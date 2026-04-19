'use client'

import { useEffect, useRef }         from 'react'
import { ArrowUpRight }              from 'lucide-react'
import dynamic                       from 'next/dynamic'
import ProjectCard, { type Project } from '@/components/ProjectCard'
import TransitionLink                from '@/components/TransitionLink'

const DenseOrb = dynamic(() => import('@/components/DenseOrb'), { ssr: false })

/* ─── Curated homepage showcase — 1 featured + 3 grid ──────────────────────── */
const SHOWCASE: Project[] = [
  {
    _id:         'hw1',
    title:       '3D Portfolio Experience',
    description: 'Immersive portfolio built with Three.js CSS3DRenderer, GSAP scroll choreography, and a cinematic avatar landing sequence. Designed for motion and depth.',
    image:       'https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?w=1200&q=85',
    link:        '#',
    github:      '#',
    tags:        ['Three.js', 'GSAP', 'Next.js'],
  },
  {
    _id:         'hw2',
    title:       'Real-Time Dashboard',
    description: 'Full-stack analytics platform with live WebSocket feeds and interactive data visualisation.',
    image:       'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    link:        '#',
    github:      '#',
    tags:        ['React', 'Node.js', 'D3.js'],
  },
  {
    _id:         'hw3',
    title:       'Generative Art Engine',
    description: 'WebGL generative art driven by audio — custom GLSL shaders producing unique visual outputs.',
    image:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    link:        '#',
    tags:        ['WebGL', 'GLSL', 'Web Audio API'],
  },
  {
    _id:         'hw4',
    title:       'Motion Design System',
    description: 'Component library with physics-based animations, accessible interactions, and full Storybook coverage.',
    image:       'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    link:        '#',
    github:      '#',
    tags:        ['Framer Motion', 'TypeScript', 'Storybook'],
  },
]

export default function HomeWorkSection() {
  const sectionRef = useRef<HTMLElement>(null)

  /* ── Scroll reveals — only for elements inside this section ── */
  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll<HTMLElement>('.reveal')
    if (!els?.length) return
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('is-visible')
      }),
      { threshold: 0.06 },
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const featured  = SHOWCASE[0]
  const secondary = SHOWCASE.slice(1)

  return (
    <section
      id="work-section"
      ref={sectionRef}
      style={{
        position:             'relative',
        // Transparent at the very top — the fixed atmospheric layer bleeds
        // through, creating visual continuity with the hero's depth.
        // Transitions to a warm near-opaque dark as content emerges.
        background: `linear-gradient(
          to bottom,
          transparent                  0px,
          rgba(6, 4, 2, 0.46)         80px,
          rgba(6, 4, 2, 0.82)         200px,
          rgba(6, 4, 2, 0.96)         380px,
          rgba(6, 4, 2, 0.96)         100%
        )`,
        // Low-intensity blur on the transparent zone blends the fixed
        // atmospheric gradient into the section surface — glass-like depth.
        backdropFilter:       'blur(4px) saturate(0.92)',
        WebkitBackdropFilter: 'blur(4px) saturate(0.92)',
        paddingTop:           'clamp(80px, 10vh, 120px)',
        paddingBottom:        'clamp(100px, 14vh, 180px)',
      }}
    >
      {/* ── Atmospheric continuity glows — echo hero lighting ── */}

      {/* Cool-neutral depth shadow — barely perceptible, no blue read */}
      <div
        aria-hidden
        style={{
          position:      'absolute',
          top:           0,
          left:          0,
          right:         0,
          height:        '420px',
          background:    'radial-gradient(ellipse 62% 85% at 26% 0%, rgba(6,7,9,0.38) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex:        0,
        }}
      />

      {/* Faint gold warmth — echoes the halo and bounce light */}
      <div
        aria-hidden
        style={{
          position:      'absolute',
          top:           0,
          left:          0,
          width:         '42%',
          height:        '560px',
          background:    'radial-gradient(ellipse 80% 55% at 8% 38%, rgba(201,168,76,0.032) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex:        0,
        }}
      />

      {/* ── Split layout container ── */}
      <div
        style={{
          position:   'relative',
          zIndex:     2,
          maxWidth:   '1200px',
          margin:     '0 auto',
          padding:    '0 clamp(24px, 5vw, 60px)',
          display:    'flex',
          gap:        'clamp(36px, 5vw, 80px)',
          alignItems: 'flex-start',
        }}
      >

        {/* ════════════════════════════════════════════════════════════
            LEFT COLUMN — migration destination anchor
            The orb-anchor marks where the future 30M orb will land.
            Nothing renders here yet; the div gives the particle system
            a stable getBoundingClientRect() target.
            ════════════════════════════════════════════════════════════ */}
        <div
          className="hidden md:block"
          style={{ flex: '0 0 clamp(168px, 21%, 248px)', position: 'relative', alignSelf: 'stretch' }}
        >
          <div
            id="orb-anchor"
            aria-hidden
            style={{
              position:        'sticky',
              top:             '80px',
              width:           '100%',
              height:          '248px',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              pointerEvents:   'none',
            }}
          >
            <DenseOrb />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            RIGHT COLUMN — selected work
            ════════════════════════════════════════════════════════════ */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── Section header ── */}
          <div className="reveal" style={{ marginBottom: '52px' }}>

            <p className="section-label" style={{ marginBottom: '22px' }}>
              Selected Work
            </p>

            {/* Heading row — title left, view-all link right */}
            <div
              style={{
                display:        'flex',
                alignItems:     'flex-end',
                justifyContent: 'space-between',
                gap:            '24px',
                flexWrap:       'wrap',
              }}
            >
              <h2
                style={{
                  fontFamily:    "'Playfair Display', serif",
                  fontSize:      'clamp(1.85rem, 3vw, 2.9rem)',
                  fontWeight:    700,
                  lineHeight:    1.07,
                  letterSpacing: '-0.022em',
                  color:         '#ffffff',
                  margin:        0,
                }}
              >
                Projects &amp;<br />
                <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Experiments.</em>
              </h2>

              <TransitionLink
                href="/projects"
                style={{
                  display:       'flex',
                  alignItems:    'center',
                  gap:           '5px',
                  fontFamily:    'Inter, sans-serif',
                  fontSize:      '10px',
                  fontWeight:    500,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color:         'rgba(201,168,76,0.72)',
                  textDecoration:'none',
                  cursor:        'none',
                  paddingBottom: '3px',
                  borderBottom:  '1px solid rgba(201,168,76,0.22)',
                  flexShrink:    0,
                  alignSelf:     'flex-end',
                  marginBottom:  '5px',
                }}
              >
                View all
                <ArrowUpRight size={12} strokeWidth={2} />
              </TransitionLink>
            </div>

            {/* Body copy */}
            <p
              style={{
                marginTop:  '20px',
                fontSize:   '13px',
                color:      'var(--text-muted)',
                lineHeight: 1.75,
                maxWidth:   '52ch',
              }}
            >
              A curated selection of interactive experiences, tools, and
              experiments — each built with depth, motion, and precision.
            </p>

            {/* Gold rule */}
            <div
              style={{
                marginTop:  '28px',
                height:     '1px',
                background: 'linear-gradient(90deg, var(--gold-border), transparent 55%)',
              }}
            />
          </div>

          {/* ── Featured project ── */}
          <div
            className="reveal"
            style={{ marginBottom: '16px', transitionDelay: '0.10s' }}
          >
            <ProjectCard project={featured} index={0} variant="featured" />
          </div>

          {/* ── Secondary grid — 3 cards ── */}
          <div
            className="reveal"
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(252px, 1fr))',
              gap:                 '14px',
              transitionDelay:     '0.20s',
            }}
          >
            {secondary.map((project, i) => (
              <ProjectCard
                key={project._id}
                project={project}
                index={i + 1}
                variant="grid"
              />
            ))}
          </div>

          {/* ── Footer link — mobile fallback ── */}
          <div
            className="reveal md:hidden"
            style={{
              marginTop:      '36px',
              display:        'flex',
              justifyContent: 'center',
              transitionDelay:'0.28s',
            }}
          >
            <TransitionLink href="/projects" className="btn-ghost">
              View all projects
              <ArrowUpRight size={14} />
            </TransitionLink>
          </div>

        </div>
      </div>
    </section>
  )
}
