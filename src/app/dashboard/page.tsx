'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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
  under_review:    { icon: <FileSearch size={20} />,    color: 'var(--dash-green)',  soft: 'var(--dash-green-50)',  line: 'var(--dash-green-100)' },
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'الآن'
  if (m < 60) return `منذ ${m} دقيقة`
  const h = Math.floor(m / 60)
  if (h < 24) return `منذ ${h} ساعة`
  const d = Math.floor(h / 24)
  if (d < 30) return `منذ ${d} يوم`
  const mo = Math.floor(d / 30)
  return `منذ ${mo} شهر`
}

function severityColor(n: number | null | undefined): string {
  if (n == null) return 'var(--dash-dim)'
  if (n <= 4) return '#2E8B57'
  if (n <= 7) return 'var(--dash-gold)'
  return 'var(--dash-err)'
}

export default function Dashboard() {
  const router = useRouter()
  const toasts = useToasts()

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    async function loadSettings() {
      const docId = selectedDoctorFilter === 'all' ? 'khalid' : selectedDoctorFilter
      const settings = await getDoctorSettings(docId)
      setScheduleSettings(settings)
    }
    loadSettings()
  }, [selectedDoctorFilter])

  useEffect(() => {
    const docId = selectedDoctorFilter === 'all' ? 'khalid' : selectedDoctorFilter
    setCalendarStatus(null)
    fetch(`/api/calendar/status?doctorId=${encodeURIComponent(docId)}`)
      .then((res) => res.json())
      .then((data) => setCalendarStatus(data))
      .catch(() => setCalendarStatus({ connected: false, email: null, configured: false }))
  }, [selectedDoctorFilter])

  const statusCounts = OVERVIEW_STATUSES.map((status) => {
    const count = consultations.filter(
      (c) => c.status === status || (status === 'approved' && c.status === 'booked')
    ).length
    return { status, count, label: STATUS_CONFIG[status].label, ...STATUS_META[status] }
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
    const docId = selectedDoctorFilter === 'all' ? 'khalid' : selectedDoctorFilter
    try {
      await saveDoctorSettings(docId, scheduleSettings)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch {
      toasts.push('خطأ أثناء حفظ الإعدادات', 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  async function handleConnectCalendar() {
    const docId = selectedDoctorFilter === 'all' ? 'khalid' : selectedDoctorFilter
    window.location.href = `/api/calendar/oauth/connect?doctorId=${encodeURIComponent(docId)}`
  }

  async function handleDisconnectCalendar() {
    const docId = selectedDoctorFilter === 'all' ? 'khalid' : selectedDoctorFilter
    setCalendarLoading(true)
    try {
      await fetch('/api/calendar/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: docId }),
      })
      setCalendarStatus({ connected: false, email: null, configured: calendarStatus?.configured ?? false })
      toasts.push('تم قطع اتصال Google Calendar', 'success')
    } catch {
      toasts.push('فشل قطع اتصال Google Calendar', 'error')
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
        message={authChecked ? 'جاري تحميل الاستشارات...' : 'جاري التحقق من تسجيل الدخول...'}
      />
    )
  }

  const todayLabel = new Date().toLocaleDateString('ar-SA-u-nu-latn', {
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
          <span className="dash-eyebrow">لوحة التحكم المشتركة</span>
          <h1 className="dash-title">
            {activeTab === 'requests' ? 'مركز بترجي للاستشارات الطبية' : 'ضبط جدول العمل والعيادة'}
          </h1>
          <p className="dash-subtitle">
            {activeTab === 'requests'
              ? 'متابعة طلبات وحجوزات الاستشارات بكفاءة ورؤية واضحة لكل حالة.'
              : 'تحديد أيام وساعات العمل ومدة الاستشارة لكل طبيب.'}
          </p>
        </div>
        <div className="dash-topbar-end">
          <span className="dash-pill"><CalendarDays size={14} /> {todayLabel}</span>
          <span className="dash-pill">
            إجمالي: <strong className="dash-pill-num">{consultations.length}</strong> استشارة
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
              aria-label={`تصفية حسب حالة: ${label}`}
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
                  {count === 0 ? 'لا توجد' : count === 1 ? 'استشارة واحدة' : `${count} استشارات`}
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
                placeholder="ابحث باسم المريض، الجوال، أو سبب الشكوى..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="dash-search-icon"><Search size={16} /></span>
            </div>


            <div className="dash-filter-group">
              <span className="dash-filter-label">الحالة:</span>
              <select
                className="dash-select"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
              >
                <option value="all">الكل</option>
                <option value="submitted">بانتظار المراجعة</option>
                <option value="under_review">قيد المراجعة</option>
                <option value="needs_info">يحتاج معلومات</option>
                <option value="patient_replied">رد المريض</option>
                <option value="approved">مقبول ومؤكد</option>
                <option value="completed">مكتمل</option>
                <option value="declined">مرفوض</option>
                <option value="cancelled">ملغي</option>
                <option value="pending_payment">في انتظار الدفع</option>
                <option value="pending_booking">في انتظار الحجز</option>
              </select>
            </div>

            {activeFilters && (
              <button className="dash-reset" onClick={() => { setSearchQuery(''); setSelectedDoctorFilter('all'); setSelectedStatusFilter('all') }}>
                <RotateCcw size={14} /> إعادة ضبط
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {activeFilters && (
            <div className="dash-chips">
              {searchQuery && (
                <span className="dash-chip">
                  بحث: «{searchQuery}»
                  <button aria-label="إزالة البحث" onClick={() => clearFilter('search')}>×</button>
                </span>
              )}

              {selectedStatusFilter !== 'all' && (
                <span className="dash-chip">
                  {STATUS_CONFIG[selectedStatusFilter as ConsultationStatus]?.label}
                  <button aria-label="إزالة تصفية الحالة" onClick={() => clearFilter('status')}>×</button>
                </span>
              )}
            </div>
          )}

          {/* Result count */}
          <div className="dash-result-count">
            عرض <strong>{filteredConsultations.length}</strong> من {consultations.length} استشارة
          </div>

          {/* Table */}
          <div className="dash-card">
            {!filteredConsultations.length ? (
              <div className="dash-empty">
                <div className="dash-empty-glyph"><Inbox size={30} /></div>
                <p className="dash-empty-title">لا توجد استشارات مطابقة</p>
                <p className="dash-empty-desc">جرب تعديل خيارات التصفية أو البحث في الأعلى.</p>
              </div>
            ) : (
              <div className="dash-table-scroll">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>المريض</th>
                      <th>سبب الاستشارة</th>
                      <th>الحالة</th>
                      <th>التاريخ</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConsultations.map((c) => {
                      const config = STATUS_CONFIG[c.status]
                      const doctorId = c.doctor_id || 'khalid'
                      const assignedDoc = DOCTORS.find((d) => d.id === doctorId) || DOCTORS[0]
                      return (
                        <tr key={c.id} onClick={() => router.push(`/dashboard/${c.id}`)}>
                          <td>
                            <div className="dash-patient">
                              <span className="dash-patient-name">{c.patient_name}</span>
                              <span className="dash-patient-meta">{c.patient_phone} · {c.patient_age} سنة</span>
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
                            <span className={`dash-badge dash-badge-${c.status}`}>{config?.label}</span>
                          </td>
                          <td>
                            <div className="dash-date-cell">
                              <span className="dash-date">
                                {new Date(c.created_at).toLocaleDateString('ar-SA-u-nu-latn')}
                              </span>
                              <span className="dash-timeago">{timeAgo(c.created_at)}</span>
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
            <h2 className="dash-settings-title">ضبط جدول العمل والعيادة</h2>
            <span className="dash-settings-doctor">
              ({DOCTORS.find((d) => d.id === (selectedDoctorFilter === 'all' ? 'khalid' : selectedDoctorFilter))?.name})
            </span>
          </div>

          {saveSuccess && (
            <div className="dash-success">
              <Check size={16} />
              تم حفظ إعدادات المواعيد وجدول العمل بنجاح!
            </div>
          )}

          <div className="dash-settings-grid">
            <div>
              <h3 className="dash-group-title">أيام العمل الأسبوعية</h3>
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
                      <span>{day.label} <span style={{ color: 'var(--dash-dim)', fontWeight: 500, fontSize: '0.72rem' }}>({day.en})</span></span>
                      <span className="dash-day-toggle" />
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="dash-group-title">ساعات الدوام اليومي</h3>
              <div className="dash-field-row">
                <div className="dash-field">
                  <label>بداية الدوام</label>
                  <input
                    type="time"
                    value={scheduleSettings.startTime}
                    onChange={(e) => setScheduleSettings({ ...scheduleSettings, startTime: e.target.value })}
                  />
                </div>
                <div className="dash-field">
                  <label>نهاية الدوام</label>
                  <input
                    type="time"
                    value={scheduleSettings.endTime}
                    onChange={(e) => setScheduleSettings({ ...scheduleSettings, endTime: e.target.value })}
                  />
                </div>
              </div>

              <h3 className="dash-group-title" style={{ marginTop: '1rem' }}>فترة الاستراحة / الغداء</h3>
              <div className="dash-field-row">
                <div className="dash-field">
                  <label>بداية الاستراحة</label>
                  <input
                    type="time"
                    value={scheduleSettings.lunchStart}
                    onChange={(e) => setScheduleSettings({ ...scheduleSettings, lunchStart: e.target.value })}
                  />
                </div>
                <div className="dash-field">
                  <label>نهاية الاستراحة</label>
                  <input
                    type="time"
                    value={scheduleSettings.lunchEnd}
                    onChange={(e) => setScheduleSettings({ ...scheduleSettings, lunchEnd: e.target.value })}
                  />
                </div>
              </div>

              <div className="dash-field" style={{ marginTop: '1rem' }}>
                <label>مدة الاستشارة (دقيقة)</label>
                <select
                  value={scheduleSettings.slotDuration}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, slotDuration: parseInt(e.target.value) })}
                >
                  <option value="15">15 دقيقة</option>
                  <option value="30">30 دقيقة</option>
                  <option value="45">45 دقيقة</option>
                  <option value="60">60 دقيقة (ساعة كاملة)</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className="dash-group-title">أسعار الجلسات والاستشارات</h3>
              <div className="dash-field">
                <label>سعر الكشف الأساسي (ريال)</label>
                <input
                  type="number"
                  value={scheduleSettings.consultationPrice ?? 799}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, consultationPrice: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="dash-field" style={{ marginTop: '1rem' }}>
                <label>سعر الكشف الشامل والخطة العلاجية (ريال)</label>
                <input
                  type="number"
                  value={scheduleSettings.comprehensivePrice ?? 1700}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, comprehensivePrice: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="dash-field" style={{ marginTop: '1rem' }}>
                <label>سعر باقة 3 جلسات متابعة (ريال)</label>
                <input
                  type="number"
                  value={scheduleSettings.packagePrice3 ?? 2000}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, packagePrice3: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="dash-field" style={{ marginTop: '1rem' }}>
                <label>سعر باقة 4 جلسات متابعة (ريال)</label>
                <input
                  type="number"
                  value={scheduleSettings.packagePrice4 ?? 3400}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, packagePrice4: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="dash-field" style={{ marginTop: '1rem' }}>
                <label>سعر باقة المتابعة المتعددة والعرض الترويجي (ريال)</label>
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
              <h3 className="dash-group-title">تكامل Google Calendar</h3>
            </div>
            <p className="dash-calendar-desc">
              عند ربط حساب Google Calendar، يتم إخفاء المواعيد المشغولة تلقائياً من المرضى،
              وإنشاء حدث في تقويمك عند حجز مريض لموعد جديد.
            </p>
            {calendarStatus?.connected ? (
              <div className="dash-calendar-connected">
                <div className="dash-calendar-status">
                  <span className="dash-calendar-dot" />
                  <div>
                    <span className="dash-calendar-status-label">متصل</span>
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
                  قطع الاتصال
                </button>
              </div>
            ) : (
              <div className="dash-calendar-disconnected">
                {!calendarStatus?.configured ? (
                  <div className="dash-calendar-warning">
                    <p>
                      لتفعيل التكامل، أضف بيانات اعتماد Google OAuth في متغيرات البيئة:
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
                    <Link2 size={15} /> ربط Google Calendar
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
