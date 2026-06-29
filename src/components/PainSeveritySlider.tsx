'use client'

type Props = {
  value: number | null
  onChange: (v: number) => void
}

/**
 * 0-10 pain scale with colour gradient. Includes verbal anchors at 0, 3, 7, 10.
 */
export default function PainSeveritySlider({ value, onChange }: Props) {
  const current = value ?? 0
  const color =
    current <= 2 ? 'var(--ok)' :
    current <= 5 ? 'var(--gold)' :
    current <= 7 ? 'oklch(60% 0.18 50)' :
    'var(--err)'

  const label =
    current === 0  ? 'لا يوجد ألم' :
    current <= 2   ? 'ألم خفيف جداً' :
    current <= 4   ? 'ألم خفيف' :
    current <= 6   ? 'ألم متوسط' :
    current <= 8   ? 'ألم شديد' :
    'ألم لا يُحتمل'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', fontWeight: 600 }}>
          {label}
        </span>
        <span
          className="num"
          style={{
            fontSize: '1.8rem',
            fontWeight: 900,
            color,
            transition: 'color 200ms',
            direction: 'ltr',
          }}
        >
          {current}/10
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        step="1"
        value={current}
        onChange={e => onChange(parseInt(e.target.value))}
        style={{
          width: '100%',
          accentColor: color,
          cursor: 'pointer',
        }}
      />
      <div className="num" style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.7rem',
        color: 'var(--fg-dim)',
        direction: 'ltr',
      }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <span key={n} style={{ width: '14px', textAlign: 'center' }}>{n}</span>
        ))}
      </div>
    </div>
  )
}
