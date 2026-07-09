'use client'

import { useState } from 'react'
import Image from 'next/image'
import { DOCTORS } from '@/lib/doctors'
import { Field } from '../_components/Field'
import { IdDropZone } from '../_components/IdDropZone'
import { Spinner } from '../_components/Spinner'
import type { FormData } from '../types'
import { useLanguage } from '@/context/LanguageContext'
import { getLatestConsultationByNationalId } from '@/lib/consultationService'

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
  const { lang, t } = useLanguage()
  const selectedDoctor = DOCTORS.find((d) => d.id === selectedDoctorId) || DOCTORS[0]

  const [searchId, setSearchId] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchStatus, setSearchStatus] = useState<'idle' | 'success' | 'error'>('idle')

  async function handleSearch() {
    if (!searchId.trim()) return
    setSearchLoading(true)
    setSearchStatus('idle')
    try {
      const matched = await getLatestConsultationByNationalId(searchId.trim())
      if (matched) {
        set('patient_name', matched.patient_name)
        set('patient_phone', matched.patient_phone)
        set('patient_age', matched.patient_age?.toString() || '')
        set('patient_national_id', searchId.trim())
        set('patient_type', 'returning')
        setSearchStatus('success')
      } else {
        setSearchStatus('error')
      }
    } catch (err) {
      console.error(err)
      setSearchStatus('error')
    } finally {
      setSearchLoading(false)
    }
  }

  const isFormValid = () => {
    if (form.patient_type === 'returning') {
      return (
        form.patient_name &&
        form.patient_phone &&
        form.patient_national_id &&
        searchStatus === 'success'
      );
    } else if (form.patient_type === 'new') {
      return (
        form.patient_name &&
        form.patient_phone &&
        form.patient_national_id
      );
    }
    return false;
  }

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

      {/* Patient Type Select */}
      <Field label={lang === 'ar' ? 'هل لديك ملف طبي سابق بالمركز؟' : 'Do you have a medical file here?'}>
        <div className="option-grid">
          <button
            type="button"
            className={`option-button ${form.patient_type === 'returning' ? 'option-button-selected' : ''}`}
            onClick={() => {
              set('patient_type', 'returning')
              set('patient_name', '')
              set('patient_phone', '')
              set('patient_age', '')
              set('patient_national_id', '')
              setSearchStatus('idle')
            }}
          >
            {lang === 'ar' ? 'نعم، لدي ملف سابق' : 'Yes, I have a file'}
          </button>
          <button
            type="button"
            className={`option-button ${form.patient_type === 'new' ? 'option-button-selected' : ''}`}
            onClick={() => {
              set('patient_type', 'new')
              set('patient_name', '')
              set('patient_phone', '')
              set('patient_age', '')
              set('patient_national_id', '')
              setSearchStatus('idle')
            }}
          >
            {lang === 'ar' ? 'لا، مريض جديد' : 'No, new patient'}
          </button>
        </div>
      </Field>

      {/* Returning Patient Search section */}
      {form.patient_type === 'returning' && (
        <div
          style={{
            background: 'var(--surface)',
            border: '1.5px dashed var(--border)',
            borderRadius: 'var(--r-lg)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'fadeIn 0.3s ease-in-out',
          }}
        >
          <Field label={lang === 'ar' ? 'أدخل رقم الهوية الوطنية أو الإقامة للبحث عن ملفك' : 'Enter National ID or Iqama to find your record'} required>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
              <input
                className="input"
                placeholder={lang === 'ar' ? 'رقم الهوية أو الإقامة (10 أرقام)' : 'ID / Iqama Number (10 digits)'}
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <button
                type="button"
                className="btn-primary"
                onClick={handleSearch}
                disabled={searchLoading || !searchId.trim()}
                style={{ padding: '0 1.25rem' }}
              >
                {searchLoading ? <Spinner /> : (lang === 'ar' ? 'بحث' : 'Search')}
              </button>
            </div>
          </Field>

          {searchStatus === 'success' && (
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--dash-ok)',
                background: 'var(--dash-ok-soft)',
                padding: '0.75rem',
                borderRadius: 'var(--r)',
                border: '1px solid var(--dash-ok-soft)',
              }}
            >
              ✓ {lang === 'ar' ? `تم العثور على ملفك الطبي باسم: ${form.patient_name}. يمكنك الاستمرار.` : `Medical record found for: ${form.patient_name}. You can proceed.`}
            </div>
          )}

          {searchStatus === 'error' && (
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--dash-err)',
                background: 'var(--dash-err-soft)',
                padding: '0.75rem',
                borderRadius: 'var(--r)',
                border: '1px solid var(--dash-err-soft)',
              }}
            >
              ✗ {lang === 'ar' ? 'لم نتمكن من العثور على ملف طبي بهذا الرقم. يرجى التأكد من الرقم أو اختيار مريض جديد.' : 'Could not find a medical record. Check the number or select new patient.'}
            </div>
          )}
        </div>
      )}

      {/* Basic Data Fields (Shown if returning succeeds or if new patient is selected) */}
      {(form.patient_type === 'new' || (form.patient_type === 'returning' && searchStatus === 'success')) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s ease-in-out' }}>
          <Field label={t('booking_full_name')} required>
            <input
              className="input"
              placeholder={t('booking_name_placeholder')}
              value={form.patient_name}
              onChange={(e) => set('patient_name', e.target.value)}
              disabled={form.patient_type === 'returning'}
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
                disabled={form.patient_type === 'returning'}
              />
            </Field>
            <Field label={t('booking_age_label')} optional>
              <input
                className="input"
                type="number"
                placeholder={t('booking_age_placeholder')}
                value={form.patient_age}
                onChange={(e) => set('patient_age', e.target.value)}
                disabled={form.patient_type === 'returning'}
              />
            </Field>
          </div>

          <Field label={lang === 'ar' ? 'رقم الهوية الوطنية أو الإقامة' : 'National ID or Iqama Number'} required>
            <input
              className="input"
              placeholder={lang === 'ar' ? 'أدخل 10 أرقام' : 'Enter 10 digits'}
              value={form.patient_national_id}
              onChange={(e) => set('patient_national_id', e.target.value)}
              disabled={form.patient_type === 'returning'}
            />
          </Field>

          <Field label={lang === 'ar' ? 'إرفاق صورة الهوية أو الإقامة' : 'Attach ID Card Image'} optional>
            <IdDropZone file={form.id_file} onChange={(f) => set('id_file', f)} />
          </Field>
        </div>
      )}

      {form.patient_type && (
        <button
          type="button"
          className="btn-primary"
          style={{ justifyContent: 'center', marginTop: '0.5rem' }}
          disabled={!isFormValid() || loading}
          onClick={onNext}
        >
          {t('booking_next')}
        </button>
      )}
    </div>
  )
}
