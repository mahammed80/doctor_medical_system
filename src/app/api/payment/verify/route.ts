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
  if (!hmacSecret || hmacSecret === 'replace_with_hmac_secret') {
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

  if (!verifyHmac(payload, hmacSecret)) {
    return NextResponse.json({ error: 'Invalid HMAC.' }, { status: 400 })
  }

  const success = payload.success === 'true'
  const consultationId = payload.merchant_order_id || payload.order
  const transactionId = payload.id

  if (success && consultationId) {
    try {
      await updateConsultationAsService(consultationId, {
        status: 'pending_booking',
        payment_id: String(transactionId ?? ''),
      })
    } catch (e) {
      console.error('Failed to mark consultation as paid after Paymob webhook:', e)
      return NextResponse.json({ error: 'DB update failed.' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
