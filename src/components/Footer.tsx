'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'

export function Footer() {
  const { t, isRtl } = useLanguage()

  return (
    <footer style={{
      borderTop: '1px solid var(--border-faint)',
      background: 'linear-gradient(180deg, var(--bg) 0%, var(--surface) 100%)',
      padding: '5rem 0 2rem',
      marginTop: '6rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-1.5rem', left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: '0.75rem',
      }}>
        {[1, 2, 3, 4, 5].map(i => (
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
                alt={t('hero_badge')}
                fill
                sizes="32px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{t('hero_title_dr')}</div>
          </div>
          <div style={{
            fontSize: '0.78rem', color: 'var(--fg-dim)', lineHeight: 1.8,
          }}>
            {t('footer_desc')}
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          alignItems: isRtl ? 'flex-end' : 'flex-start',
        }}>
          <div style={{
            fontSize: '0.72rem', fontWeight: 700, color: 'var(--fg-muted)',
            letterSpacing: '0.04em',
          }}>
            {t('footer_links')}
          </div>
          <Link href="/" style={{
            color: 'var(--fg-dim)', textDecoration: 'none', fontSize: '0.82rem',
            transition: 'color 200ms',
          }}>{t('nav_home')}</Link>
          <Link href="/consultation/new" style={{
            color: 'var(--fg-dim)', textDecoration: 'none', fontSize: '0.82rem',
            transition: 'color 200ms',
          }}>{t('nav_start')}</Link>
        </div>

        <div style={{
          textAlign: isRtl ? 'left' : 'right',
          fontSize: '0.72rem', color: 'var(--fg-dim)',
          alignSelf: 'stretch',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ marginBottom: '0.35rem' }}>
            {t('footer_rights')}
          </div>
          <div style={{ direction: 'ltr', textAlign: isRtl ? 'left' : 'right' }}>
            © {new Date().getFullYear()}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '3rem',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        opacity: 0.5,
      }} />
    </footer>
  )
}
