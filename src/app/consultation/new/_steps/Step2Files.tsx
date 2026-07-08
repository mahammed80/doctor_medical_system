'use client'

import { FolderOpen, X } from 'lucide-react'
import CategoryFileDropZone from '@/components/CategoryFileDropZone'
import type { FileWithCategory } from '@/components/CategoryFileDropZone'
import { Field } from '../_components/Field'
import { Spinner } from '../_components/Spinner'
import type { FormData } from '../types'
import { useLanguage } from '@/context/LanguageContext'

type Props = {
  form: FormData
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void
  loading: boolean
  onUpload: () => void
  onNext: () => void
}

export function Step2Files({ form, set, loading, onUpload, onNext }: Props) {
  const { t } = useLanguage()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--fg)' }}>
          {t('booking_files_q')}
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--fg-dim)', marginTop: '0.35rem', lineHeight: 1.7 }}>
          {t('booking_files_desc')}
        </p>
      </div>

      <div className="option-grid">
        <button
          type="button"
          onClick={() => set('has_previous_tests', 'yes')}
          className={['option-card', form.has_previous_tests === 'yes' && 'option-card-selected']
            .filter(Boolean)
            .join(' ')}
        >
          <div className="option-card-icon" style={{ display: 'inline-flex' }}><FolderOpen size={24} /></div>
          {t('booking_has_files_yes')}
        </button>
        <button
          type="button"
          onClick={() => set('has_previous_tests', 'no')}
          className={['option-card', form.has_previous_tests === 'no' && 'option-card-selected']
            .filter(Boolean)
            .join(' ')}
        >
          <div className="option-card-icon" style={{ display: 'inline-flex' }}><X size={24} /></div>
          {t('booking_has_files_no')}
        </button>
      </div>

      {form.has_previous_tests === 'yes' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'scaleIn 0.3s var(--ease-out)',
          }}
        >
          <Field label={t('booking_upload_files_label')} optional>
            <CategoryFileDropZone
              files={form.uploaded_files}
              onChange={(list: FileWithCategory[]) =>
                set('uploaded_files', list)
              }
            />
          </Field>
        </div>
      )}

      {form.has_previous_tests === 'no' && (
        <button
          type="button"
          className="btn-primary"
          onClick={onNext}
          style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
        >
          {t('booking_next')}
        </button>
      )}

      {form.has_previous_tests === 'yes' && (
        <div className="booking-actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={onNext}
            style={{ justifyContent: 'center' }}
          >
            {t('booking_skip')}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onUpload}
            disabled={loading}
            style={{ flex: 2, justifyContent: 'center' }}
          >
            {loading ? <Spinner /> : t('booking_next_upload')}
          </button>
        </div>
      )}
    </div>
  )
}

