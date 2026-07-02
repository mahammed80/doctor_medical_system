'use client'

import { useState, type ReactNode } from 'react'
import {
  ArrowLeftCircle,
  Bone,
  Check,
  Dumbbell,
  Footprints,
  Globe,
  Hand,
  PersonStanding,
} from 'lucide-react'
import {
  PAIN_LOCATIONS,
  PAIN_LOCATION_LABELS_AR,
  SPINAL_AREA_LABELS_AR,
  type PainLocation,
  type SpinalArea,
} from '@/lib/supabase'

type Side = 'left' | 'right'
type View = 'front' | 'back'

type Props = {
  /**
   * Selected locations. Each entry is either a plain PainLocation id
   * (e.g. "knee") or a side-aware sentinel ("knee_right", "knee_left",
   * "knee_both") added in addition to the base id when the user picks a
   * specific side. Keeping the array as `string[]` lets the form keep
   * `pain_locations: string[]` without a schema migration.
   */
  selected: string[]
  spinalSelected: SpinalArea[]
  widespread: boolean
  onChange: (locations: string[], spinal: SpinalArea[]) => void
  onWidespreadChange: (v: boolean) => void
}

/**
 * Map every bilateral PainLocation to its hot-spot coordinates
 * on the 200×400 viewBox. We expose 4 variants per joint so the user
 * can pick (left / right). For spine-only locations (neck, upper_back,
 * lower_back) the side is implicit (centered).
 */
type Spot = {
  id: PainLocation
  side?: Side
  view: View
  x: number
  y: number
  label: string
}

const FRONT_SPOTS: Spot[] = [
  { id: 'shoulder', side: 'right', view: 'front', x: 138, y: 92,  label: 'كتف أيمن' },
  { id: 'shoulder', side: 'left',  view: 'front', x: 62,  y: 92,  label: 'كتف أيسر' },
  { id: 'elbow',    side: 'right', view: 'front', x: 158, y: 150, label: 'كوع أيمن' },
  { id: 'elbow',    side: 'left',  view: 'front', x: 42,  y: 150, label: 'كوع أيسر' },
  { id: 'wrist',    side: 'right', view: 'front', x: 168, y: 210, label: 'معصم أيمن' },
  { id: 'wrist',    side: 'left',  view: 'front', x: 32,  y: 210, label: 'معصم أيسر' },
  { id: 'hip',      side: 'right', view: 'front', x: 118, y: 222, label: 'ورك أيمن' },
  { id: 'hip',      side: 'left',  view: 'front', x: 82,  y: 222, label: 'ورك أيسر' },
  { id: 'knee',     side: 'right', view: 'front', x: 118, y: 298, label: 'ركبة يمنى' },
  { id: 'knee',     side: 'left',  view: 'front', x: 82,  y: 298, label: 'ركبة يسرى' },
  { id: 'ankle',    side: 'right', view: 'front', x: 118, y: 372, label: 'كاحل أيمن' },
  { id: 'ankle',    side: 'left',  view: 'front', x: 82,  y: 372, label: 'كاحل أيسر' },
]

const BACK_SPOTS: Spot[] = [
  { id: 'neck',                    view: 'back', x: 100, y: 50,  label: 'الرقبة' },
  { id: 'shoulder', side: 'right', view: 'back', x: 138, y: 92,  label: 'كتف أيمن' },
  { id: 'shoulder', side: 'left',  view: 'back', x: 62,  y: 92,  label: 'كتف أيسر' },
  { id: 'elbow',    side: 'right', view: 'back', x: 158, y: 150, label: 'كوع أيمن' },
  { id: 'elbow',    side: 'left',  view: 'back', x: 42,  y: 150, label: 'كوع أيسر' },
  { id: 'wrist',    side: 'right', view: 'back', x: 168, y: 210, label: 'معصم أيمن' },
  { id: 'wrist',    side: 'left',  view: 'back', x: 32,  y: 210, label: 'معصم أيسر' },
  { id: 'upper_back',              view: 'back', x: 100, y: 130, label: 'أعلى الظهر' },
  { id: 'lower_back',              view: 'back', x: 100, y: 200, label: 'أسفل الظهر' },
  { id: 'hip',      side: 'right', view: 'back', x: 118, y: 222, label: 'ورك أيمن' },
  { id: 'hip',      side: 'left',  view: 'back', x: 82,  y: 222, label: 'ورك أيسر' },
  { id: 'knee',     side: 'right', view: 'back', x: 118, y: 298, label: 'ركبة يمنى' },
  { id: 'knee',     side: 'left',  view: 'back', x: 82,  y: 298, label: 'ركبة يسرى' },
  { id: 'ankle',    side: 'right', view: 'back', x: 118, y: 372, label: 'كاحل أيمن' },
  { id: 'ankle',    side: 'left',  view: 'back', x: 82,  y: 372, label: 'كاحل أيسر' },
]

/** Quick-pick groups used as an alternative to tapping the body. */
const QUICK_PICKS: Array<{ id: PainLocation; label: string; icon: ReactNode; category: 'upper' | 'middle' | 'lower' }> = [
  { id: 'shoulder',   label: 'الكتف',   icon: <Dumbbell size={16} />, category: 'upper'  },
  { id: 'elbow',      label: 'الكوع',   icon: <Dumbbell size={16} />, category: 'upper'  },
  { id: 'wrist',      label: 'المعصم',  icon: <Hand size={16} />, category: 'upper'  },
  { id: 'neck',       label: 'الرقبة',  icon: <PersonStanding size={16} />, category: 'upper'  },
  { id: 'upper_back', label: 'أعلى الظهر', icon: <ArrowLeftCircle size={16} />, category: 'middle' },
  { id: 'lower_back', label: 'أسفل الظهر', icon: <Bone size={16} />, category: 'middle' },
  { id: 'hip',        label: 'الورك',   icon: <Bone size={16} />, category: 'middle' },
  { id: 'knee',       label: 'الركبة',  icon: <Bone size={16} />, category: 'lower'  },
  { id: 'ankle',      label: 'الكاحل',  icon: <Footprints size={16} />, category: 'lower'  },
]

const SIDE_LABELS: Record<Side, string> = {
  right: 'أيمن',
  left:  'أيسر',
}

export default function BodyMap({
  selected,
  spinalSelected,
  widespread,
  onChange,
  onWidespreadChange,
}: Props) {
  const [view, setView] = useState<View>('front')
  const [hovered, setHovered] = useState<Spot | null>(null)

  const spots = view === 'front' ? FRONT_SPOTS : BACK_SPOTS
  const showSpinal = selected.includes('neck') || selected.includes('upper_back') || selected.includes('lower_back')

  // ── toggles ────────────────────────────────────────────────────────────
  function isSpotSelected(spot: Spot): boolean {
    if (!selected.includes(spot.id)) return false
    if (!spot.side) return true
    return selected.includes(spot.id + '_both')
  }

  function toggle(spot: Spot) {
    if (widespread) onWidespreadChange(false)
    if (!selected.includes(spot.id)) {
      onChange([...selected, spot.id], spinalSelected)
      return
    }
    if (!spot.side) {
      onChange(selected.filter(l => l !== spot.id), spinalSelected)
      return
    }
    // Bilateral: 1st click → side, 2nd click on opposite → mark as both,
    // 3rd click (same side) → clear that side, 4th click → clear both.
    // We model "both" as a sentinel element appended to the same array.
    const tagBoth = `${spot.id}_both`
    const tagRight = `${spot.id}_right`
    const tagLeft = `${spot.id}_left`
    const has = (s: string) => selected.includes(s)

    if (has(tagBoth)) {
      onChange(
        selected.filter(l => l !== spot.id && l !== tagBoth).concat(spot.side === 'right' ? tagRight : tagLeft),
        spinalSelected,
      )
    } else if (has(spot.side === 'right' ? tagRight : tagLeft)) {
      // Same side again — clear the location entirely
      onChange(
        selected.filter(l => l !== spot.id && ![`${spot.id}_right`, `${spot.id}_left`].includes(l)),
        spinalSelected,
      )
    } else if (has(spot.side === 'right' ? tagLeft : tagRight)) {
      // Opposite side already — promote to both
      const cleaned = selected.filter(l => l !== tagLeft && l !== tagRight)
      onChange([...cleaned, spot.id, tagBoth], spinalSelected)
    } else {
      // First time this side
      onChange([...selected, spot.side === 'right' ? tagRight : tagLeft], spinalSelected)
    }
  }

  function toggleSpinal(area: SpinalArea) {
    if (spinalSelected.includes(area)) {
      onChange(selected, spinalSelected.filter(a => a !== area))
    } else {
      onChange(selected, [...spinalSelected, area])
    }
  }

  function getDisplayLabel(spot: Spot): string {
    if (!spot.side) return PAIN_LOCATION_LABELS_AR[spot.id]
    if (isSpotSelected(spot)) {
      if (selected.includes(`${spot.id}_both`)) return `${PAIN_LOCATION_LABELS_AR[spot.id]} (كلا الجانبين)`
      return `${PAIN_LOCATION_LABELS_AR[spot.id]} (${SIDE_LABELS[spot.side]})`
    }
    return spot.label
  }

  // ── derived list of selected regions for the side panel ────────────────
  const selectedItems: Array<{ key: string; label: string; side?: Side }> = []
  for (const loc of selected) {
    if (loc === 'neck' || loc === 'upper_back' || loc === 'lower_back') {
      selectedItems.push({ key: loc, label: PAIN_LOCATION_LABELS_AR[loc] })
      continue
    }
    const tagRight = `${loc}_right`
    const tagLeft = `${loc}_left`
    const tagBoth = `${loc}_both`
    if (selected.includes(tagBoth)) {
      selectedItems.push({ key: `${loc}-both`, label: `${PAIN_LOCATION_LABELS_AR[loc as PainLocation]} (كلا الجانبين)` })
    } else {
      if (selected.includes(tagRight)) selectedItems.push({ key: `${loc}-right`, label: `${PAIN_LOCATION_LABELS_AR[loc as PainLocation]} (أيمن)`, side: 'right' })
      if (selected.includes(tagLeft))  selectedItems.push({ key: `${loc}-left`,  label: `${PAIN_LOCATION_LABELS_AR[loc as PainLocation]} (أيسر)`, side: 'left'  })
      if (!selected.includes(tagRight) && !selected.includes(tagLeft) && !selected.includes(tagBoth)) {
        selectedItems.push({ key: loc, label: PAIN_LOCATION_LABELS_AR[loc as PainLocation] })
      }
    }
  }

  function removeSelected(key: string) {
    if (key.endsWith('-both')) {
      const loc = key.replace(/-both$/, '')
      onChange(
        selected.filter(l => l !== loc && l !== `${loc}_both`),
        spinalSelected,
      )
      return
    }
    if (key.endsWith('-right') || key.endsWith('-left')) {
      const side = key.endsWith('-right') ? 'right' : 'left'
      const loc = key.replace(/-(right|left)$/, '')
      onChange(selected.filter(l => l !== `${loc}_${side}`), spinalSelected)
      return
    }
    onChange(selected.filter(l => l !== key), spinalSelected)
  }

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 280px) 1fr',
        gap: '1.25rem',
        alignItems: 'start',
      }}
      className="body-map-grid"
    >
      {/* ── Body silhouette (left) ───────────────────────── */}
      <div
        style={{
          position: 'relative',
          background:
            'linear-gradient(180deg, var(--primary-subtle) 0%, var(--surface) 100%)',
          borderRadius: 'var(--r-lg)',
          padding: '1rem',
          border: '1px solid var(--border-faint)',
          minHeight: 420,
        }}
      >
        <svg
          viewBox="0 0 200 400"
          style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 480 }}
          aria-label={`رسم توضيحي للجسم - ${view === 'front' ? 'العرض الأمامي' : 'العرض الخلفي'}`}
        >
          <defs>
            <linearGradient id="bodyGradFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E6F3EE" />
              <stop offset="60%" stopColor="#F3EFE9" />
              <stop offset="100%" stopColor="#E3DDD3" />
            </linearGradient>
            <linearGradient id="bodyGradBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F3EFE9" />
              <stop offset="60%" stopColor="#E3DDD3" />
              <stop offset="100%" stopColor="#D3CAB9" />
            </linearGradient>
            <radialGradient id="hoverGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0C5A42" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0C5A42" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ── Silhouette (single cleaner shape) ── */}
          <g style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.04))' }}>
            {/* Head */}
            <ellipse
              cx="100" cy="30" rx="22" ry="26"
              fill={`url(#${view === 'front' ? 'bodyGradFront' : 'bodyGradBack'})`}
              stroke="#B3A58E" strokeWidth="1.4"
            />
            {/* Neck */}
            <rect x="88" y="54" width="24" height="14" rx="3"
              fill={`url(#${view === 'front' ? 'bodyGradFront' : 'bodyGradBack'})`}
              stroke="#B3A58E" strokeWidth="1.4"
            />
            {/* Torso */}
            <path
              d="M 56,70
                 C 56,68 70,66 100,66
                 C 130,66 144,68 144,70
                 L 152,210
                 C 152,222 138,228 100,228
                 C 62,228 48,222 48,210
                 Z"
              fill={`url(#${view === 'front' ? 'bodyGradFront' : 'bodyGradBack'})`}
              stroke="#B3A58E" strokeWidth="1.4"
              strokeLinejoin="round"
            />
            {/* Right arm (viewer's right) */}
            <path
              d="M 144,72
                 C 158,82 168,108 170,150
                 C 172,190 174,210 172,220
                 C 170,226 164,228 160,224
                 C 156,218 156,200 154,180
                 C 152,150 148,118 140,90
                 Z"
              fill={`url(#${view === 'front' ? 'bodyGradFront' : 'bodyGradBack'})`}
              stroke="#B3A58E" strokeWidth="1.4"
              strokeLinejoin="round"
            />
            {/* Left arm */}
            <path
              d="M 56,72
                 C 42,82 32,108 30,150
                 C 28,190 26,210 28,220
                 C 30,226 36,228 40,224
                 C 44,218 44,200 46,180
                 C 48,150 52,118 60,90
                 Z"
              fill={`url(#${view === 'front' ? 'bodyGradFront' : 'bodyGradBack'})`}
              stroke="#B3A58E" strokeWidth="1.4"
              strokeLinejoin="round"
            />
            {/* Right leg */}
            <path
              d="M 78,228
                 C 78,228 88,232 100,232
                 L 100,380
                 C 100,388 90,392 84,388
                 C 78,384 76,360 76,330
                 C 76,300 78,260 78,228
                 Z"
              fill={`url(#${view === 'front' ? 'bodyGradFront' : 'bodyGradBack'})`}
              stroke="#B3A58E" strokeWidth="1.4"
              strokeLinejoin="round"
            />
            {/* Left leg */}
            <path
              d="M 122,228
                 C 122,228 112,232 100,232
                 L 100,380
                 C 100,388 110,392 116,388
                 C 122,384 124,360 124,330
                 C 124,300 122,260 122,228
                 Z"
              fill={`url(#${view === 'front' ? 'bodyGradFront' : 'bodyGradBack'})`}
              stroke="#B3A58E" strokeWidth="1.4"
              strokeLinejoin="round"
            />
            {/* Feet */}
            <ellipse cx="86" cy="392" rx="14" ry="6"
              fill={`url(#${view === 'front' ? 'bodyGradFront' : 'bodyGradBack'})`}
              stroke="#B3A58E" strokeWidth="1.4"
            />
            <ellipse cx="114" cy="392" rx="14" ry="6"
              fill={`url(#${view === 'front' ? 'bodyGradFront' : 'bodyGradBack'})`}
              stroke="#B3A58E" strokeWidth="1.4"
            />

            {/* Back-view overlays */}
            {view === 'back' && (
              <>
                {/* Spine */}
                <line
                  x1="100" y1="68" x2="100" y2="220"
                  stroke="#0C5A42" strokeWidth="1.6" strokeDasharray="3 3" opacity="0.45"
                />
                {/* Shoulder blade hints */}
                <path d="M 78,108 Q 100,118 122,108" fill="none" stroke="#0C5A42" strokeWidth="1" opacity="0.25" />
                {/* Loin dimples */}
                <circle cx="90"  cy="220" r="2.2" fill="#0C5A42" opacity="0.25" />
                <circle cx="110" cy="220" r="2.2" fill="#0C5A42" opacity="0.25" />
              </>
            )}
            {/* Front-view subtle chest line */}
            {view === 'front' && (
              <line x1="100" y1="78" x2="100" y2="160" stroke="#0C5A42" strokeWidth="0.8" opacity="0.12" />
            )}
          </g>

          {/* ── Hover glow ring ── */}
          {hovered && (
            <circle
              cx={hovered.x} cy={hovered.y} r="22"
              fill="url(#hoverGlow)"
              style={{ pointerEvents: 'none', transition: 'all 200ms' }}
            />
          )}

          {/* ── Hotspots ── */}
          {spots.map((spot, i) => {
            const isSel = isSpotSelected(spot)
            return (
              <g
                key={`${spot.id}-${spot.side ?? 'c'}-${view}-${i}`}
                role="button"
                tabIndex={widespread ? -1 : 0}
                aria-disabled={widespread}
                aria-label={getDisplayLabel(spot)}
                aria-pressed={isSel}
                style={{ cursor: widespread ? 'not-allowed' : 'pointer', outline: 'none' }}
                onClick={() => !widespread && toggle(spot)}
                onKeyDown={(e) => {
                  if (widespread) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggle(spot)
                  }
                }}
                onMouseEnter={() => setHovered(spot)}
                onMouseLeave={() => setHovered((h) => (h === spot ? null : h))}
                onFocus={() => setHovered(spot)}
                onBlur={() => setHovered((h) => (h === spot ? null : h))}
              >
                {/* Pulse ring for unselected hotspots */}
                {!isSel && (
                  <circle
                    cx={spot.x} cy={spot.y} r="14"
                    fill="none"
                    stroke="#0C5A42"
                    strokeWidth="1"
                    opacity="0.35"
                    style={{ animation: 'pulse-soft 2.5s ease-in-out infinite' }}
                  />
                )}
                <circle
                  cx={spot.x} cy={spot.y} r="14"
                  fill={isSel ? '#9B2C2C' : '#0C5A42'}
                  opacity={isSel ? 0.95 : 0.85}
                  stroke="white" strokeWidth="2.5"
                  style={{ transition: 'all 200ms' }}
                />
                <circle
                  cx={spot.x} cy={spot.y} r="5.5"
                  fill="white" pointerEvents="none"
                />
                {isSel && (
                  <path
                    d={`M ${spot.x - 4} ${spot.y} L ${spot.x - 1} ${spot.y + 4} L ${spot.x + 4} ${spot.y - 4}`}
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pointerEvents="none"
                  />
                )}
              </g>
            )
          })}
        </svg>

        {/* Floating hover label */}
        {hovered && (
          <div
            style={{
              position: 'absolute',
              insetInlineStart: '50%',
              transform: 'translateX(-50%)',
              top: '0.5rem',
              background: 'var(--fg)',
              color: 'white',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.25rem 0.7rem',
              borderRadius: 9999,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-md)',
              animation: 'scaleIn 0.15s var(--ease-out)',
              zIndex: 2,
            }}
          >
            {getDisplayLabel(hovered)}
          </div>
        )}
      </div>

      {/* ── Right column: controls + selected + quick-pick ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', minWidth: 0 }}>

        {/* Widespread toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={widespread}
          onClick={() => {
            const next = !widespread
            onWidespreadChange(next)
            if (next) onChange([], [])
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--r)',
            border: `1.5px solid ${widespread ? 'var(--primary)' : 'var(--border)'}`,
            background: widespread ? 'var(--primary-soft)' : 'var(--surface)',
            color: 'var(--fg)',
            cursor: 'pointer',
            transition: 'all 200ms',
            textAlign: 'right',
            fontFamily: 'inherit',
            fontSize: '0.88rem',
            fontWeight: 700,
            width: '100%',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: 18, height: 18, borderRadius: 4,
                background: widespread ? 'var(--primary)' : 'transparent',
                border: `1.5px solid ${widespread ? 'var(--primary)' : 'var(--border)'}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '0.7rem', fontWeight: 900,
              }}
              aria-hidden
            >
              {widespread ? <Check size={14} /> : null}
            </span>
            <span>ألم منتشر في كامل الجسم</span>
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--fg-dim)', fontWeight: 500 }}>
            للأعراض العامة
          </span>
        </button>

        {/* Front / back tabs */}
        <div
          role="tablist"
          aria-label="جهة الجسم"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.4rem',
            background: 'var(--surface-up)',
            padding: '0.3rem',
            borderRadius: 'var(--r)',
            border: '1px solid var(--border-faint)',
          }}
        >
          {(['front', 'back'] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              style={{
                padding: '0.55rem 0.5rem',
                fontSize: '0.82rem',
                fontWeight: view === v ? 800 : 500,
                color: view === v ? 'white' : 'var(--fg-muted)',
                background: view === v ? 'var(--primary)' : 'transparent',
                border: 'none',
                borderRadius: 'calc(var(--r) - 4px)',
                cursor: 'pointer',
                transition: 'all 200ms',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              <span aria-hidden style={{ display: 'inline-flex' }}>{v === 'front' ? <PersonStanding size={16} /> : <Footprints size={16} />}</span>
              {v === 'front' ? 'العرض الأمامي' : 'العرض الخلفي'}
            </button>
          ))}
        </div>

        {/* Selected areas panel */}
        <div
          aria-live="polite"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-faint)',
            borderRadius: 'var(--r)',
            padding: '0.75rem 0.85rem',
            minHeight: 64,
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: selectedItems.length > 0 ? '0.5rem' : 0,
          }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--fg-dim)', letterSpacing: '0.04em' }}>
              المناطق المختارة
            </span>
            <span
              className="num"
              style={{
                fontSize: '0.7rem', fontWeight: 800,
                color: widespread || selectedItems.length > 0 ? 'var(--primary)' : 'var(--fg-dim)',
                background: widespread || selectedItems.length > 0 ? 'var(--primary-soft)' : 'transparent',
                padding: '0.1rem 0.55rem', borderRadius: 9999,
              }}
            >
              {widespread ? 'الكل' : selectedItems.length}
            </span>
          </div>
          {widespread ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              background: 'var(--primary-soft)', color: 'var(--primary)',
              border: '1px solid var(--border-accent)', borderRadius: 9999,
              fontSize: '0.82rem', fontWeight: 700,
            }}>
              <span aria-hidden style={{ display: 'inline-flex' }}><Globe size={16} /></span> كامل الجسم
            </div>
          ) : selectedItems.length === 0 ? (
            <p style={{ fontSize: '0.78rem', color: 'var(--fg-dim)', margin: 0, lineHeight: 1.6 }}>
              لم يتم اختيار أي منطقة بعد — انقر على نقاط الجسم أو اختر من القائمة السريعة بالأسفل.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {selectedItems.map((item) => {
                const tone =
                  item.side === 'right' ? { bg: 'rgba(194,154,104,0.10)', color: '#936C40', border: 'rgba(194,154,104,0.30)' } :
                  item.side === 'left'  ? { bg: 'rgba(12,90,66,0.08)',   color: 'var(--primary)', border: 'var(--border-accent)' } :
                                            { bg: 'var(--err-soft)', color: 'var(--err)', border: 'rgba(155,44,44,0.25)' }
                return (
                  <span
                    key={item.key}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.3rem 0.55rem 0.3rem 0.7rem',
                      background: tone.bg, color: tone.color,
                      border: `1px solid ${tone.border}`,
                      borderRadius: 9999,
                      fontSize: '0.78rem', fontWeight: 700,
                      animation: 'scaleIn 0.2s var(--ease-out)',
                    }}
                  >
                    {item.label}
                    <button
                      type="button"
                      onClick={() => removeSelected(item.key)}
                      aria-label={`إزالة ${item.label}`}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: tone.color,
                        cursor: 'pointer',
                        fontSize: '1rem',
                        lineHeight: 1,
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 18, height: 18,
                        borderRadius: '50%',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = tone.color; e.currentTarget.style.color = 'white' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tone.color }}
                    >
                      ×
                    </button>
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick-pick body regions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--fg-muted)' }}>
              اختيار سريع للمنطقة
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--fg-dim)' }}>
              {view === 'front' ? 'الأمامي' : 'الخلفي'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(['upper', 'middle', 'lower'] as const).map((cat) => {
              const items = QUICK_PICKS.filter((p) => p.category === cat)
              // Filter: only show items valid in current view
              const visible = items.filter((p) => {
                if (view === 'front') return p.id !== 'neck' && p.id !== 'upper_back' && p.id !== 'lower_back'
                return true
              })
              if (visible.length === 0) return null
              const catLabel = cat === 'upper' ? 'الجزء العلوي' : cat === 'middle' ? 'الجزء الأوسط' : 'الجزء السفلي'
              return (
                <div key={cat}>
                  <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--fg-dim)', marginBottom: '0.3rem', letterSpacing: '0.04em' }}>
                    {catLabel}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {visible.map((p) => {
                      const isSel = selected.includes(p.id)
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            if (widespread) onWidespreadChange(false)
                            if (isSel) {
                              onChange(selected.filter(l => l !== p.id && ![`${p.id}_right`, `${p.id}_left`, `${p.id}_both`].includes(l as string)), spinalSelected)
                            } else {
                              onChange([...selected, p.id], spinalSelected)
                            }
                          }}
                          aria-pressed={isSel}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.45rem 0.75rem',
                            borderRadius: 9999,
                            border: `1.5px solid ${isSel ? 'var(--primary)' : 'var(--border)'}`,
                            background: isSel ? 'var(--primary-soft)' : 'var(--surface)',
                            color: isSel ? 'var(--primary)' : 'var(--fg)',
                            fontWeight: isSel ? 700 : 500,
                            fontSize: '0.78rem',
                            cursor: widespread ? 'not-allowed' : 'pointer',
                            opacity: widespread ? 0.5 : 1,
                            transition: 'all 150ms',
                            fontFamily: 'inherit',
                          }}
                        >
                          <span aria-hidden style={{ display: 'inline-flex' }}>{p.icon}</span>
                          {p.label}
                          {isSel && <span style={{ display: 'inline-flex' }} aria-hidden><Check size={16} /></span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Spinal sub-selection (back view only) */}
        {view === 'back' && showSpinal && (
          <div
            style={{
              background: 'var(--gold-soft)',
              border: '1px solid rgba(194,154,104,0.30)',
              borderRadius: 'var(--r)',
              padding: '0.75rem 0.85rem',
              animation: 'scaleIn 0.25s var(--ease-out)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <span aria-hidden style={{ display: 'inline-flex' }}><Bone size={16} /></span>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#936C40' }}>
                حدد الفقرات المتأثرة (اختياري)
              </span>
            </div>
            <div role="group" aria-label="مناطق الفقرات" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {(['cervical', 'thoracic', 'lumbar'] as SpinalArea[]).map((a) => {
                const isSel = spinalSelected.includes(a)
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleSpinal(a)}
                    aria-pressed={isSel}
                    style={{
                      flex: '1 1 100px',
                      padding: '0.5rem 0.6rem',
                      borderRadius: 'var(--r-sm)',
                      border: `1.5px solid ${isSel ? 'var(--gold)' : 'rgba(194,154,104,0.40)'}`,
                      background: isSel ? 'var(--gold)' : 'transparent',
                      color: isSel ? 'white' : '#936C40',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                      fontFamily: 'inherit',
                    }}
                  >
                    {SPINAL_AREA_LABELS_AR[a]}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper to validate the list of selectable locations
export const ALL_LOCATIONS = PAIN_LOCATIONS
