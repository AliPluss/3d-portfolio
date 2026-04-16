'use client'

import { useEffect, useState, useRef } from 'react'
import BlogCard, { type Post } from '@/components/BlogCard'

// ─── Fallback posts ───────────────────────────────────────────────────────────
const FALLBACK_POSTS: Post[] = [
  {
    _id: 'p1',
    title: 'The Art of Cinematic Web Scrolling with GSAP & Three.js',
    excerpt: 'How to build scroll-driven 3D experiences that feel like film — camera movement, depth of field, and the physics of motion.',
    thumbnail: 'https://images.unsplash.com/photo-1604403428907-673e7f4cd341?w=1200&q=85',
    date: '2025-03-10',
    slug: 'cinematic-scroll-gsap-threejs',
  },
  {
    _id: 'p2',
    title: 'Designing Dark Luxury UI: From Tokens to Full System',
    excerpt: 'A deep-dive into the design process behind a dark luxury interface — palette selection, typography pairing, and glass morphism.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    date: '2025-02-20',
    slug: 'dark-luxury-ui-design',
  },
  {
    _id: 'p3',
    title: 'CSS3DRenderer: The Hidden Power of Three.js',
    excerpt: 'Most developers only use WebGLRenderer. CSS3DRenderer lets you bring real DOM into 3D space — here\'s how to master it.',
    thumbnail: 'https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?w=800&q=80',
    date: '2025-01-15',
    slug: 'css3d-renderer-threejs',
  },
  {
    _id: 'p4',
    title: 'Next.js 14 + Framer Motion: Perfect Page Transitions',
    excerpt: 'App Router changed everything. Here\'s the cleanest architecture for smooth, accessible page transitions in 2025.',
    thumbnail: 'https://images.unsplash.com/photo-1581276879432-15e50529f34b?w=800&q=80',
    date: '2024-12-08',
    slug: 'nextjs14-page-transitions',
  },
  {
    _id: 'p5',
    title: 'Building a JWT Admin Dashboard with Express + MongoDB',
    excerpt: 'A production-grade pattern for securing your Node.js API routes — JWTs, refresh tokens, and role-based access.',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    date: '2024-11-22',
    slug: 'jwt-admin-dashboard',
  },
]

export default function BlogPage() {
  const [posts, setPosts]   = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

    fetch(`${apiUrl}/api/posts`, { signal: AbortSignal.timeout(4000) })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: Post[]) => {
        setPosts(data.length > 0 ? data : FALLBACK_POSTS)
        setUsingFallback(data.length === 0)
      })
      .catch(() => {
        setPosts(FALLBACK_POSTS)
        setUsingFallback(true)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!headerRef.current) return
    const el = headerRef.current
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('is-visible') },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const featured = posts[0]
  const rest     = posts.slice(1)

  return (
    <main className="min-h-screen pt-28 pb-28 px-6 md:px-10" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div ref={headerRef} className="reveal mb-20">
          <p style={{
            fontSize: '10px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: '16px',
          }}>Signal</p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.08,
            marginBottom: '20px',
          }}>
            Writing &amp;<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Ideas</em>
          </h1>
          <div className="gold-line" />
          {usingFallback && (
            <p style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-dim)' }}>
              Showing sample posts — connect the backend to load live content.
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 'var(--radius)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  height: i === 0 ? '400px' : '280px',
                }}
                className="animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {/* ── Featured post (large) ── */}
            {featured && (
              <div className="mb-10">
                <BlogCard post={featured} featured />
              </div>
            )}

            {/* ── Divider ── */}
            {rest.length > 0 && (
              <div className="gold-line-full mb-10" />
            )}

            {/* ── Grid ── */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post, i) => (
                  <BlogCard key={post._id} post={post} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
