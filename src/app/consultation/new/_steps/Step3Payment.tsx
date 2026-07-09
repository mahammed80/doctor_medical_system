'use client'

import { AlertCircle } from 'lucide-react'
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
  const { lang, t } = useLanguage()

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Premium Payment Card */}
      <div style={{
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        padding: '2.25rem 1.75rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative gradient top bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, var(--primary), var(--primary-down))'
        }} />
        
        {/* Header / Summary */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '0.35rem 0.85rem', 
            borderRadius: '100px', 
            background: 'var(--primary-50)', 
            color: 'var(--primary)',
            fontSize: '0.78rem',
            fontWeight: 800,
            marginBottom: '0.75rem'
          }}>
            {lang === 'ar' ? 'ملخص الرسوم المستحقة' : 'Summary of Fees Due'}
          </div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--fg)' }}>
            {doctorName}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--fg-dim)', marginTop: '0.25rem' }}>
            {lang === 'ar' ? 'استشاري جراحة العظام والعمود الفقري' : 'Consultant Orthopedic & Spine Surgeon'}
          </p>
        </div>

        {/* Itemized Billing Box */}
        <div style={{
          background: 'var(--bg)',
          borderRadius: 'var(--r-lg)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          border: '1px solid var(--border-faint)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--fg-dim)' }}>
              {lang === 'ar' ? 'جلسة كشف طبي أونلاين' : 'Online Medical Consultation'}
            </span>
            <span style={{ fontWeight: 600, color: 'var(--fg)' }}>
              {price} {t('booking_currency')}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--fg-dim)' }}>
              {lang === 'ar' ? 'رسوم الخدمة والاتصال' : 'Service & Connection Fees'}
            </span>
            <span style={{ color: 'var(--dash-ok)', fontWeight: 600 }}>
              {lang === 'ar' ? 'مجاني' : 'Free'}
            </span>
          </div>
          <div style={{ height: '1px', background: 'var(--border)', margin: '0.25rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800 }}>
            <span style={{ color: 'var(--fg)' }}>
              {lang === 'ar' ? 'الإجمالي المطلوب سداده' : 'Total Amount Payable'}
            </span>
            <span style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>
              {price} {t('booking_currency')}
            </span>
          </div>
        </div>

        {/* Payment Form / Button container */}
        <div>
          {paymentLoading ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <Spinner />
              <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--fg-dim)' }}>
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
        </div>

        {/* Security and Badges */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '0.75rem', 
          borderTop: '1px solid var(--border)',
          paddingTop: '1.25rem',
          marginTop: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--fg-dim)' }}>
            <span style={{ color: 'var(--dash-ok)', fontWeight: 'bold' }}>✓</span>
            {lang === 'ar' ? 'دفع آمن ومشفر 256-bit SSL' : 'Secure 256-bit SSL Encrypted Payment'}
          </div>
          
          {/* Brand logos (mada, visa, mastercard, apple pay) */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.6rem',
            opacity: 0.9
          }}>
            {/* mada */}
            <div style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '0.2rem 0.5rem',
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#005A9C',
              fontStyle: 'italic',
              boxShadow: 'var(--shadow-sm)'
            }}>mada</div>
            {/* Apple Pay */}
            <div style={{
              background: '#000',
              border: '1px solid #000',
              borderRadius: '4px',
              padding: '0.2rem 0.5rem',
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#fff',
              boxShadow: 'var(--shadow-sm)'
            }}> Pay</div>
            {/* Visa */}
            <div style={{
              background: '#1A1F71',
              border: '1px solid #1A1F71',
              borderRadius: '4px',
              padding: '0.2rem 0.5rem',
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#fff',
              boxShadow: 'var(--shadow-sm)'
            }}>VISA</div>
            {/* Mastercard */}
            <div style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '0.2rem 0.5rem',
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#EB001B',
              boxShadow: 'var(--shadow-sm)'
            }}>mastercard</div>
          </div>
        </div>
      </div>
    </div>
  )
}
