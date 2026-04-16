'use client'

import { useEffect, useState, useRef } from 'react'
import ProjectCard, { type Project } from '@/components/ProjectCard'

// ─── Fallback data (shown when API is unavailable) ─────────────────────────
const FALLBACK_PROJECTS: Project[] = [
  {
    _id: 'f1',
    title: '3D Portfolio Experience',
    description: 'Immersive portfolio site with Three.js CSS3DRenderer, GSAP scroll animations, and a cinematic avatar landing sequence.',
    image: 'https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?w=800&q=80',
    link: '#',
    github: '#',
    tags: ['Three.js', 'GSAP', 'Next.js'],
  },
  {
    _id: 'f2',
    title: 'Real-Time Data Dashboard',
    description: 'Full-stack analytics dashboard with live WebSocket feeds, interactive charts, and a Node.js/MongoDB backend.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    link: '#',
    github: '#',
    tags: ['React', 'Node.js', 'MongoDB', 'D3.js'],
  },
  {
    _id: 'f3',
    title: 'Generative Art Engine',
    description: 'A WebGL-based generative art system that creates unique visual outputs from audio input using custom shaders.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    link: '#',
    tags: ['WebGL', 'GLSL', 'Web Audio API'],
  },
  {
    _id: 'f4',
    title: 'E-Commerce Platform',
    description: 'High-performance e-commerce solution with headless CMS, edge caching, and sub-second page transitions.',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
    link: '#',
    github: '#',
    tags: ['Next.js', 'Stripe', 'Sanity', 'Tailwind'],
  },
  {
    _id: 'f5',
    title: 'AI Writing Assistant',
    description: 'LLM-powered writing tool with context-aware suggestions, real-time collaboration, and custom fine-tuning.',
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
    link: '#',
    tags: ['Python', 'FastAPI', 'OpenAI', 'React'],
  },
  {
    _id: 'f6',
    title: 'Motion Design System',
    description: 'Component library with physics-based animations, accessible interactions, and a comprehensive Storybook.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    link: '#',
    github: '#',
    tags: ['Framer Motion', 'TypeScript', 'Storybook'],
  },
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading,  setLoading]  = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

    fetch(`${apiUrl}/api/projects`, { signal: AbortSignal.timeout(4000) })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: Project[]) => {
        setProjects(data.length > 0 ? data : FALLBACK_PROJECTS)
        setUsingFallback(data.length === 0)
      })
      .catch(() => {
        setProjects(FALLBACK_PROJECTS)
        setUsingFallback(true)
      })
      .finally(() => setLoading(false))
  }, [])

  // Scroll-reveal for header
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
          }}>
            Selected Work
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.08,
            marginBottom: '20px',
          }}>
            Projects &amp;<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Experiments</em>
          </h1>
          <div className="gold-line" />
          {usingFallback && (
            <p style={{
              marginTop: '14px',
              fontSize: '11px',
              color: 'var(--text-dim)',
              letterSpacing: '0.05em',
            }}>
              Showing sample projects — connect the backend to load live data.
            </p>
          )}
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 'var(--radius)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  aspectRatio: '4/3',
                  animationDuration: `${1.2 + i * 0.15}s`,
                }}
                className="animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <ProjectCard key={project._id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
