'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DOCTORS } from '@/lib/doctors'

const CONFETTI_DIAMONDS = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i * 5.2) % 100}%`,
  delay: `${(i * 0.7) % 12}s`,
  duration: `${12 + (i % 8) * 2}s`,
  size: `${4 + (i % 3) * 3}px`,
  color: i % 3 === 0 ? 'var(--gold)' : i % 3 === 1 ? 'var(--primary)' : 'var(--ok)',
}))

export default function Success() {
  const [assignedDoc, setAssignedDoc] = useState(DOCTORS[0])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const docId = params.get('doctor')
      const doc = DOCTORS.find(d => d.id === docId)
      if (doc) {
        setAssignedDoc(doc)
      }
    }
  }, [])

  return (
    <main className="geo-bg" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Floating diamond celebration */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {CONFETTI_DIAMONDS.map((d, i) => (
          <div key={i} style={{
            position: 'absolute', bottom: '-20px', left: d.left,
            width: d.size, height: d.size,
            background: d.color,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            opacity: 0,
            animation: `driftDiamond ${d.duration} ${d.delay} linear infinite`,
          }} />
        ))}
      </div>

      <div style={{
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        animation: 'fadeUp 0.6s var(--ease-out)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Animated success circle with rings */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2rem' }}>
          {/* Outer ring */}
          <div style={{
            position: 'absolute', top: '-12px', left: '-12px', right: '-12px', bottom: '-12px',
            borderRadius: '50%',
            border: '1.5px solid oklch(68% 0.17 70 / 0.15)',
            animation: 'pulse-soft 3s ease-in-out infinite',
          }} />
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--ok) 0%, oklch(50% 0.15 155 / 0.8) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            animation: 'successPop 0.6s var(--ease-spring) 0.1s both, ringExpand 1.5s ease-out 0.6s',
            boxShadow: '0 8px 32px oklch(50% 0.15 155 / 0.25)',
            position: 'relative',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Doctor Small Card in Success Page */}
        <div className="card-warm" style={{
          padding: '1rem',
          maxWidth: '320px',
          margin: '0 auto 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--r-lg)',
          background: 'oklch(100% 0 0 / 0.6)',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1.5px solid var(--primary)',
            position: 'relative',
            flexShrink: 0
          }}>
            <Image
              src={assignedDoc.image}
              alt={assignedDoc.name}
              fill
              sizes="48px"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--fg)' }}>{assignedDoc.name}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600 }}>{assignedDoc.specialty}</div>
          </div>
        </div>

        {/* Decorative diamond divider */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ width: '24px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold))' }} />
          <div style={{
            width: '6px', height: '6px',
            background: 'var(--gold)',
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          }} />
          <div style={{ width: '24px', height: '1px', background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
        </div>

        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          marginBottom: '1rem',
        }}>
          تم إرسال الطلب بنجاح
        </h1>

        <p style={{
          color: 'var(--fg-muted)',
          lineHeight: 1.85,
          marginBottom: '0.5rem',
          fontSize: '0.95rem',
        }}>
          تم إرسال طلب حجز استشارتك مع <strong style={{ color: 'var(--fg)' }}>{assignedDoc.name}</strong> بنجاح.
        </p>
        <p style={{
          color: 'var(--fg-dim)',
          lineHeight: 1.85,
          marginBottom: '2.5rem',
          fontSize: '0.88rem',
        }}>
          طلبك بانتظار مراجعة وتأكيد الطبيب. سوف يصلك إشعار بالبريد الإلكتروني أو رسالة نصية فور مراجعة الموعد وقبوله.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link href="/" className="btn-primary">
            العودة للرئيسية
          </Link>
          <Link href="/dashboard" className="btn-ghost">
            لوحة التحكم
          </Link>
        </div>

        {/* Decorative bottom diamonds */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '0.5rem',
          marginTop: '3rem', opacity: 0.15,
        }}>
          {[1,2,3,4,3,2,1].map((_, i) => (
            <div key={i} style={{
              width: `${4 + (i % 3) * 2}px`,
              height: `${4 + (i % 3) * 2}px`,
              background: i % 2 === 0 ? 'var(--primary)' : 'var(--gold)',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }} />
          ))}
        </div>
      </div>
    </main>
  )
}
