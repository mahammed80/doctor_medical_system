// Paymob KSA MIGS-compatible payment flow.
//
// MIGS (Online Card) integrations on Paymob KSA do NOT support the
// /api/ecommerce/payment-links endpoint. Instead, they use the standard
// Orders + Payment Keys flow with a standalone redirect:
//
//   1. POST /api/ecommerce/orders          → creates order, returns order id
//   2. POST /api/acceptance/payment_keys   → creates one-time payment key
//   3. Redirect user to /standalone/?token=… → hosted checkout page
//   4. After payment, Paymob redirects to our transaction response callback
//      with ?success=true&id=…&order=…

const PAYMOB_BASE = (process.env.PAYMOB_BASE_URL || 'https://ksa.paymob.com').replace(/\/+$/, '')

type PaymobAuthResponse = { token: string; profile: unknown }
type PaymobOrderResponse = { id: number; created_at: string }
type PaymobPaymentKeyResponse = { token: string; id: number }

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

  const authToken = await getPaymobAuthToken()
  const currency = params.currency || 'SAR'

  console.log('[paymob] creating payment via orders+payment_keys flow', {
    consultationId: params.consultationId,
    integrationId,
    amountCents: params.amountCents,
    currency,
  })

  // Step 1: Create an order
  const order = await postJson<PaymobOrderResponse>(
    `${PAYMOB_BASE}/api/ecommerce/orders`,
    {
      auth_token: authToken,
      amount_cents: params.amountCents,
      currency,
      merchant_order_id: params.consultationId,
      items: [],
      shipping_data: params.billingData,
      shipping_details: {
        notes: '',
        number_of_packages: 1,
        weight: 1,
        weight_unit: 'KG',
        length: 1,
        width: 1,
        height: 1,
        contents: 'Medical Consultation',
      },
    },
  )

  console.log('[paymob] order created:', { orderId: order.id })

  // Step 2: Generate a payment key (one-time token)
  const paymentKey = await postJson<PaymobPaymentKeyResponse>(
    `${PAYMOB_BASE}/api/acceptance/payment_keys`,
    {
      auth_token: authToken,
      amount_cents: params.amountCents,
      expiration: 3600,
      order_id: order.id,
      billing_data: params.billingData,
      currency,
      integration_id: Number(integrationId),
      lock_order_when_paid: true,
    },
  )

  // Step 3: Build the standalone checkout URL
  const checkoutUrl = `${PAYMOB_BASE}/standalone/?token=${paymentKey.token}`

  console.log('[paymob] payment key generated, checkout URL ready:', {
    paymentKeyId: paymentKey.id,
    checkoutUrl,
  })

  return {
    url: checkoutUrl,
    paymentId: String(order.id),
    token: paymentKey.token,
  }
}
