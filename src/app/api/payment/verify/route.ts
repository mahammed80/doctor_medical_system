import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { updateConsultationAsService, getConsultationIdByPaymentId } from '@/lib/server/consultationAdmin'

export const runtime = 'nodejs'

// Paymob's "Transaction Processed Callback" (this webhook) sends a JSON body
// shaped as { type: "TRANSACTION", obj: { ...transaction fields... } } — the
// fields used for HMAC verification live under `obj`, not at the top level.
// (Confirmed against Paymob's official callback docs and a live decoded
// checkout token — a flat top-level parse silently hashes an empty string
// and every real callback fails HMAC verification as a result.)
const HMAC_FIELDS = [
  'amount_cents',
  'created_at',
  'currency',
  'error_occured',
  'has_parent_transaction',
  'id',
  'integration_id',
  'is_3d_secure',
  'is_auth',
  'is_capture',
  'is_refunded',
  'is_standalone_payment',
  'is_voided',
  'order',
  'owner',
  'pending',
  'source_data_pan',
  'source_data_sub_type',
  'source_data_type',
  'success',
] as const

// Extracts the string value Paymob used for a given HMAC field, from the
// (possibly nested) transaction object. `order` and the `source_data_*`
// fields are nested one level deep in the raw callback JSON.
function extractHmacValue(obj: Record<string, unknown>, key: (typeof HMAC_FIELDS)[number]): string {
  const sourceData = (obj.source_data as Record<string, unknown> | undefined) ?? {}
  const order = obj.order as Record<string, unknown> | number | string | undefined
  switch (key) {
    case 'order':
      if (order && typeof order === 'object') return order.id != null ? String(order.id) : ''
      return order != null ? String(order) : ''
    case 'source_data_pan':
      return sourceData.pan != null ? String(sourceData.pan) : ''
    case 'source_data_sub_type':
      return sourceData.sub_type != null ? String(sourceData.sub_type) : ''
    case 'source_data_type':
      return sourceData.type != null ? String(sourceData.type) : ''
    default:
      return obj[key] != null ? String(obj[key]) : ''
  }
}

function verifyHmac(obj: Record<string, unknown>, receivedHmac: string, hmacSecret: string): boolean {
  const toHash = HMAC_FIELDS.map(k => extractHmacValue(obj, k)).join('')
  const expected = createHmac('sha512', hmacSecret).update(toHash).digest('hex')
  if (expected.length !== receivedHmac.length) return false
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(receivedHmac, 'hex'))
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET
  console.log('[paymob-webhook] HMAC secret configured:', !!hmacSecret && hmacSecret !== 'replace_with_hmac_secret')

  if (!hmacSecret || hmacSecret === 'replace_with_hmac_secret') {
    console.error('[paymob-webhook] PAYMOB_HMAC_SECRET is not configured or still has placeholder value')
    return NextResponse.json(
      { error: 'PAYMOB_HMAC_SECRET not configured.' },
      { status: 500 },
    )
  }

  const contentType = request.headers.get('content-type') ?? ''
  const url = new URL(request.url)

  // Paymob's processed-callback JSON is shaped { type, obj: {...} }. Some
  // integrations instead post the fields directly at the top level or via
  // form-encoding — fall back to the raw body in those cases.
  let obj: Record<string, unknown>
  let bodyHmac: string | undefined
  if (contentType.includes('application/json')) {
    const body = (await request.json()) as Record<string, unknown>
    obj = (body.obj as Record<string, unknown> | undefined) ?? body
    bodyHmac = typeof body.hmac === 'string' ? body.hmac : undefined
  } else {
    const form = await request.formData()
    obj = Object.fromEntries(
      [...form.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']),
    )
    bodyHmac = typeof obj.hmac === 'string' ? obj.hmac : undefined
  }

  // Paymob appends `hmac` as a query parameter on the Transaction Processed
  // Callback URL rather than inside the JSON body — check both.
  const receivedHmac = url.searchParams.get('hmac') || bodyHmac || ''

  const orderId = (() => {
    const order = obj.order as Record<string, unknown> | number | string | undefined
    if (order && typeof order === 'object') return order.id != null ? String(order.id) : ''
    return order != null ? String(order) : ''
  })()
  const transactionId = obj.id != null ? String(obj.id) : ''

  console.log('[paymob-webhook] received obj keys:', Object.keys(obj))
  console.log('[paymob-webhook] success field:', obj.success, '| id:', transactionId, '| order:', orderId)

  if (!verifyHmac(obj, receivedHmac, hmacSecret)) {
    console.error('[paymob-webhook] HMAC verification FAILED for transaction:', transactionId)
    return NextResponse.json({ error: 'Invalid HMAC.' }, { status: 400 })
  }

  console.log('[paymob-webhook] HMAC verification passed')

  const success = obj.success === true || obj.success === 'true'

  if (success && orderId) {
    try {
      // Paymob identifies orders by its own numeric order id — translate
      // that back to our consultation UUID via the payment_id we stored
      // when the checkout link was created. (Passing Paymob's numeric order
      // id directly as our uuid primary key would fail: the id column is
      // typed uuid, so a bare numeric string can never match.)
      const consultationId = await getConsultationIdByPaymentId(orderId)
      if (!consultationId) {
        console.error('[paymob-webhook] No consultation found for Paymob order id:', orderId)
        return NextResponse.json({ error: 'Consultation not found for order id.' }, { status: 404 })
      }

      const result = await updateConsultationAsService(consultationId, {
        status: 'pending_booking',
        payment_id: transactionId || orderId,
      })
      if (!result) {
        console.error('[paymob-webhook] updateConsultationAsService returned null for:', consultationId)
        return NextResponse.json({ error: 'Consultation update failed.' }, { status: 404 })
      }
      console.log('[paymob-webhook] Consultation marked as paid:', consultationId, '(order', orderId + ')')
    } catch (e) {
      console.error('[paymob-webhook] Failed to mark consultation as paid:', e)
      return NextResponse.json({ error: 'DB update failed.' }, { status: 500 })
    }
  } else {
    console.log('[paymob-webhook] Skipping update: success=%s, orderId=%s', success, orderId)
  }

  return NextResponse.json({ ok: true })
}
