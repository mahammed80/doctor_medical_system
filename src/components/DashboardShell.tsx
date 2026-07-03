'use client'

import Image from 'next/image'
import { Inbox, Settings, LogOut, Activity } from 'lucide-react'
import { AuthSession } from '@/lib/auth'
import { DOCTORS } from '@/lib/doctors'

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
  const doctor = DOCTORS[0]
  const initial = (session?.display_name || session?.email || 'د').slice(0, 1)
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
          <div className="dash-sidebar-mark">ب</div>
          <div className="dash-sidebar-brand-text">
            <span className="dash-sidebar-brand-name">مركز بترجي</span>
            <span className="dash-sidebar-brand-sub">لوحة التحكم</span>
          </div>
        </div>

        <div className="dash-sidebar-section-label">التنقّل</div>
        <nav className="dash-sidebar-nav">
          {navItem('requests', <Inbox size={18} />, 'طلبات الاستشارات', pendingCount)}
          {navItem('settings', <Settings size={18} />, 'إعدادات العيادة')}
        </nav>

        <div className="dash-sidebar-section-label">الطبيب المعالج</div>
        <div className="dash-context-card">
          <div className="dash-context-avatar">
            <Image src={doctor.image} alt={doctor.name} fill sizes="42px" style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <div className="dash-context-name">{doctor.name}</div>
            <div className="dash-context-role">{doctor.specialty}</div>
          </div>
          <span className="dash-context-pulse" aria-hidden />
        </div>

        <div className="dash-sidebar-footer">
          <div className="dash-user-card">
            <div className="dash-user-avatar">{initial}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="dash-user-name">{session?.display_name || 'طبيب'}</div>
              <div className="dash-user-email">{session?.email || ''}</div>
            </div>
          </div>
          <button className="dash-signout" onClick={onSignOut}>
            <LogOut size={15} /> تسجيل الخروج
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
  return (
    <div className="dash-gate">
      <div className="dash-gate-error">
        <div className="dash-gate-error-icon"><Activity size={26} /></div>
        <h2 className="dash-gate-error-title">{message}</h2>
        <button className="dash-action dash-action-primary" onClick={onBack} style={{ margin: '0 auto' }}>
          العودة للوحة التحكم
        </button>
      </div>
    </div>
  )
}
