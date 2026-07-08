'use client'

import { AlertCircle, Check } from 'lucide-react'
import { PaymobPaymentForm } from '../_components/PaymobPaymentForm'
import { Spinner } from '../_components/Spinner'
import { useLanguage } from '@/context/LanguageContext'

type Props = {
  price: string
  doctorName: string
  paymentLoading: boolean
  checkoutUrl: string | null
  consultationId: string | null
}

export function Step3Payment({ price, doctorName, paymentLoading, checkoutUrl, consultationId }: Props) {
  const { t } = useLanguage()

  return (
    <div>
      <div className="price-display">
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '220px', height: '220px',
          borderRadius: '50%',
          border: '1px solid oklch(68% 0.17 70 / 0.08)',
          pointerEvents: 'none',
        }} aria-hidden />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '180px', height: '180px',
          borderRadius: '50%',
          border: '1px solid oklch(68% 0.17 70 / 0.04)',
          pointerEvents: 'none',
        }} aria-hidden />
        <div className="price-badge">
          <span style={{ fontSize: '0.55rem' }}>◇</span>
          {t('booking_fees_label')}
        </div>
        <div className="price-row">
          <span className="price-amount num">{price}</span>
          <span className="price-currency">{t('booking_currency')}</span>
        </div>
        <div className="price-subtitle">{t('booking_fees_with')} {doctorName}</div>
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
            {t('booking_preparing_payment')}
          </p>
        </div>
      ) : checkoutUrl && consultationId ? (
        <PaymobPaymentForm checkoutUrl={checkoutUrl} price={price} />
      ) : (
        <div className="alert alert-error">
          <div className="alert-icon" style={{ display: 'inline-flex' }}><AlertCircle size={16} /></div>
          <div>
            <div className="alert-title">{t('booking_payment_gateway_error')}</div>
            <div className="alert-text">{t('booking_payment_gateway_error_desc')}</div>
          </div>
        </div>
      )}

      <div className="payment-seal">
        <div className="payment-seal-icon" style={{ display: 'inline-flex' }}><Check size={14} /></div>
        <span className="payment-seal-text">{t('booking_secure_payment_seal')}</span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border)', display: 'inline-block' }} />
        <span className="payment-seal-text">{t('booking_powered_by')}</span>
      </div>
    </div>
  )
}

