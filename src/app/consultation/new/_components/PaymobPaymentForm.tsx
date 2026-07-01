export function PaymobPaymentForm({
  checkoutUrl,
  price,
}: {
  checkoutUrl: string
  price: string
}) {
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
        }}
      >
        ادفع {price} ريال عبر Paymob
      </a>
      <p
        style={{
          fontSize: '0.78rem',
          color: 'var(--fg-dim)',
          textAlign: 'center',
          lineHeight: 1.7,
        }}
      >
        🔒 الدفع مشفر وآمن عبر Paymob — اضغط الزر أعلاه لإكمال سداد رسوم الاستشارة ({price} ر.س).
        سيتم تحويلك إلى بوابة Paymob الآمنة، ثم تعود تلقائياً إلى هنا بعد إتمام الدفع.
      </p>
    </div>
  )
}
