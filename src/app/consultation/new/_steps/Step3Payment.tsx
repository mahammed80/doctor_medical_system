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
      <div
        style={{
          textAlign: 'center',
          padding: '2rem 0 2rem',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 220,
            height: 220,
            borderRadius: '50%',
            border: '1px solid rgba(194, 154, 104, 0.08)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 180,
            height: 180,
            borderRadius: '50%',
            border: '1px solid rgba(194, 154, 104, 0.04)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: 'var(--gold)',
            marginBottom: '1.25rem',
            padding: '0.35rem 1rem',
            borderRadius: 9999,
            background: 'var(--gold-soft)',
            border: '1px solid rgba(194, 154, 104, 0.25)',
            position: 'relative',
          }}
        >
          <span style={{ fontSize: '0.55rem' }}>◇</span>
          رسوم الاستشارة
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '0.3rem',
          }}
        >
          <span
            className="num"
            style={{
              fontSize: '4.5rem',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              background:
                'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 50%, var(--primary-down) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 0.9,
              backgroundSize: '200% 200%',
              animation: 'shimmer 4s ease-in-out infinite',
            }}
          >
            {price}
          </span>
          <span style={{ fontSize: '1.2rem', color: 'var(--fg-muted)', fontWeight: 500 }}>
            ريال
          </span>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--fg-muted)', marginTop: '0.75rem' }}>
          استشارة مع د. خالد بترجي
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            flex: 1,
            height: 1,
            background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
          }}
        />
        <div
          style={{
            width: 6,
            height: 6,
            background: 'var(--gold)',
            opacity: 0.3,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          }}
        />
        <div
          style={{
            flex: 1,
            height: 1,
            background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
          }}
        />
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
        <div
          style={{
            textAlign: 'center',
            padding: '2rem 1.5rem',
            background: 'var(--err-soft)',
            border: '1.5px solid var(--err)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--err)',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          حدث خطأ أثناء الاتصال ببوابة الدفع. يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً.
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '2rem',
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            background: 'var(--ok-soft)',
            border: '1px solid var(--border-accent)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ok)',
            fontSize: '0.5rem',
            fontWeight: 700,
          }}
        >
          ✓
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--fg-dim)' }}>
          الدفع مشفر وآمن 256-bit SSL
        </span>
        <span
          style={{
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: 'var(--border)',
            display: 'inline-block',
          }}
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--fg-dim)' }}>
          مدعوم من Paymob
        </span>
      </div>
    </div>
  )
}
