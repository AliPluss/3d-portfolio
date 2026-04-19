'use client'

import { useEffect, useState, useRef } from 'react'
import BlogCard, { type Post }          from '@/components/BlogCard'
import PageShell                         from '@/components/PageShell'

// ─── Fallback posts ───────────────────────────────────────────────────────────
const FALLBACK_POSTS: Post[] = [
  {
    _id:         'p1',
    title:       'The Art of Cinematic Web Scrolling with GSAP & Three.js',
    excerpt:     'How to build scroll-driven 3D experiences that feel like film — camera movement, depth of field, and the physics of motion.',
    thumbnail:   'https://images.unsplash.com/photo-1604403428907-673e7f4cd341?w=1400&q=85',
    date:        '2025-03-10',
    slug:        'cinematic-scroll-gsap-threejs',
    category:    'Three.js',
    readingTime: 8,
  },
  {
    _id:         'p2',
    title:       'Designing Dark Luxury UI: From Tokens to Full System',
    excerpt:     'A deep-dive into the design process behind a dark luxury interface — palette selection, typography pairing, and glass morphism.',
    thumbnail:   'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=80',
    date:        '2025-02-20',
    slug:        'dark-luxury-ui-design',
    category:    'Design',
    readingTime: 6,
  },
  {
    _id:         'p3',
    title:       'CSS3DRenderer: The Hidden Power of Three.js',
    excerpt:     "Most developers only use WebGLRenderer. CSS3DRenderer lets you bring real DOM into 3D space — here's how to master it.",
    thumbnail:   'https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?w=800&q=80',
    date:        '2025-01-15',
    slug:        'css3d-renderer-threejs',
    category:    'Three.js',
    readingTime: 5,
  },
  {
    _id:         'p4',
    title:       'Next.js 14 + Framer Motion: Perfect Page Transitions',
    excerpt:     "App Router changed everything. Here's the cleanest architecture for smooth, accessible page transitions in 2025.",
    thumbnail:   'https://images.unsplash.com/photo-1581276879432-15e50529f34b?w=800&q=80',
    date:        '2024-12-08',
    slug:        'nextjs14-page-transitions',
    category:    'Next.js',
    readingTime: 7,
  },
  {
    _id:         'p5',
    title:       'Building a JWT Admin Dashboard with Express + MongoDB',
    excerpt:     'A production-grade pattern for securing your Node.js API routes — JWTs, refresh tokens, and role-based access.',
    thumbnail:   'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    date:        '2024-11-22',
    slug:        'jwt-admin-dashboard',
    category:    'Engineering',
    readingTime: 9,
  },
]

/* ─── Section divider ────────────────────────────────────────────────────────── */
function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '18px',
      margin: '68px 0 42px',
    }}>
      <div style={{
        flex: 1, height: '1px',
        background: 'linear-gradient(90deg, var(--gold-border), transparent)',
      }} />
      <span style={{
        fontFamily:    "'Inter', sans-serif",
        fontSize:      '9px', fontWeight: 500,
        letterSpacing: '0.32em', textTransform: 'uppercase',
        color:         'var(--text-dim)', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{
        flex: 1, height: '1px',
        background: 'linear-gradient(270deg, var(--gold-border), transparent)',
      }} />
    </div>
  )
}

/* ─── Loading skeleton matching editorial layout ─────────────────────────────── */
function LoadingLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Featured skeleton */}
      <div className="skeleton" style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        aspectRatio: '21/9', minHeight: '280px',
      }} />
      {/* Horizontal skeletons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[0, 1].map(i => (
          <div key={i} className="skeleton" style={{
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            height: '190px',
          }} />
        ))}
      </div>
      {/* Compact grid skeletons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="skeleton" style={{
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            aspectRatio: '3/2',
          }} />
        ))}
      </div>
    </div>
  )
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */
export default function BlogPage() {
  const [posts,        setPosts]        = useState<Post[]>([])
  const [loading,      setLoading]      = useState(true)
  const [usingFallback,setUsingFallback]= useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  /* ── Fetch ── */
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

    fetch(`${apiUrl}/api/posts`, { signal: AbortSignal.timeout(4000) })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((data: Post[]) => {
        setPosts(data.length > 0 ? data : FALLBACK_POSTS)
        setUsingFallback(data.length === 0)
      })
      .catch(() => { setPosts(FALLBACK_POSTS); setUsingFallback(true) })
      .finally(() => setLoading(false))
  }, [])

  /* ── Scroll reveals ── */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible') }),
      { threshold: 0.06 },
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [posts])

  /* ── Partition ── */
  const featured    = posts[0]
  const horizontal  = posts.slice(1, 3)   // 2 editorial horizontal cards
  const compact     = posts.slice(3)       // compact 3-col grid

  return (
    <PageShell>
      <main
        className="min-h-screen pb-32"
        style={{ background: 'var(--bg)', paddingTop: '112px' }}
      >
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 clamp(20px, 5vw, 40px)' }}>

          {/* ════════════════════════════════════════
              HEADER
          ════════════════════════════════════════ */}
          <div ref={headerRef} className="reveal" style={{ marginBottom: '64px' }}>
            <p className="section-label" style={{ marginBottom: '20px' }}>Signal</p>

            <div style={{
              display: 'flex', alignItems: 'flex-end',
              justifyContent: 'space-between', flexWrap: 'wrap',
              gap: '24px', marginBottom: '28px',
            }}>
              <h1 style={{
                fontFamily:    "'Playfair Display', serif",
                fontSize:      'clamp(2.8rem, 6vw, 5.2rem)',
                fontWeight:    700,
                color:         '#fff',
                lineHeight:    1.06,
                letterSpacing: '-0.025em',
              }}>
                Writing &amp;<br />
                <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Ideas</em>
              </h1>

              {!loading && (
                <span style={{
                  fontFamily:    "'Inter', sans-serif",
                  fontSize:      '11px', fontWeight: 400,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color:         'var(--text-dim)',
                  alignSelf:     'flex-end', paddingBottom: '8px',
                }}>
                  {String(posts.length).padStart(2, '0')} Articles
                </span>
              )}
            </div>

            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize:   '14px', color: 'var(--text-muted)',
              lineHeight: 1.75, maxWidth: '52ch', marginBottom: '24px',
            }}>
              Thinking aloud on design systems, web motion, and the craft
              of building things that feel as good as they work.
            </p>

            <div className="gold-line" />

            {usingFallback && (
              <p style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-ghost)' }}>
                Showing sample posts — connect the backend to load live content.
              </p>
            )}
          </div>

          {/* ════════════════════════════════════════
              CONTENT
          ════════════════════════════════════════ */}
          {loading ? (
            <LoadingLayout />
          ) : (
            <>
              {/* ── Featured ── */}
              {featured && (
                <div className="reveal">
                  <BlogCard post={featured} variant="featured" />
                </div>
              )}

              {/* ── Horizontal ── */}
              {horizontal.length > 0 && (
                <>
                  <SectionDivider label="Recent Writing" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {horizontal.map((post, i) => (
                      <div
                        key={post._id}
                        className="reveal"
                        style={{ transitionDelay: `${i * 0.08}s` }}
                      >
                        <BlogCard post={post} variant="horizontal" index={i} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Compact grid ── */}
              {compact.length > 0 && (
                <>
                  <SectionDivider label="Archive" />
                  <div style={{
                    display:             'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap:                 '14px',
                  }}>
                    {compact.map((post, i) => (
                      <div
                        key={post._id}
                        className="reveal"
                        style={{ transitionDelay: `${i * 0.07}s` }}
                      >
                        <BlogCard post={post} variant="compact" index={i} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

        </div>
      </main>
    </PageShell>
  )
}
