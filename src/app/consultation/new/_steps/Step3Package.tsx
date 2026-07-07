'use client'

import { Check, Sparkles, Stethoscope, Repeat } from 'lucide-react'
import type { FormData } from '../types'

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
  const packages: PackageOption[] = [
    {
      id: 'basic',
      icon: <Stethoscope size={26} />,
      title: 'استشارة أساسية',
      price: String(prices.basic),
      desc: 'استشارة طبية واحدة مع الطبيب',
      features: [
        'استشارة فردية بالفيديو',
        'تقييم أولي للحالة',
        'توصيات علاجية مبدئية',
        'وصفة طبية عند الحاجة',
        'متابعة لمدة يومين عبر الشات',
      ],
    },
    {
      id: 'comprehensive',
      icon: <Sparkles size={26} />,
      title: 'استشارة شاملة',
      price: String(prices.comprehensive),
      desc: 'تقييم شامل مع خطة علاجية مفصلة',
      features: [
        'جلستان بالفيديو (تقييم + متابعة)',
        'تحليل شامل للتاريخ المرضي والفحوصات',
        'خطة علاجية متكاملة ومخصصة',
        'وصفة طبية مراجعة',
        'متابعة لمدة أسبوع عبر الشات',
      ],
      popular: true,
    },
    {
      id: 'followup',
      icon: <Repeat size={26} />,
      title: 'باقة متابعة',
      price: String(prices.followup),
      desc: 'ثلاث جلسات متابعة متكاملة',
      features: [
        'ثلاث جلسات فيديو',
        'مراجعة دورية للفحوصات والأشعة',
        'تعديل الخطة العلاجية حسب التطور',
        'وصفات طبية متجددة',
        'متابعة مستمرة لمدة أسبوعين عبر الشات',
      ],
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--fg)' }}>
          اختر الباقة المناسبة لاحتياجك
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--fg-dim)', marginTop: '0.35rem', lineHeight: 1.7 }}>
          كل باقة مصممة لتلبية احتياجات مختلفة. اختر ما يناسب حالتك.
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
              {pkg.popular && <span className="pkg-badge">الأكثر طلباً</span>}
              <div className="pkg-card-head">
                <span className="pkg-card-icon">{pkg.icon}</span>
                <span className="pkg-card-title">{pkg.title}</span>
              </div>
              <div className="pkg-card-desc">{pkg.desc}</div>
              <div className="pkg-card-price">
                <span className="pkg-price-amount num">{pkg.price}</span>
                <span className="pkg-price-currency">ريال</span>
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
                  تم الاختيار
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
        التالي
      </button>
    </div>
  )
}
