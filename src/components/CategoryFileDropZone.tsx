'use client'

import { useRef, useState } from 'react'
import { FILE_CATEGORIES, FILE_CATEGORY_LABELS_AR, type FileCategory } from '@/lib/supabase'

const MAX_FILES = 10
const MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB

export type FileWithCategory = {
  file: File
  category: FileCategory
  previewUrl: string | null
}

type Props = {
  files: FileWithCategory[]
  onChange: (files: FileWithCategory[]) => void
}

export default function CategoryFileDropZone({ files, onChange }: Props) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<FileCategory>('mri')
  const inputRef = useRef<HTMLInputElement>(null)

  function validateAndAdd(incoming: File[]) {
    setError(null)
    if (files.length + incoming.length > MAX_FILES) {
      setError(`الحد الأقصى ${MAX_FILES} ملفات في المرة الواحدة.`)
      return
    }
    const accepted: FileWithCategory[] = []
    for (const f of incoming) {
      if (f.size > MAX_SIZE_BYTES) {
        setError(`الملف "${f.name}" يتجاوز الحد الأقصى (20MB).`)
        continue
      }
      accepted.push({
        file: f,
        category: activeCategory,
        previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      })
    }
    if (accepted.length) onChange([...files, ...accepted])
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files || [])
    if (dropped.length) validateAndAdd(dropped)
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files || [])
    if (picked.length) validateAndAdd(picked)
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeAt(i: number) {
    const next = files.slice()
    const removed = next.splice(i, 1)[0]
    if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl)
    onChange(next)
  }

  function changeCategory(i: number, cat: FileCategory) {
    const next = files.slice()
    next[i] = { ...next[i], category: cat }
    onChange(next)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Category selector for the next batch of files */}
      <div>
        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--fg-dim)', fontWeight: 600, marginBottom: '0.4rem' }}>
          نوع الملفات المراد رفعها:
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {FILE_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                border: `1.5px solid ${activeCategory === cat ? 'var(--primary)' : 'var(--border)'}`,
                background: activeCategory === cat ? 'var(--primary-soft)' : 'var(--surface)',
                color: activeCategory === cat ? 'var(--primary)' : 'var(--fg)',
                fontWeight: activeCategory === cat ? 700 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
            >
              {FILE_CATEGORY_LABELS_AR[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--r-lg)',
          padding: '1.5rem 1rem',
          textAlign: 'center',
          background: dragging ? 'var(--primary-soft)' : 'var(--bg)',
          cursor: 'pointer',
          transition: 'all 200ms',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={onPick}
          style={{ display: 'none' }}
          accept="image/*,application/pdf"
        />
        <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>📎</div>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--fg)' }}>
          اسحب الملفات هنا أو انقر للاختيار
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--fg-dim)', marginTop: '0.25rem' }}>
          حتى {MAX_FILES} ملفات، 20 ميجا لكل ملف — صور أو PDF
        </div>
      </div>

      {error && (
        <div style={{
          padding: '0.6rem 0.85rem',
          background: 'var(--err-soft)',
          border: '1px solid var(--err)',
          borderRadius: 'var(--r)',
          color: 'var(--err)',
          fontSize: '0.78rem',
          fontWeight: 700,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {files.map((f, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.75rem',
                background: 'var(--surface)',
                border: '1px solid var(--border-faint)',
                borderRadius: 'var(--r)',
              }}
            >
              {/* Thumbnail or icon */}
              <div style={{
                width: '44px',
                height: '44px',
                flexShrink: 0,
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'var(--bg)',
                border: '1px solid var(--border-faint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--fg-dim)',
                fontWeight: 800,
                fontSize: '0.7rem',
              }}>
                {f.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.previewUrl} alt={f.file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  f.file.name.split('.').pop()?.toUpperCase().slice(0, 4) || '📄'
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--fg)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {f.file.name}
                </div>
                <div className="num" style={{ fontSize: '0.7rem', color: 'var(--fg-dim)', direction: 'ltr', textAlign: 'right' }}>
                  {(f.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>

              {/* Category editor */}
              <select
                value={f.category}
                onChange={e => changeCategory(i, e.target.value as FileCategory)}
                className="input"
                style={{
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.72rem',
                  width: 'auto',
                  minWidth: '110px',
                }}
                onClick={e => e.stopPropagation()}
              >
                {FILE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{FILE_CATEGORY_LABELS_AR[cat]}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="إزالة"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1px solid var(--err)',
                  background: 'var(--err-soft)',
                  color: 'var(--err)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
