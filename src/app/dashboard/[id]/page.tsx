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
  PAIN_NATURE_LABELS_EN,
  PAIN_LOCATION_LABELS_AR,
  PAIN_LOCATION_LABELS_EN,
  SPINAL_AREA_LABELS_AR,
  SPINAL_AREA_LABELS_EN,
  FILE_CATEGORY_LABELS_AR,
  FILE_CATEGORY_LABELS_EN,
  STATUS_CONFIG,
  type ConsultationStatus,
} from '@/lib/supabase'
import { DashboardShell, DashboardGate, DashboardError } from '@/components/DashboardShell'
import { useLanguage } from '@/context/LanguageContext'
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
  const { lang, t } = useLanguage()

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
    setSession(cached)
    setAuthChecked(true)
  }, [router])

  useEffect(() => {
    if (!id || !authChecked) return
    let unsub: (() => void) | null = null
    ;(async () => {
      try {
        const doc = await getConsultationById(id)
        if (!doc) { setError(lang === 'ar' ? 'الاستشارة غير موجودة' : 'Consultation not found'); return }
        setConsultation(doc)
        setDoctorNotes(doc.doctor_notes || '')

        const fileList = await getConsultationFiles(id)
        setFiles(fileList)

        unsub = subscribeToMessages(id, setMessages)
        await markRead(id, 'doctor')
      } catch (err) {
        console.error('Error loading consultation details:', err)
        setError(lang === 'ar' ? 'تعذر تحميل الاستشارة' : 'Could not load consultation')
      } finally {
        setLoading(false)
      }
    })()
    return () => { if (unsub) unsub() }
  }, [id, authChecked, lang])

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
      toasts.push(lang === 'ar' ? 'فشل تحديث حالة الاستشارة. حاول مرة أخرى.' : 'Failed to update consultation status. Try again.', 'error')
    }
  }

  async function approve() {
    await setStatus('approved', lang === 'ar' ? 'تم قبول الاستشارة وتأكيد الموعد من قبل الطبيب.' : 'Consultation accepted and appointment confirmed by the doctor.')
  }

  async function startReview() {
    await setStatus('under_review', lang === 'ar' ? 'بدأ الطبيب مراجعة طلبك.' : 'The doctor has started reviewing your request.')
  }

  async function askForInfo() {
    if (!chatInput.trim()) {
      toasts.push(lang === 'ar' ? 'اكتب رسالتك للطبيب قبل إرسال طلب المعلومات.' : 'Please write your message to the patient before requesting info.', 'warn')
      return
    }
    if (!consultation) return
    setSendingMessage(true)
    try {
      await sendMessage(consultation.id, chatInput, 'doctor')
      await transitionStatus(consultation.id, 'needs_info', {}, lang === 'ar' ? 'طلب الطبيب من المريض معلومات إضافية.' : 'The doctor requested additional information from the patient.')
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
      await transitionStatus(consultation.id, 'needs_info', {}, lang === 'ar' ? 'طلب الطبيب من المريض معلومات إضافية.' : 'The doctor requested additional information from the patient.')
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
      lang === 'ar' ? 'تم رفض طلب الاستشارة.' : 'Consultation request declined.',
    )
    const refreshed = await getConsultationById(consultation.id)
    if (refreshed) setConsultation(refreshed)
    setShowReject(false)
    setRejectReason('')
  }

  async function cancel() {
    if (!consultation || !cancelReason.trim()) {
      toasts.push(lang === 'ar' ? 'الرجاء كتابة سبب الإلغاء.' : 'Please write a cancellation reason.', 'warn')
      return
    }
    await transitionStatus(consultation.id, 'cancelled', { cancellation_reason: cancelReason }, lang === 'ar' ? 'تم إلغاء الاستشارة.' : 'Consultation cancelled.')
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
    await setStatus('completed', lang === 'ar' ? 'تم إجراء الاستشارة وإغلاقها.' : 'Consultation completed and closed.')
  }

  async function reschedule() {
    if (!reschedDate || !reschedTime) {
      toasts.push(lang === 'ar' ? 'الرجاء اختيار التاريخ والوقت الجديد.' : 'Please select a new date and time.', 'warn')
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
      lang === 'ar' ? `تم إعادة جدولة الموعد إلى ${reschedDate} الساعة ${reschedTime}.` : `Appointment rescheduled to ${reschedDate} at ${reschedTime}.`,
    )
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
        setNotesSavedAt(new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', { hour: '2-digit', minute: '2-digit' }))
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
        message={authChecked ? t('dash_gate_loading_detail') : t('dash_gate_checking_login')}
      />
    )
  }

  if (error || !consultation) {
    return <DashboardError message={error || (lang === 'ar' ? 'الاستشارة غير موجودة' : 'Consultation not found')} onBack={() => router.push('/dashboard')} />
  }

  const configLabel = t('status_' + consultation.status)
  const doctorId = consultation.doctor_id || 'khalid'
  const assignedDoc = DOCTORS.find((d) => d.id === doctorId) || DOCTORS[0]

  const painNatures = (consultation.pain_natures || []).filter(Boolean)
  const painLocations = (consultation.pain_locations || []).filter(Boolean)
  const spinalAreas = (consultation.spinal_areas || []).filter(Boolean)

  const painNatureLabels = lang === 'ar' ? PAIN_NATURE_LABELS_AR : PAIN_NATURE_LABELS_EN
  const painLocationLabels = lang === 'ar' ? PAIN_LOCATION_LABELS_AR : PAIN_LOCATION_LABELS_EN
  const spinalAreaLabels = lang === 'ar' ? SPINAL_AREA_LABELS_AR : SPINAL_AREA_LABELS_EN
  const fileCategoryLabels = lang === 'ar' ? FILE_CATEGORY_LABELS_AR : FILE_CATEGORY_LABELS_EN

  const filesByCategory = files.reduce<Record<string, ConsultationFile[]>>((acc, f) => {
    const key = f.category || 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(f)
    return acc
  }, {})

  const canActOnReview = ['submitted', 'under_review', 'patient_replied'].includes(consultation.status)
  const isClosed = ['completed', 'cancelled', 'declined'].includes(consultation.status)

  const facts: [string, string | null | undefined][] = lang === 'ar' ? [
    ['مدة الشكوى', consultation.pain_duration],
    ['كيف بدأت الأعراض', consultation.symptom_start],
    ['علاجات سابقة', consultation.previous_treatments],
    ['عمليات سابقة', consultation.previous_surgeries],
    ['عوامل تزيد الألم', consultation.aggravating_factors],
    ['عوامل تخفف الألم', consultation.relieving_factors],
    ['تورم/تيبس المفاصل', consultation.joint_swelling_stiffness],
    ['التاريخ المرضي', consultation.medical_history],
    ['الأدوية الحالية', consultation.current_medications],
  ] : [
    ['Complaint duration', consultation.pain_duration],
    ['How symptoms started', consultation.symptom_start],
    ['Previous treatments', consultation.previous_treatments],
    ['Previous surgeries', consultation.previous_surgeries],
    ['Aggravating factors', consultation.aggravating_factors],
    ['Relieving factors', consultation.relieving_factors],
    ['Joint swelling/stiffness', consultation.joint_swelling_stiffness],
    ['Medical history', consultation.medical_history],
    ['Current medications', consultation.current_medications],
  ]

  const quickTemplates = lang === 'ar' ? QUICK_REPLY_TEMPLATES : [
    'Please upload a clearer image of your X-ray or MRI report.',
    'When did this pain start exactly, and does it increase with movement or rest?',
    'Are you currently taking any pain relievers or other chronic disease medications?',
  ]

  return (
    <DashboardShell active="requests" session={session} onSignOut={handleSignOut}>
      {/* Topbar */}
      <div className="dash-detail-topbar">
        <Link href="/dashboard" className="dash-back">
          <ArrowRight size={16} /> {t('dash_detail_back')}
        </Link>
        <div className="dash-detail-heading">
          <h1 className="dash-detail-title">{t('dash_detail_title')} {consultation.patient_name}</h1>
          <div className="dash-detail-sub">
            <span className={`dash-badge dash-badge-${consultation.status}`}>{configLabel}</span>
            <span className="dash-detail-meta">
              {new Date(consultation.created_at).toLocaleString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US')}
            </span>
          </div>
        </div>
      </div>

      {/* Doctor banner */}
      <div className="dash-doctor-banner" style={{ marginBottom: '1.1rem' }}>
        <div className="dash-doctor-banner-avatar">
          <Image src={assignedDoc.image === '/main_image.jpeg' ? '/doctor_centered_landscape.jpg' : assignedDoc.image} alt={t('hero_title_dr')} fill sizes="54px" style={{ objectFit: 'cover' }} />
        </div>
        <div>
          <div className="dash-doctor-banner-kicker">{t('dash_detail_doctor_kicker')}</div>
          <div className="dash-doctor-banner-name">{consultation.doctor_name || t('hero_title_dr')}</div>
          <div className="dash-doctor-banner-spec">{consultation.specialty || t('hero_title_title')}</div>
        </div>
        {consultation.appointment_date && consultation.appointment_time && (
          <div className="dash-doctor-banner-appt">
            <span className="dash-doctor-banner-appt-label">{t('dash_detail_appt_label')}</span>
            <span className="dash-doctor-banner-appt-date">
              {new Date(consultation.appointment_date).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <span className="dash-doctor-banner-appt-time">{consultation.appointment_time}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="dash-actions">
        {canActOnReview && (
          <>
            <button onClick={startReview} className="dash-action"><Search size={15} /> {t('dash_btn_start_review')}</button>
            <button onClick={() => setShowApprove(true)} className="dash-action dash-action-ok"><Check size={15} /> {t('dash_btn_approve')}</button>
            <button onClick={() => askForInfoWithTemplate(quickTemplates[0])} className="dash-action"><Send size={15} /> {t('dash_btn_ask_info')}</button>
            <button onClick={() => setShowReject(true)} className="dash-action dash-action-err"><X size={15} /> {t('dash_btn_reject')}</button>
          </>
        )}
        {consultation.status === 'approved' && (
          <button onClick={startConsultation} className="dash-action dash-action-primary">{t('dash_btn_start_close')}</button>
        )}
        {!isClosed && consultation.status !== 'pending_payment' && consultation.status !== 'pending_booking' && (
          <>
            <button onClick={() => setShowReschedule(true)} className="dash-action"><Calendar size={15} /> {t('dash_btn_reschedule')}</button>
            <button onClick={() => setShowCancel(true)} className="dash-action dash-action-err"><Ban size={15} /> {t('dash_btn_cancel')}</button>
          </>
        )}
        <a
          href={`/patient/consultation/${consultation.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="dash-action"
          style={{ marginInlineStart: 'auto' }}
        >
          <ExternalLink size={15} /> {t('dash_btn_view_as_patient')}
        </a>
      </div>

      {/* Confirm panels */}
      {showReschedule && (
        <div className="dash-confirm">
          <div className="dash-confirm-title"><Calendar size={16} /> {t('dash_confirm_reschedule')}</div>
          <div className="dash-field-row">
            <div className="dash-field">
              <label>{t('dash_confirm_new_date')}</label>
              <input type="date" value={reschedDate} onChange={(e) => setReschedDate(e.target.value)} />
            </div>
            <div className="dash-field">
              <label>{t('dash_confirm_new_time')}</label>
              <input type="time" value={reschedTime} onChange={(e) => setReschedTime(e.target.value)} />
            </div>
          </div>
          <div className="dash-confirm-row">
            <button onClick={reschedule} className="dash-action dash-action-primary">{t('dash_confirm_btn_confirm')}</button>
            <button onClick={() => setShowReschedule(false)} className="dash-action">{t('dash_confirm_btn_cancel')}</button>
          </div>
        </div>
      )}

      {showApprove && (
        <div className="dash-confirm dash-confirm-ok">
          <div className="dash-confirm-title"><Check size={16} /> {t('dash_confirm_approve_title')}</div>
          <p className="dash-confirm-desc">{t('dash_confirm_approve_desc')}</p>
          <div className="dash-confirm-row">
            <button onClick={() => { setShowApprove(false); approve() }} className="dash-action dash-action-ok">{t('dash_confirm_approve_btn')}</button>
            <button onClick={() => setShowApprove(false)} className="dash-action">{t('dash_confirm_approve_back')}</button>
          </div>
        </div>
      )}

      {showCancel && (
        <div className="dash-confirm dash-confirm-err">
          <div className="dash-confirm-title"><Ban size={16} /> {t('dash_confirm_cancel_title')}</div>
          <textarea
            placeholder={t('dash_confirm_cancel_placeholder')}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <div className="dash-confirm-row">
            <button onClick={cancel} className="dash-action dash-action-err">{t('dash_confirm_cancel_btn')}</button>
            <button onClick={() => setShowCancel(false)} className="dash-action">{t('dash_confirm_approve_back')}</button>
          </div>
        </div>
      )}

      {showReject && (
        <div className="dash-confirm dash-confirm-err">
          <div className="dash-confirm-title"><X size={16} /> {t('dash_confirm_reject_title')}</div>
          <textarea
            placeholder={t('dash_confirm_reject_placeholder')}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="dash-confirm-row">
            <button onClick={reject} className="dash-action dash-action-err">{t('dash_confirm_reject_btn')}</button>
            <button onClick={() => { setShowReject(false); setRejectReason('') }} className="dash-action">{t('dash_confirm_approve_back')}</button>
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
              <span className="dash-panel-title">{t('dash_panel_patient_info')}</span>
            </div>
            <div className="dash-panel-body">
              <div className="dash-info-table">
                <div className="dash-info-cell dash-info-key">{t('dash_info_name')}</div>
                <div className="dash-info-cell dash-info-val">{consultation.patient_name}</div>
                <div className="dash-info-cell dash-info-key">{t('dash_info_phone')}</div>
                <div className="dash-info-cell dash-info-val ltr">{consultation.patient_phone}</div>
                <div className="dash-info-cell dash-info-key">{t('dash_info_age')}</div>
                <div className="dash-info-cell dash-info-val">{consultation.patient_age} {t('dash_patient_years')}</div>
              </div>
              <div className="dash-complaint-block">
                <div className="dash-complaint-kicker">{t('dash_chief_complaint_label')}</div>
                <div className="dash-complaint-text">{consultation.chief_complaint}</div>
              </div>
            </div>
          </div>

          {/* Pain assessment */}
          <div className="dash-panel">
            <div className="dash-panel-head">
              <span className="dash-panel-head-spine gold" />
              <span className="dash-panel-title">{t('dash_panel_pain_eval')}</span>
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
                  <div className="dash-complaint-kicker" style={{ marginBottom: '0.4rem' }}>{t('dash_pain_nature')}</div>
                  <div className="dash-tags">
                    {painNatures.map((n) => (
                      <span key={n} className="dash-tag dash-tag-green">{painNatureLabels[n as never] || n}</span>
                    ))}
                  </div>
                </div>
              )}
              {painLocations.length > 0 && (
                <div>
                  <div className="dash-complaint-kicker" style={{ marginBottom: '0.4rem' }}>{t('dash_pain_locations')}</div>
                  <div className="dash-tags">
                    {painLocations.map((l) => (
                      <span key={l} className="dash-tag dash-tag-err">{painLocationLabels[l as never] || l}</span>
                    ))}
                    {spinalAreas.map((s) => (
                      <span key={s} className="dash-tag dash-tag-gold">{spinalAreaLabels[s as never] || s}</span>
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
              <span className="dash-panel-title">{t('dash_panel_files')}</span>
              <span className="dash-panel-count">{files.length}</span>
            </div>
            <div className="dash-panel-body">
              {files.length === 0 ? (
                <div className="dash-files-empty">{t('dash_files_empty')}</div>
              ) : (
                Object.entries(filesByCategory).map(([cat, list]) => {
                  const style = catStyle(cat)
                  const isIdCard = cat === 'id_card'
                  return (
                    <div key={cat}>
                      <div className="dash-file-cat-head" style={{ color: style.color }}>
                        <span>{style.icon}</span>
                        {isIdCard ? t('dash_id_card_label') : fileCategoryLabels[cat as never] || cat} ({list.length})
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
                                alt={t('dash_id_card_label')}
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
                            <span className="dash-file-open" style={{ color: style.color }}>{t('dash_file_open')} ↗</span>
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
              <span className="dash-panel-title">{t('dash_panel_chat')}</span>
              <span className="dash-panel-count">{messages.length}</span>
            </div>
            <div ref={chatScrollRef} className="dash-chat-log">
              {messages.length === 0 && (
                <p className="dash-chat-empty">{t('dash_chat_empty')}</p>
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
                    <div className="dash-bubble-author">{isDoctor ? t('dash_chat_me') : consultation.patient_name}</div>
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.body}</div>
                    <div className="dash-bubble-time">
                      <span>{new Date(m.created_at).toLocaleTimeString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
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
                placeholder={t('dash_chat_placeholder')}
                rows={2}
                disabled={sendingMessage}
              />
              <div className="dash-chat-row">
                <button type="submit" className="dash-action dash-action-primary" disabled={!chatInput.trim() || sendingMessage}>
                  {t('dash_chat_send')}
                </button>
                <button
                  type="button"
                  onClick={askForInfo}
                  className="dash-action"
                  disabled={!chatInput.trim() || sendingMessage}
                  title={lang === 'ar' ? 'إرسال الرسالة وتغيير الحالة إلى «يحتاج معلومات»' : 'Send message and change status to "Needs info"'}
                >
                  <Send size={15} /> {t('dash_btn_ask_info')}
                </button>
              </div>
              <details className="dash-templates">
                <summary>{t('dash_chat_templates')}</summary>
                <div className="dash-templates-list">
                  {quickTemplates.map((template) => (
                    <button key={template} type="button" className="dash-template-btn" onClick={() => setChatInput(template)}>
                      {template}
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
              <span className="dash-panel-title">{t('dash_panel_notes')}</span>
            </div>
            <div className="dash-panel-body">
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder={t('dash_notes_placeholder')}
                className="dash-notes-area"
              />
              <div className="dash-notes-row">
                <button onClick={saveNotes} className="dash-action dash-action-primary" disabled={savingNotes}>
                  {savingNotes ? t('dash_saving') : t('dash_notes_save')}
                </button>
                {notesSavedAt && (
                  <span className="dash-notes-saved"><Check size={15} /> {t('dash_notes_saved_at')} {notesSavedAt}</span>
                )}
              </div>
            </div>
          </div>

          {/* Cancellation reason */}
          {consultation.cancellation_reason && (
            <div className="dash-reason">
              <div className="dash-reason-key">{t('dash_cancellation_reason_title')}</div>
              <div className="dash-reason-val">{consultation.cancellation_reason}</div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

