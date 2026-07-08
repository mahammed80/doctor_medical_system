'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn, getCachedSession, TEST_CREDENTIALS } from '@/lib/auth'
import { Stethoscope, AlertTriangle, ArrowLeft, Lock, Mail } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import '../dashboard.css'

export default function LoginPage() {
  const router = useRouter()
  const { lang, t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cached = getCachedSession()
    if (cached) router.replace('/dashboard')
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError(t('dash_login_error_missing'))
      return
    }
    setLoading(true)
    try {
      await signIn(email, password)
      router.replace('/dashboard')
    } catch (err) {
      const msg = err instanceof Error ? err.message : (lang === 'ar' ? 'تعذر تسجيل الدخول' : 'Could not log in')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function fillTestCreds() {
    setEmail(TEST_CREDENTIALS[0].email)
    setPassword(TEST_CREDENTIALS[0].password)
  }

  return (
    <div className="dash-login-page">
      <div className="dash-login-card">
        <div className="dash-login-brand">
          <div className="dash-login-mark"><Stethoscope size={30} /></div>
          <h1 className="dash-login-title">{t('dash_login_title')}</h1>
          <p className="dash-login-subtitle">{t('dash_login_sub')}</p>
        </div>

        <form onSubmit={handleSubmit} className="dash-login-form">
          <div className="dash-login-field">
            <label>{t('dash_login_email')}</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', insetInlineStart: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-dim)', display: 'flex' }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                className="dash-login-input"
                placeholder="doctor@example.com"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{ paddingInlineStart: '2.7rem' }}
              />
            </div>
          </div>

          <div className="dash-login-field">
            <label>{t('dash_login_password')}</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', insetInlineStart: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-dim)', display: 'flex' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                className="dash-login-input"
                placeholder="••••••••"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{ paddingInlineStart: '2.7rem' }}
              />
            </div>
          </div>

          {error && (
            <div className="dash-login-error">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <button type="submit" className="dash-login-btn" disabled={loading}>
            {loading ? t('dash_login_loading') : t('dash_login_btn')}
          </button>
        </form>

        <div className="dash-login-hint">
          {t('dash_login_test_hint')}{' '}
          <button
            type="button"
            onClick={fillTestCreds}
            style={{ background: 'none', border: 'none', color: 'var(--dash-terra)', fontWeight: 800, cursor: 'pointer', padding: 0, fontSize: '0.74rem' }}
          >
            {t('dash_login_fill_btn')}
          </button>
          <br />
          <strong>{TEST_CREDENTIALS[0].email}</strong>
        </div>

        <Link href="/" className="dash-login-back">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowLeft size={14} /> {t('dash_login_back')}
          </span>
        </Link>
      </div>
    </div>
  )
}
