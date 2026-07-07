'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  addConsultationFile,
  createConsultation,
  getConsultationById,
  getDoctorSettings,
  getDoctorSlots,
  updateConsultation,
} from '@/lib/consultationService'
import type { DoctorScheduleSettings, TimeSlot, EnhancedConsultation } from '@/lib/consultationService'
import { useToasts } from '@/components/Toaster'
import { isDemoMode } from '@/lib/demoMode'
import { DOCTORS } from '@/lib/doctors'
import { StepIndicator } from './_components/StepIndicator'
import { Step0PatientInfo } from './_steps/Step0PatientInfo'
import { Step1Complaint } from './_steps/Step1Complaint'
import { Step2Files } from './_steps/Step2Files'
import { Step3Package } from './_steps/Step3Package'
import { Step3Payment } from './_steps/Step3Payment'
import { Step4Schedule } from './_steps/Step4Schedule'
import { STEPS } from './constants'
import type { FormData } from './types'
import { FORM_INITIAL } from './types'

const PRICE = process.env.NEXT_PUBLIC_CONSULTATION_PRICE || '799'
const COMPREHENSIVE_PRICE = process.env.NEXT_PUBLIC_COMPREHENSIVE_PRICE || '1700'
const FOLLOWUP_PRICE = process.env.NEXT_PUBLIC_FOLLOWUP_PRICE || '2000'
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
  const [redirectResolving, setRedirectResolving] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const doc = params.get('doctor')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (doc) setSelectedDoctorId(doc)

    // Detect Paymob redirect back — check for ?success=true or ?step=5
    const success = params.get('success')
    const transactionId = params.get('id')
    const orderId = params.get('order')
    const urlStep = params.get('step')
    const urlConsultationId = params.get('consultation') || orderId

    if ((urlStep === '5' || success === 'true') && urlConsultationId) {
      setStep(5)
      setConsultationId(urlConsultationId)
      if (success === 'true' && transactionId) {
        updateConsultation(urlConsultationId, {
          status: 'pending_booking',
          payment_id: transactionId,
        }).catch((e) => console.error('Failed to mark consultation as paid:', e))
      }
    }
    setRedirectResolving(false)
  }, [])

  const packagePrices = {
    basic: docSettings?.consultationPrice ?? Number(PRICE),
    comprehensive: docSettings?.comprehensivePrice ?? Number(COMPREHENSIVE_PRICE),
    followup: docSettings?.packagePrice3 ?? Number(FOLLOWUP_PRICE),
  }
  const currentPrice = String(
    form.selected_package === 'comprehensive' ? packagePrices.comprehensive
    : form.selected_package === 'followup' ? packagePrices.followup
    : packagePrices.basic
  )

  useEffect(() => {
    if (step === 4 && consultationId && !checkoutUrl) {
      // Trigger network request; loading flag is set before the request fires.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaymentLoading(true)
      fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(currentPrice),
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
  }, [step, consultationId, checkoutUrl, form.patient_name, form.patient_phone, toasts, currentPrice])

  useEffect(() => {
    getDoctorSettings(selectedDoctorId).then(setDocSettings)
  }, [selectedDoctorId])

  useEffect(() => {
    setTimeout(() => {
      setCheckoutUrl(null)
    }, 0)
  }, [form.selected_package])

  useEffect(() => {
    if (!selectedDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSlots([])
      return
    }
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
    if (form.pain_locations.length === 0 && !form.pain_widespread) {
      toasts.push('الرجاء تحديد مكان الألم على الخريطة أو اختيار "ألم منتشر".', 'warn')
      return
    }
    setLoading(true)
    try {
      let data
      if (consultationId) {
        const updated = await updateConsultation(consultationId, {
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
        data = updated || await getConsultationById(consultationId) as EnhancedConsultation
      } else {
        data = await createConsultation({
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
      }
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

      // Create Google Calendar event if the doctor has connected their calendar
      try {
        const doctor = DOCTORS.find((d) => d.id === selectedDoctorId) || DOCTORS[0]
        const res = await fetch('/api/calendar/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            doctorId: selectedDoctorId,
            consultationId,
            consultation: {
              patientName: form.patient_name,
              patientPhone: form.patient_phone,
              chiefComplaint: form.chief_complaint,
              date: selectedDate,
              time: selectedTime,
              doctorName: doctor.name,
            },
          }),
        })
        if (res.ok) {
          const data = await res.json() as { eventId?: string | null }
          if (data.eventId) {
            await updateConsultation(consultationId, {
              google_calendar_event_id: data.eventId,
            })
          }
        }
      } catch {
        // Calendar event creation is best-effort — don't block booking
      }

      router.push(`/consultation/success?doctor=${selectedDoctorId}&consultation=${consultationId}`)
    } catch (err) {
      console.error(err)
      toasts.push('حدث خطأ أثناء حجز الموعد', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="booking-page">
      <div className="booking-inner">
        <div className="booking-header">
          <Link href="/" className="booking-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            رجوع
          </Link>
          <span className="booking-step-count num">
            الخطوة {step + 1} من {STEPS.length}
          </span>
        </div>

        <StepIndicator step={step} />

        <div style={{ marginBottom: '1.75rem' }}>
          <h1 className="booking-step-title" style={{
            fontSize: '1.6rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
          }}>{STEPS[step].label}</h1>
          <p className="booking-step-desc">{STEPS[step].description}</p>
        </div>

        <div className="booking-card">
          {redirectResolving ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div className="spinner" />
              <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--fg-dim)' }}>
                جاري تحميل صفحة الحجز...
              </p>
            </div>
          ) : (
            <>
          {step === 0 && (
            <Step0PatientInfo
              form={form}
              set={set}
              selectedDoctorId={selectedDoctorId}
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
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Step3Package
              form={form}
              set={set}
              prices={packagePrices}
              loading={loading}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <Step3Payment
              price={currentPrice}
              doctorName={DOCTORS.find((d) => d.id === selectedDoctorId)?.name || DOCTORS[0].name}
              paymentLoading={paymentLoading}
              checkoutUrl={checkoutUrl}
              consultationId={consultationId}
            />
          )}
          {step === 5 && (
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
            </>
          )}
        </div>

        {step > 0 && (
          <div className="booking-back-row">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setStep((s) => s - 1)}
              style={{ fontSize: '0.88rem', padding: '0.7rem 1.5rem' }}
            >
              السابق
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
