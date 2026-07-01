'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getConsultations, getDoctorSettings, saveDoctorSettings, DoctorScheduleSettings, EnhancedConsultation } from '@/lib/consultationService'
import { getCachedSession, signOut, AuthSession } from '@/lib/auth'
import { DOCTORS } from '@/lib/doctors'
import { STATUS_CONFIG, type ConsultationStatus } from '@/lib/supabase'
import { useToasts } from '@/components/Toaster'
import './dashboard.css'

const OVERVIEW_STATUSES: ConsultationStatus[] = [
  'submitted',
  'needs_info',
  'patient_replied',
  'approved',
  'completed',
]

const STATUS_META: Record<ConsultationStatus, { icon: string; color: string; soft: string; border: string }> = {
  submitted:       { icon: '📥', color: 'var(--accent)',      soft: 'var(--accent-50)',      border: 'var(--border-accent)' },
  under_review:    { icon: '🔍', color: 'var(--primary)',     soft: 'var(--primary-50)',     border: 'var(--primary-100)' },
  needs_info:      { icon: '❓', color: 'var(--warn)',        soft: 'var(--warn-soft)',      border: 'rgba(184, 134, 75, 0.25)' },
  patient_replied: { icon: '💬', color: 'var(--primary-500)', soft: 'rgba(26, 60, 47, 0.08)', border: 'rgba(26, 60, 47, 0.14)' },
  approved:        { icon: '✅', color: 'var(--ok)',          soft: 'var(--ok-soft)',        border: 'rgba(26, 60, 47, 0.18)' },
  completed:       { icon: '✔',  color: 'var(--primary)',     soft: 'var(--primary-50)',     border: 'var(--primary-100)' },
  declined:        { icon: '❌', color: 'var(--err)',         soft: 'var(--err-soft)',       border: 'rgba(165, 62, 62, 0.2)' },
  cancelled:       { icon: '🚫', color: 'var(--err)',         soft: 'var(--err-soft)',       border: 'rgba(165, 62, 62, 0.2)' },
  pending_payment: { icon: '💳', color: 'var(--accent)',      soft: 'var(--accent-50)',      border: 'var(--border-accent)' },
  pending_booking: { icon: '📅', color: 'var(--primary)',     soft: 'var(--primary-50)',     border: 'var(--primary-100)' },
  booked:          { icon: '✅', color: 'var(--ok)',          soft: 'var(--ok-soft)',        border: 'rgba(26, 60, 47, 0.18)' },
}

const DAYS = [
  { val: 0, label: 'الأحد (Sunday)' },
  { val: 1, label: 'الاثنين (Monday)' },
  { val: 2, label: 'الثلاثاء (Tuesday)' },
  { val: 3, label: 'الأربعاء (Wednesday)' },
  { val: 4, label: 'الخميس (Thursday)' },
  { val: 5, label: 'الجمعة (Friday)' },
  { val: 6, label: 'السبت (Saturday)' },
]

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

  useEffect(() => {
    const cached = getCachedSession()
    if (!cached) {
      router.replace('/dashboard/login')
      return
    }
    // Initial sync from localStorage — runs once on mount.
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

  const statusCounts = OVERVIEW_STATUSES.map((status) => {
    const count = consultations.filter(
      (c) => c.status === status || (status === 'approved' && c.status === 'booked')
    ).length
    return { status, count, ...STATUS_CONFIG[status], ...STATUS_META[status] }
  })

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

  function resetFilters() {
    setSearchQuery('')
    setSelectedDoctorFilter('all')
    setSelectedStatusFilter('all')
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

  if (!authChecked || loading) {
    return (
      <div className="dashboard-shell">
        <div className="container">
          <div className="dashboard-skeleton">
            <div className="dashboard-skeleton-card">
              <div className="dashboard-skeleton-spinner" />
              <p className="dashboard-skeleton-text">
                {authChecked ? 'جاري تحميل الاستشارات...' : 'جاري التحقق من تسجيل الدخول...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-shell">
      <div className="container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-header-start">
            <span className="dashboard-eyebrow">لوحة التحكم المشتركة</span>
            <h1 className="dashboard-title">مركز بترجي للاستشارات الطبية</h1>
            <p className="dashboard-subtitle">متابعة طلبات وحجوزات الاستشارات بكفاءة ورؤية واضحة.</p>
          </div>
          <div className="dashboard-header-end">
            {session && (
              <span className="dashboard-pill dashboard-pill-user">
                👤 {session.display_name || session.email}
              </span>
            )}
            <span className="dashboard-pill">
              إجمالي: <strong>{consultations.length}</strong> استشارة
            </span>
            <button
              onClick={async () => {
                await signOut()
                router.replace('/dashboard/login')
              }}
              className="dashboard-btn-ghost"
            >
              تسجيل الخروج
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="dashboard-stats">
          {statusCounts.map(({ status, count, label, icon, color, soft, border }, i) => {
            const isActive = selectedStatusFilter === status
            return (
              <div
                key={status}
                className={`dashboard-stat ${isActive ? 'dashboard-stat-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={`تصفية حسب حالة: ${label}`}
                style={{
                  '--stat-color': color,
                  '--stat-soft': soft,
                  '--stat-border': border,
                  animationDelay: `${i * 0.06}s`,
                } as React.CSSProperties}
                onClick={() => setSelectedStatusFilter(isActive ? 'all' : status)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedStatusFilter(isActive ? 'all' : status)
                  }
                }}
              >
                <div className="dashboard-stat-icon">{icon}</div>
                <div className="dashboard-stat-body">
                  <span className="dashboard-stat-value">{count}</span>
                  <span className="dashboard-stat-label">{label}</span>
                  <span className="dashboard-stat-hint">
                    {count === 0 ? 'لا توجد' : count === 1 ? 'استشارة واحدة' : `${count} استشارات`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'requests'}
            className={`dashboard-tab ${activeTab === 'requests' ? 'dashboard-tab-active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            📥 طلبات الاستشارات
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'settings'}
            className={`dashboard-tab ${activeTab === 'settings' ? 'dashboard-tab-active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙ إعدادات العيادة
          </button>
        </div>

        {activeTab === 'requests' && (
          <>
            {/* Filters */}
            <div className="dashboard-filters">
              <div className="dashboard-search">
                <input
                  type="text"
                  placeholder="ابحث باسم المريض، الجوال، أو سبب الشكوى..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="dashboard-search-icon">🔍</span>
              </div>

              <div className="dashboard-filter-group">
                <span className="dashboard-filter-label">الطبيب:</span>
                <select
                  className="dashboard-select"
                  value={selectedDoctorFilter}
                  onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                >
                  <option value="all">الكل</option>
                  {DOCTORS.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="dashboard-filter-group">
                <span className="dashboard-filter-label">الحالة:</span>
                <select
                  className="dashboard-select"
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
                <button className="dashboard-reset" onClick={resetFilters}>
                  إعادة ضبط
                </button>
              )}
            </div>

            {/* Table */}
            <div className="dashboard-table-card">
              {!filteredConsultations.length ? (
                <div className="dashboard-empty">
                  <div className="dashboard-empty-icon">—</div>
                  <p className="dashboard-empty-title">لا توجد استشارات مطابقة</p>
                  <p className="dashboard-empty-desc">جرب تعديل خيارات التصفية أو البحث في الأعلى</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>المريض</th>
                        <th>الطبيب المختص</th>
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
                          <tr key={c.id}>
                            <td>
                              <div className="dashboard-patient">
                                <span className="dashboard-patient-name">{c.patient_name}</span>
                                <span className="dashboard-patient-meta">
                                  {c.patient_phone} • {c.patient_age} سنة
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="dashboard-doctor">
                                <div className="dashboard-doctor-avatar">
                                  <Image
                                    src={assignedDoc.image}
                                    alt={assignedDoc.name}
                                    fill
                                    sizes="34px"
                                    style={{ objectFit: 'cover' }}
                                  />
                                </div>
                                <div>
                                  <div className="dashboard-doctor-name">{c.doctor_name || assignedDoc.name}</div>
                                  <div className="dashboard-doctor-specialty">{c.specialty || assignedDoc.specialty}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="dashboard-complaint">{c.chief_complaint}</span>
                            </td>
                            <td>
                              <span className={`dashboard-badge dashboard-badge-${c.status}`}>
                                {config?.label}
                              </span>
                            </td>
                            <td>
                              <span className="dashboard-date">
                                {new Date(c.created_at).toLocaleDateString('ar-SA-u-nu-latn')}
                              </span>
                            </td>
                            <td>
                              <Link href={`/dashboard/${c.id}`} className="dashboard-action">
                                عرض التفاصيل
                              </Link>
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
          <div className="dashboard-settings">
            <h2 className="dashboard-settings-title">
              🗓 ضبط جدول العمل والعيادة
              <span style={{ color: 'var(--fg-dim)', fontSize: '0.85rem', fontWeight: 500 }}>
                ({DOCTORS.find((d) => d.id === (selectedDoctorFilter === 'all' ? 'khalid' : selectedDoctorFilter))?.name})
              </span>
            </h2>

            {saveSuccess && (
              <div className="dashboard-success">
                <span>✓</span>
                تم حفظ إعدادات المواعيد وجدول العمل بنجاح!
              </div>
            )}

            <div className="dashboard-settings-grid">
              <div>
                <h3 className="dashboard-settings-group-title">أيام العمل الأسبوعية</h3>
                <div className="dashboard-checkbox-list">
                  {DAYS.map((day) => {
                    const isChecked = scheduleSettings.workingDays.includes(day.val)
                    return (
                      <label key={day.val} className="dashboard-checkbox">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const newList = e.target.checked
                              ? [...scheduleSettings.workingDays, day.val].sort()
                              : scheduleSettings.workingDays.filter((v) => v !== day.val)
                            setScheduleSettings({ ...scheduleSettings, workingDays: newList })
                          }}
                        />
                        <span style={{ fontWeight: isChecked ? 700 : 500, color: isChecked ? 'var(--fg)' : undefined }}>
                          {day.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="dashboard-settings-group-title">ساعات الدوام اليومي</h3>
                <div className="dashboard-field-row">
                  <div className="dashboard-field">
                    <label>بداية الدوام</label>
                    <input
                      type="time"
                      value={scheduleSettings.startTime}
                      onChange={(e) => setScheduleSettings({ ...scheduleSettings, startTime: e.target.value })}
                    />
                  </div>
                  <div className="dashboard-field">
                    <label>نهاية الدوام</label>
                    <input
                      type="time"
                      value={scheduleSettings.endTime}
                      onChange={(e) => setScheduleSettings({ ...scheduleSettings, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <h3 className="dashboard-settings-group-title" style={{ marginTop: '1rem' }}>
                  فترة الاستراحة / الغداء
                </h3>
                <div className="dashboard-field-row">
                  <div className="dashboard-field">
                    <label>بداية الاستراحة</label>
                    <input
                      type="time"
                      value={scheduleSettings.lunchStart}
                      onChange={(e) => setScheduleSettings({ ...scheduleSettings, lunchStart: e.target.value })}
                    />
                  </div>
                  <div className="dashboard-field">
                    <label>نهاية الاستراحة</label>
                    <input
                      type="time"
                      value={scheduleSettings.lunchEnd}
                      onChange={(e) => setScheduleSettings({ ...scheduleSettings, lunchEnd: e.target.value })}
                    />
                  </div>
                </div>

                <div className="dashboard-field" style={{ marginTop: '1rem' }}>
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
            </div>

            <button
              className="dashboard-save-btn"
              disabled={savingSettings}
              onClick={handleSaveSettings}
            >
              {savingSettings ? 'جاري الحفظ...' : 'حفظ التعديلات وإعدادات الدوام'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
