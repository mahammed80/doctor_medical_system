'use client'

import CategoryFileDropZone from '@/components/CategoryFileDropZone'
import type { FileWithCategory } from '@/components/CategoryFileDropZone'
import { Field } from '../_components/Field'
import { Spinner } from '../_components/Spinner'
import type { FormData } from '../types'

type Props = {
  form: FormData
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void
  loading: boolean
  onUpload: () => void
  onSkipToPayment: () => void
}

export function Step2Files({ form, set, loading, onUpload, onSkipToPayment }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--fg)' }}>
          هل لديك أي ملفات طبية سابقة (أشعة، تحاليل، روشتات)؟
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--fg-dim)', marginTop: '0.35rem', lineHeight: 1.7 }}>
          مشاركة الفحوصات السابقة تساعد الطبيب على تشخيص الحالة بشكل أدق.
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
          <div className="option-card-icon">📁</div>
          نعم، لدي ملفات سابقة
        </button>
        <button
          type="button"
          onClick={() => set('has_previous_tests', 'no')}
          className={['option-card', form.has_previous_tests === 'no' && 'option-card-selected']
            .filter(Boolean)
            .join(' ')}
        >
          <div className="option-card-icon">❌</div>
          لا، لا توجد لدي ملفات
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
          <Field label="رفع الملفات الطبية" optional>
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
          onClick={onSkipToPayment}
          style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
        >
          التالي
        </button>
      )}

      {form.has_previous_tests === 'yes' && (
        <div className="booking-actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={onSkipToPayment}
            style={{ justifyContent: 'center' }}
          >
            تخطى
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onUpload}
            disabled={loading}
            style={{ flex: 2, justifyContent: 'center' }}
          >
            {loading ? <Spinner /> : 'التالي (رفع ومتابعة)'}
          </button>
        </div>
      )}
    </div>
  )
}
