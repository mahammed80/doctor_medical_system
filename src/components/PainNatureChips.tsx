'use client'

import { type ReactNode } from 'react'
import { ArrowUpRight, Check, CircleDot, Flame, Sword, Timer, Waves, Zap } from 'lucide-react'
import { PAIN_NATURES, PAIN_NATURE_LABELS_AR, type PainNature } from '@/lib/supabase'

type Props = {
  selected: string[]
  onChange: (next: string[]) => void
}

const ICON: Record<PainNature, ReactNode> = {
  sharp:        <Zap size={16} />,
  dull:         <CircleDot size={16} />,
  burning:      <Flame size={16} />,
  stabbing:     <Sword size={16} />,
  continuous:   <Timer size={16} />,
  intermittent: <Waves size={16} />,
  radiating:    <ArrowUpRight size={16} />,
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
            <span style={{ display: 'inline-flex' }}>{ICON[id]}</span>
            {PAIN_NATURE_LABELS_AR[id]}
            {isSelected && <span style={{ display: 'inline-flex' }}><Check size={16} /></span>}
          </button>
        )
      })}
    </div>
  )
}
