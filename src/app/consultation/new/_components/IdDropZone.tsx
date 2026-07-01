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
      className={['drop-zone', dragOver && 'drop-zone-active'].filter(Boolean).join(' ')}
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
          className="drop-zone-preview"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="drop-zone-file">
            <span className="drop-zone-thumb">🪪</span>
            <div style={{ overflow: 'hidden', textAlign: 'right' }}>
              <span className="drop-zone-name">{file.name}</span>
              <span className="drop-zone-size">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="drop-zone-remove"
          >
            حذف
          </button>
        </div>
      ) : (
        <div>
          <div className="drop-zone-icon">🪪</div>
          <span className="drop-zone-text">
            اسحب صورة الهوية أو جواز السفر هنا أو اختر من جهازك
          </span>
          <p className="drop-zone-hint">PDF · JPG · PNG — الحد الأقصى 10MB</p>
        </div>
      )}
    </div>
  )
}
