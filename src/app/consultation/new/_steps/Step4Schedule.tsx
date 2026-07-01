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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          background: 'var(--ok-soft)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--r)',
          marginBottom: '1.5rem',
          animation: 'scaleIn 0.4s var(--ease-out)',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--ok)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.85rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
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

      <div
        className="card-warm"
        style={{
          padding: '1.5rem',
          border: '1px solid var(--border-faint)',
          borderRadius: 'var(--r-lg)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
            onClick={() => onChangeMonth(-1)}
          >
            السابق ◀
          </button>
          <span
            className="num"
            style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--fg)' }}
          >
            {ARABIC_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
            onClick={() => onChangeMonth(1)}
          >
            ▶ التالي
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.35rem',
            textAlign: 'center',
            marginBottom: '0.5rem',
          }}
        >
          {ARABIC_WEEKDAYS.map((w) => (
            <div
              key={w}
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--fg-dim)',
                paddingBottom: '0.25rem',
              }}
            >
              {w}
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.35rem',
          }}
        >
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
                className="num"
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
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
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!disabled && !isSelected) {
                    e.currentTarget.style.background = 'var(--primary-soft)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled && !isSelected) {
                    e.currentTarget.style.background = 'var(--bg)'
                  }
                }}
              >
                {day.getDate()}
                {!isWorking && !isPast && (
                  <span
                    style={{
                      fontSize: '0.45rem',
                      display: 'block',
                      color: 'var(--fg-dim)',
                      fontWeight: 400,
                    }}
                  >
                    مغلق
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div
        className="card-warm"
        style={{
          padding: '1.5rem',
          border: '1px solid var(--border-faint)',
          borderRadius: 'var(--r-lg)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem',
        }}
      >
        <h3
          style={{
            fontSize: '0.9rem',
            fontWeight: 800,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span
            style={{ width: 4, height: 14, borderRadius: 2, background: 'var(--gold)' }}
          />
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
          <div
            style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              color: 'var(--fg-dim)',
              background: 'var(--bg)',
              borderRadius: 'var(--r)',
              border: '1px dashed var(--border)',
            }}
          >
            📅 الرجاء اختيار تاريخ من التقويم في الأعلى لعرض الأوقات المتاحة
          </div>
        ) : slots.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              color: 'var(--fg-dim)',
              background: 'var(--bg)',
              borderRadius: 'var(--r)',
              border: '1px dashed var(--border)',
            }}
          >
            📭 عذراً، لا توجد فترات عمل متاحة في هذا اليوم
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {slots.map((slot) => {
              const isTimeSelected = selectedTime === slot.time
              const slotDisabled = !slot.available
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={slotDisabled}
                  onClick={() => onSelectTime(slot.time)}
                  className="num"
                  style={{
                    padding: '0.6rem 0.5rem',
                    borderRadius: 8,
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
                    textAlign: 'center',
                  }}
                >
                  {slot.time}
                  {slotDisabled && (
                    <span
                      style={{
                        fontSize: '0.55rem',
                        display: 'block',
                        color: 'var(--err)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      محجوز
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selectedDate && selectedTime && (
        <div
          style={{
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
            justifyContent: 'space-between',
          }}
        >
          <span>
            📌 الموعد المختار:{' '}
            {new Date(selectedDate).toLocaleDateString('ar-SA-u-nu-latn', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}{' '}
            في تمام الساعة <span className="num">{selectedTime}</span>
          </span>
          <span
            className="num"
            style={{ fontSize: '0.72rem', color: 'var(--fg-dim)', fontWeight: 400 }}
          >
            بانتظار موافقة الطبيب
          </span>
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
