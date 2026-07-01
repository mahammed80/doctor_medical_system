'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  HeroBackdrop,
  ScrollReveal,
  SectionDivider,
  SectionLabel,
  SectionTexture,
} from './_landing/_components/Decor'

export default function Home() {
  return (
    <main style={{ position: 'relative', zIndex: 1 }}>
      <HeroBackdrop />

      {/* ───────────────────────────────────────────────────────────────────
          HERO
      ─────────────────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="anim-fade">
              <SectionLabel>مركز بترجي للاستشارات الطبية التخصصية</SectionLabel>
            </div>

            <h1 className="hero-title anim-fade-1">
              رعاية طبية<br />
              <span className="hero-title-accent">تضعك في المقام الأول</span>
            </h1>

            <p className="hero-lead anim-fade-2">
              احجز استشارتك المرئية مع د. خالد بترجي، استشاري جراحة العظام والمفاصل،
              واطرح أسئلتك وتقاريرك الطبية بخصوصية تامة من منزلك.
            </p>

            <div className="hero-actions anim-fade-2">
              <Link href="/consultation/new" className="btn-accent">
                احجز موعدك الآن
                <span aria-hidden style={{ fontSize: '1.1rem' }}>←</span>
              </Link>
              <Link href="#about" className="btn-ghost">
                تعرّف على الدكتور
              </Link>
            </div>

            <div className="hero-stats-bar anim-fade-3">
              {STATS.map((s) => (
                <div key={s.label} className="hero-stat">
                  <span className="hero-stat-num">{s.num}</span>
                  <span className="hero-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual anim-scale">
            <div className="hero-image-frame">
              <Image
                src="/main_image.jpeg"
                alt="د. خالد بترجي"
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
                priority
              />
            </div>

            {/* Floating credential card */}
            <div className="hero-float-card">
              <div className="hero-float-avatar">
                <span>٣٥+</span>
              </div>
              <div>
                <div className="hero-float-title">عاماً من الخبرة</div>
                <div className="hero-float-desc">في جراحة العظام والمفاصل</div>
              </div>
            </div>

            {/* Decorative dot grid */}
            <div className="hero-dots" aria-hidden />
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ───────────────────────────────────────────────────────────────────
          EXPERTISE TAGS
      ─────────────────────────────────────────────────────────────────── */}
      <section className="section-padded">
        <div className="container">
          <ScrollReveal>
            <div className="expertise-row">
              {EXPERTISE_TAGS.map((tag) => (
                <span key={tag} className="expertise-tag">
                  {tag}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider />

      {/* ───────────────────────────────────────────────────────────────────
          COUNTERS
      ─────────────────────────────────────────────────────────────────── */}
      <section className="section-padded">
        <div className="container">
          <ScrollReveal>
            <div className="counter-grid">
              {COUNTERS.map((c, i) => (
                <div
                  key={c.label}
                  className="counter-card"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="counter-num">
                    <AnimatedCounter end={c.end} suffix={c.suffix} />
                  </div>
                  <div className="counter-label">{c.label}</div>
                  <div className="counter-sub">{c.sub}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider />

      {/* ───────────────────────────────────────────────────────────────────
          ABOUT / QUALIFICATIONS
      ─────────────────────────────────────────────────────────────────── */}
      <section id="about" className="section-padded about-section">
        <SectionTexture />
        <div className="container">
          <div className="about-grid">
            <ScrollReveal>
              <div className="about-copy">
                <SectionLabel>المؤهلات والخبرة</SectionLabel>
                <h2 className="section-title about-title">
                  خبرة تمتد لأكثر من<br />
                  <span className="text-accent">ثلاثة عقود</span>
                </h2>
                <p className="about-lead">
                  يتمتع الدكتور خالد بترجي بسيرة ذاتية حافلة بالإنجازات الأكاديمية والعملية
                  في مجال جراحة العظام والمفاصل، مع أكثر من 35 عاماً من الخبرة المتراكمة.
                </p>
                <p className="about-body">
                  من إجراء عمليات تبديل المفاصل المعقدة إلى الجراحات التنظيرية الدقيقة،
                  يسعى د. بترجي دائماً لتقديم رعاية شخصية تجمع بين أحدث التقنيات
                  والتعاطف الإنساني.
                </p>
                <Link href="/consultation/new" className="btn-primary">
                  احجز استشارتك
                </Link>

                <div className="mini-stats">
                  {MINI_STATS.map((s) => (
                    <div key={s.label} className="mini-stat">
                      <div className="mini-stat-num">{s.num}</div>
                      <div className="mini-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="qualifications">
                <h3 className="qualifications-title">محطات مهنية</h3>
                <div className="qualifications-list">
                  {QUALIFICATIONS.map((q) => (
                    <div key={q.title} className="qualification-item">
                      <div className="qualification-year">{q.year}</div>
                      <div>
                        <div className="qualification-title">{q.title}</div>
                        <div className="qualification-inst">{q.inst}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ───────────────────────────────────────────────────────────────────
          SERVICES
      ─────────────────────────────────────────────────────────────────── */}
      <section className="section-padded">
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <SectionLabel>الباقات والأسعار</SectionLabel>
              <h2 className="section-title">اختر الباقة المناسبة لك</h2>
              <p className="section-subtitle">
                استشارات مرنة بأسعار تنافسية تناسب جميع الحالات
              </p>
            </div>
          </ScrollReveal>

          <div className="services-grid">
            {SERVICES.map((svc, i) => (
              <ScrollReveal key={svc.title} delay={i * 100}>
                <div
                  className={`service-card ${svc.popular ? 'service-card-popular' : ''}`}
                >
                  {svc.popular && (
                    <div className="service-ribbon">الأكثر طلباً</div>
                  )}

                  <div className="service-meta">
                    {svc.popular ? 'الخطة المطورة' : 'باقة استشارية'}
                  </div>
                  <h3 className="service-title">{svc.title}</h3>

                  <div className="service-price-row">
                    <span className="service-price">{svc.price}</span>
                    <span className="service-period">{svc.period}</span>
                  </div>

                  <p className="service-desc">{svc.desc}</p>

                  <ul className="service-features">
                    {svc.features.map((f) => (
                      <li key={f}>
                        <span aria-hidden>—</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/consultation/new"
                    className={svc.popular ? 'btn-accent' : 'btn-ghost'}
                    style={{ width: '100%' }}
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

      {/* ───────────────────────────────────────────────────────────────────
          FEATURES
      ─────────────────────────────────────────────────────────────────── */}
      <section className="section-padded features-section">
        <SectionTexture />
        <div className="container">
          <div className="features-grid">
            <ScrollReveal>
              <div className="features-copy">
                <SectionLabel>لماذا د. خالد بترجي؟</SectionLabel>
                <h2 className="section-title">
                  رعاية طبية بمعايير عالمية — من منزلك
                </h2>
                <p className="features-lead">
                  نضعك في قلب الرعاية الصحية. منصة متكاملة تجمع بين الخبرة الطبية
                  والتقنية الحديثة لتوفير تجربة استشارية سلسة وآمنة.
                </p>
                <Link href="/consultation/new" className="btn-primary">
                  ابدأ الآن
                </Link>
              </div>
            </ScrollReveal>

            <div className="features-cards">
              {FEATURES.map((f, i) => (
                <ScrollReveal key={f.title} delay={i * 80}>
                  <div className="feature-card">
                    <div className="feature-icon">{f.icon}</div>
                    <div className="feature-number">0{i + 1}</div>
                    <h3 className="feature-title">{f.title}</h3>
                    <p className="feature-desc">{f.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ───────────────────────────────────────────────────────────────────
          STEPS
      ─────────────────────────────────────────────────────────────────── */}
      <section className="section-padded">
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <SectionLabel>خطوات الحجز</SectionLabel>
              <h2 className="section-title">كيف تعمل الخدمة؟</h2>
              <p className="section-subtitle">
                من التسجيل إلى الجلسة مع الدكتور في 4 خطوات بسيطة
              </p>
            </div>
          </ScrollReveal>

          <div className="steps-grid">
            {STEPS.map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 100}>
                <div className="step-card">
                  <div className="step-num">{item.step}</div>
                  <h3 className="step-title">{item.title}</h3>
                  <p className="step-desc">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ───────────────────────────────────────────────────────────────────
          TESTIMONIALS
      ─────────────────────────────────────────────────────────────────── */}
      <section className="section-padded testimonials-section">
        <SectionTexture />
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <SectionLabel>آراء المرضى</SectionLabel>
              <h2 className="section-title">ماذا يقول مرضانا؟</h2>
            </div>
          </ScrollReveal>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <ScrollReveal key={t.name}>
                <blockquote className="testimonial-card">
                  <div className="testimonial-quote-mark" aria-hidden>&ldquo;</div>
                  <p className="testimonial-text">{t.text}</p>
                  <footer className="testimonial-author">
                    <div className="testimonial-avatar">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="testimonial-name">{t.name}</div>
                      <div className="testimonial-title">{t.title}</div>
                    </div>
                  </footer>
                </blockquote>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ───────────────────────────────────────────────────────────────────
          ARTICLES
      ─────────────────────────────────────────────────────────────────── */}
      <section className="section-padded">
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <SectionLabel>المكتبة الطبية</SectionLabel>
              <h2 className="section-title">موارد صحية لك</h2>
              <p className="section-subtitle">
                مقالات وإرشادات طبية من إعداد د. خالد بترجي
              </p>
            </div>
          </ScrollReveal>

          <div className="articles-grid">
            {ARTICLES.map((a, i) => (
              <ScrollReveal key={a.slug} delay={i * 100}>
                <Link href={`/articles/${a.slug}`} className="article-card">
                  <span className="article-tag">{a.tag}</span>
                  <h3 className="article-title">{a.title}</h3>
                  <p className="article-summary">{a.summary}</p>
                  <div className="article-meta">
                    <span className="num">{a.readTime}</span>
                    <span>دقائق قراءة</span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ───────────────────────────────────────────────────────────────────
          FAQ
      ─────────────────────────────────────────────────────────────────── */}
      <section className="section-padded">
        <div className="container">
          <div className="faq-grid">
            <ScrollReveal>
              <div className="faq-copy">
                <SectionLabel>الأسئلة الشائعة</SectionLabel>
                <h2 className="section-title">
                  كل ما تريد معرفته عن الاستشارة
                </h2>
                <p className="faq-lead">
                  إجابات سريعة عن أكثر الأسئلة شيوعاً. إن كان لديك سؤال آخر،
                  لا تتردد في التواصل معنا.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="faq-list">
                {FAQS.map((item) => (
                  <details key={item.q} className="faq-item">
                    <summary className="faq-question">
                      {item.q}
                      <span className="faq-icon" aria-hidden>+</span>
                    </summary>
                    <div className="faq-answer">{item.a}</div>
                  </details>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ───────────────────────────────────────────────────────────────────
          CTA
      ─────────────────────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <ScrollReveal>
            <div className="cta-card">
              <div className="cta-content">
                <h2 className="cta-title">
                  ابدأ رحلة علاجك اليوم
                </h2>
                <p className="cta-desc">
                  احجز استشارتك الآن خلال دقائق واختر موعدك المناسب. رعاية طبية
                  تخصصية بمعايير عالمية في متناول يدك.
                </p>
                <Link href="/consultation/new" className="btn-accent btn-lg">
                  ابدأ الاستشارة
                  <span aria-hidden style={{ fontSize: '1.2rem' }}>←</span>
                </Link>
              </div>
              <div className="cta-visual" aria-hidden>
                <div className="cta-circle" />
                <div className="cta-circle cta-circle-2" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
