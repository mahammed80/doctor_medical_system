'use client'

import { useEffect, useState, Suspense, type ReactNode, Component } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Check,
  X,
  Search,
  Inbox,
  HelpCircle,
  MessageCircle,
  Ban,
  Calendar,
  CalendarDays,
  CreditCard,
  ChevronLeft,
  FileSearch,
  RotateCcw,
  Link2,
  Unlink,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { getConsultations, getDoctorSettings, saveDoctorSettings, DoctorScheduleSettings, EnhancedConsultation } from '@/lib/consultationService'
import { getCachedSession, signOut, AuthSession } from '@/lib/auth'
import { DOCTORS } from '@/lib/doctors'
import { STATUS_CONFIG, type ConsultationStatus } from '@/lib/supabase'
import { useToasts } from '@/components/Toaster'
import { DashboardShell, DashboardGate } from '@/components/DashboardShell'
import { useLanguage } from '@/context/LanguageContext'
import './dashboard.css'

const OVERVIEW_STATUSES: ConsultationStatus[] = [
  'submitted',
  'needs_info',
  'patient_replied',
  'approved',
  'completed',
]

type StatMeta = { icon: ReactNode; color: string; soft: string; line: string }

const STATUS_META: Record<ConsultationStatus, StatMeta> = {
  submitted:       { icon: <Inbox size={20} />,         color: 'var(--dash-terra)',  soft: 'var(--dash-terra-50)',  line: 'rgba(196,106,79,0.25)' },
  under_review:    { icon: <Search size={20} />,        color: 'var(--dash-green)',  soft: 'var(--dash-green-50)',  line: 'var(--dash-green-100)' },
  needs_info:      { icon: <HelpCircle size={20} />,    color: 'var(--dash-gold)',   soft: 'var(--dash-amber-soft)', line: 'rgba(184,134,75,0.28)' },
  patient_replied: { icon: <MessageCircle size={20} />, color: '#235344',            soft: 'var(--dash-green-50)',  line: 'var(--dash-green-100)' },
  approved:        { icon: <Check size={20} />,         color: 'var(--dash-ok)',     soft: 'var(--dash-ok-soft)',   line: 'rgba(26,60,47,0.18)' },
  completed:       { icon: <Check size={20} />,         color: 'var(--dash-green)',  soft: 'var(--dash-green-50)',  line: 'var(--dash-green-100)' },
  declined:        { icon: <X size={20} />,             color: 'var(--dash-err)',    soft: 'var(--dash-err-soft)',  line: 'rgba(165,62,62,0.22)' },
  cancelled:       { icon: <Ban size={20} />,           color: 'var(--dash-err)',    soft: 'var(--dash-err-soft)',  line: 'rgba(165,62,62,0.22)' },
  pending_payment: { icon: <CreditCard size={20} />,    color: 'var(--dash-terra)',  soft: 'var(--dash-terra-50)',  line: 'rgba(196,106,79,0.25)' },
  pending_booking: { icon: <Calendar size={20} />,      color: 'var(--dash-green)',  soft: 'var(--dash-green-50)',  line: 'var(--dash-green-100)' },
  booked:          { icon: <Check size={20} />,         color: 'var(--dash-ok)',     soft: 'var(--dash-ok-soft)',   line: 'rgba(26,60,47,0.18)' },
}

const DAYS = [
  { val: 0, label: 'الأحد', en: 'Sunday' },
  { val: 1, label: 'الاثنين', en: 'Monday' },
  { val: 2, label: 'الثلاثاء', en: 'Tuesday' },
  { val: 3, label: 'الأربعاء', en: 'Wednesday' },
  { val: 4, label: 'الخميس', en: 'Thursday' },
  { val: 5, label: 'الجمعة', en: 'Friday' },
  { val: 6, label: 'السبت', en: 'Saturday' },
]

function timeAgo(iso: string, lang: 'ar' | 'en'): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (lang === 'ar') {
    if (m < 1) return 'الآن'
    if (m < 60) return `منذ ${m} دقيقة`
    const h = Math.floor(m / 60)
    if (h < 24) return `منذ ${h} ساعة`
    const d = Math.floor(h / 24)
    if (d < 30) return `منذ ${d} يوم`
    const mo = Math.floor(d / 30)
    return `منذ ${mo} شهر`
  } else {
    if (m < 1) return 'now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    if (d < 30) return `${d}d ago`
    const mo = Math.floor(d / 30)
    return `${mo}mo ago`
  }
}

function severityColor(n: number | null | undefined): string {
  if (n == null) return 'var(--dash-dim)'
  if (n <= 4) return '#2E8B57'
  if (n <= 7) return 'var(--dash-gold)'
  return 'var(--dash-err)'
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      const isEn = typeof document !== 'undefined' && document.documentElement.lang === 'en'
      return (
        <DashboardGate message={isEn ? 'An unexpected error occurred. Please refresh the page.' : 'حدث خطأ غير متوقع. يرجى تحديث الصفحة.'} />
      )
    }
    return this.props.children
  }
}

function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toasts = useToasts()
  const { lang, t } = useLanguage()

  const [session, setSession] = useState<AuthSession | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [consultations, setConsultations] = useState<EnhancedConsultation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('all')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all')

  const [activeTab, setActiveTab] = useState<'requests' | 'settings'>('requests')
  const [scheduleSettings, setScheduleSettings] = useState<DoctorScheduleSettings | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [calendarStatus, setCalendarStatus] = useState<{ connected: boolean; email: string | null; configured: boolean } | null>(null)
  const [calendarLoading, setCalendarLoading] = useState(false)

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
    if (!authChecked) return
    async function loadData() {
      try {
        const data = await getConsultations()
        setConsultations(data)
      } catch (err) {
        console.error('Error loading consultations:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [authChecked])

  useEffect(() => {
    if (!authChecked) return
    async function loadSettings() {
      try {
        const settings = await getDoctorSettings('khalid')
        setScheduleSettings(settings)
      } catch (err) {
        console.error('Error loading doctor settings:', err)
      }
    }
    loadSettings()
  }, [authChecked])

  useEffect(() => {
    if (!authChecked) return
    async function checkCalendar() {
      try {
        const res = await fetch('/api/calendar/status?doctorId=khalid')
        const data = await res.json()
        setCalendarStatus(data)
      } catch (err) {
        console.error('Error checking calendar status:', err)
      }
    }
    checkCalendar()
  }, [authChecked])

  useEffect(() => {
    if (searchParams.get('calendar_connected') === 'true') {
      toasts.push(lang === 'ar' ? 'تم ربط Google Calendar بنجاح! الحجوزات المستقبلية ستتم مزامنتها تلقائياً.' : 'Google Calendar connected successfully! Future bookings will be synchronized automatically.', 'success')
      const url = new URL(window.location.href)
      url.searchParams.delete('calendar_connected')
      window.history.replaceState({}, '', url.toString())
    }
    const error = searchParams.get('calendar_error')
    if (error) {
      toasts.push(lang === 'ar' ? `فشل ربط Google Calendar: ${error}` : `Failed to connect Google Calendar: ${error}`, 'error')
      const url = new URL(window.location.href)
      url.searchParams.delete('calendar_error')
      window.history.replaceState({}, '', url.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const statusCounts = OVERVIEW_STATUSES.map((status) => {
    const count = consultations.filter(
      (c) => c.status === status || (status === 'approved' && c.status === 'booked')
    ).length
    return { status, count, label: t('status_' + status), ...STATUS_META[status] }
  })
  const maxCount = Math.max(1, ...statusCounts.map((s) => s.count))
  const pendingCount = consultations.filter((c) => c.status === 'submitted').length

  const filteredConsultations = consultations.filter((c) => {
    const matchesSearch =
      c.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patient_phone.includes(searchQuery) ||
      (c.chief_complaint || '').toLowerCase().includes(searchQuery.toLowerCase())
    const doctorId = c.doctor_id || 'khalid'
    const matchesDoctor = selectedDoctorFilter === 'all' || doctorId === selectedDoctorFilter
    const matchesStatus = selectedStatusFilter === 'all' || c.status === selectedStatusFilter
    return matchesSearch && matchesDoctor && matchesStatus
  })

  const activeFilters = searchQuery || selectedDoctorFilter !== 'all' || selectedStatusFilter !== 'all'

  function clearFilter(kind: 'search' | 'doctor' | 'status') {
    if (kind === 'search') setSearchQuery('')
    if (kind === 'doctor') setSelectedDoctorFilter('all')
    if (kind === 'status') setSelectedStatusFilter('all')
  }

  async function handleSaveSettings() {
    if (!scheduleSettings) return
    setSavingSettings(true)
    setSaveSuccess(false)
    const docId = 'khalid'
    try {
      await saveDoctorSettings(docId, scheduleSettings)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch {
      toasts.push(lang === 'ar' ? 'خطأ أثناء حفظ الإعدادات' : 'Error saving settings', 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  async function handleConnectCalendar() {
    window.location.href = `/api/calendar/oauth/connect?doctorId=khalid`
  }

  async function handleDisconnectCalendar() {
    setCalendarLoading(true)
    try {
      await fetch('/api/calendar/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: 'khalid' }),
      })
      setCalendarStatus({ connected: false, email: null, configured: calendarStatus?.configured ?? false })
      toasts.push(lang === 'ar' ? 'تم قطع اتصال Google Calendar' : 'Google Calendar disconnected successfully', 'success')
    } catch {
      toasts.push(lang === 'ar' ? 'فشل قطع اتصال Google Calendar' : 'Failed to disconnect Google Calendar', 'error')
    } finally {
      setCalendarLoading(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    router.replace('/dashboard/login')
  }

  if (!authChecked || loading) {
    return (
      <DashboardGate
        message={authChecked ? t('dash_gate_loading_consults') : t('dash_gate_checking_login')}
      />
    )
  }

  const todayLabel = new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <DashboardShell
      active={activeTab}
      session={session}
      onSignOut={handleSignOut}
      onNavigate={setActiveTab}
      pendingCount={pendingCount}
    >
      {/* Topbar */}
      <div className="dash-topbar">
        <div className="dash-topbar-start">
          <span className="dash-eyebrow">{t('dash_eyebrow')}</span>
          <h1 className="dash-title">
            {activeTab === 'requests' ? t('dash_title_requests') : t('dash_title_settings')}
          </h1>
          <p className="dash-subtitle">
            {activeTab === 'requests'
              ? t('dash_subtitle_requests')
              : t('dash_subtitle_settings')}
          </p>
        </div>
        <div className="dash-topbar-end">
          <span className="dash-pill"><CalendarDays size={14} /> {todayLabel}</span>
          <span className="dash-pill">
            {t('dash_total')}: <strong className="dash-pill-num">{consultations.length}</strong> {t('dash_consultations')}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        {statusCounts.map(({ status, count, label, icon, color, soft, line }, i) => {
          const isActive = selectedStatusFilter === status
          return (
            <div
              key={status}
              className={`dash-stat ${isActive ? 'dash-stat-active' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              aria-label={lang === 'ar' ? `تصفية حسب حالة: ${label}` : `Filter by status: ${label}`}
              style={{
                '--stat-color': color,
                '--stat-soft': soft,
                '--stat-line': line,
                '--bar-w': `${(count / maxCount) * 100}%`,
                animationDelay: `${i * 0.06}s`,
              } as React.CSSProperties}
              onClick={() => {
                setActiveTab('requests')
                setSelectedStatusFilter(isActive ? 'all' : status)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setActiveTab('requests')
                  setSelectedStatusFilter(isActive ? 'all' : status)
                }
              }}
            >
              <span className="dash-stat-spine" />
              <div className="dash-stat-head">
                <div className="dash-stat-icon">{icon}</div>
                <span className="dash-stat-trend">{count === 0 ? '—' : `${count}`}</span>
              </div>
              <div className="dash-stat-body">
                <span className="dash-stat-value">{count}</span>
                <span className="dash-stat-label">{label}</span>
                <span className="dash-stat-hint">
                  {lang === 'ar' ? (count === 0 ? 'لا توجد' : count === 1 ? 'استشارة واحدة' : `${count} استشارات`) : (count === 0 ? 'No consultations' : count === 1 ? '1 consultation' : `${count} consultations`)}
                </span>
              </div>
              <span className="dash-stat-bar" />
            </div>
          )
        })}
      </div>

      {activeTab === 'requests' && (
        <>
          {/* Toolbar */}
          <div className="dash-toolbar">
            <div className="dash-search">
              <input
                type="text"
                placeholder={t('dash_search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="dash-search-icon"><Search size={16} /></span>
            </div>


            <div className="dash-filter-group">
              <span className="dash-filter-label">{t('dash_filter_status_label')}</span>
              <select
                className="dash-select"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
              >
                <option value="all">{t('dash_filter_status_all')}</option>
                <option value="submitted">{t('status_submitted')}</option>
                <option value="under_review">{t('status_under_review')}</option>
                <option value="needs_info">{t('status_needs_info')}</option>
                <option value="patient_replied">{t('status_patient_replied')}</option>
                <option value="approved">{t('status_approved')}</option>
                <option value="completed">{t('status_completed')}</option>
                <option value="declined">{t('status_declined')}</option>
                <option value="cancelled">{t('status_cancelled')}</option>
                <option value="pending_payment">{t('status_pending_payment')}</option>
                <option value="pending_booking">{t('status_pending_booking')}</option>
              </select>
            </div>

            {activeFilters && (
              <button className="dash-reset" onClick={() => { setSearchQuery(''); setSelectedDoctorFilter('all'); setSelectedStatusFilter('all') }}>
                <RotateCcw size={14} /> {t('dash_reset_filters')}
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {activeFilters && (
            <div className="dash-chips">
              {searchQuery && (
                <span className="dash-chip">
                  {lang === 'ar' ? `بحث: «${searchQuery}»` : `Search: "${searchQuery}"`}
                  <button aria-label={lang === 'ar' ? 'إزالة البحث' : 'Remove search'} onClick={() => clearFilter('search')}>×</button>
                </span>
              )}

              {selectedStatusFilter !== 'all' && (
                <span className="dash-chip">
                  {t('status_' + selectedStatusFilter)}
                  <button aria-label={lang === 'ar' ? 'إزالة تصفية الحالة' : 'Remove status filter'} onClick={() => clearFilter('status')}>×</button>
                </span>
              )}
            </div>
          )}

          {/* Result count */}
          <div className="dash-result-count">
            {t('dash_showing')} <strong>{filteredConsultations.length}</strong> {t('dash_of')} {consultations.length} {t('dash_consultations')}
          </div>

          {/* Table */}
          <div className="dash-card">
            {!filteredConsultations.length ? (
              <div className="dash-empty">
                <div className="dash-empty-glyph"><Inbox size={30} /></div>
                <p className="dash-empty-title">{t('dash_empty_title')}</p>
                <p className="dash-empty-desc">{t('dash_empty_desc')}</p>
              </div>
            ) : (
              <div className="dash-table-scroll">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>{t('dash_table_patient')}</th>
                      <th>{t('dash_table_complaint')}</th>
                      <th>{t('dash_table_status')}</th>
                      <th>{t('dash_table_date')}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConsultations.map((c) => {
                      const configLabel = t('status_' + c.status)
                      return (
                        <tr
                          key={c.id}
                          tabIndex={0}
                          role="button"
                          aria-label={lang === 'ar' ? `استشارة ${c.patient_name}` : `Consultation ${c.patient_name}`}
                          onClick={() => router.push(`/dashboard/${c.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              router.push(`/dashboard/${c.id}`)
                            }
                          }}
                        >
                          <td>
                            <div className="dash-patient">
                              <span className="dash-patient-name">{c.patient_name}</span>
                              <span className="dash-patient-meta">{c.patient_phone} · {c.patient_age} {t('dash_patient_years')}</span>
                            </div>
                          </td>

                          <td>
                            <span className="dash-complaint">{c.chief_complaint}</span>
                            {c.pain_severity != null && (
                              <span className="dash-severity" style={{ marginTop: '0.2rem' }}>
                                <span className="dash-severity-dot" style={{ background: severityColor(c.pain_severity) }} />
                                {c.pain_severity}/10
                              </span>
                            )}
                          </td>
                          <td>
                            <span className={`dash-badge dash-badge-${c.status}`}>{configLabel}</span>
                          </td>
                          <td>
                            <div className="dash-date-cell">
                              <span className="dash-date">
                                {new Date(c.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US')}
                              </span>
                              <span className="dash-timeago">{timeAgo(c.created_at, lang)}</span>
                            </div>
                          </td>
                          <td>
                            <ChevronLeft size={18} className="dash-row-chevron" />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'settings' && scheduleSettings && (
        <div className="dash-settings">
          <div className="dash-settings-head">
            <CalendarDays size={22} />
            <h2 className="dash-settings-title">{t('dash_title_settings')}</h2>
            <span className="dash-settings-doctor">
              ({DOCTORS.find((d) => d.id === 'khalid')?.name})
            </span>
          </div>

          {saveSuccess && (
            <div className="dash-success">
              <Check size={16} />
              {t('dash_save_success')}
            </div>
          )}

          <div className="dash-settings-grid">
            <div>
              <h3 className="dash-group-title">{t('dash_working_days')}</h3>
              <div className="dash-day-list">
                {DAYS.map((day) => {
                  const isOn = scheduleSettings.workingDays.includes(day.val)
                  return (
                    <div
                      key={day.val}
                      className={`dash-day-chip ${isOn ? 'dash-day-chip-on' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        const newList = isOn
                          ? scheduleSettings.workingDays.filter((v) => v !== day.val)
                          : [...scheduleSettings.workingDays, day.val].sort()
                        setScheduleSettings({ ...scheduleSettings, workingDays: newList })
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          const newList = isOn
                            ? scheduleSettings.workingDays.filter((v) => v !== day.val)
                            : [...scheduleSettings.workingDays, day.val].sort()
                          setScheduleSettings({ ...scheduleSettings, workingDays: newList })
                        }
                      }}
                    >
                      <span>{lang === 'ar' ? day.label : day.en} <span style={{ color: 'var(--dash-dim)', fontWeight: 500, fontSize: '0.72rem' }}>({lang === 'ar' ? day.en : day.label})</span></span>
                      <span className="dash-day-toggle" />
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="dash-group-title">{t('dash_daily_hours')}</h3>
              <div className="dash-field-row">
                <div className="dash-field">
                  <label>{t('dash_start_time')}</label>
                  <input
                    type="time"
                    value={scheduleSettings.startTime}
                    onChange={(e) => setScheduleSettings({ ...scheduleSettings, startTime: e.target.value })}
                  />
                </div>
                <div className="dash-field">
                  <label>{t('dash_end_time')}</label>
                  <input
                    type="time"
                    value={scheduleSettings.endTime}
                    onChange={(e) => setScheduleSettings({ ...scheduleSettings, endTime: e.target.value })}
                  />
                </div>
              </div>

              <h3 className="dash-group-title" style={{ marginTop: '1rem' }}>{t('dash_break_hours')}</h3>
              <div className="dash-field-row">
                <div className="dash-field">
                  <label>{t('dash_break_start')}</label>
                  <input
                    type="time"
                    value={scheduleSettings.lunchStart}
                    onChange={(e) => setScheduleSettings({ ...scheduleSettings, lunchStart: e.target.value })}
                  />
                </div>
                <div className="dash-field">
                  <label>{t('dash_break_end')}</label>
                  <input
                    type="time"
                    value={scheduleSettings.lunchEnd}
                    onChange={(e) => setScheduleSettings({ ...scheduleSettings, lunchEnd: e.target.value })}
                  />
                </div>
              </div>

              <div className="dash-field" style={{ marginTop: '1rem' }}>
                <label>{t('dash_slot_duration')}</label>
                <select
                  value={scheduleSettings.slotDuration}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, slotDuration: parseInt(e.target.value) })}
                >
                  <option value="15">{t('dash_slot_15')}</option>
                  <option value="30">{t('dash_slot_30')}</option>
                  <option value="45">{t('dash_slot_45')}</option>
                  <option value="60">{t('dash_slot_60')}</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className="dash-group-title">{t('dash_prices_title')}</h3>
              <div className="dash-field">
                <label>{t('dash_price_basic')}</label>
                <input
                  type="number"
                  value={scheduleSettings.consultationPrice ?? 799}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, consultationPrice: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="dash-field" style={{ marginTop: '1rem' }}>
                <label>{t('dash_price_comprehensive')}</label>
                <input
                  type="number"
                  value={scheduleSettings.comprehensivePrice ?? 1700}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, comprehensivePrice: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="dash-field" style={{ marginTop: '1rem' }}>
                <label>{t('dash_price_pkg3')}</label>
                <input
                  type="number"
                  value={scheduleSettings.packagePrice3 ?? 2000}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, packagePrice3: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="dash-field" style={{ marginTop: '1rem' }}>
                <label>{t('dash_price_pkg4')}</label>
                <input
                  type="number"
                  value={scheduleSettings.packagePrice4 ?? 3400}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, packagePrice4: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="dash-field" style={{ marginTop: '1rem' }}>
                <label>{t('dash_price_promo')}</label>
                <input
                  type="number"
                  value={scheduleSettings.packagePricePromo ?? 2500}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, packagePricePromo: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Google Calendar Integration */}
          <div className="dash-calendar-section">
            <div className="dash-calendar-head">
              <Link2 size={20} />
              <h3 className="dash-group-title">{t('dash_gcal_title')}</h3>
            </div>
            <p className="dash-calendar-desc">
              {t('dash_gcal_desc')}
            </p>
            {calendarStatus?.connected ? (
              <div className="dash-calendar-connected">
                <div className="dash-calendar-status">
                  <span className="dash-calendar-dot" />
                  <div>
                    <span className="dash-calendar-status-label">{t('dash_gcal_connected')}</span>
                    {calendarStatus.email && (
                      <span className="dash-calendar-email">{calendarStatus.email}</span>
                    )}
                  </div>
                </div>
                <button
                  className="dash-action dash-action-err"
                  onClick={handleDisconnectCalendar}
                  disabled={calendarLoading}
                >
                  {calendarLoading ? <Loader2 size={15} className="spin" /> : <Unlink size={15} />}
                  {t('dash_gcal_disconnect')}
                </button>
              </div>
            ) : (
              <div className="dash-calendar-disconnected">
                {!calendarStatus?.configured ? (
                  <div className="dash-calendar-warning">
                    <p>
                      {t('dash_gcal_warning')}
                    </p>
                    <code>GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI</code>
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dash-calendar-link"
                    >
                      <ExternalLink size={13} /> Google Cloud Console
                    </a>
                  </div>
                ) : (
                  <button
                    className="dash-action dash-action-primary"
                    onClick={handleConnectCalendar}
                  >
                    <Link2 size={15} /> {t('dash_gcal_connect')}
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            className="dash-save-btn"
            disabled={savingSettings}
            onClick={handleSaveSettings}
          >
            {savingSettings ? 'جاري الحفظ...' : 'حفظ التعديلات وإعدادات الدوام'}
          </button>
        </div>
      )}
    </DashboardShell>
  )
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardGate message="جاري تحميل لوحة التحكم..." />}>
        <Dashboard />
      </Suspense>
    </ErrorBoundary>
  )
}
