import type { Metadata } from 'next'
import { Amiri, Noto_Sans_Arabic, Cormorant } from 'next/font/google'
import Link from 'next/link'
import Image from 'next/image'
import { ToastProvider } from '@/components/Toaster'
import './globals.css'

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-display',
})

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
})

const cormorant = Cormorant({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-latin',
})

export const metadata: Metadata = {
  title: 'استشارات د. خالد بترجي',
  description: 'احجز استشارتك الطبية مع د. خالد بترجي بسهولة — أون لاين، آمن، وسريع.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} ${notoSansArabic.variable} ${cormorant.variable}`}>
      <body>
        <ToastProvider>
          <div className="grain" />

          <header className="site-header">
            <div className="container header-inner">
              <Link href="/" className="brand">
                <div className="brand-mark">
                  <Image
                    src="/logo.png"
                    alt="شعار مركز بترجي للاستشارات"
                    fill
                    sizes="36px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="brand-text">
                  <span className="brand-title">استشارات د. خالد بترجي</span>
                  <span className="brand-subtitle">جراحة العظام والمفاصل</span>
                </div>
              </Link>

              <nav className="header-nav">
                <Link href="/consultation/new" className="btn-primary btn-sm">
                  احجز استشارتك
                </Link>
              </nav>
            </div>
          </header>

          {children}

          <footer className="site-footer">
            <div className="container footer-inner">
              <div className="footer-brand">
                <div className="brand-mark">
                  <Image
                    src="/logo.png"
                    alt="شعار مركز بترجي للاستشارات"
                    fill
                    sizes="32px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <div className="footer-title">استشارات د. خالد بترجي</div>
                  <p className="footer-desc">
                    منصة استشارات طبية متكاملة لتقديم رعاية صحية ممتازة وتجربة استشارية آمنة من منزلك.
                  </p>
                </div>
              </div>

              <div className="footer-links">
                <span className="footer-links-title">روابط سريعة</span>
                <Link href="/">الرئيسية</Link>
                <Link href="/consultation/new">حجز استشارة</Link>
                <Link href="/dashboard">لوحة التحكم</Link>
              </div>

              <div className="footer-copy" dir="ltr">
                <span>جميع الحقوق محفوظة</span>
                <span>© {new Date().getFullYear()}</span>
              </div>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  )
}
