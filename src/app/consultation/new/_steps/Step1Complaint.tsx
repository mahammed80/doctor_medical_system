'use client'

import BodyMap from '@/components/BodyMap'
import PainSeveritySlider from '@/components/PainSeveritySlider'
import PainNatureChips from '@/components/PainNatureChips'
import { Field } from '../_components/Field'
import { Spinner } from '../_components/Spinner'
import { PAIN_DURATIONS } from '../constants'
import type { FormData } from '../types'

type Props = {
  form: FormData
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void
  loading: boolean
  onSubmit: () => void
}

export function Step1Complaint({ form, set, loading, onSubmit }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
      <Field label="ما هي الشكوى الرئيسية التي تعاني منها؟" required>
        <textarea
          className="input"
          placeholder="مثال: ألم حاد في الركبة اليسرى يزداد عند صعود الدرج..."
          value={form.chief_complaint}
          onChange={(e) => set('chief_complaint', e.target.value)}
          style={{ minHeight: 90, fontWeight: 500 }}
        />
      </Field>

      <div className="card-warm" style={{ padding: '1rem 1.25rem', background: 'var(--bg)' }}>
        <Field label="شدّة الألم" required>
          <PainSeveritySlider
            value={form.pain_severity}
            onChange={(v) => set('pain_severity', v)}
          />
        </Field>
      </div>

      <Field label="طبيعة الألم (يمكن اختيار أكثر من وصف)" required>
        <PainNatureChips
          selected={form.pain_natures}
          onChange={(v) => set('pain_natures', v)}
        />
      </Field>

      <Field label="مكان الألم على الجسم" required>
        <BodyMap
          selected={form.pain_locations as never}
          spinalSelected={form.spinal_areas as never}
          onChange={(locs, spinal) => {
            set('pain_locations', locs)
            set('spinal_areas', spinal)
          }}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="مدة الشكوى (سريعة)" optional>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            {PAIN_DURATIONS.map((opt) => {
              const isSelected = form.pain_duration === opt
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set('pain_duration', opt)}
                  style={{
                    padding: '0.55rem 0.4rem',
                    borderRadius: 'var(--r-sm)',
                    border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--primary-soft)' : 'var(--surface)',
                    color: isSelected ? 'var(--primary)' : 'var(--fg)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </Field>

        <Field label="كيف بدأت الأعراض؟" optional>
          <input
            className="input"
            placeholder="مثال: بعد رفع ثقل، أو بدون سبب واضح"
            value={form.symptom_start}
            onChange={(e) => set('symptom_start', e.target.value)}
          />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="علاجات سابقة" optional>
          <textarea
            className="input"
            style={{ minHeight: 70 }}
            placeholder="أدوية، علاج طبيعي، جبائر..."
            value={form.previous_treatments}
            onChange={(e) => set('previous_treatments', e.target.value)}
          />
        </Field>
        <Field label="عمليات جراحية سابقة" optional>
          <textarea
            className="input"
            style={{ minHeight: 70 }}
            placeholder="نوع العملية وتاريخها..."
            value={form.previous_surgeries}
            onChange={(e) => set('previous_surgeries', e.target.value)}
          />
        </Field>
        <Field label="العوامل التي تزيد الألم" optional>
          <textarea
            className="input"
            style={{ minHeight: 70 }}
            placeholder="مثال: صعود الدرج، الجلوس طويلاً..."
            value={form.aggravating_factors}
            onChange={(e) => set('aggravating_factors', e.target.value)}
          />
        </Field>
        <Field label="العوامل التي تخفف الألم" optional>
          <textarea
            className="input"
            style={{ minHeight: 70 }}
            placeholder="مثال: الراحة، الكمادات، مسكنات..."
            value={form.relieving_factors}
            onChange={(e) => set('relieving_factors', e.target.value)}
          />
        </Field>
      </div>

      <Field label="هل تعاني من تورم أو تيبس في المفاصل؟" required>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {['نعم', 'لا'].map((opt) => {
            const isSelected = form.joint_swelling_stiffness === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => set('joint_swelling_stiffness', opt)}
                style={{
                  flex: 1,
                  padding: '0.65rem 1.5rem',
                  borderRadius: 'var(--r-sm)',
                  border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--primary-soft)' : 'var(--surface)',
                  color: isSelected ? 'var(--primary)' : 'var(--fg)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="التاريخ المرضي" optional>
          <textarea
            className="input"
            style={{ minHeight: 70 }}
            placeholder="أمراض مزمنة، حساسية..."
            value={form.medical_history}
            onChange={(e) => set('medical_history', e.target.value)}
          />
        </Field>
        <Field label="الأدوية الحالية" optional>
          <textarea
            className="input"
            style={{ minHeight: 70 }}
            placeholder="اسم الدواء والجرعة..."
            value={form.current_medications}
            onChange={(e) => set('current_medications', e.target.value)}
          />
        </Field>
      </div>

      <button
        type="button"
        className="btn-primary"
        style={{ justifyContent: 'center', marginTop: '0.5rem' }}
        disabled={
          !form.chief_complaint ||
          form.pain_natures.length === 0 ||
          form.pain_locations.length === 0 ||
          loading
        }
        onClick={onSubmit}
      >
        {loading ? <Spinner /> : 'التالي (حفظ البيانات)'}
      </button>
    </div>
  )
}
