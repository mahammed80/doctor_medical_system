'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ARTICLES } from '@/lib/articles'

export default function ArticleDetail() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const article = ARTICLES.find(a => a.slug === slug)

  if (!article) {
    return (
      <main className="geo-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card-warm" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--fg)', marginBottom: '0.75rem' }}>المقال غير موجود</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--fg-dim)', lineHeight: 1.6, marginBottom: '2rem' }}>
            عذراً، المقال الذي تبحث عنه غير متوفر حالياً أو قد تم نقله.
          </p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-flex', justifyContent: 'center', width: '100%' }}>
            العودة للرئيسية
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="geo-bg" style={{ minHeight: '100vh', padding: '4rem 0 6rem', position: 'relative' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Back Button */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--primary)',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--r)',
            background: 'var(--primary-subtle)',
            border: '1px solid var(--border-accent)',
            transition: 'all 200ms var(--ease-out)',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateX(5px)'
              e.currentTarget.style.background = 'var(--primary-soft)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateX(0)'
              e.currentTarget.style.background = 'var(--primary-subtle)'
            }}
          >
            → العودة للرئيسية
          </Link>
        </div>

        {/* Article Container Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2.5fr 1fr',
          gap: '2.5rem',
          alignItems: 'start',
        }}>
          {/* Main Content Card */}
          <article className="card-warm" style={{
            padding: '3rem 2.5rem',
            background: 'oklch(100% 0 0 / 0.8)',
            border: '1.5px solid var(--border-accent)',
            boxShadow: 'var(--shadow-md)',
          }}>
            
            {/* Header Category and Read Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700, color: 'white',
                background: 'var(--primary)', padding: '0.25rem 0.75rem',
                borderRadius: 'var(--r-sm)',
              }}>
                {article.tag}
              </span>
              <span style={{
                fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg-dim)',
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                {article.readTime} دقائق قراءة
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4.5vw, 2.5rem)',
              fontWeight: 900,
              color: 'var(--fg)',
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}>
              {article.title}
            </h1>

            {/* Meta information */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.8rem',
              color: 'var(--fg-dim)',
              paddingBottom: '2rem',
              marginBottom: '2rem',
              borderBottom: '1px solid var(--border-faint)',
            }}>
              <div>كتب بواسطة: <strong>{article.author}</strong></div>
              <div style={{ color: 'var(--border)' }}>|</div>
              <div>نُشر في: {article.date}</div>
            </div>

            {/* Article Content */}
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: article.content }}
              style={{
                fontSize: '1.02rem',
                color: 'var(--fg)',
                lineHeight: 1.9,
              }}
            />

          </article>

          {/* Sidebar Area */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '100px' }}>
            
            {/* Consultation Booking Card */}
            <div className="card-warm" style={{
              padding: '2rem 1.5rem',
              background: 'linear-gradient(135deg, oklch(100% 0 0 / 0.9) 0%, var(--surface) 100%)',
              border: '1.5px solid var(--border-accent)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {/* Doctor Avatar */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                overflow: 'hidden',
                margin: '0 auto 1.25rem',
                border: '3px solid var(--primary-soft)',
                boxShadow: '0 4px 12px var(--primary-glow)',
                position: 'relative',
              }}>
                <Image
                  src="/main_image.jpeg"
                  alt="د. خالد بترجي"
                  fill
                  sizes="80px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--fg)', marginBottom: '0.5rem' }}>هل تعاني من آلام المفاصل؟</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                احجز استشارتك المرئية والمباشرة الآن مع الدكتور خالد بترجي من منزلك لتلقي التشخيص الدقيق والخطة العلاجية المناسبة.
              </p>
              
              <Link href="/consultation/new" className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem', padding: '0.8rem 1.25rem' }}>
                ابدأ الاستشارة الآن
              </Link>
            </div>

            {/* Other Articles Card */}
            <div className="card-warm" style={{
              padding: '1.5rem',
              background: 'oklch(100% 0 0 / 0.8)',
              border: '1px solid var(--border-faint)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--fg)', marginBottom: '1rem', borderBottom: '1.5px solid var(--primary-soft)', paddingBottom: '0.5rem' }}>
                مقالات ذات صلة
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ARTICLES.filter(a => a.slug !== slug).map(a => (
                  <Link key={a.slug} href={`/articles/${a.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--fg)', lineHeight: 1.4, transition: 'color 200ms' }}
                         onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                         onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg)')}
                    >
                      {a.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--fg-dim)', marginTop: '0.2rem' }}>
                      {a.tag} • {a.readTime} دقائق قراءة
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </aside>
        </div>

      </div>
    </main>
  )
}
