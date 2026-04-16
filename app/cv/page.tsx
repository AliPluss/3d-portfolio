'use client'

import { useEffect, useRef } from 'react'
import { Download } from 'lucide-react'

const EXPERIENCE = [
  {
    role:    'Creative Developer',
    company: 'Freelance',
    period:  '2022 — Present',
    points: [
      'Built immersive 3D web experiences using Three.js, CSS3DRenderer, and custom GLSL shaders.',
      'Architected full-stack applications with Next.js 14, Node.js, and MongoDB.',
      'Led visual direction for digital products achieving Awwwards nominations.',
    ],
  },
  {
    role:    'Front-End Engineer',
    company: 'Studio X',
    period:  '2020 — 2022',
    points: [
      'Delivered interactive campaigns for Fortune 500 clients with sub-1.5s LCP.',
      'Introduced GSAP-based animation system adopted across the entire engineering team.',
      'Mentored two junior developers on WebGL fundamentals and performance best practices.',
    ],
  },
  {
    role:    'UI Developer',
    company: 'Digital Agency',
    period:  '2018 — 2020',
    points: [
      'Converted complex Figma designs into pixel-perfect, accessible React components.',
      'Reduced design-to-dev handoff cycle by 40% through systematic component documentation.',
    ],
  },
]

const EDUCATION = [
  {
    degree:      'BSc Computer Science',
    institution: 'University of Technology',
    period:      '2014 — 2018',
    note:        'First Class Honours · Thesis: Real-time 3D rendering in the browser',
  },
  {
    degree:      'Advanced Certificate — 3D & Motion Design',
    institution: 'Motion School',
    period:      '2021',
  },
]

const SKILLS = [
  'Three.js', 'WebGL', 'GLSL', 'GSAP', 'Framer Motion',
  'React', 'Next.js', 'TypeScript', 'Node.js', 'Express',
  'MongoDB', 'PostgreSQL', 'Tailwind CSS', 'Figma', 'Blender',
]

export default function CVPage() {
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('is-visible')
      }),
      { threshold: 0.12 }
    )
    sectionRefs.current.forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const addRef = (i: number) => (el: HTMLElement | null) => {
    sectionRefs.current[i] = el
  }

  return (
    <main className="min-h-screen pt-24 pb-28 px-6 md:px-10 print-area" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto">

        {/* Download */}
        <div className="flex justify-end mb-10 no-print">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full
                       text-xs tracking-widest uppercase transition-all"
            style={{
              border:  '1px solid var(--gold-border)',
              color:   'var(--text-muted)',
              background: 'transparent',
              cursor: 'none',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.color          = '#fff'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor    = 'var(--gold-muted)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow      = '0 0 20px var(--gold-glow)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.color          = 'var(--text-muted)'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor    = 'var(--gold-border)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow      = 'none'
            }}
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>

        {/* ── Header ── */}
        <header
          ref={addRef(0)}
          className="reveal mb-16"
        >
          <p style={{
            fontSize: '10px', letterSpacing: '0.3em',
            textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '16px',
          }}>
            Curriculum Vitae
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            fontWeight: 700, lineHeight: 1.06, color: '#fff', marginBottom: '12px',
          }}>
            Your<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Name</em>
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Creative Developer &amp; 3D Web Designer
          </p>
          <div className="flex flex-wrap gap-5" style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
            <span>your@email.com</span>
            <span style={{ color: 'var(--gold-border)' }}>·</span>
            <span>github.com/handle</span>
            <span style={{ color: 'var(--gold-border)' }}>·</span>
            <span>yoursite.com</span>
          </div>
        </header>

        <GoldDivider />

        {/* ── About ── */}
        <section ref={addRef(1)} className="reveal mb-14">
          <SectionLabel>Profile</SectionLabel>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: '560px' }}>
            Creative developer with a focus on 3D web experiences and immersive digital design.
            I bridge the gap between engineering precision and artistic vision — building things
            that feel as good as they look. Rooted in Mesopotamian heritage, shaped by Nordic
            minimalism, driven by technology.
          </p>
        </section>

        {/* ── Experience ── */}
        <section ref={addRef(2)} className="reveal mb-14">
          <SectionLabel>Experience</SectionLabel>
          <div className="flex flex-col" style={{ gap: '40px' }}>
            {EXPERIENCE.map((job, i) => (
              <div key={i} className="flex gap-6">
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center pt-1.5" style={{ flexShrink: 0 }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'var(--gold)', boxShadow: '0 0 8px var(--gold-glow)',
                  }} />
                  {i < EXPERIENCE.length - 1 && (
                    <div style={{
                      width: '1px', flexGrow: 1, marginTop: '8px',
                      background: 'linear-gradient(to bottom, var(--gold-border), transparent)',
                    }} />
                  )}
                </div>
                <div style={{ paddingBottom: i < EXPERIENCE.length - 1 ? '0' : '0' }}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <h3 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '1rem', fontWeight: 600, color: '#fff',
                    }}>
                      {job.role}
                    </h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                      {job.period}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.18em',
                    color: 'var(--gold-muted)', marginBottom: '10px',
                  }}>
                    {job.company}
                  </p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {job.points.map((p, j) => (
                      <li key={j} style={{
                        fontSize: '13px', color: 'var(--text-muted)',
                        lineHeight: 1.7, display: 'flex', gap: '10px',
                      }}>
                        <span style={{ color: 'var(--gold-border)', marginTop: '2px', flexShrink: 0 }}>—</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <GoldDivider />

        {/* ── Education ── */}
        <section ref={addRef(3)} className="reveal my-14">
          <SectionLabel>Education</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {EDUCATION.map((edu, i) => (
              <div key={i} style={{
                display: 'flex', flexWrap: 'wrap',
                alignItems: 'baseline', justifyContent: 'space-between', gap: '8px',
              }}>
                <div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '2px',
                  }}>
                    {edu.degree}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{edu.institution}</p>
                  {edu.note && (
                    <p style={{ fontSize: '11px', color: 'var(--gold-muted)', marginTop: '3px' }}>{edu.note}</p>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                  {edu.period}
                </span>
              </div>
            ))}
          </div>
        </section>

        <GoldDivider />

        {/* ── Skills ── */}
        <section ref={addRef(4)} className="reveal mt-14">
          <SectionLabel>Skills &amp; Tools</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SKILLS.map((skill) => (
              <span
                key={skill}
                style={{
                  fontSize: '11px',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  border: '1px solid var(--gold-border)',
                  color: 'var(--text-muted)',
                  background: 'var(--gold-subtle)',
                  letterSpacing: '0.03em',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: '9px',
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
      color: 'var(--gold)',
      marginBottom: '20px',
    }}>
      {children}
    </p>
  )
}

function GoldDivider() {
  return (
    <div style={{
      width: '100%', height: '1px', marginBottom: '0',
      background: 'linear-gradient(90deg, transparent, var(--gold-border), transparent)',
    }} />
  )
}
