'use client'

import { PAIN_NATURES, PAIN_NATURE_LABELS_AR, type PainNature } from '@/lib/supabase'

type Props = {
  selected: string[]
  onChange: (next: string[]) => void
}

const ICON: Record<PainNature, string> = {
  sharp:        '⚡',
  dull:         '◐',
  burning:      '🔥',
  stabbing:     '🗡',
  continuous:   '⏱',
  intermittent: '〰',
  radiating:    '↗',
}

export default function PainNatureChips({ selected, onChange }: Props) {
  function toggle(id: string) {
    if (selected.includes(id)) onChange(selected.filter(s => s !== id))
    else onChange([...selected, id])
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {PAIN_NATURES.map(id => {
        const isSelected = selected.includes(id)
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '9999px',
              border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
              background: isSelected ? 'var(--primary-soft)' : 'var(--surface)',
              color: isSelected ? 'var(--primary)' : 'var(--fg)',
              fontWeight: isSelected ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 150ms',
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>{ICON[id]}</span>
            {PAIN_NATURE_LABELS_AR[id]}
            {isSelected && <span style={{ fontSize: '0.9rem' }}>✓</span>}
          </button>
        )
      })}
    </div>
  )
}
