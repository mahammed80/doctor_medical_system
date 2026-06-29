const PAYMOB_BASE = 'https://accept.paymob.com'

type PaymobAuthResponse = { token: string }
type PaymobOrderResponse = { id: number }
type PaymobPaymentKeyResponse = { token: string }

let cachedToken: { value: string; expiresAt: number } | null = null

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

export async function createPaymobOrder(
  authToken: string,
  amountCents: number,
  consultationId: string,
): Promise<number> {
  const data = await postJson<PaymobOrderResponse>(`${PAYMOB_BASE}/api/ecommerce/orders`, {
    auth_token: authToken,
    amount_cents: amountCents,
    currency: 'SAR',
    delivery_needed: false,
    items: [],
    merchant_order_id: consultationId,
  })
  return data.id
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

export async function createPaymobPaymentKey(params: {
  authToken: string
  orderId: number
  amountCents: number
  consultationId: string
  billingData: PaymobBillingData
  redirectUrl: string
}): Promise<string> {
  const integrationId = process.env.PAYMOB_INTEGRATION_ID
  if (!integrationId) throw new Error('PAYMOB_INTEGRATION_ID is not set')

  const data = await postJson<PaymobPaymentKeyResponse>(`${PAYMOB_BASE}/api/payment_keys`, {
    auth_token: params.authToken,
    amount_cents: params.amountCents,
    expiration: 3600,
    order_id: params.orderId,
    billing_data: params.billingData,
    currency: 'SAR',
    integration_id: Number(integrationId),
    lock_order_when_paid: true,
    redirection_url: params.redirectUrl,
    merchant_redirect_url: params.redirectUrl,
    extras: { consultation_id: params.consultationId },
  })
  return data.token
}

export function buildPaymobIframeUrl(paymentToken: string): string {
  const iframeId = process.env.PAYMOB_IFRAME_ID
  if (!iframeId) throw new Error('PAYMOB_IFRAME_ID is not set')
  return `${PAYMOB_BASE}/api/acceptance/iframes/${iframeId}?payment_token=${encodeURIComponent(paymentToken)}`
}
