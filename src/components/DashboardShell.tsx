'use client'

import Image from 'next/image'
import { Inbox, Settings, LogOut, Activity } from 'lucide-react'
import { AuthSession } from '@/lib/auth'
import { DOCTORS } from '@/lib/doctors'
import { useLanguage } from '@/context/LanguageContext'

type DashTab = 'requests' | 'settings'

type DashShellProps = {
  active: DashTab
  session: AuthSession | null
  onSignOut: () => void
  onNavigate?: (tab: DashTab) => void
  pendingCount?: number
  children: React.ReactNode
}

export function DashboardShell({ active, session, onSignOut, onNavigate, pendingCount = 0, children }: DashShellProps) {
  const { lang, t } = useLanguage()
  const doctor = DOCTORS[0]
  const initial = (session?.display_name || session?.email || t('dash_brand_mark')).slice(0, 1)
  const navItem = (tab: DashTab, icon: React.ReactNode, label: string, badge?: number) => (
    <button
      type="button"
      className={`dash-nav-item ${active === tab ? 'dash-nav-item-active' : ''}`}
      onClick={() => onNavigate?.(tab)}
    >
      {icon}
      {label}
      {badge != null && badge > 0 && <span className="dash-nav-badge">{badge}</span>}
    </button>
  )

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-brand">
          <div className="dash-sidebar-mark">{t('dash_brand_mark')}</div>
          <div className="dash-sidebar-brand-text">
            <span className="dash-sidebar-brand-name">{t('dash_brand_name')}</span>
            <span className="dash-sidebar-brand-sub">{t('dash_brand_sub')}</span>
          </div>
        </div>

        <div className="dash-sidebar-section-label">{t('dash_nav_title')}</div>
        <nav className="dash-sidebar-nav">
          {navItem('requests', <Inbox size={18} />, t('dash_nav_requests'), pendingCount)}
          {navItem('settings', <Settings size={18} />, t('dash_nav_settings'))}
        </nav>

        <div className="dash-sidebar-section-label">{t('dash_doctor_section')}</div>
        <div className="dash-context-card">
          <div className="dash-context-avatar">
            <Image src={doctor.image} alt={t('hero_title_dr')} fill sizes="42px" style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <div className="dash-context-name">{t('hero_title_dr')}</div>
            <div className="dash-context-role">{t('hero_title_title')}</div>
          </div>
          <span className="dash-context-pulse" aria-hidden />
        </div>

        <div className="dash-sidebar-footer">
          <div className="dash-user-card">
            <div className="dash-user-avatar">{initial}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="dash-user-name">{session?.display_name || t('dash_doctor_role')}</div>
              <div className="dash-user-email">{session?.email || ''}</div>
            </div>
          </div>
          <button className="dash-signout" onClick={onSignOut}>
            <LogOut size={15} /> {t('dash_signout')}
          </button>
        </div>
      </aside>

      <main className="dash-main">
        <div className="dash-inner">{children}</div>
      </main>
    </div>
  )
}

export function DashboardGate({ message }: { message: string }) {
  return (
    <div className="dash-gate">
      <div className="dash-gate-card">
        <div className="dash-gate-ring" />
        <p className="dash-gate-text">{message}</p>
      </div>
    </div>
  )
}

export function DashboardError({ message, onBack }: { message: string; onBack?: () => void }) {
  const { t } = useLanguage()
  return (
    <div className="dash-gate">
      <div className="dash-gate-error">
        <div className="dash-gate-error-icon"><Activity size={26} /></div>
        <h2 className="dash-gate-error-title">{message}</h2>
        <button className="dash-action dash-action-primary" onClick={onBack} style={{ margin: '0 auto' }}>
          {t('dash_error_back')}
        </button>
      </div>
    </div>
  )
}
