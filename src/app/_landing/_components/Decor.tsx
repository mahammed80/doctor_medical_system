'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="section-label">
      {children}
    </div>
  )
}

export function SectionDivider() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '3rem 0',
      }}
    >
      <div style={{ flex: 1, height: '1px', background: 'var(--border-faint)' }} />
      <div
        style={{
          width: 32,
          height: 2,
          background: 'var(--accent)',
          borderRadius: 2,
          opacity: 0.5,
        }}
      />
      <div style={{ flex: 1, height: '1px', background: 'var(--border-faint)' }} />
    </div>
  )
}

export function ScrollReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`reveal ${visible ? 'visible' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const el = ref.current
    if (!el) return
    let current = 0
    const step = Math.max(1, Math.floor(end / 50))
    const interval = setInterval(() => {
      current += step
      if (current >= end) {
        current = end
        clearInterval(interval)
      }
      el.textContent = current.toLocaleString('en-US') + suffix
    }, 30)
    return () => clearInterval(interval)
  }, [started, end, suffix])

  return (
    <span ref={ref} className="num">
      0{suffix}
    </span>
  )
}

export function HeroBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* Warm gradient wash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 20% 10%, rgba(212, 185, 150, 0.14) 0%, transparent 45%), radial-gradient(ellipse at 85% 25%, rgba(196, 106, 79, 0.08) 0%, transparent 40%), radial-gradient(ellipse at 50% 95%, rgba(26, 60, 47, 0.06) 0%, transparent 45%)',
        }}
      />

      {/* Subtle organic blob */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          insetInlineStart: '-8%',
          width: '42vw',
          height: '42vw',
          maxWidth: 520,
          maxHeight: 520,
          background: 'rgba(196, 106, 79, 0.04)',
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          animation: 'morphBlob 18s ease-in-out infinite',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '12%',
          insetInlineEnd: '-6%',
          width: '34vw',
          height: '34vw',
          maxWidth: 420,
          maxHeight: 420,
          background: 'rgba(26, 60, 47, 0.05)',
          borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
          animation: 'morphBlob 22s ease-in-out infinite reverse',
          filter: 'blur(48px)',
        }}
      />
    </div>
  )
}

export function SectionTexture() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse at 100% 0%, rgba(196, 106, 79, 0.05) 0%, transparent 35%)',
        zIndex: 0,
      }}
    />
  )
}
