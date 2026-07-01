import type { ReactNode } from 'react'

export function Field({
  label,
  optional,
  required,
  children,
}: {
  label: string
  optional?: boolean
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="field">
      <label className="label">
        {label}
        {required && (
          <span style={{ color: 'var(--err)', marginRight: '0.2rem', fontSize: '0.8rem' }}>
            *
          </span>
        )}
        {optional && (
          <span style={{ color: 'var(--fg-dim)', fontWeight: 400, marginRight: '0.35rem', fontSize: '0.78rem' }}>
            (اختياري)
          </span>
        )}
      </label>
      {children}
    </div>
  )
}
