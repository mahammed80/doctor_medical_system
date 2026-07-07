'use client'

import { PAIN_LOCATION_LABELS_AR, SPINAL_AREA_LABELS_AR } from '@/lib/supabase'

const VIEWBOX = '0 0 200 400'

type SpotCoords = { x: number; y: number }

const SPOT_POSITIONS: Record<string, SpotCoords> = {
  neck:        { x: 100, y: 50 },
  shoulder:    { x: 100, y: 88 },
  elbow:       { x: 100, y: 150 },
  wrist:       { x: 100, y: 210 },
  hip:         { x: 100, y: 222 },
  knee:        { x: 100, y: 298 },
  ankle:       { x: 100, y: 372 },
  upper_back:  { x: 100, y: 130 },
  lower_back:  { x: 100, y: 200 },
}

const SIDE_OFFSET = 19

type Props = {
  painLocations: string[]
  spinalAreas: string[]
  widespread: boolean
}

function parseLocation(raw: string): { base: string; side: 'left' | 'right' | 'both' } | null {
  for (const base of Object.keys(SPOT_POSITIONS)) {
    if (raw === base) return { base, side: 'both' }
    if (raw === `${base}_right`) return { base, side: 'right' }
    if (raw === `${base}_left`) return { base, side: 'left' }
    if (raw === `${base}_both`) return { base, side: 'both' }
  }
  return null
}

export function ConsultationBodyMap({ painLocations, spinalAreas, widespread }: Props) {
  const parsed = painLocations
    .map(parseLocation)
    .filter((p): p is { base: string; side: 'left' | 'right' | 'both' } => p !== null)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.5rem 0',
    }}>
      <svg viewBox={VIEWBOX} width="140" height="280" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="bodyGradDoc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A3C2F" />
            <stop offset="100%" stopColor="#0A1F18" />
          </linearGradient>
          <filter id="shadowDoc">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.25" />
          </filter>
        </defs>

        {widespread && (
          <ellipse cx="100" cy="200" rx="80" ry="160" fill="none" stroke="#9B2C2C" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.6">
            <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="3s" repeatCount="indefinite" />
          </ellipse>
        )}

        {/* Body outline */}
        <g filter="url(#shadowDoc)" fill="url(#bodyGradDoc)" stroke="#2A5A4A" strokeWidth="1.2">
          <ellipse cx="100" cy="30" rx="22" ry="26" />
          <rect x="88" y="54" width="24" height="12" rx="3" />
          <path d="M74 66 C60 90 56 140 74 228 C74 228 72 160 88 66 L74 66Z M126 66 C140 90 144 140 126 228 C126 228 128 160 112 66 L126 66Z" />
          <path d="M148 90 C170 100 178 155 168 215 L168 215 C164 165 150 120 148 90Z" />
          <path d="M52 90 C30 100 22 155 32 215 L32 215 C36 165 50 120 52 90Z" />
          <path d="M80 228 C80 280 82 340 80 380 L82 380 C84 335 84 285 84 228Z" />
          <path d="M120 228 C120 280 118 340 120 380 L118 380 C116 335 116 285 116 228Z" />
          <ellipse cx="86" cy="392" rx="16" ry="6" />
          <ellipse cx="114" cy="392" rx="16" ry="6" />
        </g>

        {/* Spine line */}
        <line x1="100" y1="68" x2="100" y2="220" stroke="#3A6A5A" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

        {/* Spinal area highlights */}
        {spinalAreas.includes('cervical') && (
          <rect x="88" y="54" width="24" height="20" rx="6" fill="#E8A838" opacity="0.4" />
        )}
        {spinalAreas.includes('thoracic') && (
          <rect x="88" y="80" width="24" height="50" rx="6" fill="#E8A838" opacity="0.4" />
        )}
        {spinalAreas.includes('lumbar') && (
          <rect x="88" y="140" width="24" height="50" rx="6" fill="#E8A838" opacity="0.4" />
        )}

        {/* Pain markers */}
        {parsed.map(({ base, side }, i) => {
          const pos = SPOT_POSITIONS[base]
          if (!pos) return null

          const markers: { x: number; y: number; s: 'right' | 'left' }[] = []
          if (side === 'right' || side === 'both') markers.push({ x: pos.x + SIDE_OFFSET, y: pos.y, s: 'right' })
          if (side === 'left' || side === 'both') markers.push({ x: pos.x - SIDE_OFFSET, y: pos.y, s: 'left' })

          return markers.map((m, j) => (
            <g key={`${base}-${m.s}-${i}-${j}`}>
              <circle cx={m.x} cy={m.y} r="10" fill="#9B2C2C" opacity="0.85" />
              <circle cx={m.x} cy={m.y} r="4" fill="#fff" />
            </g>
          ))
        })}

        {/* Legend */}
        <foreignObject x="0" y="0" width="200" height="20">
          <div style={{ fontSize: '7px', color: '#8BA89A', textAlign: 'center', direction: 'rtl', pointerEvents: 'none' }}>
            {widespread ? 'ألم منتشر في كامل الجسم' :
              parsed.length === 0 && spinalAreas.length === 0 ? 'لم يتم تحديد أماكن الألم' :
              [...new Set(parsed.map(p => PAIN_LOCATION_LABELS_AR[p.base as keyof typeof PAIN_LOCATION_LABELS_AR] || p.base)),
               ...spinalAreas.map(s => SPINAL_AREA_LABELS_AR[s as keyof typeof SPINAL_AREA_LABELS_AR] || s)
              ].slice(0, 3).join('، ') + (parsed.length + spinalAreas.length > 3 ? '...' : '')}
          </div>
        </foreignObject>
      </svg>
    </div>
  )
}
