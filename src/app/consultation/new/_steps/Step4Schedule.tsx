'use client'

import { useMemo } from 'react'
import { Calendar, Check, Inbox, MapPin } from 'lucide-react'
import { Spinner } from '../_components/Spinner'
import { ARABIC_MONTHS, ARABIC_WEEKDAYS } from '../constants'
import type { DoctorScheduleSettings, TimeSlot } from '@/lib/consultationService'
import { useLanguage } from '@/context/LanguageContext'

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
  const { lang, t } = useLanguage()
  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth])
  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])

  const workingDays = docSettings?.workingDays ?? [0, 1, 2, 3, 4]
  const weekdays = lang === 'ar' ? ARABIC_WEEKDAYS : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthName = lang === 'ar' ? ARABIC_MONTHS[currentMonth.getMonth()] : currentMonth.toLocaleDateString('en-US', { month: 'long' })

  return (
    <div>
      <div className="alert alert-success">
        <div className="alert-icon" style={{ display: 'inline-flex' }}><Check size={16} /></div>
        <div>
          <div className="alert-title">{t('booking_payment_success_title')}</div>
          <div className="alert-text">{t('booking_payment_success_desc')}</div>
        </div>
      </div>

      <div className="calendar-card">
        <div className="calendar-header">
          <button
            type="button"
            className="btn-ghost calendar-nav"
            onClick={() => onChangeMonth(-1)}
          >
            {t('booking_prev')}
          </button>
          <span className="calendar-month num">
            {monthName} {currentMonth.getFullYear()}
          </span>
          <button
            type="button"
            className="btn-ghost calendar-nav"
            onClick={() => onChangeMonth(1)}
          >
            {t('booking_next')}
          </button>
        </div>

        <div className="calendar-grid" style={{ marginBottom: '0.5rem' }}>
          {weekdays.map((w) => (
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
                  <span className="calendar-day-closed">{t('booking_closed')}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="time-card">
        <h3 className="time-card-title">
          <span className="time-card-accent" />
          {t('booking_available_times_for')}{' '}
          {selectedDate ? (
            <span className="num" style={{ color: 'var(--primary)' }}>
              {new Date(selectedDate).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {
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
              {t('booking_loading_slots')}
            </p>
          </div>
        ) : !selectedDate ? (
          <div className="empty-box">
            <span style={{ display: 'inline-flex', marginInlineEnd: '0.35rem' }}><Calendar size={16} /></span>
            {t('booking_choose_date_prompt')}
          </div>
        ) : slots.length === 0 ? (
          <div className="empty-box">
            <span style={{ display: 'inline-flex', marginInlineEnd: '0.35rem' }}><Inbox size={16} /></span>
            {t('booking_no_slots_warn')}
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
                    <span className="time-slot-note">{t('booking_slot_reserved')}</span>
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
            <span style={{ display: 'inline-flex', marginInlineEnd: '0.35rem' }}><MapPin size={16} /></span>
            {t('booking_selected_appt')}{' '}
            {new Date(selectedDate).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}{' '}
            {t('booking_at_time')} <span className="num">{selectedTime}</span>
          </span>
          <span className="booking-summary-meta">{t('booking_awaiting_approval')}</span>
        </div>
      )}

      <button
        type="button"
        className="btn-primary"
        disabled={!selectedDate || !selectedTime || loading}
        style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', padding: '1rem' }}
        onClick={onConfirm}
      >
        {loading ? <Spinner /> : t('booking_confirm_review')}
      </button>
    </div>
  )
}

