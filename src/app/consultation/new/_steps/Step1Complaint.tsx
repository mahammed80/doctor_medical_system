'use client'

import { Field } from '../_components/Field'
import { Spinner } from '../_components/Spinner'
import type { FormData } from '../types'
import { useLanguage } from '@/context/LanguageContext'

type Props = {
  form: FormData
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void
  loading: boolean
  onSubmit: () => void
}

export function Step1Complaint({ form, set, loading, onSubmit }: Props) {
  const { lang, t } = useLanguage()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Field label={lang === 'ar' ? 'الشكوى الرئيسية (مثل: ألم ركبة، ظهر، رقبة...)' : 'Chief Complaint (e.g., knee pain, back pain, neck pain...)'} required>
        <textarea
          className="textarea"
          placeholder={lang === 'ar' ? 'اكتب شكواك الرئيسية هنا...' : 'Enter your chief complaint here...'}
          value={form.chief_complaint}
          onChange={(e) => set('chief_complaint', e.target.value)}
          style={{ minHeight: 100 }}
        />
      </Field>

      <Field label={lang === 'ar' ? 'تفاصيل إضافية عن الحالة أو التاريخ المرضي' : 'Additional Details or Medical History'} optional>
        <textarea
          className="textarea"
          placeholder={lang === 'ar' ? 'أدخل أي تفاصيل إضافية، عمليات سابقة، أو ملاحظات ترغب في مشاركتها (اختياري)...' : 'Enter any additional details, previous surgeries, or notes (optional)...'}
          value={form.medical_history}
          onChange={(e) => set('medical_history', e.target.value)}
          style={{ minHeight: 120 }}
        />
      </Field>

      <button
        type="button"
        className="btn-primary"
        style={{ justifyContent: 'center', marginTop: '0.5rem' }}
        disabled={!form.chief_complaint || loading}
        onClick={onSubmit}
      >
        {loading ? <Spinner /> : t('booking_next_save')}
      </button>
    </div>
  )
}
