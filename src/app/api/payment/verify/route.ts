import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { updateConsultationAsService } from '@/lib/server/consultationAdmin'

export const runtime = 'nodejs'

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

function verifyHmac(params: Record<string, string>, hmacSecret: string): boolean {
  const toHash = HMAC_FIELDS.map(k => params[k] ?? '').join('')
  const expected = createHmac('sha512', hmacSecret).update(toHash).digest('hex')
  const received = params.hmac ?? ''
  if (expected.length !== received.length) return false
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'))
  } catch {
    return false
  }
}

function flattenPayload(raw: Record<string, unknown>): Record<string, string> {
  // Paymob's transaction-processed callback wraps fields in an `obj` key:
  //   { "type": "TRANSACTION", "obj": { "id": 123, "success": true, ... } }
  // Flatten so we can compute HMAC against the top-level params.* fields.
  const source = (raw.obj && typeof raw.obj === 'object' ? raw.obj : raw) as Record<string, unknown>
  const flat: Record<string, string> = {}
  for (const [k, v] of Object.entries(source)) {
    if (v === null || v === undefined) {
      flat[k] = ''
    } else if (typeof v === 'object') {
      flat[k] = String((v as Record<string, unknown>).id ?? JSON.stringify(v))
    } else {
      flat[k] = String(v)
    }
  }
  return flat
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

  let raw: Record<string, unknown>
  const contentType = request.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    raw = (await request.json()) as Record<string, unknown>
  } else {
    const form = await request.formData()
    raw = Object.fromEntries(
      [...form.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']),
    ) as Record<string, unknown>
  }

  console.log('[paymob-webhook] received payload keys:', Object.keys(raw))
  console.log('[paymob-webhook] has obj wrapper:', 'obj' in raw)

  const params = flattenPayload(raw)

  console.log('[paymob-webhook] flattened fields:', {
    id: params.id,
    success: params.success,
    order: params.order,
    merchant_order_id: params.merchant_order_id,
  })

  if (!verifyHmac(params, hmacSecret)) {
    console.error('[paymob-webhook] HMAC verification FAILED for transaction:', params.id)
    return NextResponse.json({ error: 'Invalid HMAC.' }, { status: 400 })
  }

  console.log('[paymob-webhook] HMAC verification passed')

  const success = params.success === 'true'
  const consultationId = params.merchant_order_id || params.order
  const transactionId = params.id

  if (success && consultationId) {
    try {
      const result = await updateConsultationAsService(consultationId, {
        status: 'pending_booking',
        payment_id: String(transactionId ?? ''),
      })
      if (!result) {
        console.error('[paymob-webhook] updateConsultationAsService returned null for:', consultationId)
        return NextResponse.json({ error: 'Consultation not found or update failed.' }, { status: 404 })
      }
      console.log('[paymob-webhook] Consultation marked as paid:', consultationId)
    } catch (e) {
      console.error('[paymob-webhook] Failed to mark consultation as paid:', e)
      return NextResponse.json({ error: 'DB update failed.' }, { status: 500 })
    }
  } else {
    console.log('[paymob-webhook] Skipping update: success=%s, consultationId=%s', success, consultationId)
  }

  return NextResponse.json({ ok: true })
}
