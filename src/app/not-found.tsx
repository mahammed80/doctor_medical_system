import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--fg-muted)', margin: 0 }}>
        الصفحة المطلوبة غير موجودة.
      </p>
      <Link href="/" className="btn-primary" style={{ fontSize: '0.9rem' }}>
        العودة إلى الرئيسية
      </Link>
    </div>
  )
}
