'use client'

import { Lock } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export function PaymobPaymentForm({
  checkoutUrl,
  price,
}: {
  checkoutUrl: string
  price: string
}) {
  const { lang } = useLanguage()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <a
        href={checkoutUrl}
        target="_top"
        rel="noopener"
        className="btn-primary btn-lg"
        style={{
          width: '100%',
          justifyContent: 'center',
          textDecoration: 'none',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)',
          border: 'none',
          boxShadow: 'var(--shadow-md)',
          fontWeight: 700
        }}
      >
        {lang === 'ar' ? `ادفع ${price} ريال عبر Paymob` : `Pay ${price} SAR via Paymob`}
      </a>
      <p
        style={{
          fontSize: '0.78rem',
          color: 'var(--fg-dim)',
          textAlign: 'center',
          lineHeight: 1.7,
        }}
      >
        <span style={{ display: 'inline-flex', marginInlineEnd: '0.35rem' }}><Lock size={14} /></span>
        {lang === 'ar' 
          ? `الدفع مشفر وآمن عبر Paymob. اضغط الزر أعلاه لإكمال سداد رسوم الاستشارة (${price} ر.س). سيتم تحويلك إلى بوابة Paymob الآمنة، ثم تعود تلقائياً إلى هنا بعد إتمام الدفع.`
          : `Payment is encrypted and secure via Paymob. Click the button above to complete the consultation fee (${price} SAR). You will be redirected to the secure Paymob gateway, then automatically return here after payment.`}
      </p>
    </div>
  )
}
