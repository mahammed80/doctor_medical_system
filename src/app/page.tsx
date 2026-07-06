'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ARTICLES } from '@/lib/articles'
import { getDoctorSettings, type DoctorScheduleSettings } from '@/lib/consultationService'
import { useLanguage } from '@/context/LanguageContext'

/* ── DATA ── */



/* ── COMPONENTS ── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em',
      color: 'var(--primary)',
      padding: '0.35rem 1rem', borderRadius: '9999px',
      border: '1px solid var(--border-accent)',
      background: 'var(--primary-subtle)', marginBottom: '1.25rem',
    }}>
      <span style={{ fontSize: '0.55rem' }}>◇</span>
      {children}
    </div>
  )
}

function SectionDivider() {
  return (
    <div className="section-divider">
      <span className="diamond" />
      <span className="diamond" style={{ width: '6px', height: '6px', opacity: 0.25 }} />
      <span className="diamond" />
    </div>
  )
}

function ScrollReveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setVisible(true), delay); observer.disconnect() } },
      { threshold: 0.08 }
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

function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
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
      { threshold: 0.5 }
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
      if (current >= end) { current = end; clearInterval(interval) }
      const numStr = current.toLocaleString('en-US')
      el.textContent = numStr + suffix
    }, 25)
    return () => clearInterval(interval)
  }, [started, end, suffix])

  return <span ref={ref} style={{ fontFamily: 'var(--font-inter), sans-serif' }}>0{suffix}</span>
}

const ORB_COLORS = [
  'radial-gradient(circle, oklch(38% 0.11 150 / 0.12) 0%, transparent 70%)',
  'radial-gradient(circle, oklch(68% 0.17 70 / 0.08) 0%, transparent 70%)',
  'radial-gradient(circle, oklch(38% 0.11 150 / 0.06) 0%, transparent 70%)',
]

function FloatingOrbs() {
  const orbs = [
    { size: '400px', top: '10%', right: '-5%', anim: 'floatOrb 18s ease-in-out infinite', color: ORB_COLORS[0] },
    { size: '300px', top: '50%', left: '-8%', anim: 'floatOrb2 22s ease-in-out infinite', color: ORB_COLORS[1] },
    { size: '200px', top: '70%', right: '15%', anim: 'floatOrb 15s ease-in-out infinite reverse', color: ORB_COLORS[2] },
    { size: '500px', top: '-15%', left: '20%', anim: 'floatOrb2 25s ease-in-out infinite', color: ORB_COLORS[0] },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {orbs.map((orb, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: orb.size,
          height: orb.size,
          top: orb.top,
          [orb.left ? 'left' : 'right']: orb.left || orb.right,
          borderRadius: '50%',
          background: orb.color,
          animation: orb.anim,
          willChange: 'transform',
        }} />
      ))}
    </div>
  )
}

function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!ref.current) return
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      ref.current.style.background = `radial-gradient(600px at ${x * 100}% ${y * 100}%, oklch(38% 0.11 150 / 0.04) 0%, transparent 70%)`
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  return (
    <div ref={ref} style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
      transition: 'background 0.4s',
    }} />
  )
}

function DiamondShower() {
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
  )
}

/* ── PAGE ── */

export default function Home() {
  const { t, isRtl, lang } = useLanguage()
  const [docSettings, setDocSettings] = useState<DoctorScheduleSettings | null>(null)

  useEffect(() => {
    getDoctorSettings('khalid').then(setDocSettings)
  }, [])

  const stats = [
    { num: t('stat_experience_num'), label: t('stat_experience_label'), desc: t('stat_experience_desc') },
    { num: t('stat_online_num'), label: t('stat_online_label'), desc: t('stat_online_desc') },
    { num: t('stat_satisfaction_num'), label: t('stat_satisfaction_label'), desc: t('stat_satisfaction_desc') },
  ]

  const steps = [
    { step: '01', title: t('step1_title'), desc: t('step1_desc') },
    { step: '02', title: t('step2_title'), desc: t('step2_desc') },
    { step: '03', title: t('step3_title'), desc: t('step3_desc') },
    { step: '04', title: t('step4_title'), desc: t('step4_desc') },
  ]

  const services = [
    {
      title: t('pkg_basic_title'),
      price: '799',
      period: t('currency_sar'),
      desc: t('pkg_basic_desc'),
      features: [
        t('pkg_basic_f1'),
        t('pkg_basic_f2'),
        t('pkg_basic_f3'),
        t('pkg_basic_f4'),
        t('pkg_basic_f5'),
      ],
      popular: false,
    },
    {
      title: t('pkg_comprehensive_title'),
      price: '1,700',
      period: t('currency_sar'),
      desc: t('pkg_comprehensive_desc'),
      features: [
        t('pkg_comprehensive_f1'),
        t('pkg_comprehensive_f2'),
        t('pkg_comprehensive_f3'),
        t('pkg_comprehensive_f4'),
        t('pkg_comprehensive_f5'),
      ],
      popular: true,
    },
    {
      title: t('pkg_followup_title'),
      price: '2,500',
      period: t('currency_sar'),
      desc: t('pkg_followup_desc'),
      features: [
        '',
        '',
        t('pkg_followup_f3'),
        t('pkg_followup_f4'),
        t('pkg_followup_f5'),
      ],
      popular: false,
    },
  ]

  const features = [
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
      title: t('why_f1_title'),
      desc: t('why_f1_desc'),
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
      title: t('why_f2_title'),
      desc: t('why_f2_desc'),
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
      title: t('why_f3_title'),
      desc: t('why_f3_desc'),
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="14" y2="11" /></svg>,
      title: t('why_f4_title'),
      desc: t('why_f4_desc'),
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></svg>,
      title: t('why_f5_title'),
      desc: t('why_f5_desc'),
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
      title: t('why_f6_title'),
      desc: t('why_f6_desc'),
    },
  ]

  const faqs = [
    { q: t('faq_1_q'), a: t('faq_1_a') },
    { q: t('faq_2_q'), a: '' },
    { q: t('faq_3_q'), a: t('faq_3_a') },
    { q: t('faq_4_q'), a: t('faq_4_a') },
    { q: t('faq_5_q'), a: t('faq_5_a') },
  ]

  const testimonials = [
    { text: t('test_1_text'), name: t('test_1_name'), title: t('test_1_title') },
    { text: t('test_2_text'), name: t('test_2_name'), title: t('test_2_title') },
    { text: t('test_3_text'), name: t('test_3_name'), title: t('test_3_title') },
  ]

  const qualifications = [
    { year: '1991', title: t('qual_1991_title'), inst: t('qual_1991_inst') },
    { year: '2012', title: t('qual_2012_title'), inst: t('qual_2012_inst') },
    { year: '2020', title: t('qual_2020_title'), inst: t('qual_2020_inst') },
    { year: '2026', title: t('qual_2026_title'), inst: t('qual_2026_inst') },
  ]

  const dynamicServices = services.map((svc, idx) => {
    if (!docSettings) return svc
    if (idx === 0 && docSettings.consultationPrice != null) {
      return { ...svc, price: docSettings.consultationPrice.toLocaleString('en-US') }
    }
    if (idx === 1 && docSettings.comprehensivePrice != null) {
      return { ...svc, price: docSettings.comprehensivePrice.toLocaleString('en-US') }
    }
    if (idx === 2) {
      const promo = docSettings.packagePricePromo ?? 2500
      const p3 = docSettings.packagePrice3 ?? 2000
      const p4 = docSettings.packagePrice4 ?? 3400
      return {
        ...svc,
        price: promo.toLocaleString('en-US'),
        features: [
          t('pkg_followup_f1_template').replace('{p3}', p3.toLocaleString('en-US')),
          t('pkg_followup_f2_template').replace('{p4}', p4.toLocaleString('en-US')),
          ...svc.features.slice(2),
        ]
      }
    }
    return svc
  })

  const dynamicFaqs = faqs.map((faq) => {
    if (!docSettings) return faq
    if (faq.q === t('faq_2_q')) {
      const p1 = docSettings.consultationPrice ?? 799
      const p2 = docSettings.comprehensivePrice ?? 1700
      const p3 = docSettings.packagePrice3 ?? 2000
      return {
        ...faq,
        a: t('faq_2_a_template')
          .replace('{p1}', p1.toLocaleString('en-US'))
          .replace('{p2}', p2.toLocaleString('en-US'))
          .replace('{p3}', p3.toLocaleString('en-US'))
      }
    }
    return faq
  })

  return (
    <main
      style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}
    >
      <div className="geo-bg" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <MouseGlow />

      {/* ── HERO ── */}
      <section id="hero-section" className="section-py-hero" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '85%',
          background: 'linear-gradient(170deg, oklch(99.5% 0.001 85) 0%, var(--bg) 60%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <div className="hero-grid" style={{
            alignItems: 'stretch',
          }}>
            {/* Hero Text */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em',
                color: 'var(--primary)',
                padding: '0.35rem 0.85rem', borderRadius: '6px',
                border: '1px solid var(--border-accent)',
                background: 'oklch(38% 0.11 150 / 0.05)', marginBottom: '2rem',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'inline-block',
                }} />
                {t('hero_badge')}
              </div>

              <h1 className="anim-fade-1" style={{
                fontSize: 'clamp(2.5rem, 5.5vw, 4.1rem)',
                fontWeight: 'normal',
                fontFamily: 'var(--font-display), serif',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: 'var(--fg)',
                marginBottom: '1.5rem',
              }}>
                {t('hero_title_dr')}{' '}
                <br />
                <span style={{
                  fontFamily: 'var(--font-body), sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(1.8rem, 3.8vw, 2.5rem)',
                  background: 'linear-gradient(135deg, var(--primary) 0%, oklch(44% 0.12 150) 50%, var(--primary-down) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  backgroundSize: '200% 200%',
                  animation: 'shimmer 4s ease-in-out infinite',
                  display: 'block',
                  paddingTop: '10px',
                }}>
                  {t('hero_title_title')}
                </span>
                <span style={{
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)',
                  fontWeight: 500,
                  color: 'var(--fg-muted)',
                  display: 'block',
                  marginTop: '0.75rem',
                  lineHeight: 1.6,
                  letterSpacing: '-0.01em',
                }}>
                  {t('hero_title_sub')}
                </span>
              </h1>

              <p className="anim-fade-2" style={{
                fontSize: '1.05rem',
                color: 'var(--fg-muted)',
                lineHeight: 1.9,
                marginBottom: '2.5rem',
                maxWidth: '540px',
              }}>
                {t('hero_para')}
              </p>

              <div className="anim-fade-2" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Link href="/consultation/new" className="btn-primary btn-primary-shimmer" style={{
                  fontSize: '1.1rem',
                  padding: '1.1rem 2.8rem',
                  gap: '0.75rem',
                  borderRadius: 'var(--r-lg)',
                }}>
                  {t('hero_btn_start')}
                  <span style={{ fontSize: '1.2rem', lineHeight: 1, display: 'inline-block', transform: 'translateX(0)', transition: 'transform 200ms' }}
                  >{isRtl ? '←' : '→'}</span>
                </Link>
                <Link href="#about-section" className="btn-ghost" style={{ fontSize: '0.95rem', padding: '0.9rem 1.75rem' }}>
                  {t('hero_btn_about')}
                </Link>
              </div>


            </div>

            {/* Doctor Photo Column */}
            <div className="anim-scale" style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div className="photo-frame" style={{
                width: '100%',
                maxWidth: '480px',
                aspectRatio: '1024/876',
                position: 'relative',
                boxShadow: 'var(--shadow-xl)',
                transform: 'perspective(1000px) rotateY(-2deg)',
                transition: 'transform 500ms var(--ease-out)',
              }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'perspective(1000px) rotateY(0deg)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'perspective(1000px) rotateY(-2deg)'}
              >
                <div style={{
                  position: 'absolute', inset: 2,
                  background: 'linear-gradient(180deg, transparent 40%, oklch(15% 0.01 150 / 0.35) 100%)',
                  pointerEvents: 'none', zIndex: 2, borderRadius: 'var(--radius-xl)',
                }} />
                
                <Image
                  src="/doctor_centered_landscape.jpg"
                  alt="د. خالد بترجي"
                  fill
                  sizes="(max-width: 900px) 100vw, 480px"
                  style={{ objectFit: 'cover', objectPosition: 'center', scale: '1.02', borderRadius: 'var(--radius-xl)' }}
                  priority
                />

                <div style={{
                  position: 'absolute', bottom: 2, left: 2, right: 2, height: '4px',
                  background: 'linear-gradient(90deg, var(--gold) 0%, oklch(68% 0.17 70 / 0.4) 50%, var(--primary) 100%)',
                  zIndex: 3, borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
                }} />
                
                {/* Decorative gold corner accents */}
                <div style={{
                  position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 3,
                  width: '20px', height: '20px',
                  borderTop: '2px solid var(--gold)',
                  borderRight: '2px solid var(--gold)',
                  opacity: 0.4,
                  borderRadius: '0 4px 0 0',
                }} />
                <div style={{
                  position: 'absolute', bottom: '1.25rem', left: '1.25rem', zIndex: 3,
                  width: '20px', height: '20px',
                  borderBottom: '2px solid var(--gold)',
                  borderLeft: '2px solid var(--gold)',
                  opacity: 0.4,
                  borderRadius: '0 0 0 4px',
                }} />

                {/* Floating Profile Card */}
                <div className="doctor-glass-card" style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '1.5rem',
                  right: '1.5rem',
                  textAlign: 'center',
                  padding: '1.1rem 1.5rem',
                  borderRadius: 'var(--r-lg)',
                  zIndex: 4,
                }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--fg)' }}>{t('hero_title_dr')}</div>
                  <div style={{
                    fontSize: '0.82rem', color: 'var(--fg-muted)', marginTop: '0.2rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: 'var(--ok)', display: 'inline-block',
                      animation: 'pulse-soft 2s ease-in-out infinite',
                      boxShadow: '0 0 6px var(--ok-soft)',
                    }} />
                    {t('hero_status_online')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HERO STATS SECTION ── */}
      <section className="section-py-stats" style={{ position: 'relative', zIndex: 3 }}>
        <div className="container">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 p-6 sm:p-8 md:p-12" style={{
              background: 'var(--surface)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
            }}>
              {stats.map(({ num, label, desc }, idx) => (
                <div key={label}
                  className="flex flex-col items-center text-center pb-8 last:pb-0 md:pb-0 md:pl-10 border-b last:border-b-0 md:border-b-0 md:border-l border-[var(--border-faint)] last:border-l-0"
                  style={{ position: 'relative' }}
                >
                  <div className="num" style={{
                    fontSize: 'clamp(3.5rem, 6vw, 4.8rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--gold) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1.0,
                    marginBottom: '0.75rem',
                    fontFamily: 'var(--font-inter), sans-serif',
                  }}>
                    {num}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--fg)', marginBottom: '0.35rem' }}>{label}</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--fg-muted)', lineHeight: 1.4, maxWidth: '280px' }}>{desc}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── EXPERTISE BAR ── */}
      <section className="section-pb-expertise" style={{ position: 'relative', zIndex: 2 }}>
        <div className="container">
          <ScrollReveal>
            <div className="p-4 sm:p-6 md:p-8 md:px-10" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem 3rem',
              background: 'var(--surface)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
            }}>
              {[t('exp_joints'), t('exp_scopes'), t('exp_pain'), t('exp_rehab'), t('exp_online')].map((item, i) => (
                <div key={item} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.85rem', fontWeight: 600,
                  color: 'var(--fg-muted)',
                  transition: 'color 200ms',
                }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: i === 0 ? 'var(--primary)' : 'var(--gold)',
                    flexShrink: 0,
                    animation: i === 0 ? 'shimmerGlow 3s ease-in-out infinite' : 'none',
                  }} />
                  {item}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider />

      {/* ── ACHIEVEMENT COUNTERS ── */}
      <section className="section-py-counters" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, transparent 0%, oklch(97% 0.008 85) 50%, transparent 100%)',
        }} />
        <div className="container" style={{ position: 'relative' }}>
          <ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 p-6 sm:p-8 md:p-12" style={{
              background: 'var(--surface)',
              backdropFilter: 'blur(24px)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
            }}>
              {[
                { end: 1500, label: t('counter_patients_label'), suffix: '+', sub: t('counter_patients_sub') },
                { end: 35, label: t('counter_experience_label'), suffix: '+', sub: t('counter_experience_sub') },
                { end: 98, label: t('counter_satisfaction_label'), suffix: isRtl ? '٪' : '%', sub: t('counter_satisfaction_sub') },
                { end: 24, label: t('counter_response_label'), suffix: '', sub: t('counter_response_sub') },
              ].map((c, i) => (
                <div key={c.label} style={{
                  textAlign: 'center',
                  padding: '1rem',
                  animation: `counterPop 0.5s var(--ease-out) ${0.15 * i}s both`,
                }}>
                  <div className="num" style={{
                    fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--gold) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '0.4rem',
                    lineHeight: 1.1,
                  }}>
                    <AnimatedCounter end={c.end} suffix={c.suffix} />
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--fg)', marginBottom: '0.15rem' }}>{c.label}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--fg-muted)', lineHeight: 1.4 }}>{c.sub}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider />

      {/* ── DOCTOR QUALIFICATIONS ── */}
      <section id="about-section" className="section-py-about" style={{ position: 'relative', zIndex: 2 }}>
        <div className="container">
          <div className="about-grid" style={{
            alignItems: 'center',
          }}>
            <ScrollReveal>
              <div>
                <SectionLabel>{t('qual_label')}</SectionLabel>
                <h2 style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg)',
                  marginBottom: '1rem',
                  lineHeight: 1.15,
                }}>
                  {isRtl ? (
                    <>خبرة تمتد لأكثر من <span style={{ color: 'var(--primary)' }}>ثلاثة عقود</span></>
                  ) : (
                    <>Experience extending over <span style={{ color: 'var(--primary)' }}>three decades</span></>
                  )}
                </h2>
                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--fg-muted)',
                  lineHeight: 1.9,
                  marginBottom: '2.5rem',
                }}>
                  {t('qual_desc')}
                </p>
                <Link href="/consultation/new" className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.85rem 1.75rem' }}>
                  {t('qual_btn')}
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {qualifications.map(q => (
                  <div key={q.title} style={{
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'flex-start',
                    padding: '1.25rem 1.5rem',
                    background: 'var(--surface)',
                    borderRadius: 'var(--r-lg)',
                    border: '1px solid var(--border-faint)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 300ms var(--ease-spring), box-shadow 300ms',
                    cursor: 'default',
                  }}
                    onMouseOver={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(-6px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
                    }}
                    onMouseOut={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-faint)';
                    }}
                  >
                    <div style={{
                      minWidth: '3.5rem', textAlign: 'center',
                      padding: '0.35rem 0.5rem',
                      background: 'var(--primary-subtle)',
                      borderRadius: 'var(--r)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: 'var(--primary)',
                      fontFamily: 'var(--font-inter), sans-serif',
                    }}>
                      {q.year}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--fg)', marginBottom: '0.15rem' }}>{q.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--fg-dim)' }}>{q.inst}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── HOW IT WORKS ── */}
      <section id="steps-section" className="section-py-steps" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, transparent 0%, oklch(97% 0.008 85) 50%, transparent 100%)',
        }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <ScrollReveal>
            <SectionLabel>{t('steps_label')}</SectionLabel>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 'normal',
              fontFamily: 'var(--font-display), serif',
              letterSpacing: '-0.02em',
              color: 'var(--fg)',
              marginBottom: '0.75rem',
            }}>
              {t('steps_title')}
            </h2>
            <p style={{
              fontSize: '1.05rem',
              color: 'var(--fg-muted)',
              maxWidth: '520px',
              margin: '0 auto 4rem',
              lineHeight: 1.8,
            }}>
              {t('steps_subtitle')}
            </p>
          </ScrollReveal>

          <div className="steps-grid" style={{
            position: 'relative',
          }}>
            <div className="hidden md:block" style={{
              position: 'absolute', top: '2.5rem', left: 'calc(12.5% + 1.5rem)',
              right: 'calc(12.5% + 1.5rem)', height: '2px',
              background: `linear-gradient(${isRtl ? '270deg' : '90deg'}, var(--primary) 0%, var(--border) 50%, var(--border) 100%)`,
              zIndex: 0,
            }} />

            {steps.map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 100}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1.5rem',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  <div style={{
                    width: '5rem', height: '5rem',
                    borderRadius: '50%',
                    background: i === 0 ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)' : 'var(--surface)',
                    border: i === 0 ? 'none' : '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: i === 0 ? 'white' : 'var(--fg-dim)',
                    boxShadow: i === 0 ? '0 8px 24px oklch(38% 0.11 150 / 0.15)' : 'var(--shadow-sm)',
                    transition: 'all 400ms var(--ease-spring)',
                    position: 'relative',
                    fontFamily: 'var(--font-inter), sans-serif',
                  }}
                    onMouseOver={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'scale(1.08)'
                      if (i !== 0) { el.style.borderColor = 'var(--primary)'; el.style.color = 'var(--primary)'; el.style.boxShadow = 'var(--shadow-md)' }
                    }}
                    onMouseOut={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'scale(1)'
                      if (i !== 0) { el.style.borderColor = 'var(--border)'; el.style.color = 'var(--fg-dim)'; el.style.boxShadow = 'var(--shadow-sm)' }
                    }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--fg)', marginBottom: '0.35rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--fg-dim)', lineHeight: 1.7, maxWidth: '220px', margin: '0 auto' }}>{item.desc}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── SERVICES ── */}
      <section id="services-section" className="section-py-services" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
          background: 'linear-gradient(180deg, var(--bg) 0%, oklch(97% 0.008 85) 50%, var(--bg) 100%)',
        }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <ScrollReveal>
            <SectionLabel>{t('pricing_label')}</SectionLabel>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 'normal',
              fontFamily: 'var(--font-display), serif',
              letterSpacing: '-0.02em',
              color: 'var(--fg)',
              marginBottom: '0.75rem',
            }}>
              {t('pricing_title')}
            </h2>
            <p style={{
              fontSize: '1.05rem',
              color: 'var(--fg-muted)',
              maxWidth: '520px',
              margin: '0 auto 4rem',
              lineHeight: 1.8,
            }}>
              {t('pricing_subtitle')}
            </p>
          </ScrollReveal>

          <div className="services-grid">
            {dynamicServices.map((svc, i) => (
              <ScrollReveal key={svc.title} delay={i * 100}>
                <div className="p-6 sm:p-8 md:p-10 xl:p-12" style={{
                  background: 'var(--surface)',
                  backdropFilter: 'blur(16px)',
                  border: svc.popular ? '1px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: svc.popular ? '0 20px 50px oklch(38% 0.11 150 / 0.08), 0 2px 12px oklch(38% 0.11 150 / 0.03), inset 0 1px 0 oklch(100% 0 0 / 0.7)' : 'var(--shadow-lg)',
                  textAlign: isRtl ? 'right' : 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 400ms var(--ease-out)',
                }}
                  onMouseOver={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-6px)'
                    el.style.boxShadow = svc.popular 
                      ? '0 30px 60px oklch(38% 0.11 150 / 0.12), 0 2px 16px oklch(38% 0.11 150 / 0.04)' 
                      : 'var(--shadow-xl)'
                    if (!svc.popular) el.style.borderColor = 'var(--border-accent)'
                  }}
                  onMouseOut={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'none'
                    el.style.boxShadow = svc.popular 
                      ? '0 20px 50px oklch(38% 0.11 150 / 0.08), 0 2px 12px oklch(38% 0.11 150 / 0.03), inset 0 1px 0 oklch(100% 0 0 / 0.7)' 
                      : 'var(--shadow-lg)'
                    if (!svc.popular) el.style.borderColor = 'var(--border)'
                  }}
                >
                  {/* Gold decorative corner */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: isRtl ? '1rem' : 'auto',
                    left: !isRtl ? '1rem' : 'auto',
                    width: '24px',
                    height: '24px',
                    borderTop: svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)',
                    borderRight: isRtl ? (svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)') : 'none',
                    borderLeft: !isRtl ? (svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)') : 'none',
                    borderRadius: isRtl ? '0 6px 0 0' : '6px 0 0 0',
                    opacity: svc.popular ? 0.5 : 0.15,
                    pointerEvents: 'none',
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: isRtl ? '1rem' : 'auto',
                    right: !isRtl ? '1rem' : 'auto',
                    width: '24px',
                    height: '24px',
                    borderBottom: svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)',
                    borderLeft: isRtl ? (svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)') : 'none',
                    borderRight: !isRtl ? (svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)') : 'none',
                    borderRadius: isRtl ? '0 0 0 6px' : '0 0 6px 0',
                    opacity: svc.popular ? 0.5 : 0.15,
                    pointerEvents: 'none',
                  }} />

                  {svc.popular && (
                    <>
                      <div style={{
                        position: 'absolute', top: '1.5rem', left: '-2.75rem',
                        transform: 'rotate(-45deg)',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)',
                        color: 'white', fontSize: '0.65rem', fontWeight: 700,
                        padding: '0.25rem 3.5rem', letterSpacing: '0.08em',
                      }}>
                        {t('pkg_popular')}
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: isRtl ? 0 : 'auto',
                        left: !isRtl ? 0 : 'auto',
                        width: '120px',
                        height: '120px',
                        background: `radial-gradient(circle at top ${isRtl ? 'right' : 'left'}, oklch(38% 0.11 150 / 0.06), transparent 70%)`,
                        pointerEvents: 'none',
                      }} />
                    </>
                  )}
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)',
                    marginBottom: '0.5rem', letterSpacing: '0.05em',
                  }}>
                    {svc.popular ? t('pkg_advanced_label') : t('pkg_basic_label')}
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--fg)', marginBottom: '0.3rem' }}>{svc.title}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1rem', direction: 'ltr' }}>
                    <span className="num" style={{
                      fontSize: '2.8rem', fontWeight: 900,
                      letterSpacing: '-0.03em',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      fontFamily: 'var(--font-inter), sans-serif',
                    }}>{svc.price}</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--fg-dim)', fontWeight: 600 }}>{svc.period}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{svc.desc}</p>
                  <div style={{ borderTop: '1px solid var(--border-faint)', paddingTop: '1.25rem', marginBottom: '1.75rem' }}>
                    {svc.features.map((f) => (
                      <div key={f} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                        fontSize: '0.82rem', color: 'var(--fg-muted)',
                        padding: '0.35rem 0',
                      }}>
                        <span style={{ color: svc.popular ? 'var(--primary)' : 'var(--gold)', fontSize: '0.6rem', marginTop: '0.3rem' }}>◈</span>
                        {f}
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/consultation/new"
                    className={svc.popular ? 'btn-primary' : 'btn-ghost'}
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem', padding: '0.9rem' }}
                  >
                    {svc.popular ? t('pkg_btn_book') : t('pkg_btn_choose')}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── WHY CHOOSE US ── */}
      <section className="section-py-why" style={{ position: 'relative', zIndex: 2 }}>
        <div className="container">
          <div className="features-grid">
            <div className="features-copy">
              <ScrollReveal>
                <SectionLabel>{t('why_label')}</SectionLabel>
                <h2 style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                  fontWeight: 'normal',
                  fontFamily: 'var(--font-display), serif',
                  letterSpacing: '-0.02em',
                  color: 'var(--fg)',
                  marginBottom: '1rem',
                  lineHeight: 1.15,
                }}>
                  {t('why_title')}
                </h2>
                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--fg-muted)',
                  lineHeight: 1.9,
                  marginBottom: '2.5rem',
                }}>
                  {t('why_desc')}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link href="/consultation/new" className="btn-primary" style={{ fontSize: '0.95rem', padding: '0.9rem 2rem' }}>
                    ابدأ الآن
                  </Link>
                </div>

                <div className="mini-stats grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6" style={{
                  marginTop: '3rem',
                }}>
                  {[
                    { num: '1,500+', label: 'مريض' },
                    { num: '98%', label: 'رضا المرضى' },
                    { num: '24', label: 'ساعة للرد' },
                  ].map((s) => (
                    <div key={s.label} style={{
                      padding: '1.25rem', textAlign: 'center',
                      background: 'var(--surface)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 300ms var(--ease-out)',
                    }}
                      onMouseOver={e => {
                        const el = e.currentTarget as HTMLElement
                        el.style.transform = 'translateY(-4px)'
                        el.style.borderColor = 'var(--border-accent)'
                        el.style.boxShadow = 'var(--shadow-md)'
                      }}
                      onMouseOut={e => {
                        const el = e.currentTarget as HTMLElement
                        el.style.transform = 'none'
                        el.style.borderColor = 'var(--border)'
                        el.style.boxShadow = 'var(--shadow-sm)'
                      }}
                    >
                      <div className="num" style={{
                        fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)',
                        marginBottom: '0.15rem',
                        fontFamily: 'var(--font-inter), sans-serif',
                      }}>{s.num}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--fg-dim)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            <div className="features-cards">
              {features.map((f, i) => (
                <ScrollReveal key={f.title} delay={(i % 4) * 80}>
                  <div style={{
                    padding: '1.5rem',
                    background: 'var(--surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 400ms var(--ease-out)',
                    cursor: 'default',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                    onMouseOver={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'translateY(-4px)'
                      el.style.boxShadow = 'var(--shadow-xl)'
                      el.style.borderColor = 'var(--border-accent)'
                    }}
                    onMouseOut={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'none'
                      el.style.boxShadow = 'var(--shadow-md)'
                      el.style.borderColor = 'var(--border)'
                    }}
                  >
                    {/* Hover shimmer overlay */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'linear-gradient(135deg, transparent 0%, var(--primary-subtle) 50%, transparent 100%)',
                      opacity: 0,
                      transition: 'opacity 500ms',
                      pointerEvents: 'none',
                      borderRadius: 'var(--r-lg)',
                    }}
                      onMouseOver={e => (e.currentTarget.style.opacity = '1')}
                      onMouseOut={e => (e.currentTarget.style.opacity = '0')}
                    />
                    <div style={{
                      width: '2.75rem', height: '2.75rem',
                      borderRadius: 'var(--r)',
                      background: 'linear-gradient(135deg, var(--primary-subtle) 0%, oklch(38% 0.11 150 / 0.08) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--primary)',
                      marginBottom: '0.75rem',
                      position: 'relative',
                    }}>
                      {f.icon}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--fg)', marginBottom: '0.3rem', position: 'relative' }}>{f.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--fg-dim)', lineHeight: 1.7, position: 'relative' }}>{f.desc}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials-section" className="section-py-testimonials" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, var(--bg) 0%, oklch(97% 0.008 85) 50%, var(--bg) 100%)',
        }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <ScrollReveal>
            <SectionLabel>{t('test_label')}</SectionLabel>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 'normal',
              fontFamily: 'var(--font-display), serif',
              letterSpacing: '-0.02em',
              color: 'var(--fg)',
              marginBottom: '3rem',
            }}>
              {t('test_title')}
            </h2>
          </ScrollReveal>

          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 120}>
                <div className="testimonial-card p-6 sm:p-8 lg:p-10" style={{
                  background: 'var(--surface)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-md)',
                  textAlign: isRtl ? 'right' : 'left',
                  position: 'relative',
                  transition: 'all 450ms var(--ease-out)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
                  onMouseOver={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-5px)'
                    el.style.boxShadow = 'var(--shadow-xl)'
                    el.style.borderColor = 'var(--border-accent)'
                  }}
                  onMouseOut={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'none'
                    el.style.boxShadow = 'var(--shadow-md)'
                    el.style.borderColor = 'var(--border)'
                  }}
                >
                  {/* Gold accent top border */}
                  <div style={{
                    position: 'absolute', top: 0, left: '20%', right: '20%',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
                    opacity: 0.3,
                    pointerEvents: 'none',
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: isRtl ? '1.5rem' : 'auto',
                    right: !isRtl ? '1.5rem' : 'auto',
                    fontSize: '4rem', lineHeight: 0.8,
                    color: 'var(--primary-soft)',
                    fontWeight: 900,
                    fontFamily: 'serif',
                    opacity: 0.5,
                  }}>
                    &quot;
                  </div>
                  <p className="testimonial-text" style={{
                    fontSize: '0.9rem',
                    color: 'var(--fg-muted)',
                    lineHeight: 1.9,
                    marginBottom: '1.5rem',
                    position: 'relative',
                    zIndex: 1,
                    flex: '1 1 auto',
                  }}>
                    {t.text}
                  </p>
                  <div className="testimonial-author" style={{
                    borderTop: '1px solid var(--border-faint)',
                    paddingTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginTop: 'auto',
                  }}>
                    <div className="testimonial-avatar" style={{
                      width: '2.75rem', height: '2.75rem',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      flexShrink: 0,
                    }}>
                      {t.name.charAt(0)}
                    </div>
                    <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                      <div className="testimonial-name" style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--fg)' }}>{t.name}</div>
                      <div className="testimonial-title" style={{ fontSize: '0.72rem', color: 'var(--fg-dim)' }}>{t.title}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── HEALTH RESOURCES ── */}
      <section className="section-py-lib" style={{ position: 'relative', zIndex: 2 }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center' }}>
              <SectionLabel>{t('lib_label')}</SectionLabel>
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--fg)',
                marginBottom: '0.75rem',
              }}>
                {t('lib_title')}
              </h2>
              <p style={{
                fontSize: '1.05rem',
                color: 'var(--fg-muted)',
                maxWidth: '520px',
                margin: '0 auto 4rem',
                lineHeight: 1.8,
              }}>
                {t('lib_desc')}
              </p>
            </div>
          </ScrollReveal>

          <div className="articles-grid">
            {ARTICLES.map((r, i) => {
              const art = lang === 'ar' ? r.ar : r.en
              return (
                <ScrollReveal key={r.slug} delay={i * 100}>
                  <Link href={`/articles/${r.slug}`} className="p-6 sm:p-8" style={{
                    display: 'block',
                    textDecoration: 'none',
                    background: 'var(--surface)',
                    borderRadius: 'var(--r-xl)',
                    border: '1px solid var(--border-faint)',
                    boxShadow: 'var(--shadow-sm)',
                    textAlign: isRtl ? 'right' : 'left',
                    transition: 'transform 350ms var(--ease-spring), box-shadow 350ms, border-color 350ms',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                    onMouseOver={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'translateY(-6px)'
                      el.style.boxShadow = 'var(--shadow-md)'
                      el.style.borderColor = 'var(--border-accent)'
                    }}
                    onMouseOut={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'translateY(0)'
                      el.style.boxShadow = 'var(--shadow-sm)'
                      el.style.borderColor = 'var(--border-faint)'
                    }}
                  >
                    <div style={{
                      fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)',
                      padding: '0.2rem 0.75rem',
                      borderRadius: '9999px',
                      border: '1px solid var(--border-accent)',
                      background: 'var(--primary-subtle)',
                      display: 'inline-block',
                      marginBottom: '1rem',
                    }}>
                      {art.tag}
                    </div>
                    <div style={{
                      fontSize: '1rem', fontWeight: 800, color: 'var(--fg)',
                      marginBottom: '0.5rem', lineHeight: 1.4,
                    }}>
                      {art.title}
                    </div>
                    <p style={{
                      fontSize: '0.82rem', color: 'var(--fg-muted)',
                      lineHeight: 1.7, marginBottom: '1.25rem',
                    }}>
                      {art.summary}
                    </p>
                    <div style={{
                      fontSize: '0.72rem', color: 'var(--fg-dim)',
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontWeight: 700 }}>{art.readTime}</span> {t('read_time_suffix')}
                    </div>
                  </Link>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── FAQ ── */}
      <section id="faq-section" className="section-py-faq" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, transparent 0%, oklch(97% 0.008 85) 50%, transparent 100%)',
        }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="faq-grid">
            <ScrollReveal>
              <div className="faq-copy">
                <SectionLabel>{t('faq_label')}</SectionLabel>
                <h2 style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                  fontWeight: 'normal',
                  fontFamily: 'var(--font-display), serif',
                  letterSpacing: '-0.02em',
                  color: 'var(--fg)',
                  marginBottom: '1rem',
                  lineHeight: 1.15,
                }}>
                  {t('faq_title')}
                </h2>
                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--fg-muted)',
                  lineHeight: 1.8,
                }}>
                  {t('faq_desc')}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {dynamicFaqs.map(item => (
                  <details key={item.q} style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '0',
                    overflow: 'hidden',
                    transition: 'all 300ms var(--ease-out)',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <summary className="p-4 sm:p-5 md:p-6" style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: 'var(--fg)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      listStyle: 'none',
                    }}>
                      {item.q}
                      <span style={{
                        fontSize: '0.85rem',
                        color: 'var(--primary)',
                        transition: 'transform 300ms var(--ease-spring)',
                        flexShrink: 0,
                        fontWeight: 700,
                      }}>
                        +
                      </span>
                    </summary>
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 md:px-6 md:pb-6 pt-4" style={{
                      fontSize: '0.87rem',
                      color: 'var(--fg-muted)',
                      lineHeight: 1.9,
                      borderTop: '1px solid var(--border-faint)',
                      marginTop: '0',
                    }}>
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── FINAL CTA ── */}
      <section className="section-py-cta" style={{ position: 'relative', zIndex: 2 }}>
        <div className="container" style={{ position: 'relative' }}>
          <ScrollReveal>
            <div className="card-p-cta" style={{
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-up) 50%, oklch(32% 0.10 150) 100%)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 24px 70px oklch(38% 0.11 150 / 0.16)',
            }}>
              <div style={{
                position: 'absolute', top: '-40%', right: '-10%',
                width: '400px', height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, oklch(100% 0 0 / 0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
                animation: 'floatOrb 20s ease-in-out infinite',
              }} />
              <div style={{
                position: 'absolute', bottom: '-30%', left: '-5%',
                width: '300px', height: '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, oklch(100% 0 0 / 0.05) 0%, transparent 70%)',
                pointerEvents: 'none',
                animation: 'floatOrb2 25s ease-in-out infinite',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em',
                  color: 'oklch(100% 0 0 / 0.8)',
                  padding: '0.4rem 1.1rem', borderRadius: '9999px',
                  border: '1px solid oklch(100% 0 0 / 0.2)',
                  background: 'oklch(100% 0 0 / 0.08)',
                  marginBottom: '1.5rem',
                }}>
                  <span style={{ fontSize: '0.6rem', animation: 'pulse-soft 2s ease-in-out infinite' }}>◇</span>
                  {t('cta_badge')}
                </div>
                <h2 style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 900,
                  color: 'white',
                  lineHeight: 1.15,
                  marginBottom: '1rem',
                }}>
                  {t('cta_title')}
                </h2>
                <p style={{
                  fontSize: '1.05rem',
                  color: 'oklch(100% 0 0 / 0.75)',
                  lineHeight: 1.8,
                  maxWidth: '520px',
                  margin: '0 auto 2rem',
                }}>
                  {t('cta_desc')}
                </p>
                <Link
                  href="/consultation/new"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1.1rem 3rem',
                    borderRadius: 'var(--r-lg)',
                    background: 'white',
                    color: 'var(--primary)',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    fontFamily: 'var(--font-tajawal), sans-serif',
                    boxShadow: '0 4px 14px oklch(0% 0 0 / 0.15)',
                    transition: 'transform 300ms var(--ease-spring), box-shadow 300ms',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px oklch(0% 0 0 / 0.2)';
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px oklch(0% 0 0 / 0.15)';
                  }}
                >
                  {t('cta_btn')}
                  <span style={{ fontSize: '1.2rem', lineHeight: 1, display: 'inline-block', transition: 'transform 200ms' }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = isRtl ? 'translateX(-4px)' : 'translateX(4px)'}
                    onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'}
                  >{isRtl ? '←' : '→'}</span>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </main>
  )
}
