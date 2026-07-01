'use client'

import Image from 'next/image'
import { DOCTORS } from '@/lib/doctors'
import { Field } from '../_components/Field'
import { IdDropZone } from '../_components/IdDropZone'
import type { FormData } from '../types'

type Props = {
  form: FormData
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void
  selectedDoctorId: string
  onSelectDoctor: (id: string) => void
  loading: boolean
  onNext: () => void
}

export function Step0PatientInfo({
  form,
  set,
  selectedDoctorId,
  onSelectDoctor,
  loading,
  onNext,
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Field label="اختر الطبيب الاستشاري" required>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            marginBottom: '0.5rem',
          }}
        >
          {DOCTORS.map((d) => {
            const isSelected = selectedDoctorId === d.id
            return (
              <div
                key={d.id}
                onClick={() => onSelectDoctor(d.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--r)',
                  background: isSelected ? 'var(--primary-soft)' : 'var(--surface)',
                  border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 200ms var(--ease-out)',
                  boxShadow: isSelected ? '0 4px 12px var(--primary-glow)' : 'var(--shadow-sm)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border-accent)'
                    e.currentTarget.style.background = 'var(--surface-up)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.background = 'var(--surface)'
                  }
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1.5px solid var(--border)',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  <Image
                    src={d.image}
                    alt={d.name}
                    fill
                    sizes="40px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: 'var(--fg)',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {d.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      color: 'var(--fg-dim)',
                      marginTop: '0.15rem',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {d.specialty}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Field>

      <Field label="الاسم الكامل للمريض" required>
        <input
          className="input"
          placeholder="محمد عبدالله"
          value={form.patient_name}
          onChange={(e) => set('patient_name', e.target.value)}
          style={{ fontWeight: 500 }}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '1rem' }}>
        <Field label="رقم الجوال" required>
          <input
            className="input"
            placeholder="05xxxxxxxx"
            dir="ltr"
            value={form.patient_phone}
            onChange={(e) => set('patient_phone', e.target.value)}
          />
        </Field>
        <Field label="العمر" required>
          <input
            className="input"
            type="number"
            placeholder="35"
            value={form.patient_age}
            onChange={(e) => set('patient_age', e.target.value)}
          />
        </Field>
      </div>

      <Field
        label="إثبات الهوية الشخصية (بطاقة الأحوال / الإقامة / جواز السفر)"
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
        التالي
      </button>
    </div>
  )
}
