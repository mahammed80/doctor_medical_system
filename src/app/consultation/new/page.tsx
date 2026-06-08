'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { DOCTORS } from '@/lib/doctors'
import { createConsultation, updateConsultation, saveLocalUploadedFile } from '@/lib/consultationService'

type FormData = {
  patient_name: string
  patient_phone: string
  patient_age: string
  chief_complaint: string
  medical_history: string
  current_medications: string
  files: File[]
}

const STEPS = [
  { label: 'بياناتك',        sub: 'المعلومات الشخصية' },
  { label: 'الملفات',  sub: 'المستندات الطبية' },
  { label: 'الدفع',          sub: 'رسوم الاستشارة' },
  { label: 'الموعد',     sub: 'اختر وقتك' },
]

export default function NewConsultation() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [consultationId, setConsultationId] = useState<string | null>(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState('khalid')
  const [form, setForm] = useState<FormData>({
    patient_name: '', patient_phone: '', patient_age: '',
    chief_complaint: '', medical_history: '', current_medications: '', files: [],
  })

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }))
  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const doc = params.get('doctor')
      if (doc && DOCTORS.some(d => d.id === doc)) {
        setSelectedDoctorId(doc)
      }
    }
  }, [])

  async function submitStep1() {
    setLoading(true)
    try {
      const data = await createConsultation({
        patient_name: form.patient_name,
        patient_phone: form.patient_phone,
        patient_age: parseInt(form.patient_age),
        chief_complaint: form.chief_complaint,
        medical_history: form.medical_history,
        current_medications: form.current_medications,
        doctor_id: selectedDoctorId,
      })
      setConsultationId(data.id)
      setStep(1)
    } catch (err) {
      alert('حصل خطأ، حاول مجدداً')
    } finally {
      setLoading(false)
    }
  }

  async function uploadFiles() {
    setLoading(true)
    if (!consultationId) return
    try {
      if (isDemo) {
        await new Promise(r => setTimeout(r, 900))
        for (const file of form.files) {
          await saveLocalUploadedFile(consultationId, file.name, file.type)
        }
        setStep(2)
        return
      }

      for (const file of form.files) {
        const path = `${consultationId}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('consultation-files').upload(path, file)
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('consultation-files').getPublicUrl(path)
          await supabase.from('consultation_files').insert({ consultation_id: consultationId, file_name: file.name, file_url: publicUrl, file_type: file.type })
        }
      }
      setStep(2)
    } catch (err) {
      alert('خطأ أثناء رفع الملفات')
    } finally {
      setLoading(false)
    }
  }

  const price = process.env.NEXT_PUBLIC_CONSULTATION_PRICE || '899'

  // ── Calendly postMessage listener ──
  useEffect(() => {
    function handleCalendlyEvent(e: MessageEvent) {
      if (e.data?.event === 'calendly.event_scheduled' && consultationId) {
        const eventUrl = e.data?.payload?.event?.uri
        updateConsultation(consultationId, {
          status: 'booked',
          calendly_event_url: eventUrl || null,
        }).then(() => {
          router.push('/consultation/success')
        })
      }
    }
    window.addEventListener('message', handleCalendlyEvent)
    return () => window.removeEventListener('message', handleCalendlyEvent)
  }, [consultationId, router])

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

              <Field label="الاسم الكامل" required>
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

              <Field label="سبب الاستشارة" required>
                <textarea
                  className="input"
                  placeholder="اشرح سبب الاستشارة بالتفصيل..."
                  value={form.chief_complaint}
                  onChange={e => set('chief_complaint', e.target.value)}
                  style={{ minHeight: '100px' }}
                />
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
                disabled={!form.patient_name || !form.patient_phone || !form.patient_age || !form.chief_complaint || loading}
                onClick={submitStep1}
              >
                {loading ? <Spinner /> : 'التالي'}
              </button>
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <DropZone
                files={form.files}
                onAdd={newFiles => setForm(f => ({ ...f, files: [...f.files, ...newFiles] }))}
                onRemove={i => setForm(f => ({ ...f, files: f.files.filter((_, j) => j !== i) }))}
              />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  className="btn-ghost"
                  onClick={() => setStep(2)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  تخطى
                </button>
                <button
                  className="btn-primary"
                  onClick={uploadFiles}
                  disabled={loading}
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {loading ? <Spinner /> : form.files.length > 0 ? `رفع ${form.files.length} ملف` : 'التالي'}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
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
                  border: '1px solid oklch(68% 0.17 70 / 0.08)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '180px', height: '180px',
                  borderRadius: '50%',
                  border: '1px solid oklch(68% 0.17 70 / 0.04)',
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
                  border: '1px solid oklch(68% 0.17 70 / 0.25)',
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
                    background: 'linear-gradient(135deg, var(--primary) 0%, oklch(55% 0.22 260) 50%, var(--primary-down) 100%)',
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
                marginBottom: '1.5rem',
              }}>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />
                <div style={{
                  width: '6px', height: '6px',
                  background: 'var(--gold)', opacity: 0.3,
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                }} />
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />
              </div>

              {/* Payment methods */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.6rem',
                marginBottom: '1.5rem',
              }}>
                {[
                  { id: 'mada', label: 'مدى' },
                  { id: 'visa', label: 'Visa' },
                  { id: 'mastercard', label: 'Mastercard' },
                  { id: 'applepay', label: 'Apple Pay' },
                ].map(m => (
                  <div
                    key={m.id}
                    style={{
                      padding: '0.85rem 0.5rem',
                      background: 'var(--primary-subtle)',
                      border: '1px solid var(--border-accent)',
                      borderRadius: 'var(--r)',
                      textAlign: 'center',
                      fontSize: '0.72rem',
                      color: 'var(--primary)',
                      fontFamily: 'var(--font-tajawal), sans-serif',
                      fontWeight: 700,
                      transition: 'all 200ms',
                      cursor: 'default',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--primary-soft)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'var(--primary-subtle)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    {m.label}
                  </div>
                ))}
              </div>

              {/* Card fields with enhanced design */}
              <div style={{
                background: 'var(--bg)',
                borderRadius: 'var(--r-lg)',
                padding: '1.25rem',
                border: '1px solid var(--border-faint)',
                marginBottom: '1.25rem',
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="input"
                      placeholder="رقم البطاقة"
                      dir="ltr"
                      style={{ letterSpacing: '0.1em', paddingLeft: '3rem', direction: 'ltr' }}
                      disabled
                    />
                    <span style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.7rem',
                      color: 'var(--fg-dim)',
                      fontWeight: 500,
                    }}>
                      〶
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <input
                      className="input"
                      placeholder="MM / YY"
                      dir="ltr"
                      disabled
                    />
                    <input
                      className="input"
                      placeholder="CVV"
                      dir="ltr"
                      disabled
                    />
                  </div>
                  <input
                    className="input"
                    placeholder="اسم حامل البطاقة"
                    disabled
                  />
                </div>
              </div>

              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
                onClick={async () => {
                  if (consultationId) {
                    await updateConsultation(consultationId, { status: 'pending_booking', payment_id: 'pay_demo_' + Date.now() })
                  }
                  setStep(3)
                }}
              >
                ادفع {price} ريال
              </button>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '1.25rem',
              }}>
                <div style={{
                  width: '18px', height: '18px',
                  borderRadius: '4px',
                  background: 'var(--ok-soft)',
                  border: '1px solid oklch(50% 0.15 155 / 0.25)',
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
                  الدفع مشفر وآمن 128-bit SSL
                </span>
                <span style={{
                  width: '3px', height: '3px', borderRadius: '50%',
                  background: 'var(--border)', display: 'inline-block',
                }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--fg-dim)' }}>
                  مدعوم من Moyasar
                </span>
              </div>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                background: 'var(--ok-soft)',
                border: '1px solid oklch(50% 0.15 155 / 0.2)',
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

              <div style={{
                borderRadius: 'var(--r-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-faint)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <iframe
                  src={`${process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/placeholder'}?embed_type=Inline&hide_event_type_details=1&hide_gdpr_banner=1`}
                  width="100%"
                  height="520"
                  frameBorder="0"
                  style={{ display: 'block' }}
                />
              </div>

              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', padding: '1rem' }}
                onClick={async () => {
                  if (consultationId) {
                    await updateConsultation(consultationId, { status: 'booked' })
                  }
                  router.push('/consultation/success')
                }}
              >
                تأكيد الحجز
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
                  border: '1px solid oklch(50% 0.22 28 / 0.15)',
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
      border: '2.5px solid oklch(100% 0 0 / 0.3)',
      borderTopColor: 'white',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}
