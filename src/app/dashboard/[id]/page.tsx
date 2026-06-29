'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { getConsultationById, getConsultationFiles, updateConsultation, transitionStatus, EnhancedConsultation } from '@/lib/consultationService'
import { getCachedSession, signOut, AuthSession } from '@/lib/auth'
import { getMessages, sendMessage, subscribeToMessages, markRead, QUICK_REPLY_TEMPLATES } from '@/lib/chatService'
import { DOCTORS } from '@/lib/doctors'
import {
  ConsultationFile,
  ConsultationMessage,
  PAIN_NATURE_LABELS_AR,
  PAIN_LOCATION_LABELS_AR,
  SPINAL_AREA_LABELS_AR,
  FILE_CATEGORY_LABELS_AR,
  STATUS_CONFIG,
  type ConsultationStatus,
} from '@/lib/supabase'

const CATEGORY_COLORS: Record<string, { color: string; bg: string; icon: string }> = {
  mri:          { color: 'var(--primary)', bg: 'var(--primary-soft)', icon: '🧠' },
  xray:         { color: 'var(--gold)',     bg: 'var(--gold-soft)',     icon: '🩻' },
  ct:           { color: 'var(--primary)', bg: 'var(--primary-soft)', icon: '🔬' },
  lab_report:   { color: 'var(--ok)',       bg: 'var(--ok-soft)',       icon: '🧪' },
  prescription: { color: 'oklch(40% 0.15 60)', bg: 'oklch(95% 0.05 80)', icon: '📋' },
  other:        { color: 'var(--fg-dim)',   bg: 'var(--surface)',       icon: '📎' },
  id_card:      { color: 'var(--primary)', bg: 'var(--primary-soft)', icon: '🪪' },
}

function categoryStyle(cat: string | null | undefined) {
  return CATEGORY_COLORS[cat || 'other'] || CATEGORY_COLORS.other
}

export default function ConsultationDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [session, setSession] = useState<AuthSession | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [consultation, setConsultation] = useState<EnhancedConsultation | null>(null)
  const [files, setFiles] = useState<ConsultationFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Chat state
  const [messages, setMessages] = useState<ConsultationMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Doctor notes
  const [doctorNotes, setDoctorNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSavedAt, setNotesSavedAt] = useState<string | null>(null)

  // Reschedule
  const [showReschedule, setShowReschedule] = useState(false)
  const [reschedDate, setReschedDate] = useState('')
  const [reschedTime, setReschedTime] = useState('')

  // Cancellation
  const [showCancel, setShowCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Auth guard
  useEffect(() => {
    const cached = getCachedSession()
    if (!cached) {
      router.replace('/dashboard/login')
      return
    }
    setSession(cached)
    setAuthChecked(true)
  }, [router])

  // Load consultation + files
  useEffect(() => {
    if (!id || !authChecked) return
    let unsub: (() => void) | null = null
    ;(async () => {
      try {
        const doc = await getConsultationById(id)
        if (!doc) { setError('الاستشارة غير موجودة'); return }
        setConsultation(doc)
        setDoctorNotes(doc.doctor_notes || '')

        const fileList = await getConsultationFiles(id)
        setFiles(fileList)

        unsub = subscribeToMessages(id, setMessages)
        await markRead(id, 'doctor')
      } catch (err) {
        console.error('Error loading consultation details:', err)
        setError('تعذر تحميل الاستشارة')
      } finally {
        setLoading(false)
      }
    })()
    return () => { if (unsub) unsub() }
  }, [id, authChecked])

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages])

  // ── Action helpers ──────────────────────────────────────────────────────
  async function setStatus(next: ConsultationStatus, systemMessage?: string) {
    if (!consultation) return
    const updated = await transitionStatus(consultation.id, next, {}, systemMessage)
    if (updated) {
      setConsultation(updated)
      // refresh messages after status change
      const list = await getMessages(updated.id)
      setMessages(list)
    }
  }

  async function approve() {
    await setStatus('approved', '✅ تم قبول الاستشارة وتأكيد الموعد من قبل الطبيب.')
  }

  async function startReview() {
    await setStatus('under_review', '🔍 بدأ الطبيب مراجعة طلبك.')
  }

  async function askForInfo() {
    if (!chatInput.trim()) {
      alert('اكتب رسالتك للطبيب قبل إرسال طلب المعلومات.')
      return
    }
    if (!consultation) return
    setSendingMessage(true)
    try {
      await sendMessage(consultation.id, chatInput, 'doctor')
      await transitionStatus(consultation.id, 'needs_info', {}, '📨 طلب الطبيب من المريض معلومات إضافية.')
      setChatInput('')
      const list = await getMessages(consultation.id)
      setMessages(list)
      const refreshed = await getConsultationById(consultation.id)
      if (refreshed) setConsultation(refreshed)
    } finally {
      setSendingMessage(false)
    }
  }

  async function reject() {
    const reason = window.prompt('سبب الرفض (اختياري):') || ''
    if (!consultation) return
    await transitionStatus(consultation.id, 'declined', { cancellation_reason: reason }, '❌ تم رفض طلب الاستشارة.')
    const refreshed = await getConsultationById(consultation.id)
    if (refreshed) setConsultation(refreshed)
  }

  async function cancel() {
    if (!consultation || !cancelReason.trim()) {
      alert('الرجاء كتابة سبب الإلغاء.')
      return
    }
    await transitionStatus(consultation.id, 'cancelled', { cancellation_reason: cancelReason }, '🚫 تم إلغاء الاستشارة.')
    const refreshed = await getConsultationById(consultation.id)
    if (refreshed) setConsultation(refreshed)
    setShowCancel(false)
    setCancelReason('')
  }

  async function startConsultation() {
    await setStatus('completed', '✔ تم إجراء الاستشارة وإغلاقها.')
  }

  async function reschedule() {
    if (!reschedDate || !reschedTime) {
      alert('الرجاء اختيار التاريخ والوقت الجديد.')
      return
    }
    if (!consultation) return
    await updateConsultation(consultation.id, {
      appointment_date: reschedDate,
      appointment_time: reschedTime,
    })
    await transitionStatus(
      consultation.id,
      'submitted',
      {},
      `📅 تم إعادة جدولة الموعد إلى ${reschedDate} الساعة ${reschedTime}.`
    )
    const refreshed = await getConsultationById(consultation.id)
    if (refreshed) setConsultation(refreshed)
    setShowReschedule(false)
  }

  async function saveNotes() {
    if (!consultation) return
    setSavingNotes(true)
    try {
      const updated = await updateConsultation(consultation.id, { doctor_notes: doctorNotes })
      if (updated) {
        setConsultation(updated)
        setNotesSavedAt(new Date().toLocaleTimeString('ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit' }))
      }
    } finally {
      setSavingNotes(false)
    }
  }

  async function sendChat(e: React.FormEvent) {
    e.preventDefault()
    if (!chatInput.trim() || !consultation) return
    setSendingMessage(true)
    try {
      await sendMessage(consultation.id, chatInput, 'doctor')
      setChatInput('')
      const list = await getMessages(consultation.id)
      setMessages(list)
    } finally {
      setSendingMessage(false)
    }
  }

  // ── Renders ─────────────────────────────────────────────────────────────
  if (!authChecked || loading) {
    return (
      <div className="geo-bg" style={{ minHeight: '100vh', padding: '3rem 0' }}>
        <div className="container" style={{ textAlign: 'center', paddingTop: '10rem' }}>
          <div className="card-warm" style={{ maxWidth: '400px', margin: '0 auto', padding: '3rem' }}>
            <span style={{
              display: 'inline-block', width: '40px', height: '40px',
              border: '3px solid var(--primary-soft)', borderTopColor: 'var(--primary)',
              borderRadius: '50%', animation: 'spin 1.7s linear infinite', marginBottom: '1rem',
            }} />
            <p style={{ fontWeight: 700, color: 'var(--fg-muted)' }}>
              {authChecked ? 'جاري تحميل تفاصيل الاستشارة...' : 'جاري التحقق من تسجيل الدخول...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !consultation) {
    return (
      <div className="geo-bg" style={{ minHeight: '100vh', padding: '3rem 0' }}>
        <div className="container" style={{ textAlign: 'center', paddingTop: '8rem' }}>
          <div className="card-warm" style={{ maxWidth: '450px', margin: '0 auto', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.5rem' }}>{error || 'الاستشارة غير موجودة'}</h2>
            <Link href="/dashboard" className="btn-primary" style={{ fontSize: '0.9rem' }}>العودة للوحة التحكم</Link>
          </div>
        </div>
      </div>
    )
  }

  const config = STATUS_CONFIG[consultation.status]
  const doctorId = consultation.doctor_id || 'khalid'
  const assignedDoc = DOCTORS.find(d => d.id === doctorId) || DOCTORS[0]

  const painNatures = (consultation.pain_natures || []).filter(Boolean)
  const painLocations = (consultation.pain_locations || []).filter(Boolean)
  const spinalAreas = (consultation.spinal_areas || []).filter(Boolean)

  // Group files by category
  const filesByCategory = files.reduce<Record<string, ConsultationFile[]>>((acc, f) => {
    const key = f.category || 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(f)
    return acc
  }, {})

  const canActOnReview = ['submitted', 'under_review', 'patient_replied'].includes(consultation.status)
  const isClosed = ['completed', 'cancelled', 'declined'].includes(consultation.status)

  return (
    <div className="geo-bg" style={{ minHeight: '100vh', padding: '3rem 0', position: 'relative' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--fg-dim)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>→</span> العودة للوحة التحكم
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>{session?.display_name || session?.email}</span>
            <button onClick={async () => { await signOut(); router.replace('/dashboard/login') }} className="btn-ghost" style={{ fontSize: '0.72rem', padding: '0.35rem 0.7rem' }}>
              خروج
            </button>
          </div>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', right: '-0.75rem', top: '0.25rem', width: '4px', height: '28px', borderRadius: '2px', background: 'linear-gradient(180deg, var(--primary), var(--gold))' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginRight: '0.75rem' }}>
              تفاصيل استشارة: {consultation.patient_name}
            </h1>
            <div style={{ marginTop: '0.5rem', marginRight: '0.75rem' }}>
              <span className={config?.badge || 'badge-primary'}>{config?.label}</span>
            </div>
          </div>
          <span className="num" style={{ fontSize: '0.78rem', color: 'var(--fg-dim)', direction: 'ltr', padding: '0.4rem 0.85rem', background: 'var(--bg)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-faint)', whiteSpace: 'nowrap' }}>
            {new Date(consultation.created_at).toLocaleString('ar-SA-u-nu-latn')}
          </span>
        </div>

        {/* Doctor card */}
        <div className="card-warm" style={{ marginBottom: '1.25rem', padding: '1.1rem 1.5rem', border: '1.5px solid var(--border-accent)', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0.3 }} />
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)', position: 'relative', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
            <Image src={assignedDoc.image} alt={assignedDoc.name} fill sizes="52px" style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>الطبيب المعالج</div>
            <h2 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--fg)' }}>{consultation.doctor_name || assignedDoc.name}</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)' }}>{consultation.specialty || assignedDoc.specialty}</p>
          </div>
          {consultation.appointment_date && consultation.appointment_time && (
            <div className="num" style={{ marginRight: 'auto', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.66rem', color: 'var(--fg-dim)' }}>الموعد:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                {new Date(consultation.appointment_date).toLocaleDateString('ar-SA-u-nu-latn', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)' }}>{consultation.appointment_time}</span>
            </div>
          )}
        </div>

        {/* Action toolbar */}
        <div className="card-warm" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {canActOnReview && (
            <>
              <button onClick={startReview} className="btn-ghost" style={{ fontSize: '0.78rem' }}>🔍 بدء المراجعة</button>
              <button onClick={approve} className="btn-primary" style={{ fontSize: '0.78rem', background: 'var(--ok)', borderColor: 'var(--ok)' }}>✔ قبول وتأكيد</button>
              <button onClick={() => { setChatInput(QUICK_REPLY_TEMPLATES[0]); askForInfo() }} className="btn-ghost" style={{ fontSize: '0.78rem' }}>📨 طلب معلومات</button>
              <button onClick={reject} className="btn-ghost" style={{ fontSize: '0.78rem', color: 'var(--err)' }}>✘ رفض</button>
            </>
          )}
          {consultation.status === 'approved' && (
            <button onClick={startConsultation} className="btn-primary" style={{ fontSize: '0.78rem' }}>▶ بدء الاستشارة وإغلاقها</button>
          )}
          {!isClosed && consultation.status !== 'pending_payment' && consultation.status !== 'pending_booking' && (
            <>
              <button onClick={() => setShowReschedule(true)} className="btn-ghost" style={{ fontSize: '0.78rem' }}>📅 إعادة جدولة</button>
              <button onClick={() => setShowCancel(true)} className="btn-ghost" style={{ fontSize: '0.78rem', color: 'var(--err)' }}>🚫 إلغاء</button>
            </>
          )}
          <a
            href={`/patient/consultation/${consultation.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            style={{ fontSize: '0.78rem' }}
          >
            ↗ عرض كالمريض
          </a>
        </div>

        {/* Reschedule modal-ish */}
        {showReschedule && (
          <div className="card-warm" style={{ marginBottom: '1.25rem', padding: '1.25rem', border: '1.5px solid var(--primary)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.85rem' }}>📅 إعادة جدولة الموعد</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input type="date" className="input" value={reschedDate} onChange={e => setReschedDate(e.target.value)} />
              <input type="time" className="input" value={reschedTime} onChange={e => setReschedTime(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
              <button onClick={reschedule} className="btn-primary" style={{ flex: 1 }}>تأكيد</button>
              <button onClick={() => setShowReschedule(false)} className="btn-ghost" style={{ flex: 1 }}>إلغاء</button>
            </div>
          </div>
        )}

        {showCancel && (
          <div className="card-warm" style={{ marginBottom: '1.25rem', padding: '1.25rem', border: '1.5px solid var(--err)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.85rem', color: 'var(--err)' }}>🚫 إلغاء الاستشارة</h3>
            <textarea
              className="input"
              placeholder="سبب الإلغاء (سيظهر للمريض)..."
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              style={{ minHeight: '70px' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
              <button onClick={cancel} className="btn-primary" style={{ flex: 1, background: 'var(--err)', borderColor: 'var(--err)' }}>تأكيد الإلغاء</button>
              <button onClick={() => setShowCancel(false)} className="btn-ghost" style={{ flex: 1 }}>تراجع</button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* LEFT column: patient + assessment + files */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Patient + complaint */}
            <div className="card-warm" style={{ position: 'relative', overflow: 'hidden' }}>
              <SectionTitle color="var(--primary)">بيانات المريض والشكوى</SectionTitle>
              <div className="num" style={{ padding: '0 1.25rem 1rem', display: 'grid', gridTemplateColumns: '110px 1fr', gap: '0.5px', background: 'var(--border-faint)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                {[
                  { l: 'الاسم',     v: consultation.patient_name },
                  { l: 'الجوال',    v: consultation.patient_phone, dir: 'ltr' as const },
                  { l: 'العمر',     v: `${consultation.patient_age} سنة` },
                ].map(row => (
                  <div key={row.l} style={{ display: 'contents' }}>
                    <div style={{ padding: '0.7rem 0.9rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--fg-dim)', background: 'var(--surface)' }}>{row.l}</div>
                    <div style={{ padding: '0.7rem 0.9rem', fontSize: '0.85rem', color: 'var(--fg)', background: 'var(--surface)', direction: row.dir, textAlign: row.dir === 'ltr' ? 'left' : 'right' }}>{row.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '0 1.25rem 1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--fg-dim)', marginBottom: '0.35rem' }}>الشكوى الرئيسية</div>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--fg)' }}>{consultation.chief_complaint}</div>
              </div>
            </div>

            {/* Pain assessment */}
            <div className="card-warm" style={{ position: 'relative', overflow: 'hidden' }}>
              <SectionTitle color="var(--gold)">تقييم الألم</SectionTitle>
              <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {consultation.pain_severity != null && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--fg-dim)', fontWeight: 700, marginBottom: '0.25rem' }}>الشدّة</div>
                    <div className="num" style={{ fontSize: '1.5rem', fontWeight: 900, color: consultation.pain_severity <= 4 ? 'var(--ok)' : consultation.pain_severity <= 7 ? 'var(--gold)' : 'var(--err)' }}>
                      {consultation.pain_severity}/10
                    </div>
                  </div>
                )}
                {painNatures.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--fg-dim)', fontWeight: 700, marginBottom: '0.4rem' }}>طبيعة الألم</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {painNatures.map(n => (
                        <span key={n} style={{ padding: '0.3rem 0.7rem', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700 }}>
                          {PAIN_NATURE_LABELS_AR[n as never] || n}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {painLocations.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--fg-dim)', fontWeight: 700, marginBottom: '0.4rem' }}>أماكن الألم</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {painLocations.map(l => (
                        <span key={l} style={{ padding: '0.3rem 0.7rem', background: 'var(--err-soft)', color: 'var(--err)', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700 }}>
                          {PAIN_LOCATION_LABELS_AR[l as never] || l}
                        </span>
                      ))}
                      {spinalAreas.map(s => (
                        <span key={s} style={{ padding: '0.3rem 0.7rem', background: 'var(--gold-soft)', color: 'var(--gold)', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700 }}>
                          {SPINAL_AREA_LABELS_AR[s as never] || s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {[
                  ['مدة الشكوى',         consultation.pain_duration],
                  ['كيف بدأت الأعراض',   consultation.symptom_start],
                  ['علاجات سابقة',       consultation.previous_treatments],
                  ['عمليات سابقة',       consultation.previous_surgeries],
                  ['عوامل تزيد الألم',   consultation.aggravating_factors],
                  ['عوامل تخفف الألم',   consultation.relieving_factors],
                  ['تورم/تيبس المفاصل',  consultation.joint_swelling_stiffness],
                  ['التاريخ المرضي',     consultation.medical_history],
                  ['الأدوية الحالية',     consultation.current_medications],
                ].filter(([, v]) => v).map(([l, v]) => (
                  <div key={l as string}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--fg-dim)', fontWeight: 700, marginBottom: '0.2rem' }}>{l}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--fg)' }}>{v as string}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Files grouped by category */}
            <div className="card-warm" style={{ position: 'relative', overflow: 'hidden' }}>
              <SectionTitle color="var(--gold)">الملفات المرفقة ({files.length})</SectionTitle>
              <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {files.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--fg-dim)', background: 'var(--bg)', borderRadius: 'var(--r)', border: '1px dashed var(--border)' }}>
                    لا توجد ملفات مرفقة
                  </div>
                ) : (
                  Object.entries(filesByCategory).map(([cat, list]) => {
                    const style = categoryStyle(cat)
                    return (
                      <div key={cat}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: style.color, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{style.icon}</span>
                          {FILE_CATEGORY_LABELS_AR[cat as never] || cat} ({list.length})
                        </div>
                        {list.map(f => (
                          <a
                            key={f.id}
                            href={f.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '0.5rem 0.75rem', marginBottom: '0.3rem',
                              background: 'var(--bg)', borderRadius: 'var(--r-sm)',
                              border: '1px solid var(--border-faint)', textDecoration: 'none',
                              transition: 'all 200ms',
                            }}
                          >
                            <span style={{ fontSize: '0.82rem', color: 'var(--fg)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{f.file_name}</span>
                            <span style={{ fontSize: '0.7rem', color: style.color, fontWeight: 700 }}>فتح ↗</span>
                          </a>
                        ))}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT column: chat + notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Chat */}
            <div className="card-warm" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <SectionTitle color="var(--primary)" inline>المحادثة مع المريض</SectionTitle>
              <div
                ref={chatScrollRef}
                style={{
                  padding: '1rem',
                  minHeight: '280px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  background: 'var(--bg)',
                }}
              >
                {messages.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--fg-dim)', fontSize: '0.82rem', padding: '1.5rem 0' }}>
                    لا توجد رسائل بعد. ابدأ المحادثة بإرسال رسالة أو اطلب معلومات.
                  </p>
                )}
                {messages.map(m => {
                  const isDoctor = m.sender_role === 'doctor'
                  const isSystem = m.sender_role === 'system'
                  if (isSystem) {
                    return (
                      <div key={m.id} style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--fg-dim)' }}>
                        <span style={{ display: 'inline-block', padding: '0.2rem 0.75rem', background: 'var(--surface)', borderRadius: '9999px', border: '1px solid var(--border-faint)' }}>{m.body}</span>
                      </div>
                    )
                  }
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isDoctor ? 'flex-end' : 'flex-start',
                        maxWidth: '82%',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '12px',
                        background: isDoctor ? 'var(--primary)' : 'var(--surface)',
                        color: isDoctor ? 'white' : 'var(--fg)',
                        border: isDoctor ? 'none' : '1px solid var(--border-faint)',
                        fontSize: '0.85rem',
                        lineHeight: 1.5,
                      }}
                    >
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.7, marginBottom: '0.15rem' }}>
                        {isDoctor ? 'أنا (الطبيب)' : consultation.patient_name}
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.body}</div>
                      <div style={{ fontSize: '0.6rem', opacity: 0.65, marginTop: '0.2rem' }}>
                        <span className="num" style={{ direction: 'ltr' }}>
                          {new Date(m.created_at).toLocaleTimeString('ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <form onSubmit={sendChat} style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-faint)', background: 'var(--surface)' }}>
                <textarea
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(e as unknown as React.FormEvent) } }}
                  placeholder="اكتب رسالة للمريض..."
                  rows={2}
                  className="input"
                  style={{ resize: 'none' }}
                  disabled={sendingMessage}
                />
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button type="submit" className="btn-primary" disabled={!chatInput.trim() || sendingMessage} style={{ flex: 1, padding: '0.55rem' }}>
                    {sendingMessage ? '...' : 'إرسال'}
                  </button>
                  <button
                    type="button"
                    onClick={askForInfo}
                    className="btn-ghost"
                    disabled={!chatInput.trim() || sendingMessage}
                    style={{ fontSize: '0.78rem', padding: '0.5rem 0.75rem' }}
                    title="إرسال الرسالة وتغيير الحالة إلى 'يحتاج معلومات'"
                  >
                    📨 اطلب معلومات
                  </button>
                </div>
                {/* Quick reply templates */}
                <details style={{ fontSize: '0.78rem' }}>
                  <summary style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, padding: '0.25rem 0' }}>قوالب جاهزة</summary>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.4rem' }}>
                    {QUICK_REPLY_TEMPLATES.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setChatInput(t)}
                        style={{ textAlign: 'right', padding: '0.4rem 0.6rem', background: 'var(--bg)', border: '1px solid var(--border-faint)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--fg-muted)' }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </details>
              </form>
            </div>

            {/* Doctor notes */}
            <div className="card-warm" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionTitle color="var(--gold)" inline>ملاحظات الطبيب (خاصة)</SectionTitle>
              <div style={{ padding: '1rem 1.25rem' }}>
                <textarea
                  value={doctorNotes}
                  onChange={e => setDoctorNotes(e.target.value)}
                  placeholder="ملاحظاتك الخاصة حول هذه الحالة..."
                  rows={6}
                  className="input"
                  style={{ resize: 'vertical', minHeight: '120px' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.6rem' }}>
                  <button onClick={saveNotes} className="btn-primary" disabled={savingNotes} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                    {savingNotes ? 'جاري الحفظ...' : 'حفظ الملاحظات'}
                  </button>
                  {notesSavedAt && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--ok)', fontWeight: 600 }}>✓ تم الحفظ {notesSavedAt}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Cancellation reason display */}
            {consultation.cancellation_reason && (
              <div className="card-warm" style={{ padding: '1rem 1.25rem', borderRight: '4px solid var(--err)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--err)', fontWeight: 700, marginBottom: '0.3rem' }}>سبب الإلغاء/الرفض</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--fg)' }}>{consultation.cancellation_reason}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children, color, inline }: { children: React.ReactNode; color: string; inline?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: inline ? '0.85rem 1.25rem' : '1rem 1.25rem 0.85rem',
      borderBottom: inline ? '1px solid var(--border-faint)' : 'none',
    }}>
      <div style={{ width: '4px', height: '18px', borderRadius: '2px', background: color }} />
      <h2 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {children}
      </h2>
    </div>
  )
}
