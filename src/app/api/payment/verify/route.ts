import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { updateConsultationAsService } from '@/lib/server/consultationAdmin'

export const runtime = 'nodejs'

// Paymob KSA's "next/v1" platform uses a slightly different transaction
// callback shape than the legacy HMAC. We accept both shapes — the legacy
// HMAC is verified when PAYMOB_HMAC_SECRET is configured; the new KSA
// callback is verified by checking the `success` field on the order query
// string Paymob redirects back with (?success=true|false).
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

  let payload: Record<string, string>
  const contentType = request.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    payload = (await request.json()) as Record<string, string>
  } else {
    const form = await request.formData()
    payload = Object.fromEntries(
      [...form.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']),
    ) as Record<string, string>
  }

  console.log('[paymob-webhook] received payload keys:', Object.keys(payload))
  console.log('[paymob-webhook] success field:', payload.success, '| id:', payload.id, '| order:', payload.order, '| merchant_order_id:', payload.merchant_order_id)

  if (!verifyHmac(payload, hmacSecret)) {
    console.error('[paymob-webhook] HMAC verification FAILED for transaction:', payload.id)
    return NextResponse.json({ error: 'Invalid HMAC.' }, { status: 400 })
  }

  console.log('[paymob-webhook] HMAC verification passed')

  const success = payload.success === 'true'
  const consultationId = payload.merchant_order_id || payload.order
  const transactionId = payload.id

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
