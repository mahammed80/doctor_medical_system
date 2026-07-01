'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
        حدث خطأ غير متوقع
      </h1>
      <p style={{ color: 'var(--fg-muted)', maxWidth: 480, margin: 0 }}>
        نأسف للإزعاج. حاول مرة أخرى، وإن استمرت المشكلة يرجى العودة إلى الصفحة الرئيسية.
      </p>
      {error.digest ? (
        <p style={{ fontSize: '0.75rem', color: 'var(--fg-dim)', margin: 0 }}>
          رمز الخطأ: {error.digest}
        </p>
      ) : null}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="btn-primary"
          style={{ fontSize: '0.9rem' }}
        >
          إعادة المحاولة
        </button>
        <Link href="/" className="btn-ghost" style={{ fontSize: '0.9rem' }}>
          الصفحة الرئيسية
        </Link>
      </div>
    </div>
  )
}
