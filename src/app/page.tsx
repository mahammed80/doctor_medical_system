'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DOCTORS, Doctor } from '@/lib/doctors'

/* ── DATA ── */

const stats = [
  { num: '35+', label: 'سنة من الخبرة', desc: 'في جراحة العظام والمفاصل' },
  { num: '100%', label: 'استشارة أون لاين', desc: 'مرئية، آمنة ومريحة' },
  { num: '1,500+', label: 'مريض تم علاجهم', desc: 'بنسبة رضا تفوق 98%' },
]

const steps = [
  { step: '01', title: 'احجز الاستشارة', desc: 'اختر الباقة الطبية المناسبة لحالتك لبدء حجز موعدك' },
  { step: '02', title: 'سجّل بياناتك الطبية', desc: 'املأ معلوماتك الشخصية وارفع الأشعة والتحاليل في دقائق' },
  { step: '03', title: 'سدد الرسوم بأمان', desc: 'ادفع عبر بوابات الدفع الإلكتروني المعتمدة والسريعة' },
  { step: '04', title: 'احجز موعدك وتواصل', desc: 'اختر الموعد المناسب لجلستك المرئية المباشرة مع الطبيب' },
]

const services = [
  {
    title: 'الكشف الأساسي',
    price: '899',
    period: 'ريال',
    desc: 'جلسة استشارية شاملة لمدة 30 دقيقة مع الطبيب لتقييم حالتك وتشخيصها بدقة.',
    features: [
      'كشفية أساسية مع الاستشاري',
      'عرض وتحليل الأشعة والتحاليل',
      'تشخيص طبي دقيق للحالة',
      'مدة الجلسة: 30 دقيقة',
      'متابعة مجانية لمدة 10 أيام',
    ],
    popular: false,
  },
  {
    title: 'الكشف الشامل والخطة العلاجية',
    price: '1,700',
    period: 'ريال',
    desc: 'استشارة موسعة مع إعداد برنامج علاجي متكامل وتقييم الحاجة للجراحة.',
    features: [
      'كل ما في الباقة الأساسية',
      'إعداد برنامج علاجي متكامل',
      'تقييم الحاجة للجراحة',
      'مناقشة الخيارات البديلة والجراحية',
      'متابعة أولى مجانية بعد العملية',
    ],
    popular: true,
  },
  {
    title: 'باقات المتابعة المتعددة',
    price: '2,500',
    period: 'ريال',
    desc: 'جلسات متعددة بسعر مخفّض للمرضى المحتاجين لمتابعة مستمرة بعد العمليات.',
    features: [
      'باقة 3 جلسات — بقيمة 2,500 ريال',
      'باقة 4 جلسات — بقيمة 3,400 ريال',
      'توفير يصل إلى 200 ريال',
      'متابعة ما بعد الجراحة وإصابات الملاعب',
      'مرونة عالية في حجز المواعيد',
    ],
    popular: false,
  },
]

const features = [
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    title: 'نخبة من الاستشاريين',
    desc: 'جميع أطبائنا يحملون درجات البورد والزمالات الكندية والبريطانية مع خبرة طويلة.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    title: 'خصوصية تامة للملفات',
    desc: 'تشفير كامل لملفاتك وأشعاتك الطبية وفقاً لأعلى معايير الأمن السيبراني الطبية.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    title: 'جدولة مواعيد فورية',
    desc: 'اختر وقتك المناسب مباشرة من جدول الطبيب المتاح دون فترات انتظار.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="14" y2="11" /></svg>,
    title: 'دعم جميع الصيغ الطبية',
    desc: 'ارفع تقاريرك وأشعاتك بسهولة فائقة بمختلف الصيغ الطبية بما فيها ملفات DICOM.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></svg>,
    title: 'توصيل الوصفة للمنزل',
    desc: 'نوفر خدمة إرسال وصفتك الطبية المعتمدة رقمياً وتوصيل الأدوية مباشرة لباب بيتك.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
    title: 'بوابة دفع آمنة ومعتمدة',
    desc: 'خيارات دفع سعودية موثوقة تدعم بطاقات مدى، فيزا، ماستركارد، وأبل باي.',
  },
]

const faqs = [
  { q: 'كيف يمكنني حجز استشارة في مركز بترجي؟', a: 'العملية بسيطة للغاية وتستغرق أقل من 5 دقائق: اختر التخصص والطبيب المناسب لحالتك، املأ بياناتك الطبية وأرفق الأشعة إن وجدت، قم بسداد رسوم الاستشارة بأمان، ثم اختر الموعد المناسب لك من جدول الطبيب المباشر لتلقي رابط الجلسة المرئية.' },
  { q: 'ما هي تكلفة الاستشارة الطبية؟', a: 'تختلف التكلفة حسب مستوى الكشف المختار: الكشف الأساسي بقيمة 899 ريال، الكشف الشامل وإعداد الخطة العلاجية بقيمة 1,700 ريال، كما تتوفر باقات للمتابعات المتعددة تبدأ من 2,500 ريال لـ 3 جلسات.' },
  { q: 'هل يمكنني مراجعة الطبيب مجاناً بعد الجلسة؟', a: 'نعم، تشمل جميع الاستشارات الطبية كفترة مراجعة (متابعة مجانية) صالحة لمدة 10 أيام من تاريخ الجلسة الأساسية لمناقشة نتائج التحاليل أو تحديث خطة العلاج.' },
  { q: 'هل خدمة توصيل الأدوية متاحة لجميع المرضى؟', a: 'نعم، بعد استشارتك مع الطبيب، إذا قرر لك وصفة علاجية، يتم إرسالها لك إلكترونياً، ونوفر خيار توصيل الأدوية لباب منزلك بالتعاون مع كبرى الصيدليات المعتمدة.' },
  { q: 'كيف أرفع الفحوصات وصور الأشعة الخاصة بي؟', a: 'أثناء تعبئة نموذج الاستشارة، ستجد منطقة مخصصة لرفع الملفات، حيث يمكنك سحب وإفلات التقارير الطبية وصور الأشعة. يدعم نظامنا جميع الصيغ المعتمدة مثل PDF وJPG وPNG بالإضافة لصيغة DICOM للأشعات المتخصصة.' },
]

const testimonials = [
  { text: 'المركز يقدم رعاية ممتازة جداً ونخبة مميزة من الأطباء. استشرت د. خالد بترجي بخصوص عملية الركبة وكان تشخيصه دقيقاً جداً وأراحني كثيراً. وفر علي عناء السفر.', name: 'عبدالرحمن العتيبي', title: 'مريض — عيادة جراحة المفاصل' },
  { text: 'تجربة حجز سهلة وسريعة للغاية، والأروع هو إمكانية رفع الأشعة وملفات الرنين المغناطيسي لتقوم د. سارة المنصور بتحليلها ووصف العلاج المناسب لي دون الحاجة لمغادرة المنزل.', name: 'نورة الدوسري', title: 'مريضة — عيادة الروماتيزم' },
  { text: 'بعد إصابتي في الركبة، تواصلت مع د. ليلى العتيبي وأعدت لي برنامج تأهيل حركي منزلي رائع وتابعت معي خطوة بخطوة حتى عدت لممارسة الرياضة بشكل طبيعي.', name: 'فهد السبيعي', title: 'مريض — عيادة العلاج الطبيعي' },
]

const qualifications = [
  { year: '1991', title: 'تأسيس مركز بترجي الطبي', inst: 'رؤية لتقديم أفضل الخدمات الطبية التخصصية' },
  { year: '2012', title: 'إطلاق العيادات المتكاملة', inst: 'توسعة الأقسام لتشمل العمود الفقري والروماتيزم والتأهيل' },
  { year: '2020', title: 'التكامل الرقمي الكامل', inst: 'تحويل جميع الاستشارات إلى استشارات مرنية تفاعلية عن بعد' },
  { year: '2026', title: 'نظام الاستشارات المطور', inst: 'إطلاق المنصة الجديدة وتفعيل ميزات التخزين الطبي الآمن وتوصيل الأدوية' },
]

const resources = [
  { title: 'دليل المريض الشامل لجراحات المفاصل والمنظار', summary: 'كل ما تحتاج معرفته عن كيفية التحضير لعملية المنظار وما يمكن توقعه في مرحلة التعافي.', tag: 'جراحة العظام', readTime: '5' },
  { title: 'طرق التمييز بين آلام العضلات والروماتيزم', summary: 'دليل مبسط لمساعدتك في فهم طبيعة الألم ومتى يتعين عليك استشارة طبيب روماتيزم متخصص.', tag: 'الروماتيزم', readTime: '3' },
  { title: 'تمارين وقائية لتقوية أسفل الظهر وحماية العمود الفقري', summary: 'مجموعة من التمارين اليومية البسيطة التي تقي من الانزلاق الغضروفي وتخفف آلام الجلوس الطويل.', tag: 'العمود الفقري', readTime: '4' },
]

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
  'radial-gradient(circle, oklch(46% 0.19 260 / 0.12) 0%, transparent 70%)',
  'radial-gradient(circle, oklch(68% 0.17 70 / 0.08) 0%, transparent 70%)',
  'radial-gradient(circle, oklch(50% 0.15 155 / 0.06) 0%, transparent 70%)',
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
      ref.current.style.background = `radial-gradient(600px at ${x * 100}% ${y * 100}%, oklch(46% 0.19 260 / 0.04) 0%, transparent 70%)`
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
  return (
    <main
      style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}
    >
      <div className="geo-bg" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <FloatingOrbs />
      <DiamondShower />
      <MouseGlow />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 2, padding: '5rem 0 6rem' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '85%',
          background: 'linear-gradient(170deg, oklch(97% 0.008 85) 0%, var(--bg) 40%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <div className="hero-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '4rem',
            alignItems: 'stretch',
          }}>
            {/* Hero Text */}
            <div>
              <div className="anim-fade" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em',
                color: 'var(--gold)',
                padding: '0.45rem 1.25rem', borderRadius: '9999px',
                border: '1px solid oklch(68% 0.17 70 / 0.25)',
                background: 'var(--gold-soft)', marginBottom: '2rem',
                boxShadow: '0 0 20px var(--gold-glow)',
              }}>
                <span style={{
                  display: 'inline-block',
                  animation: 'pulse-soft 2s ease-in-out infinite',
                  fontSize: '0.7rem',
                }}>✦</span>
                مركز بترجي للاستشارات الطبية التخصصية
              </div>

              <h1 className="anim-fade-1" style={{
                fontSize: 'clamp(2.5rem, 5.5vw, 3.8rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                color: 'var(--fg)',
                marginBottom: '1.5rem',
              }}>
                استشارات د. خالد بترجي{' '}
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, oklch(55% 0.22 260) 50%, var(--primary-down) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  backgroundSize: '200% 200%',
                  animation: 'shimmer 4s ease-in-out infinite',
                  display: 'inline-block',
                  paddingTop: '5px',
                }}>
                  استشاري جراحة العظام والمفاصل
                </span>
                <span style={{
                  fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
                  fontWeight: 500,
                  color: 'var(--fg-muted)',
                  display: 'block',
                  marginTop: '0.75rem',
                  letterSpacing: '-0.01em',
                }}>
                  رعاية طبية فائقة لجراحات الركبة والمفاصل الصناعية والمناظير أونلاين من منزلك
                </span>
              </h1>

              <p className="anim-fade-2" style={{
                fontSize: '1.05rem',
                color: 'var(--fg-muted)',
                lineHeight: 1.9,
                marginBottom: '2.5rem',
                maxWidth: '540px',
              }}>
                أول منصة استشارات طبية متكاملة تجمع بين خبرة الاستشاريين وسهولة التقنية. احجز استشارتك المرئية في دقائق، وارفع فحوصاتك وتقاريرك بخصوصية تامة وتلقى التشخيص والخطة العلاجية من منزلك.
              </p>

              <div className="anim-fade-2" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Link href="/consultation/new" className="btn-primary" style={{
                  fontSize: '1.1rem',
                  padding: '1.1rem 2.8rem',
                  gap: '0.75rem',
                  borderRadius: 'var(--r-lg)',
                }}>
                  ابدأ الاستشارة الآن
                  <span style={{ fontSize: '1.2rem', lineHeight: 1, display: 'inline-block', transform: 'translateX(0)', transition: 'transform 200ms' }}
                  >←</span>
                </Link>
                <Link href="#about-section" className="btn-ghost" style={{ fontSize: '0.95rem', padding: '0.9rem 1.75rem' }}>
                  تعرّف على الدكتور
                </Link>
              </div>

              <div className="anim-fade-3 stats-inline" style={{
                marginTop: '4.5rem',
                display: 'flex',
                gap: '2.5rem',
                paddingTop: '2.5rem',
                borderTop: '1px solid var(--border-faint)',
              }}>
                {stats.map(({ num, label, desc }, idx) => (
                  <div key={label} style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1',
                    paddingRight: idx > 0 ? '2.5rem' : '0',
                    borderRight: idx > 0 ? '1px solid var(--border-faint)' : 'none',
                  }}>
                    <div className="num" style={{
                      fontSize: 'clamp(2.5rem, 4.5vw, 3.4rem)',
                      fontWeight: 900,
                      letterSpacing: '-0.02em',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--gold) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      lineHeight: 1.0,
                      marginBottom: '0.4rem',
                      fontFamily: 'var(--font-inter), sans-serif',
                    }}>
                      {num}
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--fg)', marginBottom: '0.15rem' }}>{label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--fg-muted)', lineHeight: 1.3 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Photo Column */}
            <div className="anim-scale" style={{
              width: '100%',
              height: '100%',
              minHeight: '520px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div className="photo-frame" style={{
                width: '70%',
                height: '70%',
                position: 'relative',
                boxShadow: '0 16px 64px oklch(0% 0 0 / 0.1), 0 4px 16px oklch(60% 0.08 60 / 0.08)',
                transform: 'perspective(1000px) rotateY(-2deg)',
                transition: 'transform 500ms var(--ease-out)',
                flexGrow: 1,
              }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'perspective(1000px) rotateY(0deg)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'perspective(1000px) rotateY(-2deg)'}
              >
                <div style={{
                  position: 'absolute', inset: 2,
                  background: 'linear-gradient(180deg, transparent 40%, oklch(15% 0.015 265 / 0.35) 100%)',
                  pointerEvents: 'none', zIndex: 2, borderRadius: 'var(--r-xl)',
                }} />
                
                <Image
                  src="/doctor-card.png"
                  alt="د. خالد بترجي"
                  fill
                  sizes="(max-width: 900px) 100vw, 550px"
                  style={{ objectFit: 'cover', scale: '1.02', borderRadius: 'var(--r-xl)' }}
                  priority
                />

                <div style={{
                  position: 'absolute', bottom: 2, left: 2, right: 2, height: '4px',
                  background: 'linear-gradient(90deg, var(--gold) 0%, oklch(68% 0.17 70 / 0.4) 50%, var(--primary) 100%)',
                  zIndex: 3, borderRadius: '0 0 var(--r-xl) var(--r-xl)',
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
                <div style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '1.5rem',
                  right: '1.5rem',
                  textAlign: 'center',
                  padding: '1.1rem 1.5rem',
                  background: 'oklch(100% 0 0 / 0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: 'var(--r-lg)',
                  border: '1px solid var(--border-faint)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 4,
                }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--fg)' }}>د. خالد بترجي</div>
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
                    رئيس مجلس إدارة المركز — متاح للحجز
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPERTISE BAR ── */}
      <section style={{ position: 'relative', zIndex: 2, padding: '0 0 5rem' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '2.5rem 4rem',
              padding: '2rem 2.5rem',
              background: 'oklch(100% 0 0 / 0.7)',
              backdropFilter: 'blur(16px)',
              borderRadius: 'var(--r-xl)',
              border: '1px solid var(--border-faint)',
              boxShadow: 'var(--shadow-warm)',
            }}>
              {['جراحة العظام والمفاصل', 'المناظير الجراحية', 'علاج الآلام المزمنة', 'تأهيل ما بعد العمليات', 'استشارات أون لاين'].map((item, i) => (
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
      <section style={{ position: 'relative', zIndex: 2, padding: '5rem 0' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, transparent 0%, oklch(97% 0.008 85) 50%, transparent 100%)',
        }} />
        <div className="container" style={{ position: 'relative' }}>
          <ScrollReveal>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              padding: '3rem',
              background: 'linear-gradient(135deg, oklch(46% 0.19 260 / 0.03), oklch(68% 0.17 70 / 0.03))',
              borderRadius: 'var(--r-xl)',
              border: '1px solid var(--border-accent)',
            }}>
              {[
                { end: 1500, label: 'مريض', suffix: '+', sub: 'تمت استشارتهم' },
                { end: 35, label: 'عاماً', suffix: '+', sub: 'خبرة في المجال الطبي' },
                { end: 98, label: '٪', suffix: '', sub: 'نسبة رضا المرضى' },
                { end: 24, label: 'ساعة', suffix: '', sub: 'الرد على الاستفسارات' },
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
                    marginBottom: '0.15rem',
                    lineHeight: 1.1,
                  }}>
                    <AnimatedCounter end={c.end} suffix={c.suffix} />
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--fg)' }}>{c.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--fg-dim)', marginTop: '0.05rem' }}>{c.sub}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider />

      {/* ── DOCTOR QUALIFICATIONS ── */}
      <section id="about-section" style={{ position: 'relative', zIndex: 2, padding: '5rem 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center',
          }}>
            <ScrollReveal>
              <div>
                <SectionLabel>المؤهلات العلمية</SectionLabel>
                <h2 style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg)',
                  marginBottom: '1rem',
                  lineHeight: 1.15,
                }}>
                  خبرة تمتد لأكثر من <span style={{ color: 'var(--primary)' }}>ثلاثة عقود</span>
                </h2>
                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--fg-muted)',
                  lineHeight: 1.9,
                  marginBottom: '2.5rem',
                }}>
                  يتمتع الدكتور خالد بترجي بسيرة ذاتية حافلة بالإنجازات الأكاديمية والعملية في مجال جراحة العظام والمفاصل، مع أكثر من 35 عاماً من الخبرة المتراكمة.
                </p>
                <Link href="/consultation/new" className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.85rem 1.75rem' }}>
                  احجز استشارتك
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
      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, transparent 0%, oklch(97% 0.008 85) 50%, transparent 100%)',
        }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <ScrollReveal>
            <SectionLabel>خطوات الحجز</SectionLabel>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: 'var(--fg)',
              marginBottom: '0.75rem',
            }}>
              كيف تعمل الخدمة؟
            </h2>
            <p style={{
              fontSize: '1.05rem',
              color: 'var(--fg-muted)',
              maxWidth: '520px',
              margin: '0 auto 4rem',
              lineHeight: 1.8,
            }}>
              من التسجيل إلى الجلسة مع الدكتور في 4 خطوات بسيطة
            </p>
          </ScrollReveal>

          <div className="steps-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: '2.5rem', left: 'calc(12.5% + 1.5rem)',
              right: 'calc(12.5% + 1.5rem)', height: '2px',
              background: 'linear-gradient(90deg, var(--primary) 0%, var(--border) 50%, var(--border) 100%)',
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
                    border: i === 0 ? 'none' : '2px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: i === 0 ? 'white' : 'var(--fg-dim)',
                    boxShadow: i === 0 ? '0 4px 20px var(--primary-glow)' : 'var(--shadow-sm)',
                    transition: 'all 400ms var(--ease-spring)',
                    position: 'relative',
                    fontFamily: 'var(--font-inter), sans-serif',
                  }}
                    onMouseOver={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'scale(1.1)'
                      if (i !== 0) { el.style.borderColor = 'var(--primary)'; el.style.color = 'var(--primary)'; el.style.boxShadow = '0 4px 20px var(--primary-glow)' }
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
      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, var(--bg) 0%, oklch(97% 0.008 85) 50%, var(--bg) 100%)',
        }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <ScrollReveal>
            <SectionLabel>الباقات والأسعار</SectionLabel>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: 'var(--fg)',
              marginBottom: '0.75rem',
            }}>
              اختر الباقة المناسبة لك
            </h2>
            <p style={{
              fontSize: '1.05rem',
              color: 'var(--fg-muted)',
              maxWidth: '520px',
              margin: '0 auto 4rem',
              lineHeight: 1.8,
            }}>
              استشارات مرنة بأسعار تنافسية تناسب جميع الحالات
            </p>
          </ScrollReveal>

          <div className="pricing-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            alignItems: 'start',
          }}>
            {services.map((svc, i) => (
              <ScrollReveal key={svc.title} delay={i * 100}>
                <div style={{
                  background: 'var(--surface)',
                  border: svc.popular ? '2px solid var(--primary)' : '1px solid var(--border-faint)',
                  borderRadius: 'var(--r-xl)',
                  padding: svc.popular ? '2.5rem 2rem' : '2rem',
                  boxShadow: svc.popular ? '0 8px 40px var(--primary-glow), 0 4px 16px oklch(0% 0 0 / 0.04)' : 'var(--shadow-warm)',
                  textAlign: 'right',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 400ms var(--ease-spring), box-shadow 400ms',
                }}
                  onMouseOver={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-8px)'
                    el.style.boxShadow = svc.popular ? '0 12px 48px var(--primary-glow), 0 4px 16px oklch(0% 0 0 / 0.04)' : '0 12px 40px oklch(0% 0 0 / 0.1)'
                  }}
                  onMouseOut={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = svc.popular ? '0 8px 40px var(--primary-glow), 0 4px 16px oklch(0% 0 0 / 0.04)' : 'var(--shadow-warm)'
                  }}
                >
                  {/* Gold decorative corner */}
                  <div style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    width: '24px', height: '24px',
                    borderTop: svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)',
                    borderRight: svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)',
                    borderRadius: '0 6px 0 0',
                    opacity: svc.popular ? 0.5 : 0.15,
                    pointerEvents: 'none',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: '1rem', left: '1rem',
                    width: '24px', height: '24px',
                    borderBottom: svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)',
                    borderLeft: svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)',
                    borderRadius: '0 0 0 6px',
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
                        الأكثر طلباً
                      </div>
                      <div style={{
                        position: 'absolute', top: 0, right: 0,
                        width: '120px', height: '120px',
                        background: 'radial-gradient(circle at top right, oklch(46% 0.19 260 / 0.06), transparent 70%)',
                        pointerEvents: 'none',
                      }} />
                    </>
                  )}
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)',
                    marginBottom: '0.5rem', letterSpacing: '0.05em',
                  }}>
                    {svc.popular ? '— مطوّر' : '— باقة'}
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
                    {svc.popular ? 'احجز الآن' : 'اختر الباقة'}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── WHY CHOOSE US ── */}
      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div className="container">
          <div className="features-layout" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center',
          }}>
            <ScrollReveal>
              <div>
                <SectionLabel>لماذا د. خالد بترجي؟</SectionLabel>
                <h2 style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg)',
                  marginBottom: '1rem',
                  lineHeight: 1.15,
                }}>
                  رعاية طبية بمعايير عالمية — من منزلك
                </h2>
                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--fg-muted)',
                  lineHeight: 1.9,
                  marginBottom: '2.5rem',
                }}>
                  نضعك في قلب الرعاية الصحية. منصة متكاملة تجمع بين الخبرة الطبية والتقنية الحديثة لتوفير تجربة استشارية سلسة وآمنة.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link href="/consultation/new" className="btn-primary" style={{ fontSize: '0.95rem', padding: '0.9rem 2rem' }}>
                    ابدأ الآن
                  </Link>
                </div>

                <div className="mini-stats" style={{
                  marginTop: '3rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                }}>
                  {[
                    { num: '1,500+', label: 'مريض' },
                    { num: '98%', label: 'رضا المرضى' },
                    { num: '24', label: 'ساعة للرد' },
                  ].map((s) => (
                    <div key={s.label} style={{
                      padding: '1.25rem', textAlign: 'center',
                      background: 'var(--surface)',
                      borderRadius: 'var(--r-lg)',
                      border: '1px solid var(--border-faint)',
                      transition: 'transform 300ms var(--ease-spring)',
                    }}
                      onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'}
                      onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
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
              </div>
            </ScrollReveal>

            <div className="features-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
            }}>
              {features.map((f, i) => (
                <ScrollReveal key={f.title} delay={(i % 4) * 80}>
                  <div style={{
                    padding: '1.5rem',
                    background: 'var(--surface)',
                    borderRadius: 'var(--r-lg)',
                    border: '1px solid var(--border-faint)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 350ms var(--ease-spring), box-shadow 350ms, border-color 350ms',
                    cursor: 'default',
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
                      background: 'linear-gradient(135deg, var(--primary-subtle) 0%, oklch(46% 0.19 260 / 0.08) 100%)',
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
      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, var(--bg) 0%, oklch(97% 0.008 85) 50%, var(--bg) 100%)',
        }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <ScrollReveal>
            <SectionLabel>آراء المرضى</SectionLabel>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: 'var(--fg)',
              marginBottom: '3rem',
            }}>
              ماذا يقول مرضانا؟
            </h2>
          </ScrollReveal>

          <div className="testimonials-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
          }}>
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 120}>
                <div style={{
                  padding: '2rem',
                  background: 'var(--surface)',
                  borderRadius: 'var(--r-xl)',
                  border: '1px solid var(--border-faint)',
                  boxShadow: 'var(--shadow-warm)',
                  textAlign: 'right',
                  position: 'relative',
                  transition: 'transform 350ms var(--ease-spring), box-shadow 350ms, border-color 350ms',
                }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'oklch(68% 0.17 70 / 0.2)';
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-warm)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-faint)';
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
                    position: 'absolute', top: '1rem', left: '1.5rem',
                    fontSize: '4rem', lineHeight: 0.8,
                    color: 'var(--primary-soft)',
                    fontWeight: 900,
                    fontFamily: 'serif',
                    opacity: 0.5,
                  }}>
                    &quot;
                  </div>
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--fg-muted)',
                    lineHeight: 1.9,
                    marginBottom: '1.5rem',
                    position: 'relative',
                    zIndex: 1,
                  }}>
                    {t.text}
                  </p>
                  <div style={{
                    borderTop: '1px solid var(--border-faint)',
                    paddingTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}>
                    <div style={{
                      width: '2.75rem', height: '2.75rem',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                    }}>
                      {t.name.charAt(0)}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--fg)' }}>{t.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--fg-dim)' }}>{t.title}</div>
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
      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center' }}>
              <SectionLabel>المكتبة الطبية</SectionLabel>
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--fg)',
                marginBottom: '0.75rem',
              }}>
                موارد صحية لك
              </h2>
              <p style={{
                fontSize: '1.05rem',
                color: 'var(--fg-muted)',
                maxWidth: '520px',
                margin: '0 auto 4rem',
                lineHeight: 1.8,
              }}>
                مقالات وإرشادات طبية من إعداد د. خالد بترجي لمساعدتك في رحلة علاجك
              </p>
            </div>
          </ScrollReveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
          }}>
            {resources.map((r, i) => (
              <ScrollReveal key={r.title} delay={i * 100}>
                <div style={{
                  padding: '2rem',
                  background: 'var(--surface)',
                  borderRadius: 'var(--r-xl)',
                  border: '1px solid var(--border-faint)',
                  boxShadow: 'var(--shadow-sm)',
                  textAlign: 'right',
                  transition: 'transform 350ms var(--ease-spring), box-shadow 350ms',
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
                    {r.tag}
                  </div>
                  <div style={{
                    fontSize: '1rem', fontWeight: 800, color: 'var(--fg)',
                    marginBottom: '0.5rem', lineHeight: 1.4,
                  }}>
                    {r.title}
                  </div>
                  <p style={{
                    fontSize: '0.82rem', color: 'var(--fg-muted)',
                    lineHeight: 1.7, marginBottom: '1.25rem',
                  }}>
                    {r.summary}
                  </p>
                  <div style={{
                    fontSize: '0.72rem', color: 'var(--fg-dim)',
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontWeight: 700 }}>{r.readTime}</span> دقائق قراءة
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── FAQ ── */}
      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, transparent 0%, oklch(97% 0.008 85) 50%, transparent 100%)',
        }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="faq-layout" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr',
            gap: '3rem',
            alignItems: 'start',
          }}>
            <ScrollReveal>
              <div>
                <SectionLabel>الأسئلة الشائعة</SectionLabel>
                <h2 style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg)',
                  marginBottom: '1rem',
                  lineHeight: 1.15,
                }}>
                  كل ما تريد معرفته عن الاستشارة
                </h2>
                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--fg-muted)',
                  lineHeight: 1.8,
                }}>
                  إجابات سريعة عن أكثر الأسئلة شيوعاً. إن كان لديك سؤال آخر، لا تتردد في التواصل معنا.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {faqs.map(item => (
                  <details key={item.q} style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border-faint)',
                    borderRadius: 'var(--r-lg)',
                    padding: '0',
                    overflow: 'hidden',
                    transition: 'box-shadow 300ms, border-color 300ms',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <summary style={{
                      padding: '1.35rem 1.5rem',
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
                    <div style={{
                      padding: '0 1.5rem 1.35rem',
                      fontSize: '0.87rem',
                      color: 'var(--fg-muted)',
                      lineHeight: 1.9,
                      borderTop: '1px solid var(--border-faint)',
                      paddingTop: '1rem',
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
      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div className="container" style={{ position: 'relative' }}>
          <ScrollReveal>
            <div style={{
              padding: '5rem 4rem',
              borderRadius: 'var(--r-xl)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-up) 50%, oklch(35% 0.22 260) 100%)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 16px 64px var(--primary-glow)',
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
                  ابدأ رحلة علاجك اليوم
                </div>
                <h2 style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 900,
                  color: 'white',
                  lineHeight: 1.15,
                  marginBottom: '1rem',
                }}>
                  استشر نخبة الأطباء من منزلك اليوم
                </h2>
                <p style={{
                  fontSize: '1.05rem',
                  color: 'oklch(100% 0 0 / 0.75)',
                  lineHeight: 1.8,
                  maxWidth: '520px',
                  margin: '0 auto 2rem',
                }}>
                  احجز استشارتك الآن خلال دقائق واختر طبيبك الاستشاري المفضل. رعاية طبية تخصصية بمعايير عالمية في متناول يدك.
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
                  ابدأ الاستشارة
                  <span style={{ fontSize: '1.2rem', lineHeight: 1, display: 'inline-block', transition: 'transform 200ms' }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'translateX(-4px)'}
                    onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'}
                  >←</span>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </main>
  )
}
