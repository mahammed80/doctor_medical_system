'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { DOCTORS } from '@/lib/doctors'
import { createConsultation, updateConsultation, saveLocalUploadedFile, getDoctorSlots, getDoctorSettings } from '@/lib/consultationService'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Initialize Stripe with the publishable key from environment variables
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

type FormData = {
  patient_name: string
  patient_phone: string
  patient_age: string
  chief_complaint: string
  medical_history: string
  current_medications: string
  id_file: File | null
  has_previous_tests: 'yes' | 'no' | ''
  xray_files: File[]
  blood_files: File[]
  pain_duration: string
  pain_type: string
  joint_swelling_stiffness: string
}

const STEPS = [
  { label: 'بياناتك والتحقق', sub: 'المعلومات الشخصية والهوية' },
  { label: 'الشكوى الطبية', sub: 'تفاصيل الحالة الصحية' },
  { label: 'الأشعة والتحاليل', sub: 'المستندات والفحوصات' },
  { label: 'الدفع',          sub: 'رسوم الاستشارة' },
  { label: 'الموعد',     sub: 'اختر وقتك' },
]

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
]

function StripePaymentForm({
  clientSecret,
  price,
  consultationId,
  onSuccess,
}: {
  clientSecret: string
  price: string
  consultationId: string
  onSuccess: (paymentId: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setErrorMessage(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setErrorMessage(submitError.message || 'خطأ في معالجة معلومات الدفع.')
      setLoading(false)
      return
    }

    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/consultation/new?step=4&consultation=${consultationId}`,
        },
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(error.message || 'فشلت عملية الدفع.')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      } else {
        setErrorMessage('حالة الدفع غير معروفة.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ غير متوقع أثناء الدفع.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{
        background: 'var(--bg)',
        borderRadius: 'var(--r-lg)',
        padding: '1.25rem',
        border: '1px solid var(--border-faint)',
        direction: 'ltr',
      }}>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {errorMessage && (
        <div style={{
          color: 'var(--err)',
          background: 'var(--err-soft)',
          border: '1px solid var(--err)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          fontWeight: 700,
          textAlign: 'right',
        }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <button
        type="submit"
        className="btn-primary"
        disabled={!stripe || loading}
        style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
      >
        {loading ? <Spinner /> : `ادفع ${price} ريال أونلاين`}
      </button>
    </form>
  )
}

export default function NewConsultation() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [consultationId, setConsultationId] = useState<string | null>(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState('khalid')
  const [form, setForm] = useState<FormData>({
    patient_name: '',
    patient_phone: '',
    patient_age: '',
    chief_complaint: '',
    medical_history: '',
    current_medications: '',
    id_file: null,
    has_previous_tests: '',
    xray_files: [],
    blood_files: [],
    pain_duration: 'أقل من أسبوع',
    pain_type: 'ألم متقطع مع الحركة',
    joint_swelling_stiffness: 'لا',
  })

  // Custom scheduling calendar states
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [slots, setSlots] = useState<any[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [docSettings, setDocSettings] = useState<any>(null)

  const price = process.env.NEXT_PUBLIC_CONSULTATION_PRICE || '899'
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)

  const set = (k: keyof FormData, v: any) => setForm(f => ({ ...f, [k]: v }))
  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const doc = params.get('doctor')
      if (doc && DOCTORS.some(d => d.id === doc)) {
        setSelectedDoctorId(doc)
      }

      // Check if redirected from Stripe (e.g. after 3D Secure verification)
      const urlStep = params.get('step')
      const urlConsultationId = params.get('consultation')
      if (urlStep === '4' && urlConsultationId) {
        setStep(4)
        setConsultationId(urlConsultationId)
        
        const paymentIntentId = params.get('payment_intent')
        if (paymentIntentId) {
          updateConsultation(urlConsultationId, {
            status: 'pending_booking',
            payment_id: paymentIntentId,
          })
        }
      }
    }
  }, [])

  useEffect(() => {
    if (step === 3 && consultationId && !clientSecret) {
      setPaymentLoading(true)
      fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseInt(price), consultationId }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret)
          } else {
            console.error('Failed to get client secret:', data.error)
            alert('خطأ في إعداد بوابة الدفع الإلكتروني.')
          }
        })
        .catch(err => {
          console.error(err)
          alert('خطأ في الاتصال بالخادم لإعداد عملية الدفع.')
        })
        .finally(() => {
          setPaymentLoading(false)
        })
    }
  }, [step, consultationId, price, clientSecret])

  async function handlePaymentSuccess(paymentId: string) {
    if (consultationId) {
      try {
        await updateConsultation(consultationId, {
          status: 'pending_booking',
          payment_id: paymentId,
        })
      } catch (e) {
        console.error('Error updating consultation status:', e)
      }
    }
    setStep(4)
  }

  function nextFromStep0() {
    if (!form.patient_name || !form.patient_phone || !form.patient_age || !form.id_file) {
      alert('الرجاء إدخال الاسم، رقم الجوال، العمر، وإرفاق صورة الهوية الشخصية للمتابعة.')
      return
    }
    setStep(1)
  }

  async function submitComplaint() {
    if (!form.chief_complaint) {
      alert('الرجاء شرح الشكوى الرئيسية للمتابعة.')
      return
    }
    setLoading(true)
    try {
      // 1. Create the consultation database record
      const data = await createConsultation({
        patient_name: form.patient_name,
        patient_phone: form.patient_phone,
        patient_age: parseInt(form.patient_age),
        chief_complaint: form.chief_complaint,
        medical_history: form.medical_history,
        current_medications: form.current_medications,
        doctor_id: selectedDoctorId,
        pain_duration: form.pain_duration,
        pain_type: form.pain_type,
        joint_swelling_stiffness: form.joint_swelling_stiffness,
      })
      setConsultationId(data.id)

      // 2. Upload the ID file linked to the consultation ID
      if (form.id_file) {
        if (isDemo) {
          await saveLocalUploadedFile(data.id, `هوية_${form.patient_name}_${form.id_file.name}`, 'id_card')
        } else {
          const file = form.id_file
          const path = `${data.id}/id_card-${Date.now()}-${file.name}`
          const { error: uploadError } = await supabase.storage.from('consultation-files').upload(path, file)
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('consultation-files').getPublicUrl(path)
            await supabase.from('consultation_files').insert({
              consultation_id: data.id,
              file_name: `هوية_${form.patient_name}_${file.name}`,
              file_url: publicUrl,
              file_type: 'id_card'
            })
          }
        }
      }
      setStep(2)
    } catch (err) {
      alert('حصل خطأ أثناء حفظ البيانات، يرجى المحاولة مجدداً.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function uploadTestsAndFiles() {
    setLoading(true)
    if (!consultationId) return
    try {
      if (form.has_previous_tests === 'yes') {
        if (isDemo) {
          await new Promise(r => setTimeout(r, 900))
          for (const file of form.xray_files) {
            await saveLocalUploadedFile(consultationId, `أشعة_${file.name}`, 'xray')
          }
          for (const file of form.blood_files) {
            await saveLocalUploadedFile(consultationId, `تحليل_${file.name}`, 'blood_analytics')
          }
          setStep(3)
          return
        }

        // Upload X-rays
        for (const file of form.xray_files) {
          const path = `${consultationId}/xray-${Date.now()}-${file.name}`
          const { error: uploadError } = await supabase.storage.from('consultation-files').upload(path, file)
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('consultation-files').getPublicUrl(path)
            await supabase.from('consultation_files').insert({
              consultation_id: consultationId,
              file_name: `أشعة_${file.name}`,
              file_url: publicUrl,
              file_type: 'xray'
            })
          }
        }

        // Upload Blood tests
        for (const file of form.blood_files) {
          const path = `${consultationId}/blood-${Date.now()}-${file.name}`
          const { error: uploadError } = await supabase.storage.from('consultation-files').upload(path, file)
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('consultation-files').getPublicUrl(path)
            await supabase.from('consultation_files').insert({
              consultation_id: consultationId,
              file_name: `تحليل_${file.name}`,
              file_url: publicUrl,
              file_type: 'blood_analytics'
            })
          }
        }
      }
      setStep(3)
    } catch (err) {
      alert('خطأ أثناء رفع الفحوصات والتحاليل الطبية.')
    } finally {
      setLoading(false)
    }
  }

  // Native Custom Scheduler data loaders
  useEffect(() => {
    getDoctorSettings(selectedDoctorId).then(settings => {
      setDocSettings(settings)
    })
  }, [selectedDoctorId])

  useEffect(() => {
    if (selectedDate) {
      setSlotsLoading(true)
      getDoctorSlots(selectedDoctorId, selectedDate).then(data => {
        setSlots(data)
        setSlotsLoading(false)
      })
    } else {
      setSlots([])
    }
  }, [selectedDate, selectedDoctorId])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const numDays = new Date(year, month + 1, 0).getDate()
    
    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= numDays; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const formatDateStr = (d: Date) => {
    const y = d.getFullYear()
    const m = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  return (
    <div className="geo-bg" style={{
      minHeight: '100vh',
      padding: '2.5rem 0 4rem',
      position: 'relative',
    }}>
      <div className="container-narrow" style={{ position: 'relative', zIndex: 1 }}>

        {/* Top nav */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2.5rem',
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--fg-dim)',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            transition: 'color 200ms',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-dim)')}>
            ← رجوع
          </Link>
          <span className="num" style={{
            fontSize: '0.82rem',
            color: 'var(--fg-dim)',
            fontWeight: 500,
            direction: 'ltr',
          }}>
            الخطوة {step + 1} من {STEPS.length}
          </span>
        </div>

        {/* ── Step indicators ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          marginBottom: '3rem',
          position: 'relative',
        }}>
          {/* Background track */}
          <div style={{
            position: 'absolute', top: '22px', left: '10%', right: '10%',
            height: '2px',
            background: 'var(--border-faint)',
            zIndex: 0,
          }} />
          <div style={{
            position: 'absolute', top: '22px', left: '10%',
            width: step > 0 ? `${(step / (STEPS.length - 1)) * 80}%` : '0%',
            height: '2px',
            background: 'linear-gradient(90deg, var(--ok), var(--primary))',
            zIndex: 0,
            transition: 'width 500ms var(--ease-out)',
          }} />

          {STEPS.map((s, i) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', flex: 'none' }}>
                <div className="num" style={{
                  width: i === step ? '46px' : i < step ? '40px' : '38px',
                  height: i === step ? '46px' : i < step ? '40px' : '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-inter), sans-serif',
                  fontSize: i === step ? '0.9rem' : i < step ? '0.85rem' : '0.78rem',
                  fontWeight: 800,
                  transition: 'all 500ms var(--ease-spring)',
                  background: i < step ? 'var(--ok)' : i === step ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)' : 'var(--surface)',
                  border: i < step ? '2px solid var(--ok)' : i === step ? '2px solid var(--primary)' : '2px solid var(--border)',
                  color: i <= step ? 'white' : 'var(--fg-dim)',
                  boxShadow: i === step ? '0 0 0 5px var(--primary-soft), 0 4px 20px var(--primary-glow)' : i < step ? '0 0 0 3px var(--ok-soft)' : 'var(--shadow-sm)',
                  position: 'relative',
                }}>
                  {i < step ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                  {/* Gold ring on active */}
                  {i === step && (
                    <div style={{
                      position: 'absolute', inset: '-4px',
                      borderRadius: '50%',
                      border: '1.5px solid var(--gold)',
                      opacity: 0.3,
                      animation: 'pulse-soft 2s ease-in-out infinite',
                      pointerEvents: 'none',
                    }} />
                  )}
                </div>
                <span style={{
                  fontSize: '0.68rem',
                  color: i === step ? 'var(--primary)' : i < step ? 'var(--ok)' : 'var(--fg-dim)',
                  fontWeight: i === step ? 700 : i < step ? 600 : 400,
                  whiteSpace: 'nowrap',
                  transition: 'color 400ms',
                }}>
                  {s.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Step title */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: 'var(--fg)',
          }}>
            {STEPS[step].label}
          </h1>
          <p style={{
            fontSize: '0.88rem',
            color: 'var(--fg-muted)',
            marginTop: '0.3rem',
          }}>
            {step === 0 && 'أدخل معلوماتك الأساسية لبدء الاستشارة'}
            {step === 1 && 'ارفع ملفاتك الطبية إن وجدت (اختياري)'}
            {step === 2 && 'رسوم الاستشارة 300 ريال'}
            {step === 3 && 'اختر الوقت المناسب لجلستك مع الدكتور'}
          </p>
        </div>

        {/* Card */}
        <div className="card-warm">
          {/* ── STEP 0 ── */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Field label="اختر الطبيب الاستشاري" required>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                  marginBottom: '0.5rem',
                }}>
                  {DOCTORS.map(d => {
                    const isSelected = selectedDoctorId === d.id
                    return (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDoctorId(d.id)}
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
                        onMouseEnter={e => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--border-accent)'
                            e.currentTarget.style.background = 'var(--surface-up)'
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--border)'
                            e.currentTarget.style.background = 'var(--surface)'
                          }
                        }}
                      >
                        {/* Doctor Avatar */}
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '1.5px solid var(--border)',
                          flexShrink: 0,
                          position: 'relative'
                        }}>
                          <Image
                            src={d.image}
                            alt={d.name}
                            fill
                            sizes="40px"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{
                            fontSize: '0.88rem',
                            fontWeight: 800,
                            color: 'var(--fg)',
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                          }}>
                            {d.name}
                          </div>
                          <div style={{
                            fontSize: '0.68rem',
                            color: 'var(--fg-dim)',
                            marginTop: '0.15rem',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                          }}>
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
                  onChange={e => set('patient_name', e.target.value)}
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
                    onChange={e => set('patient_phone', e.target.value)}
                  />
                </Field>
                <Field label="العمر" required>
                  <input
                    className="input"
                    type="number"
                    placeholder="35"
                    value={form.patient_age}
                    onChange={e => set('patient_age', e.target.value)}
                  />
                </Field>
              </div>

              <Field label="إثبات الهوية الشخصية (بطاقة الأحوال / الإقامة / جواز السفر)" required>
                <IdDropZone
                  file={form.id_file}
                  onChange={file => set('id_file', file)}
                />
              </Field>

              <button
                className="btn-primary"
                style={{ justifyContent: 'center', marginTop: '0.5rem' }}
                disabled={!form.patient_name || !form.patient_phone || !form.patient_age || !form.id_file || loading}
                onClick={nextFromStep0}
              >
                التالي
              </button>
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Field label="ما هي الشكوى الرئيسية التي تعاني منها؟" required>
                <textarea
                  className="input"
                  placeholder="مثال: ألم حاد في الركبة اليسرى يزداد عند صعود الدرج..."
                  value={form.chief_complaint}
                  onChange={e => set('chief_complaint', e.target.value)}
                  style={{ minHeight: '100px', fontWeight: 500 }}
                />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="منذ متى بدأت هذه الشكوى؟" required>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {['أقل من أسبوع', 'من أسبوع إلى شهر', 'من شهر إلى 6 أشهر', 'أكثر من 6 أشهر'].map(opt => {
                      const isSelected = form.pain_duration === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => set('pain_duration', opt)}
                          style={{
                            padding: '0.65rem 0.5rem',
                            borderRadius: 'var(--r-sm)',
                            border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                            background: isSelected ? 'var(--primary-soft)' : 'var(--surface)',
                            color: isSelected ? 'var(--primary)' : 'var(--fg)',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 150ms'
                          }}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </Field>

                <Field label="كيف تصف طبيعة الألم؟" required>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.4rem' }}>
                    {['ألم حاد ومفاجئ', 'ألم مستمر وضئيل (باهت)', 'ألم متقطع مع الحركة'].map(opt => {
                      const isSelected = form.pain_type === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => set('pain_type', opt)}
                          style={{
                            padding: '0.55rem 0.5rem',
                            borderRadius: 'var(--r-sm)',
                            border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                            background: isSelected ? 'var(--primary-soft)' : 'var(--surface)',
                            color: isSelected ? 'var(--primary)' : 'var(--fg)',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 150ms',
                            textAlign: 'right',
                            paddingRight: '1rem'
                          }}
                        >
                          {isSelected ? '● ' : '○ '} {opt}
                        </button>
                      )
                    })}
                  </div>
                </Field>
              </div>

              <Field label="هل تعاني من تورم أو تيبس في المفاصل؟" required>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['نعم', 'لا'].map(opt => {
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
                          transition: 'all 150ms'
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
                    style={{ minHeight: '80px' }}
                    placeholder="أمراض مزمنة، عمليات سابقة..."
                    value={form.medical_history}
                    onChange={e => set('medical_history', e.target.value)}
                  />
                </Field>
                <Field label="الأدوية الحالية" optional>
                  <textarea
                    className="input"
                    style={{ minHeight: '80px' }}
                    placeholder="اسم الدواء والجرعة..."
                    value={form.current_medications}
                    onChange={e => set('current_medications', e.target.value)}
                  />
                </Field>
              </div>

              <button
                className="btn-primary"
                style={{ justifyContent: 'center', marginTop: '0.5rem' }}
                disabled={!form.chief_complaint || loading}
                onClick={submitComplaint}
              >
                {loading ? <Spinner /> : 'التالي (حفظ البيانات)'}
              </button>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--fg)' }}>
                  هل لديك أي صور أشعة أو تحاليل طبية سابقة؟
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--fg-dim)', marginTop: '0.25rem' }}>
                  مشاركة الفحوصات السابقة تساعد الطبيب على تشخيص الحالة بشكل أدق.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={() => set('has_previous_tests', 'yes')}
                  style={{
                    padding: '1.25rem 1rem',
                    borderRadius: 'var(--r)',
                    border: `1.8px solid ${form.has_previous_tests === 'yes' ? 'var(--primary)' : 'var(--border)'}`,
                    background: form.has_previous_tests === 'yes' ? 'var(--primary-soft)' : 'var(--surface)',
                    color: form.has_previous_tests === 'yes' ? 'var(--primary)' : 'var(--fg)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 200ms',
                    textAlign: 'center',
                    boxShadow: form.has_previous_tests === 'yes' ? '0 4px 12px var(--primary-glow)' : 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>📁</div>
                  نعم، لدي ملفات سابقة
                </button>
                <button
                  type="button"
                  onClick={() => {
                    set('has_previous_tests', 'no')
                    setForm(f => ({ ...f, xray_files: [], blood_files: [], has_previous_tests: 'no' }))
                  }}
                  style={{
                    padding: '1.25rem 1rem',
                    borderRadius: 'var(--r)',
                    border: `1.8px solid ${form.has_previous_tests === 'no' ? 'var(--primary)' : 'var(--border)'}`,
                    background: form.has_previous_tests === 'no' ? 'var(--primary-soft)' : 'var(--surface)',
                    color: form.has_previous_tests === 'no' ? 'var(--primary)' : 'var(--fg)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 200ms',
                    textAlign: 'center',
                    boxShadow: form.has_previous_tests === 'no' ? '0 4px 12px var(--primary-glow)' : 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>❌</div>
                  لا، لا توجد لدي ملفات
                </button>
              </div>

              {form.has_previous_tests === 'yes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'scaleIn 0.3s var(--ease-out)' }}>
                  <Field label="تحميل صور الأشعة الطبية (X-Ray / MRI / CT)" optional>
                    <DropZone
                      files={form.xray_files}
                      onAdd={newFiles => setForm(f => ({ ...f, xray_files: [...f.xray_files, ...newFiles] }))}
                      onRemove={i => setForm(f => ({ ...f, xray_files: f.xray_files.filter((_, j) => j !== i) }))}
                    />
                  </Field>

                  <Field label="تحميل نتائج تحاليل الدم والتحاليل المخبرية" optional>
                    <DropZone
                      files={form.blood_files}
                      onAdd={newFiles => setForm(f => ({ ...f, blood_files: [...f.blood_files, ...newFiles] }))}
                      onRemove={i => setForm(f => ({ ...f, blood_files: f.blood_files.filter((_, j) => j !== i) }))}
                    />
                  </Field>
                </div>
              )}

              {form.has_previous_tests === 'no' && (
                <button
                  className="btn-primary"
                  onClick={() => setStep(3)}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                >
                  التالي
                </button>
              )}

              {form.has_previous_tests === 'yes' && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    className="btn-ghost"
                    onClick={() => setStep(3)}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    تخطى
                  </button>
                  <button
                    className="btn-primary"
                    onClick={uploadTestsAndFiles}
                    disabled={loading}
                    style={{ flex: 2, justifyContent: 'center' }}
                  >
                    {loading ? <Spinner /> : 'التالي (رفع ومتابعة)'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3 ── */}
          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div>
              {/* Price - enhanced */}
              <div style={{
                textAlign: 'center',
                padding: '2rem 0 2rem',
                position: 'relative',
              }}>
                {/* Decorative gold ring */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '220px', height: '220px',
                  borderRadius: '50%',
                  border: '1px solid rgba(194, 154, 104, 0.08)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '180px', height: '180px',
                  borderRadius: '50%',
                  border: '1px solid rgba(194, 154, 104, 0.04)',
                  pointerEvents: 'none',
                }} />

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--gold)',
                  marginBottom: '1.25rem',
                  padding: '0.35rem 1rem',
                  borderRadius: '9999px',
                  background: 'var(--gold-soft)',
                  border: '1px solid rgba(194, 154, 104, 0.25)',
                  position: 'relative',
                }}>
                  <span style={{ fontSize: '0.55rem' }}>◇</span>
                  رسوم الاستشارة
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  gap: '0.3rem',
                }}>
                  <span className="num" style={{
                    fontSize: '4.5rem',
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 50%, var(--primary-down) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 0.9,
                    backgroundSize: '200% 200%',
                    animation: 'shimmer 4s ease-in-out infinite',
                  }}>
                    {price}
                  </span>
                  <span style={{
                    fontSize: '1.2rem',
                    color: 'var(--fg-muted)',
                    fontWeight: 500,
                  }}>
                    ريال
                  </span>
                </div>
                <div style={{
                  fontSize: '0.82rem',
                  color: 'var(--fg-muted)',
                  marginTop: '0.75rem',
                }}>
                  استشارة مع د. خالد بترجي
                </div>
              </div>

              {/* Gold accent divider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                marginBottom: '2rem',
              }}>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />
                <div style={{
                  width: '6px', height: '6px',
                  background: 'var(--gold)', opacity: 0.3,
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                }} />
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />
              </div>

              {/* Stripe Payment Form container */}
              {paymentLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <Spinner />
                  <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--fg-dim)' }}>
                    جاري تحميل بوابة الدفع الآمنة من Stripe...
                  </p>
                </div>
              ) : clientSecret && consultationId ? (
                <Elements stripe={stripePromise} options={{ clientSecret, locale: 'ar' }}>
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    price={price}
                    consultationId={consultationId}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem 1.5rem',
                  background: 'var(--err-soft)',
                  border: '1.5px solid var(--err)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--err)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}>
                  حدث خطأ أثناء الاتصال ببوابة الدفع. يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً.
                </div>
              )}

              {/* Trust badges footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '2rem',
              }}>
                <div style={{
                  width: '18px', height: '18px',
                  borderRadius: '4px',
                  background: 'var(--ok-soft)',
                  border: '1px solid var(--border-accent)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ok)',
                  fontSize: '0.5rem',
                  fontWeight: 700,
                }}>
                  ✓
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--fg-dim)' }}>
                  الدفع مشفر وآمن 256-bit SSL
                </span>
                <span style={{
                  width: '3px', height: '3px', borderRadius: '50%',
                  background: 'var(--border)', display: 'inline-block',
                }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--fg-dim)' }}>
                  مدعوم من Stripe
                </span>
              </div>
            </div>
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                background: 'var(--ok-soft)',
                border: '1px solid var(--border-accent)',
                borderRadius: 'var(--r)',
                marginBottom: '1.5rem',
                animation: 'scaleIn 0.4s var(--ease-out)',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--ok)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  ✓
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--fg)' }}>
                    تم استلام الدفع بنجاح
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--fg-muted)', marginTop: '0.1rem' }}>
                    اختر الوقت المناسب لجلستك مع الدكتور
                  </div>
                </div>
              </div>

              {/* Native Calendar Interface */}
              <div className="card-warm" style={{
                padding: '1.5rem',
                border: '1px solid var(--border-faint)',
                borderRadius: 'var(--r-lg)',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '1.5rem'
              }}>
                {/* Month Selector Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem'
                }}>
                  <button
                    className="btn-ghost"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                    onClick={() => {
                      const prev = new Date(currentMonth)
                      prev.setMonth(prev.getMonth() - 1)
                      setCurrentMonth(prev)
                    }}
                  >
                    السابق ◀
                  </button>
                  <span className="num" style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--fg)' }}>
                    {ARABIC_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button
                    className="btn-ghost"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                    onClick={() => {
                      const next = new Date(currentMonth)
                      next.setMonth(next.getMonth() + 1)
                      setCurrentMonth(next)
                    }}
                  >
                    ▶ التالي
                  </button>
                </div>

                {/* Weekdays Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '0.35rem',
                  textAlign: 'center',
                  marginBottom: '0.5rem'
                }}>
                  {['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'].map(w => (
                    <div key={w} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--fg-dim)', paddingBottom: '0.25rem' }}>
                      {w}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '0.35rem'
                }}>
                  {getDaysInMonth(currentMonth).map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} />

                    const dateStr = formatDateStr(day)
                    const isSelected = selectedDate === dateStr
                    const today = new Date()
                    today.setHours(0,0,0,0)
                    const isPast = day < today
                    
                    const dayOfWeek = day.getDay()
                    const workingDays = docSettings?.workingDays || [0,1,2,3,4]
                    const isWorking = workingDays.includes(dayOfWeek)

                    const disabled = isPast || !isWorking

                    return (
                      <button
                        key={dateStr}
                        disabled={disabled}
                        onClick={() => {
                          setSelectedDate(dateStr)
                          setSelectedTime(null)
                        }}
                        className="num"
                        style={{
                          aspectRatio: '1',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isSelected 
                            ? '1.5px solid var(--primary)' 
                            : '1px solid var(--border-faint)',
                          background: isSelected 
                            ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)'
                            : disabled 
                            ? 'var(--surface-subtle)' 
                            : 'var(--bg)',
                          color: isSelected 
                            ? 'white' 
                            : disabled 
                            ? 'var(--fg-dim)' 
                            : 'var(--fg)',
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          opacity: disabled ? 0.45 : 1,
                          fontSize: '0.82rem',
                          fontWeight: isSelected || !disabled ? 700 : 400,
                          transition: 'all 200ms',
                          position: 'relative'
                        }}
                        onMouseEnter={e => {
                          if (!disabled && !isSelected) {
                            e.currentTarget.style.background = 'var(--primary-soft)'
                          }
                        }}
                        onMouseLeave={e => {
                          if (!disabled && !isSelected) {
                            e.currentTarget.style.background = 'var(--bg)'
                          }
                        }}
                      >
                        {day.getDate()}
                        {!isWorking && !isPast && (
                          <span style={{ fontSize: '0.45rem', display: 'block', color: 'var(--fg-dim)', fontWeight: 400 }}>مغلق</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time Slots Area */}
              <div className="card-warm" style={{
                padding: '1.5rem',
                border: '1px solid var(--border-faint)',
                borderRadius: 'var(--r-lg)',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '4px', height: '14px', borderRadius: '2px', background: 'var(--gold)' }} />
                  الأوقات المتاحة ليوم {selectedDate ? (
                    <span className="num" style={{ color: 'var(--primary)' }}>{new Date(selectedDate).toLocaleDateString('ar-SA-u-nu-latn', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  ) : '...'}
                </h3>

                {slotsLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <Spinner />
                    <p style={{ fontSize: '0.8rem', color: 'var(--fg-dim)', marginTop: '0.5rem' }}>جاري تحميل الأوقات...</p>
                  </div>
                ) : !selectedDate ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--fg-dim)', background: 'var(--bg)', borderRadius: 'var(--r)', border: '1px dashed var(--border)' }}>
                    📅 الرجاء اختيار تاريخ من التقويم في الأعلى لعرض الأوقات المتاحة
                  </div>
                ) : slots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--fg-dim)', background: 'var(--bg)', borderRadius: 'var(--r)', border: '1px dashed var(--border)' }}>
                    📭 عذراً، لا توجد فترات عمل متاحة في هذا اليوم
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                    gap: '0.5rem'
                  }}>
                    {slots.map(slot => {
                      const isTimeSelected = selectedTime === slot.time
                      const slotDisabled = !slot.available

                      return (
                        <button
                          key={slot.time}
                          disabled={slotDisabled}
                          onClick={() => setSelectedTime(slot.time)}
                          className="num"
                          style={{
                            padding: '0.6rem 0.5rem',
                            borderRadius: '8px',
                            border: isTimeSelected 
                              ? '1.5px solid var(--gold)' 
                              : '1px solid var(--border-faint)',
                            background: isTimeSelected 
                              ? 'var(--gold-soft)' 
                              : slotDisabled 
                              ? 'var(--surface-subtle)' 
                              : 'var(--bg)',
                            color: isTimeSelected 
                              ? 'var(--gold)' 
                              : slotDisabled 
                              ? 'var(--fg-dim)' 
                              : 'var(--fg)',
                            cursor: slotDisabled ? 'not-allowed' : 'pointer',
                            opacity: slotDisabled ? 0.55 : 1,
                            textDecoration: slotDisabled ? 'line-through' : 'none',
                            fontSize: '0.82rem',
                            fontWeight: isTimeSelected ? 800 : 600,
                            transition: 'all 200ms',
                            textAlign: 'center'
                          }}
                        >
                          {slot.time}
                          {slotDisabled && (
                            <span style={{ fontSize: '0.55rem', display: 'block', color: 'var(--err)', textDecoration: 'none', fontWeight: 500 }}>محجوز</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Summary of selection */}
              {selectedDate && selectedTime && (
                <div style={{
                  padding: '0.95rem 1.25rem',
                  background: 'var(--primary-soft)',
                  border: '1.5px solid var(--primary)',
                  borderRadius: 'var(--r)',
                  marginBottom: '1.5rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  animation: 'scaleIn 0.3s var(--ease-out)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>
                    📌 الموعد المختار: {new Date(selectedDate).toLocaleDateString('ar-SA-u-nu-latn', { weekday: 'long', day: 'numeric', month: 'long' })} في تمام الساعة <span className="num">{selectedTime}</span>
                  </span>
                  <span className="num" style={{ fontSize: '0.72rem', color: 'var(--fg-dim)', fontWeight: 400 }}>بانتظار موافقة الطبيب</span>
                </div>
              )}

              {/* Confirm booking button */}
              <button
                className="btn-primary"
                disabled={!selectedDate || !selectedTime || loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', padding: '1rem' }}
                onClick={async () => {
                  if (consultationId && selectedDate && selectedTime) {
                    setLoading(true)
                    try {
                      await updateConsultation(consultationId, {
                        status: 'pending_approval',
                        appointment_date: selectedDate,
                        appointment_time: selectedTime,
                      })
                      router.push(`/consultation/success?doctor=${selectedDoctorId}`)
                    } catch (err) {
                      alert('حدث خطأ أثناء حجز الموعد')
                    } finally {
                      setLoading(false)
                    }
                  }
                }}
              >
                {loading ? <Spinner /> : 'تأكيد وحجز الموعد'}
              </button>
            </div>
          )}
        </div>

        {/* Previous step button */}
        {step > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <button
              className="btn-ghost"
              onClick={() => setStep(s => s - 1)}
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

function Field({ label, optional, required, children }: { label: string; optional?: boolean; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="field">
      <label className="label">
        {label}
        {required && <span style={{ color: 'var(--err)', marginRight: '0.2rem', fontSize: '0.8rem' }}>*</span>}
        {optional && <span style={{ color: 'var(--fg-dim)', fontWeight: 400, marginRight: '0.35rem', fontSize: '0.78rem' }}>(اختياري)</span>}
      </label>
      {children}
    </div>
  )
}

function IdDropZone({ file, onChange }: { file: File | null; onChange: (f: File | null) => void }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0])
    }
  }, [onChange])

  return (
    <div
      style={{
        border: `1.5px dashed ${dragOver ? 'var(--primary)' : 'var(--border-accent)'}`,
        borderRadius: 'var(--r-lg)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        cursor: 'pointer',
        background: dragOver ? 'var(--primary-soft)' : 'var(--primary-subtle)',
        transition: 'all 200ms var(--ease-out)',
        position: 'relative'
      }}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={e => {
          if (e.target.files && e.target.files[0]) {
            onChange(e.target.files[0])
          }
        }}
      />
      {file ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'rtl' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
            <span style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--ok-soft)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              flexShrink: 0,
            }}>
              🪪
            </span>
            <div style={{ overflow: 'hidden', textAlign: 'right' }}>
              <span style={{
                fontSize: '0.85rem',
                color: 'var(--fg)',
                fontWeight: 600,
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '220px'
              }}>
                {file.name}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--fg-dim)' }}>
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          </div>
          <button
            onClick={() => onChange(null)}
            style={{
              background: 'var(--err-soft)',
              border: '1px solid rgba(155, 44, 44, 0.15)',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--err)',
              fontSize: '0.82rem',
              padding: '0.3rem 0.6rem',
              fontWeight: 700,
              flexShrink: 0,
              transition: 'all 200ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--err)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--err-soft)'; e.currentTarget.style.color = 'var(--err)' }}
          >
            حذف
          </button>
        </div>
      ) : (
        <div>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--primary-soft)',
            border: '1px solid var(--border-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem',
            color: 'var(--primary)',
            fontSize: '1.3rem',
          }}>
            🪪
          </div>
          <span style={{
            color: 'var(--primary)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.88rem',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}>
            اسحب صورة الهوية أو جواز السفر هنا أو اختر من جهازك
          </span>
          <p style={{ fontSize: '0.7rem', color: 'var(--fg-dim)', marginTop: '0.5rem' }}>
            PDF · JPG · PNG — الحد الأقصى 10MB
          </p>
        </div>
      )}
    </div>
  )
}

function DropZone({ files, onAdd, onRemove }: { files: File[]; onAdd: (f: File[]) => void; onRemove: (i: number) => void }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    onAdd(Array.from(e.dataTransfer.files))
  }, [onAdd])

  return (
    <>
      <div
        style={{
          border: `1.5px dashed ${dragOver ? 'var(--primary)' : 'var(--border-accent)'}`,
          borderRadius: 'var(--r-lg)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'var(--primary-soft)' : 'var(--primary-subtle)',
          transition: 'all 250ms var(--ease-out)',
        }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--primary-soft)',
          border: '1px solid var(--border-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          color: 'var(--primary)',
          transition: 'transform 250ms var(--ease-spring)',
        }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p style={{ color: 'var(--fg-muted)', fontSize: '0.92rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          {dragOver ? 'اترك الملف هنا' : 'اسحب ملفاتك هنا'}
        </p>
        <span style={{
          color: 'var(--primary)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.88rem',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
          textDecorationColor: 'var(--border-accent)',
        }}>
          أو اختار من جهازك
        </span>
        <p style={{ fontSize: '0.72rem', color: 'var(--fg-dim)', marginTop: '0.75rem' }}>
          PDF · JPG · PNG · DICOM — الحد الأقصى 10MB
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.dcm"
          style={{ display: 'none' }}
          onChange={e => onAdd(Array.from(e.target.files || []))}
        />
      </div>

      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          {files.map((f, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.7rem 1rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r)',
              animation: 'slideIn 0.3s var(--ease-out)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden', flex: 1 }}>
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--primary-soft)',
                  border: '1px solid var(--border-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  flexShrink: 0,
                  fontFamily: 'Tajawal, sans-serif',
                }}>
                  {f.name.split('.').pop()?.toUpperCase()}
                </span>
                <div style={{ overflow: 'hidden' }}>
                  <span style={{
                    fontSize: '0.85rem',
                    color: 'var(--fg)',
                    fontWeight: 500,
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {f.name}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    color: 'var(--fg-dim)',
                  }}>
                    {(f.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              </div>
              <button
                onClick={() => onRemove(i)}
                style={{
                  background: 'var(--err-soft)',
                  border: '1px solid rgba(155, 44, 44, 0.15)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: 'var(--err)',
                  fontSize: '0.85rem',
                  padding: '0.3rem 0.6rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  flexShrink: 0,
                  transition: 'all 200ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--err)'; e.currentTarget.style.color = 'white' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--err-soft)'; e.currentTarget.style.color = 'var(--err)' }}
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block',
      width: '18px',
      height: '18px',
      border: '2.5px solid rgba(255, 255, 255, 0.3)',
      borderTopColor: 'white',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}
