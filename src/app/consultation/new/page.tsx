'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  addConsultationFile,
  createConsultation,
  getDoctorSettings,
  getDoctorSlots,
  updateConsultation,
} from '@/lib/consultationService'
import type { DoctorScheduleSettings, TimeSlot } from '@/lib/consultationService'
import { useToasts } from '@/components/Toaster'
import { isDemoMode } from '@/lib/demoMode'
import { StepIndicator } from './_components/StepIndicator'
import { Step0PatientInfo } from './_steps/Step0PatientInfo'
import { Step1Complaint } from './_steps/Step1Complaint'
import { Step2Files } from './_steps/Step2Files'
import { Step3Payment } from './_steps/Step3Payment'
import { Step4Schedule } from './_steps/Step4Schedule'
import { STEPS } from './constants'
import type { FormData } from './types'
import { FORM_INITIAL } from './types'

const PRICE = process.env.NEXT_PUBLIC_CONSULTATION_PRICE || '899'
const IS_DEMO = isDemoMode()

export default function NewConsultation() {
  const router = useRouter()
  const toasts = useToasts()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [consultationId, setConsultationId] = useState<string | null>(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState('khalid')
  const [form, setForm] = useState<FormData>(FORM_INITIAL)
  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [docSettings, setDocSettings] = useState<DoctorScheduleSettings | null>(null)

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const doc = params.get('doctor')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (doc) setSelectedDoctorId(doc)
    const urlStep = params.get('step')
    const urlConsultationId = params.get('consultation')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (urlStep === '4' && urlConsultationId) {
      setStep(4)
      setConsultationId(urlConsultationId)
      const success = params.get('success')
      const transactionId = params.get('id')
      if (success === 'true' && transactionId) {
        updateConsultation(urlConsultationId, {
          status: 'pending_booking',
          payment_id: transactionId,
        }).catch((e) => console.error('Failed to mark consultation as paid:', e))
      }
    }
  }, [])

  useEffect(() => {
    if (step === 3 && consultationId && !checkoutUrl) {
      // External effect: set loading, then trigger network request that updates state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaymentLoading(true)
      fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(PRICE),
          consultationId,
          patient: {
            name: form.patient_name,
            phone: form.patient_phone,
          },
        }),
      })
      .then((res) => res.json())
        .then((data) => {
          if (data.checkoutUrl) setCheckoutUrl(data.checkoutUrl)
          else console.error('Failed to initialize Paymob payment:', data.error)
        })
        .catch((err) => {
          console.error(err)
          toasts.push('خطأ في الاتصال بالخادم لإعداد عملية الدفع.', 'error')
        })
        .finally(() => setPaymentLoading(false))
    }
  }, [step, consultationId, checkoutUrl, form.patient_name, form.patient_phone, toasts])

  useEffect(() => {
    getDoctorSettings(selectedDoctorId).then(setDocSettings)
  }, [selectedDoctorId])

  useEffect(() => {
    if (!selectedDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSlots([])
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlotsLoading(true)
    getDoctorSlots(selectedDoctorId, selectedDate)
      .then(setSlots)
      .finally(() => setSlotsLoading(false))
  }, [selectedDate, selectedDoctorId])

  function nextFromStep0() {
    if (!form.patient_name || !form.patient_phone || !form.patient_age || !form.id_file) {
      toasts.push('الرجاء إدخال الاسم، رقم الجوال، العمر، وإرفاق صورة الهوية الشخصية للمتابعة.', 'warn')
      return
    }
    setStep(1)
  }

  async function submitComplaint() {
    if (!form.chief_complaint) {
      toasts.push('الرجاء شرح الشكوى الرئيسية للمتابعة.', 'warn')
      return
    }
    if (form.pain_locations.length === 0) {
      toasts.push('الرجاء تحديد مكان الألم على الخريطة.', 'warn')
      return
    }
    setLoading(true)
    try {
      const data = await createConsultation({
        patient_name: form.patient_name,
        patient_phone: form.patient_phone,
        patient_age: Number(form.patient_age),
        chief_complaint: form.chief_complaint,
        medical_history: form.medical_history,
        current_medications: form.current_medications,
        doctor_id: selectedDoctorId,
        pain_severity: form.pain_severity,
        pain_natures: form.pain_natures,
        pain_locations: form.pain_locations,
        spinal_areas: form.spinal_areas,
        symptom_start: form.symptom_start,
        previous_treatments: form.previous_treatments,
        previous_surgeries: form.previous_surgeries,
        aggravating_factors: form.aggravating_factors,
        relieving_factors: form.relieving_factors,
        pain_duration: form.pain_duration,
        pain_type: form.pain_natures.join(', '),
        joint_swelling_stiffness: form.joint_swelling_stiffness,
      })
      setConsultationId(data.id)
      if (form.id_file) {
        if (IS_DEMO) {
          await addConsultationFile(data.id, form.id_file.name, '#', 'id_card', 'other')
        } else {
          const file = form.id_file
          const path = `${data.id}/id_card-${Date.now()}-${file.name}`
          const { error: uploadError } = await supabase.storage
            .from('consultation-files')
            .upload(path, file)
          if (!uploadError) {
            const { data: pub } = supabase.storage
              .from('consultation-files')
              .getPublicUrl(path)
            await addConsultationFile(data.id, file.name, pub.publicUrl, file.type, 'other', file.size)
          }
        }
      }
      setStep(2)
    } catch (err) {
      console.error(err)
      toasts.push('حصل خطأ أثناء حفظ البيانات، يرجى المحاولة مجدداً.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function uploadTestsAndFiles() {
    if (!consultationId) return
    setLoading(true)
    try {
      if (form.has_previous_tests === 'yes' && form.uploaded_files.length > 0) {
        for (const fwc of form.uploaded_files) {
          const file = fwc.file
          if (IS_DEMO) {
            await addConsultationFile(consultationId, file.name, '#', file.type, fwc.category, file.size)
            continue
          }
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
          const path = `${consultationId}/${fwc.category}-${Date.now()}-${safeName}`
          const { error: uploadError } = await supabase.storage
            .from('consultation-files')
            .upload(path, file)
          if (!uploadError) {
            const { data: pub } = supabase.storage
              .from('consultation-files')
              .getPublicUrl(path)
            await addConsultationFile(consultationId, file.name, pub.publicUrl, file.type, fwc.category, file.size)
          } else {
            console.warn('Upload failed for', file.name, uploadError)
          }
        }
      }
      setStep(3)
    } catch (err) {
      console.error(err)
      toasts.push('خطأ أثناء رفع الفحوصات والتحاليل الطبية.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function confirmBooking() {
    if (!consultationId || !selectedDate || !selectedTime) return
    setLoading(true)
    try {
      await updateConsultation(consultationId, {
        status: 'submitted',
        appointment_date: selectedDate,
        appointment_time: selectedTime,
      })
      router.push(`/patient/consultation/${consultationId}`)
    } catch (err) {
      console.error(err)
      toasts.push('حدث خطأ أثناء حجز الموعد', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="geo-bg"
      style={{ minHeight: '100vh', padding: '2.5rem 0 4rem', position: 'relative' }}
    >
      <div className="container-narrow" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2.5rem',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--fg-dim)',
              textDecoration: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              transition: 'color 200ms',
            }}
          >
            ← رجوع
          </Link>
          <span
            className="num"
            style={{
              fontSize: '0.82rem',
              color: 'var(--fg-dim)',
              fontWeight: 500,
              direction: 'ltr',
            }}
          >
            الخطوة {step + 1} من {STEPS.length}
          </span>
        </div>

        <StepIndicator step={step} />

        <div style={{ marginBottom: '1.75rem' }}>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: 'var(--fg)',
            }}
          >
            {STEPS[step].label}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--fg-muted)', marginTop: '0.3rem' }}>
            {STEPS[step].description}
          </p>
        </div>

        <div className="card-warm">
          {step === 0 && (
            <Step0PatientInfo
              form={form}
              set={set}
              selectedDoctorId={selectedDoctorId}
              onSelectDoctor={setSelectedDoctorId}
              loading={loading}
              onNext={nextFromStep0}
            />
          )}
          {step === 1 && (
            <Step1Complaint
              form={form}
              set={set}
              loading={loading}
              onSubmit={submitComplaint}
            />
          )}
          {step === 2 && (
            <Step2Files
              form={form}
              set={set}
              loading={loading}
              onUpload={uploadTestsAndFiles}
              onSkipToPayment={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Step3Payment
              price={PRICE}
              paymentLoading={paymentLoading}
              checkoutUrl={checkoutUrl}
              consultationId={consultationId}
            />
          )}
          {step === 4 && (
            <Step4Schedule
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelectDate={(d) => {
                setSelectedDate(d)
                setSelectedTime(null)
              }}
              onSelectTime={setSelectedTime}
              currentMonth={currentMonth}
              onChangeMonth={(delta) => {
                const next = new Date(currentMonth)
                next.setMonth(next.getMonth() + delta)
                setCurrentMonth(next)
              }}
              slots={slots}
              slotsLoading={slotsLoading}
              docSettings={docSettings}
              loading={loading}
              onConfirm={confirmBooking}
            />
          )}
        </div>

        {step > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setStep((s) => s - 1)}
              style={{ fontSize: '0.88rem', padding: '0.7rem 1.5rem' }}
            >
              → السابق
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
