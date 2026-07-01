'use client'

import { useMemo } from 'react'
import { Spinner } from '../_components/Spinner'
import { ARABIC_MONTHS, ARABIC_WEEKDAYS } from '../constants'
import type { DoctorScheduleSettings, TimeSlot } from '@/lib/consultationService'

type Props = {
  selectedDate: string | null
  selectedTime: string | null
  onSelectDate: (d: string) => void
  onSelectTime: (t: string) => void
  currentMonth: Date
  onChangeMonth: (delta: number) => void
  slots: TimeSlot[]
  slotsLoading: boolean
  docSettings: DoctorScheduleSettings | null
  loading: boolean
  onConfirm: () => void
}

function formatDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getDaysInMonth(date: Date): (Date | null)[] {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const numDays = new Date(year, month + 1, 0).getDate()
  const days: (Date | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= numDays; i++) days.push(new Date(year, month, i))
  return days
}

export function Step4Schedule({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  currentMonth,
  onChangeMonth,
  slots,
  slotsLoading,
  docSettings,
  loading,
  onConfirm,
}: Props) {
  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth])
  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])

  const workingDays = docSettings?.workingDays ?? [0, 1, 2, 3, 4]

  return (
    <div>
      <div className="alert alert-success">
        <div className="alert-icon">✓</div>
        <div>
          <div className="alert-title">تم استلام الدفع بنجاح</div>
          <div className="alert-text">اختر الوقت المناسب لجلستك مع الدكتور</div>
        </div>
      </div>

      <div className="calendar-card">
        <div className="calendar-header">
          <button
            type="button"
            className="btn-ghost calendar-nav"
            onClick={() => onChangeMonth(-1)}
          >
            السابق
          </button>
          <span className="calendar-month num">
            {ARABIC_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            type="button"
            className="btn-ghost calendar-nav"
            onClick={() => onChangeMonth(1)}
          >
            التالي
          </button>
        </div>

        <div className="calendar-grid" style={{ marginBottom: '0.5rem' }}>
          {ARABIC_WEEKDAYS.map((w) => (
            <div key={w} className="calendar-weekday">
              {w}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />
            const dateStr = formatDateStr(day)
            const isSelected = selectedDate === dateStr
            const isPast = day < today
            const isWorking = workingDays.includes(day.getDay())
            const disabled = isPast || !isWorking
            return (
              <button
                key={dateStr}
                type="button"
                disabled={disabled}
                onClick={() => onSelectDate(dateStr)}
                className={[
                  'calendar-day num',
                  isSelected && 'calendar-day-selected',
                  disabled && 'calendar-day-disabled',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {day.getDate()}
                {!isWorking && !isPast && (
                  <span className="calendar-day-closed">مغلق</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="time-card">
        <h3 className="time-card-title">
          <span className="time-card-accent" />
          الأوقات المتاحة ليوم{' '}
          {selectedDate ? (
            <span className="num" style={{ color: 'var(--primary)' }}>
              {new Date(selectedDate).toLocaleDateString('ar-SA-u-nu-latn', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          ) : (
            '...'
          )}
        </h3>

        {slotsLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <Spinner />
            <p style={{ fontSize: '0.8rem', color: 'var(--fg-dim)', marginTop: '0.5rem' }}>
              جاري تحميل الأوقات...
            </p>
          </div>
        ) : !selectedDate ? (
          <div className="empty-box">
            📅 الرجاء اختيار تاريخ من التقويم في الأعلى لعرض الأوقات المتاحة
          </div>
        ) : slots.length === 0 ? (
          <div className="empty-box">
            📭 عذراً، لا توجد فترات عمل متاحة في هذا اليوم
          </div>
        ) : (
          <div className="time-grid">
            {slots.map((slot) => {
              const isTimeSelected = selectedTime === slot.time
              const slotDisabled = !slot.available
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={slotDisabled}
                  onClick={() => onSelectTime(slot.time)}
                  className={[
                    'time-slot num',
                    isTimeSelected && 'time-slot-selected',
                    slotDisabled && 'time-slot-disabled',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {slot.time}
                  {slotDisabled && (
                    <span className="time-slot-note">محجوز</span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selectedDate && selectedTime && (
        <div className="booking-summary">
          <span>
            📌 الموعد المختار:{' '}
            {new Date(selectedDate).toLocaleDateString('ar-SA-u-nu-latn', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}{' '}
            في تمام الساعة <span className="num">{selectedTime}</span>
          </span>
          <span className="booking-summary-meta">بانتظار موافقة الطبيب</span>
        </div>
      )}

      <button
        type="button"
        className="btn-primary"
        disabled={!selectedDate || !selectedTime || loading}
        style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', padding: '1rem' }}
        onClick={onConfirm}
      >
        {loading ? <Spinner /> : 'تأكيد وإرسال للطبيب للمراجعة'}
      </button>
    </div>
  )
}
