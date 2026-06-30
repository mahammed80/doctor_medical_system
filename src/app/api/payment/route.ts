import { NextResponse } from 'next/server'
import {
  createPaymobCheckoutLink,
  type PaymobBillingData,
} from '@/lib/paymob'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, consultationId, patient } = body as {
      amount: number
      consultationId: string
      patient?: { name?: string; phone?: string; email?: string }
    }

    if (!amount || !consultationId) {
      return NextResponse.json(
        { error: 'المبلغ ومعرف الاستشارة مطلوبان.' },
        { status: 400 },
      )
    }

    const amountCents = Math.round(amount * 100)
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return NextResponse.json(
        { error: 'قيمة المبلغ غير صحيحة.' },
        { status: 400 },
      )
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      request.headers.get('origin') ||
      'http://localhost:3000'

    const redirectUrl = `${baseUrl}/consultation/new?step=4&consultation=${encodeURIComponent(consultationId)}&from=paymob`

    const [first = 'Patient', ...rest] = (patient?.name ?? '').split(' ')
    const last = rest.join(' ') || 'NA'

    const billingData: PaymobBillingData = {
      first_name: first,
      last_name: last,
      email: patient?.email || `${(patient?.phone ?? 'patient').replace(/\D/g, '')}@no-email.sa`,
      phone_number: patient?.phone || 'NA',
      country: 'SA',
      city: 'Riyadh',
      street: 'NA',
      building: 'NA',
      floor: 'NA',
      apartment: 'NA',
      state: 'NA',
      postal_code: 'NA',
    }

    const checkout = await createPaymobCheckoutLink({
      amountCents,
      consultationId,
      billingData,
      redirectUrl,
    })

    return NextResponse.json({
      checkoutUrl: checkout.url,
      paymentId: checkout.paymentId,
      paymentToken: checkout.token,
    })
  } catch (error: any) {
    console.error('[paymob] checkout link creation failed:', {
      message: error?.message,
      stack: error?.stack,
    })
    const raw = error?.message ?? ''
    const friendly = raw.includes('Integration ID does not exist')
      ? 'Integration ID غير موجود في نظام Paymob. تأكد أنك تستخدم رقم Integration ID الخاص بالحساب نفسه ولبيئة الـ test (يجب أن يكون مطابقاً للحساب في https://ksa.paymob.com/portal).'
      : raw.includes('PAYMOB_INTEGRATION_ID is not configured')
        ? 'PAYMOB_INTEGRATION_ID غير مهيأ في بيئة Vercel. أضف رقم Integration ID من لوحة Paymob في Settings → Environment Variables ثم أعد النشر.'
        : (raw || 'تعذّر تهيئة الدفع عبر Paymob.')
    return NextResponse.json({ error: friendly }, { status: 500 })
  }
}
