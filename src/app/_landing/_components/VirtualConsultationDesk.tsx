'use client'

import { useState } from 'react'
import Link from 'next/link'
import { JOINTS_DATA, type JointKey } from '@/content/landing'

const SLOTS = ['16:30', '18:00', '19:30'] as const
const SLOT_LABELS: Record<(typeof SLOTS)[number], string> = {
  '16:30': '04:30 PM',
  '18:00': '06:00 PM',
  '19:30': '07:30 PM',
}

export function VirtualConsultationDesk() {
  const [activeJoint, setActiveJoint] = useState<JointKey>('knee')
  const [selectedSlot, setSelectedSlot] = useState<string>('18:00')

  const joint = JOINTS_DATA[activeJoint]

  return (
    <div
      className="card-elevated geo-corner"
      style={{
        width: '100%',
        padding: '1.5rem',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid var(--border-accent)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl), 0 20px 40px rgba(12, 90, 66, 0.04)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-faint)',
          paddingBottom: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--primary-down)',
              display: 'inline-block',
              animation: 'pulse-soft 1.5s infinite',
              boxShadow: '0 0 8px var(--primary-glow)',
            }}
          />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--fg)' }}>
            بوابة التشخيص التفاعلي أونلاين
          </span>
        </div>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--gold)',
            background: 'var(--gold-soft)',
            padding: '0.2rem 0.65rem',
            borderRadius: 9999,
            border: '1px solid var(--gold)',
          }}
        >
          محاكاة سريرية
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.5rem',
          marginBottom: '1.25rem',
        }}
      >
        {(Object.keys(JOINTS_DATA) as JointKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveJoint(key)}
            className={`joint-tab-btn ${activeJoint === key ? 'active' : ''}`}
            style={{
              padding: '0.5rem 0.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.78rem',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{JOINTS_DATA[key].icon}</span>
            <span>{JOINTS_DATA[key].name}</span>
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.1fr',
          gap: '1rem',
          alignItems: 'start',
        }}
      >
        <div className="mri-screen" style={{ height: 170, width: '100%', position: 'relative' }}>
          <div className="mri-grid" />
          <div className="mri-scanline" />
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            viewBox="0 0 100 100"
          >
            <path
              d={joint.mriPath}
              fill="none"
              stroke="var(--primary-down)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.8, filter: 'drop-shadow(0 0 3px var(--primary-down))' }}
            />
            <circle cx="50" cy="50" r="5" fill="none" stroke="var(--gold)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(194,154,104,0.15)" strokeWidth="0.5" strokeDasharray="1 3" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(194,154,104,0.15)" strokeWidth="0.5" strokeDasharray="1 3" />
          </svg>
          <div
            style={{
              position: 'absolute',
              bottom: '0.5rem',
              right: '0.5rem',
              left: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.62rem',
              color: 'var(--primary-down)',
              fontFamily: 'var(--font-inter), sans-serif',
              background: 'rgba(7, 16, 13, 0.85)',
              padding: '0.2rem 0.4rem',
              borderRadius: 4,
            }}
          >
            <span>WEAR: {joint.metrics.wear}</span>
            <span>STATUS: {joint.metrics.stability}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'right' }}>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: 'var(--gold)',
              letterSpacing: '0.04em',
            }}
          >
            أعراض شائعة للشكوى
          </span>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--fg)', lineHeight: 1.3 }}>
            {joint.diagnosis}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.2rem' }}>
            {joint.symptoms.map((sym, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '0.35rem',
                  alignItems: 'flex-start',
                  fontSize: '0.72rem',
                  color: 'var(--fg-muted)',
                  lineHeight: 1.35,
                }}
              >
                <span
                  style={{
                    color: 'var(--primary-down)',
                    fontSize: '0.85rem',
                    flexShrink: 0,
                    marginTop: '-2px',
                  }}
                >
                  ✦
                </span>
                <span>{sym}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          background: 'var(--gray-100)',
          border: '1px solid var(--border-faint)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 0.85rem',
          marginTop: '1rem',
          textAlign: 'right',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: 'var(--fg-dim)', fontWeight: 600 }}>
            مستوى الكشف الموصى به:
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 800 }}>
            {joint.level}
          </span>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--fg-muted)', lineHeight: 1.45, marginTop: '0.3rem' }}>
          {joint.desc}
        </p>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--border-faint)',
          paddingTop: '0.85rem',
          marginTop: '0.85rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.4rem',
          }}
        >
          <span style={{ fontSize: '0.74rem', color: 'var(--fg-muted)', fontWeight: 700 }}>
            جدول الطبيب الفعلي المتاح اليوم:
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--primary-down)',
              fontWeight: 800,
              animation: 'pulse-soft 2s infinite',
            }}
          >
            حجز فوري
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          {SLOTS.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setSelectedSlot(time)}
              style={{
                background: selectedSlot === time ? 'var(--primary)' : 'var(--surface)',
                border: '1.5px solid',
                borderColor: selectedSlot === time ? 'var(--primary)' : 'var(--border)',
                color: selectedSlot === time ? 'white' : 'var(--fg-muted)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.25rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 200ms ease',
                fontFamily: 'var(--font-inter), sans-serif',
              }}
            >
              {SLOT_LABELS[time]}
            </button>
          ))}
        </div>

        <Link
          href="/consultation/new"
          className="btn-primary"
          style={{
            width: '100%',
            height: 42,
            fontSize: '0.85rem',
            borderRadius: 'var(--radius-md)',
            justifyContent: 'center',
            background: 'var(--primary)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          ابدأ استشارتك الآن وعيّن موعداً
        </Link>
      </div>
    </div>
  )
}
