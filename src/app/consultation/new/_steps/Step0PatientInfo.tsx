'use client'

import Image from 'next/image'
import { DOCTORS } from '@/lib/doctors'
import { Field } from '../_components/Field'
import { IdDropZone } from '../_components/IdDropZone'
import type { FormData } from '../types'
import { useLanguage } from '@/context/LanguageContext'

type Props = {
  form: FormData
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void
  selectedDoctorId: string
  loading: boolean
  onNext: () => void
}

export function Step0PatientInfo({
  form,
  set,
  selectedDoctorId,
  loading,
  onNext,
}: Props) {
  const { t } = useLanguage()
  const selectedDoctor = DOCTORS.find((d) => d.id === selectedDoctorId) || DOCTORS[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Doctor context card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--r)',
          background: 'var(--primary-50)',
          border: '1.5px solid var(--primary-100)',
        }}
      >
        <div className="doctor-avatar" style={{ width: 48, height: 48 }}>
          <Image
            src={selectedDoctor.image === '/main_image.jpeg' ? '/doctor_centered_landscape.jpg' : selectedDoctor.image}
            alt={t('hero_title_dr')}
            fill
            sizes="48px"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('booking_consulting_doctor')}
          </div>
          <div className="doctor-name">{t('hero_title_dr')}</div>
          <div className="doctor-specialty">{t('hero_title_title')}</div>
        </div>
      </div>

      <Field label={t('booking_full_name')} required>
        <input
          className="input"
          placeholder={t('booking_name_placeholder')}
          value={form.patient_name}
          onChange={(e) => set('patient_name', e.target.value)}
          style={{ fontWeight: 500 }}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '1rem' }}>
        <Field label={t('booking_phone_label')} required>
          <input
            className="input"
            placeholder={t('booking_phone_placeholder')}
            dir="ltr"
            value={form.patient_phone}
            onChange={(e) => set('patient_phone', e.target.value)}
          />
        </Field>
        <Field label={t('booking_age_label')} required>
          <input
            className="input"
            type="number"
            placeholder={t('booking_age_placeholder')}
            value={form.patient_age}
            onChange={(e) => set('patient_age', e.target.value)}
          />
        </Field>
      </div>

      <Field
        label={t('booking_id_label')}
        required
      >
        <IdDropZone file={form.id_file} onChange={(f) => set('id_file', f)} />
      </Field>

      <button
        type="button"
        className="btn-primary"
        style={{ justifyContent: 'center', marginTop: '0.5rem' }}
        disabled={
          !form.patient_name ||
          !form.patient_phone ||
          !form.patient_age ||
          !form.id_file ||
          loading
        }
        onClick={onNext}
      >
        {t('booking_next')}
      </button>
    </div>
  )
}

