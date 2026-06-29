'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn, getCachedSession } from '@/lib/auth'

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
    <div className="geo-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="card-warm" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '2.5rem 2rem',
        position: 'relative',
        overflow: 'hidden',
        animation: 'scaleIn 0.4s var(--ease-out)',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, var(--primary), var(--gold))',
        }} />

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 1rem',
            borderRadius: '16px',
            background: 'var(--primary-soft)',
            border: '1.5px solid var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            fontSize: '1.6rem',
            fontWeight: 900,
          }}>🩺</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--fg)' }}>
            لوحة تحكم الطبيب
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', marginTop: '0.4rem' }}>
            سجّل دخولك للوصول إلى الاستشارات
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              className="input"
              placeholder="doctor@example.com"
              dir="ltr"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              style={{ textAlign: 'left' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>
              كلمة المرور
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              dir="ltr"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              style={{ textAlign: 'left' }}
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--err-soft)',
              border: '1.5px solid var(--err)',
              borderRadius: 'var(--r)',
              padding: '0.7rem 0.9rem',
              color: 'var(--err)',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ justifyContent: 'center', marginTop: '0.4rem', padding: '0.85rem' }}
          >
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/" style={{ fontSize: '0.82rem', color: 'var(--fg-dim)', textDecoration: 'none', fontWeight: 600 }}>
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
