'use client'

import { useEffect, useState, useRef } from 'react'
import BlogCard, { type Post }          from '@/components/BlogCard'
import PageShell                         from '@/components/PageShell'
import TextReveal                      from '@/components/TextReveal'
import { motion, Variants }            from 'framer-motion'

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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
    },
  }

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
          <motion.div 
            variants={container}
            initial="hidden"
            animate="visible"
            className="mb-16"
          >
            <motion.p variants={item} className="section-label mb-5">Signal</motion.p>

            <div className="flex items-end justify-between flex-wrap gap-6 mb-7">
              <motion.h1 
                variants={item}
                className="font-display text-[clamp(2.4rem,6vw,5.2rem)] font-bold text-white leading-[1.06] tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Writing &amp;<br />
                <em className="italic font-normal text-gold">Ideas</em>
              </motion.h1>

              {!loading && (
                <motion.span 
                  variants={item}
                  className="font-inter text-[11px] font-normal tracking-[0.12em] text-white/40 uppercase self-end pb-2"
                >
                  {String(posts.length).padStart(2, '0')} Entries
                </motion.span>
              )}
            </div>

            <motion.p 
              variants={item}
              className="font-inter text-[14px] text-white/50 leading-relaxed max-w-[52ch] mb-6"
            >
              Thinking aloud on design systems, web motion, and the craft
              of building things that feel as good as they work.
            </motion.p>

            <motion.div variants={item} className="gold-line" />

            {usingFallback && (
              <motion.p variants={item} className="mt-4 text-[11px] text-white/30 tracking-wider uppercase">
                Viewing editorial archive
              </motion.p>
            )}
          </motion.div>

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
