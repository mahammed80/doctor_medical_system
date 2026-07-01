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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Field label="اختر الطبيب الاستشاري" required>
        <div
          role="radiogroup"
          aria-label="قائمة الأطباء الاستشاريين"
          className="doctor-grid"
        >
          {DOCTORS.map((d) => {
            const isSelected = selectedDoctorId === d.id
            return (
              <div
                key={d.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => onSelectDoctor(d.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectDoctor(d.id)
                  }
                }}
                className={['doctor-card', isSelected && 'doctor-card-selected']
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="doctor-avatar">
                  <Image
                    src={d.image}
                    alt={d.name}
                    fill
                    sizes="44px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div className="doctor-name">{d.name}</div>
                  <div className="doctor-specialty">{d.specialty}</div>
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
