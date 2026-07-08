'use client'

import { Check, Sparkles, Stethoscope, Repeat } from 'lucide-react'
import type { FormData } from '../types'
import { useLanguage } from '@/context/LanguageContext'

type PackageOption = {
  id: FormData['selected_package']
  icon: React.ReactNode
  title: string
  price: string
  desc: string
  features: string[]
  popular?: boolean
}

type Props = {
  form: FormData
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void
  prices: {
    basic: number
    comprehensive: number
    followup: number
  }
  loading: boolean
  onNext: () => void
}

export function Step3Package({ form, set, prices, loading, onNext }: Props) {
  const { lang, t } = useLanguage()

  const packages: PackageOption[] = [
    {
      id: 'basic',
      icon: <Stethoscope size={26} />,
      title: lang === 'ar' ? 'استشارة أساسية' : 'Basic Consultation',
      price: String(prices.basic),
      desc: lang === 'ar' ? 'استشارة طبية واحدة مع الطبيب' : 'One medical consultation with the doctor',
      features: lang === 'ar' ? [
        'استشارة فردية بالفيديو',
        'تقييم أولي للحالة',
        'توصيات علاجية مبدئية',
        'وصفة طبية عند الحاجة',
        'متابعة لمدة يومين عبر الشات',
      ] : [
        'One-on-one video consultation',
        'Initial condition assessment',
        'Initial treatment recommendations',
        'Medical prescription when needed',
        '2-day chat follow-up',
      ],
    },
    {
      id: 'comprehensive',
      icon: <Sparkles size={26} />,
      title: lang === 'ar' ? 'استشارة شاملة' : 'Comprehensive Consultation',
      price: String(prices.comprehensive),
      desc: lang === 'ar' ? 'تقييم شامل مع خطة علاجية مفصلة' : 'Comprehensive assessment with detailed treatment plan',
      features: lang === 'ar' ? [
        'جلستان بالفيديو (تقييم + متابعة)',
        'تحليل شامل للتاريخ المرضي والفحوصات',
        'خطة علاجية متكاملة ومخصصة',
        'وصفة طبية مراجعة',
        'متابعة لمدة أسبوع عبر الشات',
      ] : [
        'Two video sessions (assessment + follow-up)',
        'Comprehensive medical history & scans analysis',
        'Integrated and customized treatment plan',
        'Reviewed medical prescription',
        '1-week chat follow-up',
      ],
      popular: true,
    },
    {
      id: 'followup',
      icon: <Repeat size={26} />,
      title: lang === 'ar' ? 'باقة متابعة' : 'Follow-up Package',
      price: String(prices.followup),
      desc: lang === 'ar' ? 'ثلاث جلسات متابعة متكاملة' : 'Three integrated follow-up sessions',
      features: lang === 'ar' ? [
        'ثلاث جلسات فيديو',
        'مراجعة دورية للفحوصات والأشعة',
        'تعديل الخطة العلاجية حسب التطور',
        'وصفات طبية متجددة',
        'متابعة مستمرة لمدة أسبوعين عبر الشات',
      ] : [
        'Three video sessions',
        'Periodic review of scans and tests',
        'Treatment plan adjustments based on progress',
        'Renewable medical prescriptions',
        'Continuous 2-week chat follow-up',
      ],
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--fg)' }}>
          {t('booking_packages_q')}
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--fg-dim)', marginTop: '0.35rem', lineHeight: 1.7 }}>
          {t('booking_packages_desc')}
        </p>
      </div>

      <div className="pkg-cards">
        {packages.map((pkg) => {
          const isSelected = form.selected_package === pkg.id
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => set('selected_package', pkg.id)}
              className={['pkg-card', isSelected && 'pkg-card-selected', pkg.popular && 'pkg-card-popular']
                .filter(Boolean)
                .join(' ')}
            >
              {pkg.popular && <span className="pkg-badge">{t('booking_most_popular')}</span>}
              <div className="pkg-card-head">
                <span className="pkg-card-icon">{pkg.icon}</span>
                <span className="pkg-card-title">{pkg.title}</span>
              </div>
              <div className="pkg-card-desc">{pkg.desc}</div>
              <div className="pkg-card-price">
                <span className="pkg-price-amount num">{pkg.price}</span>
                <span className="pkg-price-currency">{t('booking_currency')}</span>
              </div>
              <ul className="pkg-features">
                {pkg.features.map((f, i) => (
                  <li key={i} className="pkg-feature">
                    <span className="pkg-feature-check"><Check size={13} /></span>
                    {f}
                  </li>
                ))}
              </ul>
              {isSelected && (
                <div className="pkg-selected-mark">
                  <Check size={16} />
                  {t('booking_selected')}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="btn-primary"
        style={{ justifyContent: 'center', marginTop: '0.25rem' }}
        disabled={!form.selected_package || loading}
        onClick={onNext}
      >
        {t('booking_next')}
      </button>
    </div>
  )
}

