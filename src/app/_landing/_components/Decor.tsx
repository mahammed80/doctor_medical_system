'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        color: 'var(--primary)',
        padding: '0.35rem 1rem',
        borderRadius: 9999,
        border: '1px solid var(--border-accent)',
        background: 'var(--primary-subtle)',
        marginBottom: '1.25rem',
      }}
    >
      <span style={{ fontSize: '0.55rem' }}>◇</span>
      {children}
    </div>
  )
}

export function SectionDivider() {
  return (
    <div className="section-divider">
      <span className="diamond" />
      <span className="diamond" style={{ width: 6, height: 6, opacity: 0.25 }} />
      <span className="diamond" />
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
      { threshold: 0.08 },
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
    const step = Math.max(1, Math.floor(end / 60))
    const interval = setInterval(() => {
      current += step
      if (current >= end) {
        current = end
        clearInterval(interval)
      }
      el.textContent = current.toLocaleString('en-US') + suffix
    }, 25)
    return () => clearInterval(interval)
  }, [started, end, suffix])

  return (
    <span ref={ref} style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
      0{suffix}
    </span>
  )
}

const ORB_COLORS = [
  'radial-gradient(circle, rgba(12, 90, 66, 0.12) 0%, transparent 70%)',
  'radial-gradient(circle, rgba(194, 154, 104, 0.08) 0%, transparent 70%)',
  'radial-gradient(circle, rgba(30, 139, 98, 0.06) 0%, transparent 70%)',
]

export function FloatingOrbs() {
  const orbs = [
    { size: '400px', top: '10%', right: '-5%', anim: 'floatOrb 18s ease-in-out infinite', color: ORB_COLORS[0], side: 'right' as const },
    { size: '300px', top: '50%', left: '-8%', anim: 'floatOrb2 22s ease-in-out infinite', color: ORB_COLORS[1], side: 'left' as const },
    { size: '200px', top: '70%', right: '15%', anim: 'floatOrb 15s ease-in-out infinite reverse', color: ORB_COLORS[2], side: 'right' as const },
    { size: '500px', top: '-15%', left: '20%', anim: 'floatOrb2 25s ease-in-out infinite', color: ORB_COLORS[0], side: 'left' as const },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {orbs.map((orb, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            top: orb.top,
            [orb.side]: orb.side === 'left' ? orb.left : orb.right,
            borderRadius: '50%',
            background: orb.color,
            animation: orb.anim,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  )
}

export function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!ref.current) return
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      ref.current.style.background = `radial-gradient(600px at ${x * 100}% ${y * 100}%, rgba(12, 90, 66, 0.04) 0%, transparent 70%)`
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        transition: 'background 0.4s',
      }}
    />
  )
}

export function DiamondShower() {
  const diamonds = [
    { left: '8%', size: '6px', delay: '2s', duration: '22s', color: 'var(--primary)' },
    { left: '22%', size: '10px', delay: '6s', duration: '28s', color: 'var(--gold)' },
    { left: '38%', size: '5px', delay: '1s', duration: '18s', color: 'var(--ok)' },
    { left: '52%', size: '8px', delay: '9s', duration: '24s', color: 'var(--primary)' },
    { left: '68%', size: '12px', delay: '4s', duration: '30s', color: 'var(--gold)' },
    { left: '82%', size: '7px', delay: '11s', duration: '20s', color: 'var(--ok)' },
    { left: '15%', size: '9px', delay: '14s', duration: '26s', color: 'var(--gold)' },
    { left: '45%', size: '11px', delay: '3s', duration: '32s', color: 'var(--primary)' },
    { left: '75%', size: '5px', delay: '8s', duration: '17s', color: 'var(--ok)' },
    { left: '90%', size: '14px', delay: '12s', duration: '34s', color: 'var(--primary)' },
    { left: '60%', size: '7px', delay: '16s', duration: '23s', color: 'var(--gold)' },
    { left: '35%', size: '9px', delay: '5s', duration: '19s', color: 'var(--ok)' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {diamonds.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            bottom: '-20px',
            left: d.left,
            width: d.size,
            height: d.size,
            background: d.color,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            opacity: 0,
            animation: `driftDiamond ${d.duration} ${d.delay} linear infinite`,
          }}
        />
      ))}
    </div>
  )
}
