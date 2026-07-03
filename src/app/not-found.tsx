import Link from 'next/link'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="geo-bg" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.25rem',
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        textAlign: 'center',
        animation: 'fadeUp 0.6s var(--ease-out)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          width: '84px',
          height: '84px',
          margin: '0 auto 1.75rem',
          borderRadius: '24px',
          background: 'var(--primary-50)',
          border: '1.5px solid var(--primary-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          boxShadow: '0 12px 32px var(--primary-glow)',
        }}>
          <Compass size={36} />
        </div>

        <div style={{
          fontFamily: 'var(--font-numbers), Oswald, sans-serif',
          fontSize: '3.5rem',
          fontWeight: 700,
          color: 'var(--primary)',
          lineHeight: 1,
          marginBottom: '0.5rem',
          direction: 'ltr',
        }}>
          404
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display), Amiri, serif',
          fontSize: '1.4rem',
          fontWeight: 700,
          color: 'var(--fg)',
          marginBottom: '0.75rem',
        }}>
          الصفحة غير موجودة
        </h1>

        <p style={{
          color: 'var(--fg-dim)',
          lineHeight: 1.85,
          marginBottom: '2rem',
          fontSize: '0.92rem',
        }}>
          عذراً، الصفحة التي تبحث عنها غير متوفرة أو ربما تم نقلها إلى عنوان آخر.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-primary">
            العودة للرئيسية
          </Link>
          <Link href="/consultation/new" className="btn-ghost">
            احجز استشارة
          </Link>
        </div>
      </div>
    </main>
  )
}
