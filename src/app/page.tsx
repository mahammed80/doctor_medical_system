'use client'

import Link from 'next/link'
import { ARTICLES } from '@/lib/articles'
import {
  COUNTERS,
  EXPERTISE_TAGS,
  FAQS,
  FEATURES,
  MINI_STATS,
  QUALIFICATIONS,
  SERVICES,
  STATS,
  STEPS,
  TESTIMONIALS,
} from '@/content/landing'
import {
  AnimatedCounter,
  DiamondShower,
  FloatingOrbs,
  MouseGlow,
  ScrollReveal,
  SectionDivider,
  SectionLabel,
} from './_landing/_components/Decor'
import { VirtualConsultationDesk } from './_landing/_components/VirtualConsultationDesk'

export default function Home() {
  return (
    <main style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      <div
        className="geo-bg"
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      />
      <FloatingOrbs />
      <DiamondShower />
      <MouseGlow />

      <section style={{ position: 'relative', zIndex: 2, padding: '5rem 0 6rem' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '85%',
            background:
              'linear-gradient(170deg, var(--surface-up) 0%, var(--bg) 40%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative' }}>
          <div
            className="hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '4rem',
              alignItems: 'stretch',
            }}
          >
            <div>
              <div
                className="anim-fade"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--gold)',
                  padding: '0.45rem 1.25rem',
                  borderRadius: 9999,
                  border: '1px solid rgba(194, 154, 104, 0.25)',
                  background: 'var(--gold-soft)',
                  marginBottom: '2rem',
                  boxShadow: '0 0 20px var(--gold-glow)',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    animation: 'pulse-soft 2s ease-in-out infinite',
                    fontSize: '0.7rem',
                  }}
                >
                  ✦
                </span>
                مركز بترجي للاستشارات الطبية التخصصية
              </div>

              <h1
                className="anim-fade-1"
                style={{
                  fontSize: 'clamp(2.5rem, 5.5vw, 3.8rem)',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  color: 'var(--fg)',
                  marginBottom: '1.5rem',
                }}
              >
                استشارات د. خالد بترجي{' '}
                <br />
                <span
                  style={{
                    background:
                      'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 50%, var(--primary-down) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    backgroundSize: '200% 200%',
                    animation: 'shimmer 4s ease-in-out infinite',
                    display: 'inline-block',
                    paddingTop: '10px',
                  }}
                >
                  استشاري جراحة العظام والمفاصل
                </span>
                <span
                  style={{
                    fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
                    fontWeight: 500,
                    color: 'var(--fg-muted)',
                    display: 'block',
                    marginTop: '0.75rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  رعاية طبية فائقة لجراحات الركبة والمفاصل الصناعية والمناظير أونلاين من منزلك
                </span>
              </h1>

              <p
                className="anim-fade-2"
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--fg-muted)',
                  lineHeight: 1.9,
                  marginBottom: '2.5rem',
                  maxWidth: 540,
                }}
              >
                أول منصة استشارات طبية متكاملة تجمع بين خبرة الاستشاريين وسهولة التقنية. احجز استشارتك المرئية في دقائق، وارفع فحوصاتك وتقاريرك بخصوصية تامة وتلقى التشخيص والخطة العلاجية من منزلك.
              </p>

              <div
                className="anim-fade-2"
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  href="/consultation/new"
                  className="btn-primary"
                  style={{
                    fontSize: '1.1rem',
                    padding: '1.1rem 2.8rem',
                    gap: '0.75rem',
                    borderRadius: 'var(--r-lg)',
                  }}
                >
                  ابدأ الاستشارة الآن
                  <span
                    style={{
                      fontSize: '1.2rem',
                      lineHeight: 1,
                      display: 'inline-block',
                    }}
                  >
                    ←
                  </span>
                </Link>
                <Link
                  href="#about-section"
                  className="btn-ghost"
                  style={{ fontSize: '0.95rem', padding: '0.9rem 1.75rem' }}
                >
                  تعرّف على الدكتور
                </Link>
              </div>
            </div>

            <div
              className="anim-scale"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <VirtualConsultationDesk />
            </div>
          </div>
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 3, padding: '1.5rem 0 3rem' }}>
        <div className="container">
          <ScrollReveal>
            <div
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(243, 239, 233, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1.5px solid var(--border-accent)',
                borderRadius: 'var(--r-2xl)',
                boxShadow: 'var(--shadow-lg), 0 20px 50px rgba(0, 0, 0, 0.04)',
                padding: '3rem 2.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2.5rem',
              }}
            >
              {STATS.map(({ num, label, desc }, idx) => (
                <div
                  key={label}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    paddingLeft: idx < 2 ? '2.5rem' : '0',
                    borderLeft: idx < 2 ? '1px solid var(--border-faint)' : 'none',
                  }}
                >
                  <div
                    className="num"
                    style={{
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
                    }}
                  >
                    {num}
                  </div>
                  <div
                    style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--fg)', marginBottom: '0.35rem' }}
                  >
                    {label}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--fg-muted)', lineHeight: 1.4, maxWidth: 280 }}>
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 2, padding: '0 0 5rem' }}>
        <div className="container">
          <ScrollReveal>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '2.5rem 4rem',
                padding: '2rem 2.5rem',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(16px)',
                borderRadius: 'var(--r-xl)',
                border: '1px solid var(--border-faint)',
                boxShadow: 'var(--shadow-warm)',
              }}
            >
              {EXPERTISE_TAGS.map((item, i) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--fg-muted)',
                    transition: 'color 200ms',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: i === 0 ? 'var(--primary)' : 'var(--gold)',
                      flexShrink: 0,
                      animation: i === 0 ? 'shimmerGlow 3s ease-in-out infinite' : 'none',
                    }}
                  />
                  {item}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider />

      <section style={{ position: 'relative', zIndex: 2, padding: '5rem 0' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'linear-gradient(180deg, transparent 0%, var(--surface-up) 50%, transparent 100%)',
          }}
        />
        <div className="container" style={{ position: 'relative' }}>
          <ScrollReveal>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                padding: '3rem',
                background: 'linear-gradient(135deg, rgba(12, 90, 66, 0.03), rgba(194, 154, 104, 0.03))',
                borderRadius: 'var(--r-xl)',
                border: '1px solid var(--border-accent)',
              }}
            >
              {COUNTERS.map((c, i) => (
                <div
                  key={c.label}
                  style={{
                    textAlign: 'center',
                    padding: '1rem',
                    animation: `counterPop 0.5s var(--ease-out) ${0.15 * i}s both`,
                  }}
                >
                  <div
                    className="num"
                    style={{
                      fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                      fontWeight: 900,
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--gold) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      marginBottom: '0.15rem',
                      lineHeight: 1.1,
                    }}
                  >
                    <AnimatedCounter end={c.end} suffix={c.suffix} />
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--fg)' }}>{c.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--fg-dim)', marginTop: '0.05rem' }}>
                    {c.sub}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider />

      <section id="about-section" style={{ position: 'relative', zIndex: 2, padding: '5rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4rem',
              alignItems: 'center',
            }}
          >
            <ScrollReveal>
              <div>
                <SectionLabel>المؤهلات العلمية</SectionLabel>
                <h2
                  style={{
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    color: 'var(--fg)',
                    marginBottom: '1rem',
                    lineHeight: 1.15,
                  }}
                >
                  خبرة تمتد لأكثر من <span style={{ color: 'var(--primary)' }}>ثلاثة عقود</span>
                </h2>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--fg-muted)',
                    lineHeight: 1.9,
                    marginBottom: '2.5rem',
                  }}
                >
                  يتمتع الدكتور خالد بترجي بسيرة ذاتية حافلة بالإنجازات الأكاديمية والعملية في مجال جراحة العظام والمفاصل، مع أكثر من 35 عاماً من الخبرة المتراكمة.
                </p>
                <Link
                  href="/consultation/new"
                  className="btn-primary"
                  style={{ fontSize: '0.9rem', padding: '0.85rem 1.75rem' }}
                >
                  احجز استشارتك
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {QUALIFICATIONS.map((q) => (
                  <div
                    key={q.title}
                    style={{
                      display: 'flex',
                      gap: '1.25rem',
                      alignItems: 'flex-start',
                      padding: '1.25rem 1.5rem',
                      background: 'var(--surface)',
                      borderRadius: 'var(--r-lg)',
                      border: '1px solid var(--border-faint)',
                      boxShadow: 'var(--shadow-sm)',
                      cursor: 'default',
                    }}
                  >
                    <div
                      style={{
                        minWidth: '3.5rem',
                        textAlign: 'center',
                        padding: '0.35rem 0.5rem',
                        background: 'var(--primary-subtle)',
                        borderRadius: 'var(--r)',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: 'var(--primary)',
                        fontFamily: 'var(--font-inter), sans-serif',
                      }}
                    >
                      {q.year}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 800,
                          color: 'var(--fg)',
                          marginBottom: '0.15rem',
                        }}
                      >
                        {q.title}
                      </div>
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

      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'linear-gradient(180deg, transparent 0%, var(--surface-up) 50%, transparent 100%)',
          }}
        />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <ScrollReveal>
            <SectionLabel>خطوات الحجز</SectionLabel>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--fg)',
                marginBottom: '0.75rem',
              }}
            >
              كيف تعمل الخدمة؟
            </h2>
            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--fg-muted)',
                maxWidth: 520,
                margin: '0 auto 4rem',
                lineHeight: 1.8,
              }}
            >
              من التسجيل إلى الجلسة مع الدكتور في 4 خطوات بسيطة
            </p>
          </ScrollReveal>

          <div
            className="steps-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
              position: 'relative',
            }}
          >
            {STEPS.map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 100}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <div
                    className="num"
                    style={{
                      width: '5rem',
                      height: '5rem',
                      borderRadius: '50%',
                      background:
                        i === 0
                          ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)'
                          : 'var(--surface)',
                      border: i === 0 ? 'none' : '2px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: i === 0 ? 'white' : 'var(--fg-dim)',
                      boxShadow:
                        i === 0 ? '0 4px 20px var(--primary-glow)' : 'var(--shadow-sm)',
                      fontFamily: 'var(--font-inter), sans-serif',
                    }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: 'var(--fg)',
                        marginBottom: '0.35rem',
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--fg-dim)',
                        lineHeight: 1.7,
                        maxWidth: 220,
                        margin: '0 auto',
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(180deg, var(--bg) 0%, var(--surface-up) 50%, var(--bg) 100%)',
          }}
        />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <ScrollReveal>
            <SectionLabel>الباقات والأسعار</SectionLabel>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--fg)',
                marginBottom: '0.75rem',
              }}
            >
              اختر الباقة المناسبة لك
            </h2>
            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--fg-muted)',
                maxWidth: 520,
                margin: '0 auto 4rem',
                lineHeight: 1.8,
              }}
            >
              استشارات مرنة بأسعار تنافسية تناسب جميع الحالات
            </p>
          </ScrollReveal>

          <div
            className="pricing-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
              alignItems: 'start',
            }}
          >
            {SERVICES.map((svc, i) => (
              <ScrollReveal key={svc.title} delay={i * 100}>
                <div
                  style={{
                    background: 'var(--surface)',
                    border: svc.popular
                      ? '2px solid var(--primary)'
                      : '1px solid var(--border-faint)',
                    borderRadius: 'var(--r-xl)',
                    padding: svc.popular ? '2.5rem 2rem' : '2rem',
                    boxShadow: svc.popular
                      ? '0 8px 40px var(--primary-glow), 0 4px 16px rgba(0, 0, 0, 0.04)'
                      : 'var(--shadow-warm)',
                    textAlign: 'right',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      width: 24,
                      height: 24,
                      borderTop: svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)',
                      borderRight: svc.popular
                        ? '2px solid var(--gold)'
                        : '1px solid var(--border)',
                      borderRadius: '0 6px 0 0',
                      opacity: svc.popular ? 0.5 : 0.15,
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: '1rem',
                      width: 24,
                      height: 24,
                      borderBottom: svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)',
                      borderLeft: svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)',
                      borderRadius: '0 0 0 6px',
                      opacity: svc.popular ? 0.5 : 0.15,
                      pointerEvents: 'none',
                    }}
                  />
                  {svc.popular && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '1.5rem',
                        left: '-2.75rem',
                        transform: 'rotate(-45deg)',
                        background:
                          'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.25rem 3.5rem',
                        letterSpacing: '0.08em',
                      }}
                    >
                      الأكثر طلباً
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      marginBottom: '0.5rem',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {svc.popular ? '— مطوّر' : '— باقة'}
                  </div>
                  <div
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 900,
                      color: 'var(--fg)',
                      marginBottom: '0.3rem',
                    }}
                  >
                    {svc.title}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.25rem',
                      marginBottom: '1rem',
                      direction: 'ltr',
                    }}
                  >
                    <span
                      className="num"
                      style={{
                        fontSize: '2.8rem',
                        fontWeight: 900,
                        letterSpacing: '-0.03em',
                        background:
                          'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontFamily: 'var(--font-inter), sans-serif',
                      }}
                    >
                      {svc.price}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--fg-dim)', fontWeight: 600 }}>
                      {svc.period}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--fg-muted)',
                      lineHeight: 1.7,
                      marginBottom: '1.5rem',
                    }}
                  >
                    {svc.desc}
                  </p>
                  <div
                    style={{
                      borderTop: '1px solid var(--border-faint)',
                      paddingTop: '1.25rem',
                      marginBottom: '1.75rem',
                    }}
                  >
                    {svc.features.map((f) => (
                      <div
                        key={f}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                          fontSize: '0.82rem',
                          color: 'var(--fg-muted)',
                          padding: '0.35rem 0',
                        }}
                      >
                        <span
                          style={{
                            color: svc.popular ? 'var(--primary)' : 'var(--gold)',
                            fontSize: '0.6rem',
                            marginTop: '0.3rem',
                          }}
                        >
                          ◈
                        </span>
                        {f}
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/consultation/new"
                    className={svc.popular ? 'btn-primary' : 'btn-ghost'}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontSize: '0.95rem',
                      padding: '0.9rem',
                    }}
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

      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div className="container">
          <div
            className="features-layout"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4rem',
              alignItems: 'center',
            }}
          >
            <ScrollReveal>
              <div>
                <SectionLabel>لماذا د. خالد بترجي؟</SectionLabel>
                <h2
                  style={{
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    color: 'var(--fg)',
                    marginBottom: '1rem',
                    lineHeight: 1.15,
                  }}
                >
                  رعاية طبية بمعايير عالمية — من منزلك
                </h2>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--fg-muted)',
                    lineHeight: 1.9,
                    marginBottom: '2.5rem',
                  }}
                >
                  نضعك في قلب الرعاية الصحية. منصة متكاملة تجمع بين الخبرة الطبية والتقنية الحديثة لتوفير تجربة استشارية سلسة وآمنة.
                </p>
                <Link
                  href="/consultation/new"
                  className="btn-primary"
                  style={{ fontSize: '0.95rem', padding: '0.9rem 2rem' }}
                >
                  ابدأ الآن
                </Link>

                <div
                  className="mini-stats"
                  style={{
                    marginTop: '3rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                  }}
                >
                  {MINI_STATS.map((s) => (
                    <div
                      key={s.label}
                      style={{
                        padding: '1.25rem',
                        textAlign: 'center',
                        background: 'var(--surface)',
                        borderRadius: 'var(--r-lg)',
                        border: '1px solid var(--border-faint)',
                      }}
                    >
                      <div
                        className="num"
                        style={{
                          fontSize: '1.6rem',
                          fontWeight: 900,
                          color: 'var(--primary)',
                          marginBottom: '0.15rem',
                          fontFamily: 'var(--font-inter), sans-serif',
                        }}
                      >
                        {s.num}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--fg-dim)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <div
              className="features-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
              }}
            >
              {FEATURES.map((f, i) => (
                <ScrollReveal key={f.title} delay={(i % 4) * 80}>
                  <div
                    style={{
                      padding: '1.5rem',
                      background: 'var(--surface)',
                      borderRadius: 'var(--r-lg)',
                      border: '1px solid var(--border-faint)',
                      boxShadow: 'var(--shadow-sm)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: '2.75rem',
                        height: '2.75rem',
                        borderRadius: 'var(--r)',
                        background:
                          'linear-gradient(135deg, var(--primary-subtle) 0%, rgba(12, 90, 66, 0.08) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        marginBottom: '0.75rem',
                        position: 'relative',
                      }}
                    >
                      {f.icon}
                    </div>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: 'var(--fg)',
                        marginBottom: '0.3rem',
                        position: 'relative',
                      }}
                    >
                      {f.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--fg-dim)',
                        lineHeight: 1.7,
                        position: 'relative',
                      }}
                    >
                      {f.desc}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(180deg, var(--bg) 0%, var(--surface-up) 50%, var(--bg) 100%)',
          }}
        />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <ScrollReveal>
            <SectionLabel>آراء المرضى</SectionLabel>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--fg)',
                marginBottom: '3rem',
              }}
            >
              ماذا يقول مرضانا؟
            </h2>
          </ScrollReveal>

          <div
            className="testimonials-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
            }}
          >
            {TESTIMONIALS.map((t) => (
              <ScrollReveal key={t.name}>
                <div
                  style={{
                    padding: '2rem',
                    background: 'var(--surface)',
                    borderRadius: 'var(--r-xl)',
                    border: '1px solid var(--border-faint)',
                    boxShadow: 'var(--shadow-warm)',
                    textAlign: 'right',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '20%',
                      right: '20%',
                      height: 2,
                      background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
                      opacity: 0.3,
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1.5rem',
                      fontSize: '4rem',
                      lineHeight: 0.8,
                      color: 'var(--primary-soft)',
                      fontWeight: 900,
                      fontFamily: 'serif',
                      opacity: 0.5,
                    }}
                  >
                    &quot;
                  </div>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--fg-muted)',
                      lineHeight: 1.9,
                      marginBottom: '1.5rem',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {t.text}
                  </p>
                  <div
                    style={{
                      borderTop: '1px solid var(--border-faint)',
                      paddingTop: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <div
                      style={{
                        width: '2.75rem',
                        height: '2.75rem',
                        borderRadius: '50%',
                        background:
                          'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                      }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--fg)' }}>
                        {t.name}
                      </div>
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

      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center' }}>
              <SectionLabel>المكتبة الطبية</SectionLabel>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg)',
                  marginBottom: '0.75rem',
                }}
              >
                موارد صحية لك
              </h2>
              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--fg-muted)',
                  maxWidth: 520,
                  margin: '0 auto 4rem',
                  lineHeight: 1.8,
                }}
              >
                مقالات وإرشادات طبية من إعداد د. خالد بترجي لمساعدتك في رحلة علاجك
              </p>
            </div>
          </ScrollReveal>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
            }}
          >
            {ARTICLES.map((r, i) => (
              <ScrollReveal key={r.title} delay={i * 100}>
                <Link
                  href={`/articles/${r.slug}`}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    padding: '2rem',
                    background: 'var(--surface)',
                    borderRadius: 'var(--r-xl)',
                    border: '1px solid var(--border-faint)',
                    boxShadow: 'var(--shadow-sm)',
                    textAlign: 'right',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      padding: '0.2rem 0.75rem',
                      borderRadius: 9999,
                      border: '1px solid var(--border-accent)',
                      background: 'var(--primary-subtle)',
                      display: 'inline-block',
                      marginBottom: '1rem',
                    }}
                  >
                    {r.tag}
                  </div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--fg)',
                      marginBottom: '0.5rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {r.title}
                  </div>
                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--fg-muted)',
                      lineHeight: 1.7,
                      marginBottom: '1.25rem',
                    }}
                  >
                    {r.summary}
                  </p>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--fg-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontWeight: 700 }}>
                      {r.readTime}
                    </span>{' '}
                    دقائق قراءة
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(180deg, transparent 0%, var(--surface-up) 50%, transparent 100%)',
          }}
        />
        <div className="container" style={{ position: 'relative' }}>
          <div
            className="faq-layout"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.5fr',
              gap: '3rem',
              alignItems: 'start',
            }}
          >
            <ScrollReveal>
              <div>
                <SectionLabel>الأسئلة الشائعة</SectionLabel>
                <h2
                  style={{
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    color: 'var(--fg)',
                    marginBottom: '1rem',
                    lineHeight: 1.15,
                  }}
                >
                  كل ما تريد معرفته عن الاستشارة
                </h2>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--fg-muted)',
                    lineHeight: 1.8,
                  }}
                >
                  إجابات سريعة عن أكثر الأسئلة شيوعاً. إن كان لديك سؤال آخر، لا تتردد في التواصل معنا.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {FAQS.map((item) => (
                  <details
                    key={item.q}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border-faint)',
                      borderRadius: 'var(--r-lg)',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <summary
                      style={{
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
                      }}
                    >
                      {item.q}
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
                        +
                      </span>
                    </summary>
                    <div
                      style={{
                        padding: '0 1.5rem 1.35rem',
                        fontSize: '0.87rem',
                        color: 'var(--fg-muted)',
                        lineHeight: 1.9,
                        borderTop: '1px solid var(--border-faint)',
                        paddingTop: '1rem',
                      }}
                    >
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

      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div className="container" style={{ position: 'relative' }}>
          <ScrollReveal>
            <div
              style={{
                padding: '5rem 4rem',
                borderRadius: 'var(--r-xl)',
                background:
                  'linear-gradient(135deg, var(--primary) 0%, var(--primary-up) 50%, #094532 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 16px 64px var(--primary-glow)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-40%',
                  right: '-10%',
                  width: 400,
                  height: 400,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
                  pointerEvents: 'none',
                  animation: 'floatOrb 20s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-30%',
                  left: '-5%',
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
                  pointerEvents: 'none',
                  animation: 'floatOrb2 25s ease-in-out infinite',
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: 'rgba(255, 255, 255, 0.8)',
                    padding: '0.4rem 1.1rem',
                    borderRadius: 9999,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    marginBottom: '1.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.6rem', animation: 'pulse-soft 2s ease-in-out infinite' }}>
                    ◇
                  </span>
                  ابدأ رحلة علاجك اليوم
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    fontWeight: 900,
                    color: 'white',
                    lineHeight: 1.15,
                    marginBottom: '1rem',
                  }}
                >
                  استشر نخبة الأطباء من منزلك اليوم
                </h2>
                <p
                  style={{
                    fontSize: '1.05rem',
                    color: 'rgba(255, 255, 255, 0.75)',
                    lineHeight: 1.8,
                    maxWidth: 520,
                    margin: '0 auto 2rem',
                  }}
                >
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
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  ابدأ الاستشارة
                  <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>←</span>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
