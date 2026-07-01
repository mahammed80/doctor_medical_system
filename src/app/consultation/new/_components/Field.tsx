import { Children, cloneElement, isValidElement, useId, type ReactNode } from 'react'

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
  const reactId = useId()
  const fieldId = `field-${reactId}`

  const child = Children.only(children) as React.ReactElement<{ id?: string }>
  const existingId = isValidElement(child) ? child.props.id : undefined
  const inputId = existingId ?? fieldId

  const enhanced = isValidElement(child)
    ? cloneElement(child, { id: inputId })
    : child

  return (
    <div className="field">
      <label htmlFor={inputId} className="label">
        {label}
        {required && (
          <span style={{ color: 'var(--err)', marginRight: '0.2rem', fontSize: '0.8rem' }} aria-hidden>
            *
          </span>
        )}
        {optional && (
          <span style={{ color: 'var(--fg-dim)', fontWeight: 400, marginRight: '0.35rem', fontSize: '0.78rem' }}>
            (اختياري)
          </span>
        )}
      </label>
      {enhanced}
    </div>
  )
}
