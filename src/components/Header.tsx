'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Globe } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export function Header() {
  const { lang, setLang, t, isRtl } = useLanguage()

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar')
  }

  return (
    <header className="premium-header">
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
              alt={t('hero_badge')}
              fill
              sizes="36px"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.2 }}>{t('hero_title_dr')}</span>
            <span className="hidden sm:inline-block" style={{ fontSize: '0.68rem', color: 'var(--fg-dim)', fontWeight: 500 }}>{t('logo_sub')}</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          <Link href="/" className="nav-link">{t('nav_home')}</Link>
          <Link href="/#about-section" className="nav-link">{t('nav_about')}</Link>
          <Link href="/#steps-section" className="nav-link">{t('nav_steps')}</Link>
          <Link href="/#services-section" className="nav-link">{t('nav_packages')}</Link>
          <Link href="/#testimonials-section" className="nav-link">{t('nav_testimonials')}</Link>
          <Link href="/#faq-section" className="nav-link">{t('nav_faq')}</Link>
        </nav>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={toggleLanguage}
            className="btn-ghost btn-sm"
            style={{
              padding: '0 10px',
              borderRadius: 'var(--r-sm)',
              height: '40px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
            aria-label={lang === 'ar' ? 'Switch to English' : 'تغيير إلى العربية'}
          >
            <Globe size={15} />
            <span className="hidden md:inline" style={{ fontFamily: 'var(--font-body), sans-serif' }}>
              {lang === 'ar' ? 'English' : 'العربية'}
            </span>
          </button>

          <Link href="/consultation/new" className="btn-primary btn-sm btn-primary-shimmer-gold" style={{ borderRadius: 'var(--r-sm)' }}>
            {t('nav_start')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
