import type { Metadata } from 'next'
import { Tajawal, Inter } from 'next/font/google'
import Link from 'next/link'
import Image from 'next/image'
import './globals.css'

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'استشارات د. خالد بترجي',
  description: 'احجز استشارتك الطبية مع د. خالد بترجي بسهولة — أون لاين، آمن، وسريع.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${inter.variable}`}>
      <body>
        <div className="top-bar" />
        <div className="grain" />

        <header style={{
          position: 'sticky',
          top: 5,
          zIndex: 50,
          background: 'oklch(100% 0 0 / 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-faint)',
        }}>
          <div className="container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
          }}>
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              color: 'var(--fg)',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                position: 'relative',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px var(--primary-glow)',
              }}>
                <Image
                  src="/logo.png"
                  alt="شعار مركز بترجي للاستشارات"
                  fill
                  sizes="36px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.2 }}>مركز بترجي للاستشارات</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--fg-dim)', fontWeight: 500 }}>نخبة من الأطباء الاستشاريين أونلاين</span>
              </div>
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link href="/consultation/new" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}>
                ابدأ الاستشارة
              </Link>
            </nav>
          </div>
        </header>

        {children}

        <footer style={{
          borderTop: '1px solid var(--border-faint)',
          background: 'linear-gradient(180deg, var(--bg) 0%, var(--surface) 100%)',
          padding: '5rem 0 2rem',
          marginTop: '6rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative diamond row */}
          <div style={{
            position: 'absolute', top: '-1.5rem', left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: '0.75rem',
          }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{
                width: '8px', height: '8px',
                background: i === 3 ? 'var(--gold)' : 'var(--border)',
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                opacity: i === 3 ? 0.5 : 0.15,
                animation: i === 3 ? 'diamondPulse 3s ease-in-out infinite' : 'none',
              }} />
            ))}
          </div>

          <div className="container" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '2rem',
            position: 'relative',
            zIndex: 1,
          }}>
            <div style={{ maxWidth: '320px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px var(--primary-glow)',
                }}>
                  <Image
                    src="/logo.png"
                    alt="شعار مركز بترجي للاستشارات"
                    fill
                    sizes="32px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>مركز بترجي للاستشارات الطبية</div>
              </div>
              <div style={{
                fontSize: '0.78rem', color: 'var(--fg-dim)', lineHeight: 1.8,
              }}>
                منصة استشارات طبية متكاملة تضم نخبة من أفضل الاستشاريين والأطباء المتخصصين، لتقديم رعاية صحية ممتازة وتجربة استشارية آمنة وموثوقة من منزلك.
              </div>
            </div>

            <div style={{
              display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end',
            }}>
              <div style={{
                fontSize: '0.72rem', fontWeight: 700, color: 'var(--fg-muted)',
                letterSpacing: '0.04em',
              }}>
                روابط سريعة
              </div>
              <Link href="/" style={{
                color: 'var(--fg-dim)', textDecoration: 'none', fontSize: '0.82rem',
                transition: 'color 200ms',
              }}>الرئيسية</Link>
              <Link href="/consultation/new" style={{
                color: 'var(--fg-dim)', textDecoration: 'none', fontSize: '0.82rem',
                transition: 'color 200ms',
              }}>حجز استشارة</Link>
              <Link href="/dashboard" style={{
                color: 'var(--fg-dim)', textDecoration: 'none', fontSize: '0.82rem',
                transition: 'color 200ms',
              }}>لوحة التحكم</Link>
            </div>

            <div style={{
              textAlign: 'left', direction: 'ltr',
              fontSize: '0.72rem', color: 'var(--fg-dim)',
            }}>
              <div style={{ marginBottom: '0.35rem' }}>
                جميع الحقوق محفوظة
              </div>
              <div>
                © {new Date().getFullYear()}
              </div>
            </div>
          </div>

          {/* Bottom flourish */}
          <div style={{
            marginTop: '3rem',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
            opacity: 0.5,
          }} />
        </footer>
      </body>
    </html>
  )
}
