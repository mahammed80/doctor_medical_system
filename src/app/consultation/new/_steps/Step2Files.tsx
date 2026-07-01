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
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--fg)' }}>
          هل لديك أي ملفات طبية سابقة (أشعة، تحاليل، روشتات)؟
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--fg-dim)', marginTop: '0.25rem' }}>
          مشاركة الفحوصات السابقة تساعد الطبيب على تشخيص الحالة بشكل أدق.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <button
          type="button"
          onClick={() => set('has_previous_tests', 'yes')}
          style={{
            padding: '1.25rem 1rem',
            borderRadius: 'var(--r)',
            border: `1.8px solid ${form.has_previous_tests === 'yes' ? 'var(--primary)' : 'var(--border)'}`,
            background: form.has_previous_tests === 'yes' ? 'var(--primary-soft)' : 'var(--surface)',
            color: form.has_previous_tests === 'yes' ? 'var(--primary)' : 'var(--fg)',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 200ms',
            textAlign: 'center',
            boxShadow:
              form.has_previous_tests === 'yes'
                ? '0 4px 12px var(--primary-glow)'
                : 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>📁</div>
          نعم، لدي ملفات سابقة
        </button>
        <button
          type="button"
          onClick={() =>
            set('has_previous_tests', 'no')
          }
          style={{
            padding: '1.25rem 1rem',
            borderRadius: 'var(--r)',
            border: `1.8px solid ${form.has_previous_tests === 'no' ? 'var(--primary)' : 'var(--border)'}`,
            background: form.has_previous_tests === 'no' ? 'var(--primary-soft)' : 'var(--surface)',
            color: form.has_previous_tests === 'no' ? 'var(--primary)' : 'var(--fg)',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 200ms',
            textAlign: 'center',
            boxShadow:
              form.has_previous_tests === 'no'
                ? '0 4px 12px var(--primary-glow)'
                : 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>❌</div>
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
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={onSkipToPayment}
            style={{ flex: 1, justifyContent: 'center' }}
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
