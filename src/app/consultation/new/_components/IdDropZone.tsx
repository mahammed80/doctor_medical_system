'use client'

import { useRef, useState, useCallback } from 'react'

export function IdDropZone({
  file,
  onChange,
}: {
  file: File | null
  onChange: (f: File | null) => void
}) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onChange(e.dataTransfer.files[0])
      }
    },
    [onChange],
  )

  return (
    <div
      style={{
        border: `1.5px dashed ${dragOver ? 'var(--primary)' : 'var(--border-accent)'}`,
        borderRadius: 'var(--r-lg)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        cursor: 'pointer',
        background: dragOver ? 'var(--primary-soft)' : 'var(--primary-subtle)',
        transition: 'all 200ms var(--ease-out)',
        position: 'relative',
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) onChange(e.target.files[0])
        }}
      />
      {file ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            direction: 'rtl',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'var(--ok-soft)',
                border: '1px solid var(--border-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0,
              }}
            >
              🪪
            </span>
            <div style={{ overflow: 'hidden', textAlign: 'right' }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--fg)',
                  fontWeight: 600,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 220,
                }}
              >
                {file.name}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--fg-dim)' }}>
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            style={{
              background: 'var(--err-soft)',
              border: '1px solid rgba(155, 44, 44, 0.15)',
              borderRadius: 6,
              cursor: 'pointer',
              color: 'var(--err)',
              fontSize: '0.82rem',
              padding: '0.3rem 0.6rem',
              fontWeight: 700,
              flexShrink: 0,
              transition: 'all 200ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--err)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--err-soft)'
              e.currentTarget.style.color = 'var(--err)'
            }}
          >
            حذف
          </button>
        </div>
      ) : (
        <div>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--primary-soft)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
              color: 'var(--primary)',
              fontSize: '1.3rem',
            }}
          >
            🪪
          </div>
          <span
            style={{
              color: 'var(--primary)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            اسحب صورة الهوية أو جواز السفر هنا أو اختر من جهازك
          </span>
          <p style={{ fontSize: '0.7rem', color: 'var(--fg-dim)', marginTop: '0.5rem' }}>
            PDF · JPG · PNG — الحد الأقصى 10MB
          </p>
        </div>
      )}
    </div>
  )
}
