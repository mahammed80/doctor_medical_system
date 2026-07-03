'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn, getCachedSession, TEST_CREDENTIALS } from '@/lib/auth'
import { Stethoscope, AlertTriangle, ArrowLeft, Lock, Mail } from 'lucide-react'
import '../dashboard.css'

export default function LoginPage() {
  const router = useRouter()
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
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور.')
      return
    }
    setLoading(true)
    try {
      await signIn(email, password)
      router.replace('/dashboard')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'تعذر تسجيل الدخول'
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
          <h1 className="dash-login-title">لوحة تحكم الطبيب</h1>
          <p className="dash-login-subtitle">سجّل دخولك للوصول إلى الاستشارات وإدارة المواعيد</p>
        </div>

        <form onSubmit={handleSubmit} className="dash-login-form">
          <div className="dash-login-field">
            <label>البريد الإلكتروني</label>
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
            <label>كلمة المرور</label>
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
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="dash-login-hint">
          للتجربة استخدم حساب الاختبار —{' '}
          <button
            type="button"
            onClick={fillTestCreds}
            style={{ background: 'none', border: 'none', color: 'var(--dash-terra)', fontWeight: 800, cursor: 'pointer', padding: 0, fontSize: '0.74rem' }}
          >
            املأ البيانات تلقائياً
          </button>
          <br />
          <strong>{TEST_CREDENTIALS[0].email}</strong>
        </div>

        <Link href="/" className="dash-login-back">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowLeft size={14} /> العودة للصفحة الرئيسية
          </span>
        </Link>
      </div>
    </div>
  )
}
