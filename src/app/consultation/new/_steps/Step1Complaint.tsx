'use client'

import { Pointer } from 'lucide-react'
import BodyMap from '@/components/BodyMap'
import PainSeveritySlider from '@/components/PainSeveritySlider'
import PainNatureChips from '@/components/PainNatureChips'
import { Field } from '../_components/Field'
import { Spinner } from '../_components/Spinner'
import { PAIN_DURATIONS } from '../constants'
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
      <Field label={t('booking_chief_complaint_q')} required>
        <textarea
          className="textarea"
          placeholder={t('booking_complaint_placeholder')}
          value={form.chief_complaint}
          onChange={(e) => set('chief_complaint', e.target.value)}
        />
      </Field>

      <div
        className="booking-card"
        style={{ padding: '1.25rem', background: 'var(--bg)', boxShadow: 'none' }}
      >
        <Field label={t('booking_pain_severity')} required>
          <PainSeveritySlider
            value={form.pain_severity}
            onChange={(v) => set('pain_severity', v)}
          />
        </Field>
      </div>

      <Field label={t('booking_pain_nature_label')} required>
        <PainNatureChips
          selected={form.pain_natures}
          onChange={(v) => set('pain_natures', v)}
        />
      </Field>

      <Field label={t('booking_pain_location_label')} required>
        <div
          style={{
            background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)',
            border: '1.5px solid var(--border-faint)',
            borderRadius: 'var(--r-lg)',
            padding: '1rem 1rem 1.1rem',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: 'linear-gradient(90deg, var(--primary), var(--gold))',
              opacity: 0.6,
            }}
            aria-hidden
          />
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.78rem', color: 'var(--fg-muted)', marginBottom: '0.85rem',
              padding: '0 0.25rem',
            }}
          >
            <span aria-hidden style={{ display: 'inline-flex' }}><Pointer size={16} /></span>
            {t('booking_body_map_instructions')}
          </div>
          <BodyMap
            selected={form.pain_locations as never}
            spinalSelected={form.spinal_areas as never}
            widespread={form.pain_widespread}
            onChange={(locs, spinal) => {
              set('pain_locations', locs)
              set('spinal_areas', spinal)
            }}
            onWidespreadChange={(v) => set('pain_widespread', v)}
          />
        </div>
      </Field>

      <div className="option-grid">
        <Field label={t('booking_pain_duration_q')} optional>
          <div className="option-grid" style={{ gap: '0.4rem' }}>
            {PAIN_DURATIONS.map((opt) => {
              const isSelected = form.pain_duration === opt
              const displayLabel = lang === 'ar' ? opt : {
                'أقل من أسبوع': 'Less than a week',
                'من أسبوع إلى شهر': '1 week to 1 month',
                'من شهر إلى 6 أشهر': '1 to 6 months',
                'أكثر من 6 أشهر': 'More than 6 months',
              }[opt] || opt
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set('pain_duration', opt)}
                  className={['option-button', isSelected && 'option-button-selected']
                    .filter(Boolean)
                    .join(' ')}
                >
                  {displayLabel}
                </button>
              )
            })}
          </div>
        </Field>

        <Field label={t('booking_symptom_start_q')} optional>
          <input
            className="input"
            placeholder={t('booking_symptom_start_placeholder')}
            value={form.symptom_start}
            onChange={(e) => set('symptom_start', e.target.value)}
          />
        </Field>
      </div>

      <div className="option-grid">
        <Field label={t('booking_previous_treatments_q')} optional>
          <textarea
            className="textarea"
            style={{ minHeight: 70 }}
            placeholder={t('booking_previous_treatments_placeholder')}
            value={form.previous_treatments}
            onChange={(e) => set('previous_treatments', e.target.value)}
          />
        </Field>
        <Field label={t('booking_previous_surgeries_q')} optional>
          <textarea
            className="textarea"
            style={{ minHeight: 70 }}
            placeholder={t('booking_previous_surgeries_placeholder')}
            value={form.previous_surgeries}
            onChange={(e) => set('previous_surgeries', e.target.value)}
          />
        </Field>
        <Field label={t('booking_aggravating_factors_q')} optional>
          <textarea
            className="textarea"
            style={{ minHeight: 70 }}
            placeholder={t('booking_aggravating_factors_placeholder')}
            value={form.aggravating_factors}
            onChange={(e) => set('aggravating_factors', e.target.value)}
          />
        </Field>
        <Field label={t('booking_relieving_factors_q')} optional>
          <textarea
            className="textarea"
            style={{ minHeight: 70 }}
            placeholder={t('booking_relieving_factors_placeholder')}
            value={form.relieving_factors}
            onChange={(e) => set('relieving_factors', e.target.value)}
          />
        </Field>
      </div>

      <Field label={t('booking_joint_swelling_q')} required>
        <div className="option-grid">
          {['نعم', 'لا'].map((opt) => {
            const isSelected = form.joint_swelling_stiffness === opt
            const displayLabel = opt === 'نعم' ? t('booking_yes') : t('booking_no')
            return (
              <button
                key={opt}
                type="button"
                onClick={() => set('joint_swelling_stiffness', opt)}
                className={['option-button', isSelected && 'option-button-selected']
                  .filter(Boolean)
                  .join(' ')}
              >
                {displayLabel}
              </button>
            )
          })}
        </div>
      </Field>

      <div className="option-grid">
        <Field label={t('booking_medical_history_q')} optional>
          <textarea
            className="textarea"
            style={{ minHeight: 70 }}
            placeholder={t('booking_medical_history_placeholder')}
            value={form.medical_history}
            onChange={(e) => set('medical_history', e.target.value)}
          />
        </Field>
        <Field label={t('booking_current_medications_q')} optional>
          <textarea
            className="textarea"
            style={{ minHeight: 70 }}
            placeholder={t('booking_current_medications_placeholder')}
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
          (form.pain_locations.length === 0 && !form.pain_widespread) ||
          !form.joint_swelling_stiffness ||
          loading
        }
        onClick={onSubmit}
      >
        {loading ? <Spinner /> : t('booking_next_save')}
      </button>
    </div>
  )
}

