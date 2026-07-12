// Paymob KSA Payment Links flow.
//
// Flow:
//   1. Server: POST /api/ecommerce/payment-links → returns { url, id, token }
//   2. Client: redirect to the returned URL.
//   3. After payment, Paymob sends webhook to transaction-processed callback
//      and redirects the user to the transaction-response callback URL.

const PAYMOB_BASE = (process.env.PAYMOB_BASE_URL || 'https://ksa.paymob.com').replace(/\/+$/, '')

type PaymobAuthResponse = { token: string; profile: unknown }
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

export async function createPaymobCheckoutLink(params: CreatePaymobCheckoutParams): Promise<{
  url: string
  paymentId: string
  token: string
}> {
  const integrationIdRaw = process.env.PAYMOB_INTEGRATION_ID
  const integrationId = integrationIdRaw?.trim()
  if (!integrationId || integrationId === 'replace_with_card_integration_id') {
    throw new Error(
      'PAYMOB_INTEGRATION_ID is not configured. Get the card integration ID from ' +
        'https://ksa.paymob.com/portal → Developers → Payment Integrations and set it in .env.local.',
    )
  }

  const token = await getPaymobAuthToken()
  const currency = params.currency || 'SAR'
  const isLive = String(process.env.PAYMOB_IS_LIVE || '').toLowerCase() === 'true'

  const body: Record<string, unknown> = {
    amount_cents: params.amountCents,
    currency,
    payment_methods: [Number(integrationId)],
    integration_id: Number(integrationId),
    is_live: isLive,
    billing_data: params.billingData,
    // Paymob's payment-links API reads this key as `extra` (singular) — a
    // request sent with `extras` (plural) is silently accepted but the data
    // is dropped, which we confirmed by decoding a live checkout token and
    // seeing `"extra": {}` come back empty despite sending consultation_id.
    extra: { consultation_id: params.consultationId },
    redirection_url: params.redirectUrl,
    merchant_order_id: params.consultationId,
  }

  console.log('[paymob] creating checkout link', {
    consultationId: params.consultationId,
    integrationId,
    amountCents: params.amountCents,
    currency,
    bodyKeys: Object.keys(body),
  })

  const data = await postJson<PaymobPaymentLinkResponse>(
    `${PAYMOB_BASE}/api/ecommerce/payment-links`,
    body,
    { Authorization: `Bearer ${token}` },
  )

  const url = data.client_url || data.url
  if (!url) {
    throw new Error('Paymob payment link response did not include a URL.')
  }

  return { url, paymentId: String(data.id), token: data.token }
}
