'use client'

import { PaymobPaymentForm } from '../_components/PaymobPaymentForm'
import { Spinner } from '../_components/Spinner'

type Props = {
  price: string
  paymentLoading: boolean
  checkoutUrl: string | null
  consultationId: string | null
}

export function Step3Payment({ price, paymentLoading, checkoutUrl, consultationId }: Props) {
  return (
    <div>
      <div className="price-display">
        <div className="price-badge">
          <span style={{ fontSize: '0.55rem' }}>◇</span>
          رسوم الاستشارة
        </div>
        <div className="price-row">
          <span className="price-amount num">{price}</span>
          <span className="price-currency">ريال</span>
        </div>
        <div className="price-subtitle">استشارة مع د. خالد بترجي</div>
      </div>

      <div className="price-divider">
        <div className="price-divider-line" />
        <div className="price-divider-dot" />
        <div className="price-divider-line" />
      </div>

      {paymentLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Spinner />
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--fg-dim)' }}>
            جاري تجهيز رابط الدفع الآمن عبر Paymob...
          </p>
        </div>
      ) : checkoutUrl && consultationId ? (
        <PaymobPaymentForm checkoutUrl={checkoutUrl} price={price} />
      ) : (
        <div className="alert alert-error">
          <div className="alert-icon">!</div>
          <div>
            <div className="alert-title">تعذر الاتصال ببوابة الدفع</div>
            <div className="alert-text">يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً.</div>
          </div>
        </div>
      )}

      <div className="payment-seal">
        <div className="payment-seal-icon">✓</div>
        <span className="payment-seal-text">الدفع مشفر وآمن 256-bit SSL</span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border)', display: 'inline-block' }} />
        <span className="payment-seal-text">مدعوم من Paymob</span>
      </div>
    </div>
  )
}
