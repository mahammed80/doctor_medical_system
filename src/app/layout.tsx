import type { Metadata } from 'next'
import { Amiri, Noto_Sans_Arabic, Cormorant, Oswald } from 'next/font/google'
import { ToastProvider } from '@/components/Toaster'
import { LanguageProvider } from '@/context/LanguageContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
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

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-numbers',
})

export const metadata: Metadata = {
  title: 'استشارات د. خالد بترجي',
  description: 'احجز استشارتك الطبية مع د. خالد بترجي بسهولة وبشكل آمن وسريع أونلاين.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} ${notoSansArabic.variable} ${cormorant.variable} ${oswald.variable}`}>
      <body>
        <ToastProvider>
          <LanguageProvider>
            <div className="grain" />
            <Header />
            {children}
            <Footer />
          </LanguageProvider>
        </ToastProvider>
      </body>
    </html>
  )
}

