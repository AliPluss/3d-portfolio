'use client'

import { useEffect, useState, useRef } from 'react'
import ProjectCard, { type Project }   from '@/components/ProjectCard'
import PageShell                        from '@/components/PageShell'

// ─── Fallback data ────────────────────────────────────────────────────────────
const FALLBACK_PROJECTS: Project[] = [
  {
    _id:   'f1',
    title: '3D Portfolio Experience',
    description:
      'Immersive portfolio site with Three.js CSS3DRenderer, GSAP scroll animations, and a cinematic avatar landing sequence. Built for motion and depth.',
    image:  'https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?w=1200&q=85',
    link:   '#',
    github: '#',
    tags:   ['Three.js', 'GSAP', 'Next.js'],
  },
  {
    _id:   'f2',
    title: 'Real-Time Data Dashboard',
    description:
      'Full-stack analytics dashboard with live WebSocket feeds, interactive charts, and a Node.js/MongoDB backend.',
    image:  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    link:   '#',
    github: '#',
    tags:   ['React', 'Node.js', 'MongoDB', 'D3.js'],
  },
  {
    _id:   'f3',
    title: 'Generative Art Engine',
    description:
      'A WebGL-based generative art system that creates unique visual outputs from audio input using custom shaders.',
    image:  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    link:   '#',
    tags:   ['WebGL', 'GLSL', 'Web Audio API'],
  },
  {
    _id:   'f4',
    title: 'E-Commerce Platform',
    description:
      'High-performance e-commerce solution with headless CMS, edge caching, and sub-second page transitions.',
    image:  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
    link:   '#',
    github: '#',
    tags:   ['Next.js', 'Stripe', 'Sanity', 'Tailwind'],
  },
  {
    _id:   'f5',
    title: 'AI Writing Assistant',
    description:
      'LLM-powered writing tool with context-aware suggestions, real-time collaboration, and custom fine-tuning.',
    image:  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
    link:   '#',
    tags:   ['Python', 'FastAPI', 'OpenAI', 'React'],
  },
  {
    _id:   'f6',
    title: 'Motion Design System',
    description:
      'Component library with physics-based animations, accessible interactions, and a comprehensive Storybook.',
    image:  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    link:   '#',
    github: '#',
    tags:   ['Framer Motion', 'TypeScript', 'Storybook'],
  },
]

/* ─── Loading skeletons matching the editorial layout ───────────────────────── */
function LoadingLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Featured skeleton */}
      <div className="skeleton" style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        aspectRatio: '16/8',
      }} />
      {/* Duo skeletons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {[0, 1].map(i => (
          <div key={i} className="skeleton" style={{
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            aspectRatio: '3/4',
          }} />
        ))}
      </div>
      {/* Grid skeletons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="skeleton" style={{
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            aspectRatio: '4/3',
          }} />
        ))}
      </div>
    </div>
  )
}

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
        fontFamily: "'Inter', sans-serif",
        fontSize: '9px', fontWeight: 500,
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        color: 'var(--text-dim)',
        whiteSpace: 'nowrap',
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

/* ─── Page ─────────────────────────────────────────────────────────────────── */
export default function ProjectsPage() {
  const [projects,     setProjects]     = useState<Project[]>([])
  const [loading,      setLoading]      = useState(true)
  const [usingFallback,setUsingFallback]= useState(false)

  const headerRef = useRef<HTMLDivElement>(null)

  /* ── Fetch ── */
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

    fetch(`${apiUrl}/api/projects`, { signal: AbortSignal.timeout(4000) })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((data: Project[]) => {
        setProjects(data.length > 0 ? data : FALLBACK_PROJECTS)
        setUsingFallback(data.length === 0)
      })
      .catch(() => { setProjects(FALLBACK_PROJECTS); setUsingFallback(true) })
      .finally(() => setLoading(false))
  }, [])

  /* ── Scroll reveals ── */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible') }),
      { threshold: 0.07 },
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [projects])

  /* ── Partition projects ── */
  const featured = projects[0]
  const duo      = projects.slice(1, 3)
  const grid     = projects.slice(3)

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
            <p className="section-label" style={{ marginBottom: '20px' }}>
              Selected Work
            </p>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', marginBottom: '28px' }}>
              <h1 style={{
                fontFamily:    "'Playfair Display', serif",
                fontSize:      'clamp(2.8rem, 6vw, 5.2rem)',
                fontWeight:    700,
                color:         '#fff',
                lineHeight:    1.06,
                letterSpacing: '-0.025em',
              }}>
                Projects &amp;<br />
                <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Experiments</em>
              </h1>

              {/* Editorial counter */}
              {!loading && (
                <span style={{
                  fontFamily:    "'Inter', sans-serif",
                  fontSize:      '11px', fontWeight: 400,
                  letterSpacing: '0.12em',
                  color:         'var(--text-dim)',
                  textTransform: 'uppercase',
                  alignSelf:     'flex-end',
                  paddingBottom: '8px',
                }}>
                  {String(projects.length).padStart(2, '0')} Projects
                </span>
              )}
            </div>

            {/* Intro */}
            <p style={{
              fontFamily:  "'Inter', sans-serif",
              fontSize:    '14px',
              color:       'var(--text-muted)',
              lineHeight:  1.75,
              maxWidth:    '56ch',
              marginBottom:'24px',
            }}>
              Craft-driven work at the intersection of design, code, and motion.
              Each project is a considered response to a hard problem.
            </p>

            <div className="gold-line" />

            {usingFallback && (
              <p style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-ghost)', letterSpacing: '0.05em' }}>
                Showing sample projects — connect the backend to load live data.
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
                  <ProjectCard project={featured} index={0} variant="featured" />
                </div>
              )}

              {/* ── Duo ── */}
              {duo.length > 0 && (
                <>
                  <SectionDivider label="Further Work" />
                  <div style={{
                    display:             'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap:                 '16px',
                  }}>
                    {duo.map((project, i) => (
                      <div
                        key={project._id}
                        className="reveal"
                        style={{ transitionDelay: `${i * 0.08}s` }}
                      >
                        <ProjectCard project={project} index={i + 1} variant="duo" />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Grid ── */}
              {grid.length > 0 && (
                <>
                  <SectionDivider label="Additional Work" />
                  <div style={{
                    display:             'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap:                 '16px',
                  }}>
                    {grid.map((project, i) => (
                      <div
                        key={project._id}
                        className="reveal"
                        style={{ transitionDelay: `${i * 0.07}s` }}
                      >
                        <ProjectCard project={project} index={i + 3} variant="grid" />
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
