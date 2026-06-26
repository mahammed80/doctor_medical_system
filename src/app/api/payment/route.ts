import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acac' as any,
})

export async function POST(request: Request) {
  try {
    const { amount, consultationId } = await request.json()

    if (!amount || !consultationId) {
      return NextResponse.json({ error: 'المبلغ ومعرف الاستشارة مطلوبان.' }, { status: 400 })
    }

    // Create the PaymentIntent on Stripe (amount is in halalas/cents, so multiply by 100)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'sar',
      metadata: { consultationId },
      description: `استشارة طبية إلكترونية - د. خالد بترجي (طلب: ${consultationId})`,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    console.error('Stripe PaymentIntent creation failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
