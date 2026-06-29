'use client'

import { useState } from 'react'
import { PAIN_LOCATIONS, PAIN_LOCATION_LABELS_AR, SPINAL_AREA_LABELS_AR, type PainLocation, type SpinalArea } from '@/lib/supabase'

type Props = {
  selected: PainLocation[]
  spinalSelected: SpinalArea[]
  onChange: (locations: PainLocation[], spinal: SpinalArea[]) => void
}

// Approximate (x, y) coordinates on the 200x400 viewBox for each hotspot.
const HOTSPOTS: Array<{ id: PainLocation; view: 'front' | 'back'; x: number; y: number; label: string }> = [
  // Front view
  { id: 'shoulder', view: 'front', x: 70,  y: 80,  label: 'كتف' },
  { id: 'elbow',    view: 'front', x: 55,  y: 145, label: 'كوع' },
  { id: 'wrist',    view: 'front', x: 45,  y: 200, label: 'معصم' },
  { id: 'hip',      view: 'front', x: 95,  y: 210, label: 'ورك' },
  { id: 'knee',     view: 'front', x: 100, y: 285, label: 'ركبة' },
  { id: 'ankle',    view: 'front', x: 100, y: 365, label: 'كاحل' },
]

// Back-view hotspots
const BACK_HOTSPOTS: Array<{ id: PainLocation; view: 'back'; x: number; y: number; label: string }> = [
  { id: 'neck',       view: 'back', x: 100, y: 50,  label: 'رقبة' },
  { id: 'upper_back', view: 'back', x: 100, y: 105, label: 'أعلى الظهر' },
  { id: 'shoulder',   view: 'back', x: 130, y: 80,  label: 'كتف' },
  { id: 'elbow',      view: 'back', x: 145, y: 145, label: 'كوع' },
  { id: 'wrist',      view: 'back', x: 155, y: 200, label: 'معصم' },
  { id: 'lower_back', view: 'back', x: 100, y: 175, label: 'أسفل الظهر' },
  { id: 'hip',        view: 'back', x: 105, y: 210, label: 'ورك' },
  { id: 'knee',       view: 'back', x: 100, y: 285, label: 'ركبة' },
  { id: 'ankle',      view: 'back', x: 100, y: 365, label: 'كاحل' },
]

// Spinal tap zones on the back view (sub-selection when "lower_back" / "upper_back" / "neck" is selected)
const SPINAL_TAPS: Array<{ id: SpinalArea; x: number; y: number }> = [
  { id: 'cervical', x: 100, y: 50  },
  { id: 'thoracic', x: 100, y: 105 },
  { id: 'lumbar',   x: 100, y: 175 },
]

export default function BodyMap({ selected, spinalSelected, onChange }: Props) {
  const [view, setView] = useState<'front' | 'back'>('front')

  const hotspots = view === 'front' ? HOTSPOTS : BACK_HOTSPOTS

  function toggle(loc: PainLocation) {
    if (selected.includes(loc)) {
      const next = selected.filter(l => l !== loc)
      // If the user un-selects a spinal-related area, also clear spinal sub-zones.
      const nextSpinal = (loc === 'neck' || loc === 'upper_back' || loc === 'lower_back')
        ? spinalSelected
        : spinalSelected
      onChange(next, nextSpinal)
    } else {
      onChange([...selected, loc], spinalSelected)
    }
  }

  function toggleSpinal(area: SpinalArea) {
    if (spinalSelected.includes(area)) {
      onChange(selected, spinalSelected.filter(a => a !== area))
    } else {
      onChange(selected, [...spinalSelected, area])
    }
  }

  // Show spinal taps when at least one back/spine area is selected.
  const showSpinal = selected.some(l => l === 'neck' || l === 'upper_back' || l === 'lower_back')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* View toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        {(['front', 'back'] as const).map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={view === v ? 'btn-primary' : 'btn-ghost'}
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem' }}
          >
            {v === 'front' ? 'العرض الأمامي' : 'العرض الخلفي'}
          </button>
        ))}
      </div>

      {/* SVG body */}
      <div style={{
        position: 'relative',
        background: 'var(--bg)',
        borderRadius: 'var(--r-lg)',
        padding: '1rem',
        border: '1px solid var(--border-faint)',
        maxWidth: '280px',
        margin: '0 auto',
      }}>
        <svg viewBox="0 0 200 400" style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Simple body silhouette */}
          <defs>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-soft)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--surface)" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <g>
            {/* Head */}
            <ellipse cx="100" cy="25" rx="18" ry="22" fill="url(#bodyGrad)" stroke="var(--border)" strokeWidth="1.5" />
            {/* Neck */}
            <rect x="90" y="45" width="20" height="15" fill="url(#bodyGrad)" stroke="var(--border)" strokeWidth="1.5" />
            {/* Torso */}
            <path
              d="M 60 60 L 140 60 L 145 200 L 130 210 L 70 210 L 55 200 Z"
              fill="url(#bodyGrad)"
              stroke="var(--border)"
              strokeWidth="1.5"
            />
            {/* Arms */}
            <path
              d="M 60 65 L 40 145 L 35 200 L 45 205 L 50 145 L 65 70 Z"
              fill="url(#bodyGrad)"
              stroke="var(--border)"
              strokeWidth="1.5"
            />
            <path
              d="M 140 65 L 160 145 L 165 200 L 155 205 L 150 145 L 135 70 Z"
              fill="url(#bodyGrad)"
              stroke="var(--border)"
              strokeWidth="1.5"
            />
            {/* Legs */}
            <path
              d="M 75 210 L 95 210 L 100 370 L 85 380 L 70 280 Z"
              fill="url(#bodyGrad)"
              stroke="var(--border)"
              strokeWidth="1.5"
            />
            <path
              d="M 105 210 L 125 210 L 130 280 L 115 380 L 100 370 Z"
              fill="url(#bodyGrad)"
              stroke="var(--border)"
              strokeWidth="1.5"
            />
            {/* Spine line for back view */}
            {view === 'back' && (
              <line
                x1="100" y1="60" x2="100" y2="200"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeDasharray="3,3"
                opacity="0.5"
              />
            )}
          </g>

          {/* Hotspots */}
          {hotspots.map(h => {
            const isSelected = selected.includes(h.id)
            return (
              <g key={h.id + view} style={{ cursor: 'pointer' }} onClick={() => toggle(h.id)}>
                <circle
                  cx={h.x} cy={h.y} r="14"
                  fill={isSelected ? 'var(--err)' : 'var(--primary)'}
                  opacity={isSelected ? 0.9 : 0.55}
                  stroke="white"
                  strokeWidth="2"
                />
                <circle
                  cx={h.x} cy={h.y} r="6"
                  fill="white"
                  pointerEvents="none"
                />
              </g>
            )
          })}

          {/* Spinal sub-zones (back view only) */}
          {view === 'back' && showSpinal && SPINAL_TAPS.map(s => {
            const isSelected = spinalSelected.includes(s.id)
            return (
              <g key={s.id} style={{ cursor: 'pointer' }} onClick={() => toggleSpinal(s.id)}>
                <rect
                  x={s.x - 22} y={s.y - 9} width="44" height="18" rx="9"
                  fill={isSelected ? 'var(--gold)' : 'transparent'}
                  stroke="var(--gold)"
                  strokeWidth="1.5"
                />
                <text
                  x={s.x} y={s.y + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill={isSelected ? 'white' : 'var(--gold)'}
                  pointerEvents="none"
                >
                  {SPINAL_AREA_LABELS_AR[s.id].replace('الفقرات ', '')}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Selected locations as chips */}
      {selected.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          justifyContent: 'center',
          padding: '0.75rem',
          background: 'var(--bg)',
          borderRadius: 'var(--r)',
          border: '1px solid var(--border-faint)',
        }}>
          {selected.map(loc => (
            <span
              key={loc}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.3rem 0.7rem',
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                border: '1px solid var(--border-accent)',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              {PAIN_LOCATION_LABELS_AR[loc]}
              <button
                type="button"
                onClick={() => toggle(loc)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {showSpinal && spinalSelected.length > 0 && (
        <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 600 }}>
          الفقرات المحددة: {spinalSelected.map(s => SPINAL_AREA_LABELS_AR[s]).join('، ')}
        </div>
      )}

      <p style={{ fontSize: '0.75rem', color: 'var(--fg-dim)', textAlign: 'center' }}>
        انقر على المنطقة المصابة في الجسم. {view === 'back' && 'يمكنك تحديد فقرات الظهر بالضغط على الباركود الملون.'}
      </p>
    </div>
  )
}

// Helper to validate the list of selectable locations
export const ALL_LOCATIONS = PAIN_LOCATIONS
