'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn, getCachedSession } from '@/lib/auth'
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

  return (
    <div className="dashboard-login-page">
      <div className="dashboard-login-card">
        <div className="dashboard-login-logo">🩺</div>
        <h1 className="dashboard-login-title">لوحة تحكم الطبيب</h1>
        <p className="dashboard-login-subtitle">سجّل دخولك للوصول إلى الاستشارات وإدارة المواعيد</p>

        <form onSubmit={handleSubmit} className="dashboard-login-form">
          <div className="dashboard-login-field">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              placeholder="doctor@example.com"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="dashboard-login-field">
            <label>كلمة المرور</label>
            <input
              type="password"
              placeholder="••••••••"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="dashboard-login-error">
              <span>⚠</span>
              {error}
            </div>
          )}

          <button type="submit" className="dashboard-login-btn" disabled={loading}>
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <Link href="/" className="dashboard-login-back">
          العودة للصفحة الرئيسية →
        </Link>
      </div>
    </div>
  )
}
