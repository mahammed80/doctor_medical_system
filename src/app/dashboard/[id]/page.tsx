'use client'

import { useEffect, useState, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import {
  Check,
  X,
  Search,
  Send,
  Ban,
  Calendar,
  Brain,
  ScanLine,
  Microscope,
  FlaskConical,
  ClipboardList,
  Paperclip,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { getConsultationById, getConsultationFiles, updateConsultation, transitionStatus, EnhancedConsultation } from '@/lib/consultationService'
import { getCachedSession, signOut, AuthSession } from '@/lib/auth'
import { getMessages, sendMessage, subscribeToMessages, markRead, QUICK_REPLY_TEMPLATES } from '@/lib/chatService'
import { DOCTORS } from '@/lib/doctors'
import { useToasts } from '@/components/Toaster'
import { ConsultationBodyMap } from '@/components/ConsultationBodyMap'
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
import { DashboardShell, DashboardGate, DashboardError } from '@/components/DashboardShell'
import '../dashboard.css'

const CATEGORY_STYLE: Record<string, { color: string; icon: ReactNode }> = {
  mri:          { color: 'var(--dash-green)', icon: <Brain size={15} /> },
  xray:         { color: 'var(--dash-gold)',  icon: <ScanLine size={15} /> },
  ct:           { color: 'var(--dash-green)', icon: <Microscope size={15} /> },
  lab_report:   { color: '#2E8B57',           icon: <FlaskConical size={15} /> },
  prescription: { color: 'var(--dash-gold)',  icon: <ClipboardList size={15} /> },
  other:        { color: 'var(--dash-dim)',   icon: <Paperclip size={15} /> },
  id_card:      { color: 'var(--dash-green)', icon: <Paperclip size={15} /> },
}

function catStyle(cat: string | null | undefined) {
  return CATEGORY_STYLE[cat || 'other'] || CATEGORY_STYLE.other
}

function severityFill(n: number | null | undefined): string {
  if (n == null) return '0%'
  return `${Math.min(100, Math.max(0, n * 10))}%`
}

function severityColor(n: number | null | undefined): string {
  if (n == null) return 'var(--dash-dim)'
  if (n <= 4) return '#2E8B57'
  if (n <= 7) return 'var(--dash-gold)'
  return 'var(--dash-err)'
}

export default function ConsultationDetail() {
  const params = useParams()
  const router = useRouter()
  const toasts = useToasts()
  const id = params?.id as string

  const [session, setSession] = useState<AuthSession | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [consultation, setConsultation] = useState<EnhancedConsultation | null>(null)
  const [files, setFiles] = useState<ConsultationFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [messages, setMessages] = useState<ConsultationMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  const [doctorNotes, setDoctorNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSavedAt, setNotesSavedAt] = useState<string | null>(null)

  const [showReschedule, setShowReschedule] = useState(false)
  const [reschedDate, setReschedDate] = useState('')
  const [reschedTime, setReschedTime] = useState('')

  const [showApprove, setShowApprove] = useState(false)

  const [showCancel, setShowCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const [showReject, setShowReject] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    const cached = getCachedSession()
    if (!cached) {
      router.replace('/dashboard/login')
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(cached)
    setAuthChecked(true)
  }, [router])

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

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages])

  async function setStatus(next: ConsultationStatus, systemMessage?: string) {
    if (!consultation) return
    const updated = await transitionStatus(consultation.id, next, {}, systemMessage)
    if (updated) {
      setConsultation(updated)
      const list = await getMessages(updated.id)
      setMessages(list)
    } else {
      toasts.push('فشل تحديث حالة الاستشارة. حاول مرة أخرى.', 'error')
    }
  }

  async function approve() {
    await setStatus('approved', 'تم قبول الاستشارة وتأكيد الموعد من قبل الطبيب.')
  }

  async function startReview() {
    await setStatus('under_review', 'بدأ الطبيب مراجعة طلبك.')
  }

  async function askForInfo() {
    if (!chatInput.trim()) {
      toasts.push('اكتب رسالتك للطبيب قبل إرسال طلب المعلومات.', 'warn')
      return
    }
    if (!consultation) return
    setSendingMessage(true)
    try {
      await sendMessage(consultation.id, chatInput, 'doctor')
      await transitionStatus(consultation.id, 'needs_info', {}, 'طلب الطبيب من المريض معلومات إضافية.')
      setChatInput('')
      const list = await getMessages(consultation.id)
      setMessages(list)
      const refreshed = await getConsultationById(consultation.id)
      if (refreshed) setConsultation(refreshed)
    } finally {
      setSendingMessage(false)
    }
  }

  async function askForInfoWithTemplate(template: string) {
    if (!consultation) return
    setChatInput(template)
    setSendingMessage(true)
    try {
      await sendMessage(consultation.id, template, 'doctor')
      await transitionStatus(consultation.id, 'needs_info', {}, 'طلب الطبيب من المريض معلومات إضافية.')
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
    if (!consultation) return
    await transitionStatus(
      consultation.id,
      'declined',
      { cancellation_reason: rejectReason },
      'تم رفض طلب الاستشارة.',
    )
    const refreshed = await getConsultationById(consultation.id)
    if (refreshed) setConsultation(refreshed)
    setShowReject(false)
    setRejectReason('')
  }

  async function cancel() {
    if (!consultation || !cancelReason.trim()) {
      toasts.push('الرجاء كتابة سبب الإلغاء.', 'warn')
      return
    }
    await transitionStatus(consultation.id, 'cancelled', { cancellation_reason: cancelReason }, 'تم إلغاء الاستشارة.')
    // Delete Google Calendar event if one exists
    if (consultation.google_calendar_event_id) {
      try {
        await fetch('/api/calendar/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', doctorId: consultation.doctor_id || 'khalid', consultationId: consultation.id, eventId: consultation.google_calendar_event_id, consultation: {} }),
        })
        await updateConsultation(consultation.id, { google_calendar_event_id: null })
      } catch { /* best-effort */ }
    }
    const refreshed = await getConsultationById(consultation.id)
    if (refreshed) setConsultation(refreshed)
    setShowCancel(false)
    setCancelReason('')
  }

  async function startConsultation() {
    await setStatus('completed', 'تم إجراء الاستشارة وإغلاقها.')
  }

  async function reschedule() {
    if (!reschedDate || !reschedTime) {
      toasts.push('الرجاء اختيار التاريخ والوقت الجديد.', 'warn')
      return
    }
    if (!consultation) return
    await updateConsultation(consultation.id, {
      appointment_date: reschedDate,
      appointment_time: reschedTime,
    })
    await transitionStatus(
      consultation.id,
      consultation.status,
      {},
      `تم إعادة جدولة الموعد إلى ${reschedDate} الساعة ${reschedTime}.`,
    )
    // Update Google Calendar event if one exists
    if (consultation.google_calendar_event_id) {
      try {
        const doctor = DOCTORS.find((d) => d.id === consultation.doctor_id) || DOCTORS[0]
        await fetch('/api/calendar/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            doctorId: consultation.doctor_id || 'khalid',
            consultationId: consultation.id,
            eventId: consultation.google_calendar_event_id,
            consultation: {
              patientName: consultation.patient_name,
              patientPhone: consultation.patient_phone,
              chiefComplaint: consultation.chief_complaint,
              date: reschedDate,
              time: reschedTime,
              doctorName: doctor.name,
            },
          }),
        })
      } catch { /* best-effort */ }
    }
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

  async function handleSignOut() {
    await signOut()
    router.replace('/dashboard/login')
  }

  if (!authChecked || loading) {
    return (
      <DashboardGate
        message={authChecked ? 'جاري تحميل تفاصيل الاستشارة...' : 'جاري التحقق من تسجيل الدخول...'}
      />
    )
  }

  if (error || !consultation) {
    return <DashboardError message={error || 'الاستشارة غير موجودة'} onBack={() => router.push('/dashboard')} />
  }

  const config = STATUS_CONFIG[consultation.status]
  const doctorId = consultation.doctor_id || 'khalid'
  const assignedDoc = DOCTORS.find((d) => d.id === doctorId) || DOCTORS[0]

  const painNatures = (consultation.pain_natures || []).filter(Boolean)
  const painLocations = (consultation.pain_locations || []).filter(Boolean)
  const spinalAreas = (consultation.spinal_areas || []).filter(Boolean)

  const filesByCategory = files.reduce<Record<string, ConsultationFile[]>>((acc, f) => {
    const key = f.category || 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(f)
    return acc
  }, {})

  const canActOnReview = ['submitted', 'under_review', 'patient_replied'].includes(consultation.status)
  const isClosed = ['completed', 'cancelled', 'declined'].includes(consultation.status)

  const facts: [string, string | null | undefined][] = [
    ['مدة الشكوى', consultation.pain_duration],
    ['كيف بدأت الأعراض', consultation.symptom_start],
    ['علاجات سابقة', consultation.previous_treatments],
    ['عمليات سابقة', consultation.previous_surgeries],
    ['عوامل تزيد الألم', consultation.aggravating_factors],
    ['عوامل تخفف الألم', consultation.relieving_factors],
    ['تورم/تيبس المفاصل', consultation.joint_swelling_stiffness],
    ['التاريخ المرضي', consultation.medical_history],
    ['الأدوية الحالية', consultation.current_medications],
  ]

  return (
    <DashboardShell active="requests" session={session} onSignOut={handleSignOut}>
      {/* Topbar */}
      <div className="dash-detail-topbar">
        <Link href="/dashboard" className="dash-back">
          <ArrowRight size={16} /> العودة للوحة التحكم
        </Link>
        <div className="dash-detail-heading">
          <h1 className="dash-detail-title">تفاصيل استشارة: {consultation.patient_name}</h1>
          <div className="dash-detail-sub">
            <span className={`dash-badge dash-badge-${consultation.status}`}>{config?.label}</span>
            <span className="dash-detail-meta">
              {new Date(consultation.created_at).toLocaleString('ar-SA-u-nu-latn')}
            </span>
          </div>
        </div>
      </div>

      {/* Doctor banner */}
      <div className="dash-doctor-banner" style={{ marginBottom: '1.1rem' }}>
        <div className="dash-doctor-banner-avatar">
          <Image src={assignedDoc.image === '/main_image.jpeg' ? '/doctor_centered_landscape.jpg' : assignedDoc.image} alt={assignedDoc.name} fill sizes="54px" style={{ objectFit: 'cover' }} />
        </div>
        <div>
          <div className="dash-doctor-banner-kicker">الطبيب المعالج</div>
          <div className="dash-doctor-banner-name">{consultation.doctor_name || assignedDoc.name}</div>
          <div className="dash-doctor-banner-spec">{consultation.specialty || assignedDoc.specialty}</div>
        </div>
        {consultation.appointment_date && consultation.appointment_time && (
          <div className="dash-doctor-banner-appt">
            <span className="dash-doctor-banner-appt-label">الموعد</span>
            <span className="dash-doctor-banner-appt-date">
              {new Date(consultation.appointment_date).toLocaleDateString('ar-SA-u-nu-latn', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <span className="dash-doctor-banner-appt-time">{consultation.appointment_time}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="dash-actions">
        {canActOnReview && (
          <>
            <button onClick={startReview} className="dash-action"><Search size={15} /> بدء المراجعة</button>
            <button onClick={() => setShowApprove(true)} className="dash-action dash-action-ok"><Check size={15} /> قبول وتأكيد</button>
            <button onClick={() => askForInfoWithTemplate(QUICK_REPLY_TEMPLATES[0])} className="dash-action"><Send size={15} /> طلب معلومات</button>
            <button onClick={() => setShowReject(true)} className="dash-action dash-action-err"><X size={15} /> رفض</button>
          </>
        )}
        {consultation.status === 'approved' && (
          <button onClick={startConsultation} className="dash-action dash-action-primary">بدء الاستشارة وإغلاقها</button>
        )}
        {!isClosed && consultation.status !== 'pending_payment' && consultation.status !== 'pending_booking' && (
          <>
            <button onClick={() => setShowReschedule(true)} className="dash-action"><Calendar size={15} /> إعادة جدولة</button>
            <button onClick={() => setShowCancel(true)} className="dash-action dash-action-err"><Ban size={15} /> إلغاء</button>
          </>
        )}
        <a
          href={`/patient/consultation/${consultation.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="dash-action"
          style={{ marginInlineStart: 'auto' }}
        >
          <ExternalLink size={15} /> عرض كالمريض
        </a>
      </div>

      {/* Confirm panels */}
      {showReschedule && (
        <div className="dash-confirm">
          <div className="dash-confirm-title"><Calendar size={16} /> إعادة جدولة الموعد</div>
          <div className="dash-field-row">
            <div className="dash-field">
              <label>التاريخ الجديد</label>
              <input type="date" value={reschedDate} onChange={(e) => setReschedDate(e.target.value)} />
            </div>
            <div className="dash-field">
              <label>الوقت الجديد</label>
              <input type="time" value={reschedTime} onChange={(e) => setReschedTime(e.target.value)} />
            </div>
          </div>
          <div className="dash-confirm-row">
            <button onClick={reschedule} className="dash-action dash-action-primary">تأكيد</button>
            <button onClick={() => setShowReschedule(false)} className="dash-action">إلغاء</button>
          </div>
        </div>
      )}

      {showApprove && (
        <div className="dash-confirm dash-confirm-ok">
          <div className="dash-confirm-title"><Check size={16} /> تأكيد قبول الاستشارة</div>
          <p className="dash-confirm-desc">سيتم قبول الاستشارة وتأكيد الموعد للمريض.</p>
          <div className="dash-confirm-row">
            <button onClick={() => { setShowApprove(false); approve() }} className="dash-action dash-action-ok">تأكيد القبول</button>
            <button onClick={() => setShowApprove(false)} className="dash-action">تراجع</button>
          </div>
        </div>
      )}

      {showCancel && (
        <div className="dash-confirm dash-confirm-err">
          <div className="dash-confirm-title"><Ban size={16} /> إلغاء الاستشارة</div>
          <textarea
            placeholder="سبب الإلغاء (سيظهر للمريض)..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <div className="dash-confirm-row">
            <button onClick={cancel} className="dash-action dash-action-err">تأكيد الإلغاء</button>
            <button onClick={() => setShowCancel(false)} className="dash-action">تراجع</button>
          </div>
        </div>
      )}

      {showReject && (
        <div className="dash-confirm dash-confirm-err">
          <div className="dash-confirm-title"><X size={16} /> رفض طلب الاستشارة</div>
          <textarea
            placeholder="سبب الرفض (اختياري، سيظهر للمريض)..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="dash-confirm-row">
            <button onClick={reject} className="dash-action dash-action-err">تأكيد الرفض</button>
            <button onClick={() => { setShowReject(false); setRejectReason('') }} className="dash-action">تراجع</button>
          </div>
        </div>
      )}

      {/* Two-column grid */}
      <div className="dash-detail-grid">
        {/* LEFT column */}
        <div className="dash-col">
          {/* Patient + complaint */}
          <div className="dash-panel">
            <div className="dash-panel-head">
              <span className="dash-panel-head-spine" />
              <span className="dash-panel-title">بيانات المريض والشكوى</span>
            </div>
            <div className="dash-panel-body">
              <div className="dash-info-table">
                <div className="dash-info-cell dash-info-key">الاسم</div>
                <div className="dash-info-cell dash-info-val">{consultation.patient_name}</div>
                <div className="dash-info-cell dash-info-key">الجوال</div>
                <div className="dash-info-cell dash-info-val ltr">{consultation.patient_phone}</div>
                <div className="dash-info-cell dash-info-key">العمر</div>
                <div className="dash-info-cell dash-info-val">{consultation.patient_age} سنة</div>
              </div>
              <div className="dash-complaint-block">
                <div className="dash-complaint-kicker">الشكوى الرئيسية</div>
                <div className="dash-complaint-text">{consultation.chief_complaint}</div>
              </div>
            </div>
          </div>

          {/* Pain assessment */}
          <div className="dash-panel">
            <div className="dash-panel-head">
              <span className="dash-panel-head-spine gold" />
              <span className="dash-panel-title">تقييم الألم</span>
            </div>
            <div className="dash-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {consultation.pain_severity != null && (
                <div>
                  <div className="dash-severity-meter">
                    <span className="dash-severity-num" style={{ color: severityColor(consultation.pain_severity) }}>
                      {consultation.pain_severity}/10
                    </span>
                    <span className="dash-severity-track">
                      <span className="dash-severity-fill" style={{ width: severityFill(consultation.pain_severity) }} />
                    </span>
                  </div>
                </div>
              )}
              <ConsultationBodyMap
                painLocations={consultation.pain_locations || []}
                spinalAreas={consultation.spinal_areas || []}
                widespread={false}
              />
              {painNatures.length > 0 && (
                <div>
                  <div className="dash-complaint-kicker" style={{ marginBottom: '0.4rem' }}>طبيعة الألم</div>
                  <div className="dash-tags">
                    {painNatures.map((n) => (
                      <span key={n} className="dash-tag dash-tag-green">{PAIN_NATURE_LABELS_AR[n as never] || n}</span>
                    ))}
                  </div>
                </div>
              )}
              {painLocations.length > 0 && (
                <div>
                  <div className="dash-complaint-kicker" style={{ marginBottom: '0.4rem' }}>أماكن الألم</div>
                  <div className="dash-tags">
                    {painLocations.map((l) => (
                      <span key={l} className="dash-tag dash-tag-err">{PAIN_LOCATION_LABELS_AR[l as never] || l}</span>
                    ))}
                    {spinalAreas.map((s) => (
                      <span key={s} className="dash-tag dash-tag-gold">{SPINAL_AREA_LABELS_AR[s as never] || s}</span>
                    ))}
                  </div>
                </div>
              )}
              {facts.filter(([, v]) => v).length > 0 && (
                <div className="dash-fact-list">
                  {facts.filter(([, v]) => v).map(([l, v]) => (
                    <div key={l} className="dash-fact">
                      <div className="dash-fact-key">{l}</div>
                      <div className="dash-fact-val">{v as string}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Files */}
          <div className="dash-panel">
            <div className="dash-panel-head">
              <span className="dash-panel-head-spine gold" />
              <span className="dash-panel-title">الملفات المرفقة</span>
              <span className="dash-panel-count">{files.length}</span>
            </div>
            <div className="dash-panel-body">
              {files.length === 0 ? (
                <div className="dash-files-empty">لا توجد ملفات مرفقة</div>
              ) : (
                Object.entries(filesByCategory).map(([cat, list]) => {
                  const style = catStyle(cat)
                  const isIdCard = cat === 'id_card'
                  return (
                    <div key={cat}>
                      <div className="dash-file-cat-head" style={{ color: style.color }}>
                        <span>{style.icon}</span>
                        {isIdCard ? 'بطاقة الهوية' : FILE_CATEGORY_LABELS_AR[cat as never] || cat} ({list.length})
                      </div>
                      <div className="dash-file-list">
                        {list.map((f) => (
                          <a
                            key={f.id}
                            href={f.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dash-file-item"
                          >
                            {isIdCard && (
                              <img
                                src={f.file_url}
                                alt="بطاقة الهوية"
                                style={{
                                  width: '100%',
                                  maxHeight: '180px',
                                  objectFit: 'contain',
                                  borderRadius: 'var(--r)',
                                  marginBottom: '0.4rem',
                                  border: '1px solid var(--border)',
                                }}
                              />
                            )}
                            <span className="dash-file-name">{f.file_name}</span>
                            <span className="dash-file-open" style={{ color: style.color }}>فتح ↗</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT column */}
        <div className="dash-col">
          {/* Chat */}
          <div className="dash-panel dash-chat">
            <div className="dash-panel-head">
              <span className="dash-panel-head-spine" />
              <span className="dash-panel-title">المحادثة مع المريض</span>
              <span className="dash-panel-count">{messages.length}</span>
            </div>
            <div ref={chatScrollRef} className="dash-chat-log">
              {messages.length === 0 && (
                <p className="dash-chat-empty">لا توجد رسائل بعد. ابدأ المحادثة بإرسال رسالة أو اطلب معلومات.</p>
              )}
              {messages.map((m) => {
                const isDoctor = m.sender_role === 'doctor'
                const isSystem = m.sender_role === 'system'
                if (isSystem) {
                  return (
                    <div key={m.id} className="dash-bubble dash-bubble-system">
                      <span>{m.body}</span>
                    </div>
                  )
                }
                return (
                  <div key={m.id} className={`dash-bubble ${isDoctor ? 'dash-bubble-doctor' : 'dash-bubble-patient'}`}>
                    <div className="dash-bubble-author">{isDoctor ? 'أنا (الطبيب)' : consultation.patient_name}</div>
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.body}</div>
                    <div className="dash-bubble-time">
                      <span>{new Date(m.created_at).toLocaleTimeString('ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <form onSubmit={sendChat} className="dash-chat-composer">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(e as unknown as React.FormEvent) } }}
                placeholder="اكتب رسالة للمريض..."
                rows={2}
                disabled={sendingMessage}
              />
              <div className="dash-chat-row">
                <button type="submit" className="dash-action dash-action-primary" disabled={!chatInput.trim() || sendingMessage}>
                  {sendingMessage ? '...' : 'إرسال'}
                </button>
                <button
                  type="button"
                  onClick={askForInfo}
                  className="dash-action"
                  disabled={!chatInput.trim() || sendingMessage}
                  title="إرسال الرسالة وتغيير الحالة إلى «يحتاج معلومات»"
                >
                  <Send size={15} /> اطلب معلومات
                </button>
              </div>
              <details className="dash-templates">
                <summary>قوالب جاهزة</summary>
                <div className="dash-templates-list">
                  {QUICK_REPLY_TEMPLATES.map((t) => (
                    <button key={t} type="button" className="dash-template-btn" onClick={() => setChatInput(t)}>
                      {t}
                    </button>
                  ))}
                </div>
              </details>
            </form>
          </div>

          {/* Doctor notes */}
          <div className="dash-panel">
            <div className="dash-panel-head">
              <span className="dash-panel-head-spine gold" />
              <span className="dash-panel-title">ملاحظات الطبيب (خاصة)</span>
            </div>
            <div className="dash-panel-body">
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="ملاحظاتك الخاصة حول هذه الحالة..."
                className="dash-notes-area"
              />
              <div className="dash-notes-row">
                <button onClick={saveNotes} className="dash-action dash-action-primary" disabled={savingNotes}>
                  {savingNotes ? 'جاري الحفظ...' : 'حفظ الملاحظات'}
                </button>
                {notesSavedAt && (
                  <span className="dash-notes-saved"><Check size={15} /> تم الحفظ {notesSavedAt}</span>
                )}
              </div>
            </div>
          </div>

          {/* Cancellation reason */}
          {consultation.cancellation_reason && (
            <div className="dash-reason">
              <div className="dash-reason-key">سبب الإلغاء/الرفض</div>
              <div className="dash-reason-val">{consultation.cancellation_reason}</div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
