// Paymob KSA uses the new "next/v1" platform whose primary checkout
// integration is a Payment Link (https://ksa.paymob.com/standalone/?token=…).
// The legacy "payment_keys + iframe" flow from accept.paymob.com is not
// available on KSA.
//
// Flow:
//   1. Server: POST /api/ecommerce/payment-links   → returns { url, id, token }
//   2. Client: redirect (or iframe) to the returned URL.
//   3. After payment, Paymob redirects to our `redirection_url` with
//      `?token=…&success=true&…` so the client can mark the consultation paid.

const PAYMOB_BASE = (process.env.PAYMOB_BASE_URL || 'https://ksa.paymob.com').replace(/\/+$/, '')

type PaymobAuthResponse = { token: string; profile: unknown }
type PaymobOrderResponse = { id: number; url: string; token: string }
type PaymobPaymentLinkResponse = {
  id: number
  url: string
  token: string
  client_url: string
}

let cachedToken: { value: string; expiresAt: number } | null = null

async function postJson<T>(url: string, body: unknown, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Paymob ${res.status}: ${text || res.statusText}`)
  }
  return res.json() as Promise<T>
}

export async function getPaymobAuthToken(): Promise<string> {
  const apiKey = process.env.PAYMOB_API_KEY
  if (!apiKey) throw new Error('PAYMOB_API_KEY is not set')

  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.value
  }

  const data = await postJson<PaymobAuthResponse>(`${PAYMOB_BASE}/api/auth/tokens`, {
    api_key: apiKey,
  })

  cachedToken = { value: data.token, expiresAt: now + 55 * 60 * 1000 }
  return data.token
}

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

export type PaymobBillingData = {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  country: string
  city: string
  street: string
  building: string
  floor: string
  apartment: string
  state: string
  postal_code: string
}

export type CreatePaymobCheckoutParams = {
  amountCents: number
  currency?: string
  consultationId: string
  billingData: PaymobBillingData
  redirectUrl: string
}

/**
 * Creates a Paymob Payment Link and returns the hosted checkout URL the
 * customer should be redirected to. Works on the KSA "next/v1" platform.
 */
export async function createPaymobCheckoutLink(params: CreatePaymobCheckoutParams): Promise<{
  url: string
  paymentId: string
  token: string
}> {
  const integrationId = process.env.PAYMOB_INTEGRATION_ID
  if (!integrationId || integrationId === 'replace_with_card_integration_id') {
    throw new Error(
      'PAYMOB_INTEGRATION_ID is not configured. Get the card integration ID from ' +
        'https://ksa.paymob.com/portal → Developers → Payment Integrations and set it in .env.local.',
    )
  }

  const token = await getPaymobAuthToken()
  const currency = params.currency || 'SAR'

  // KSA's payment-links endpoint requires `payment_methods` to be a non-null
  // array of integration IDs. We always send a single-element array with the
  // configured card integration ID.
  const body = {
    amount_cents: params.amountCents,
    currency,
    payment_methods: [Number(integrationId)],
    billing_data: params.billingData,
    extras: { consultation_id: params.consultationId },
    redirection_url: params.redirectUrl,
    merchant_order_id: params.consultationId,
    is_live: false,
  }

  const data = await postJson<PaymobPaymentLinkResponse>(
    `${PAYMOB_BASE}/api/ecommerce/payment-links`,
    body,
    authHeader(token),
  )

  const url = data.client_url || data.url
  if (!url) {
    throw new Error('Paymob payment link response did not include a URL.')
  }

  return { url, paymentId: String(data.id), token: data.token }
}
