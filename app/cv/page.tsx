'use client'

import { useEffect, useState } from 'react'
import { Download }            from 'lucide-react'
import PageShell               from '@/components/PageShell'
import { motion, Variants }    from 'framer-motion'
import MagneticButton          from '@/components/MagneticButton'

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */

const STATS = [
  { value: '7+',  label: 'Years' },
  { value: '40+', label: 'Projects' },
  { value: '3',   label: 'Awards' },
]

const EXPERIENCE = [
  {
    index:   '01',
    role:    'Creative Developer',
    company: 'Freelance — Remote',
    period:  '2022 — Present',
    points: [
      'Built immersive 3D web experiences using Three.js, CSS3DRenderer, and custom GLSL shaders.',
      'Architected full-stack applications with Next.js 14, Node.js, and MongoDB.',
      'Led visual direction for digital products achieving Awwwards nominations.',
    ],
  },
  {
    index:   '02',
    role:    'Front-End Engineer',
    company: 'Studio X — London',
    period:  '2020 — 2022',
    points: [
      'Delivered interactive campaigns for Fortune 500 clients with sub-1.5s LCP.',
      'Introduced GSAP-based animation system adopted across the entire engineering team.',
      'Mentored two junior developers on WebGL fundamentals and performance best practices.',
    ],
  },
  {
    index:   '03',
    role:    'UI Developer',
    company: 'Digital Agency — Berlin',
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
    note:        'First Class Honours',
    thesis:      'Thesis: Real-time 3D rendering in the browser',
  },
  {
    degree:      'Advanced Certificate',
    subtitle:    '3D & Motion Design',
    institution: 'Motion School',
    period:      '2021',
  },
]

const SKILL_GROUPS = [
  {
    category: 'Creative & Motion',
    items:    ['Three.js', 'CSS3DRenderer', 'WebGL / GLSL', 'GSAP', 'Framer Motion', 'Spline'],
  },
  {
    category: 'Engineering',
    items:    ['React', 'Next.js 14', 'TypeScript', 'Node.js / Express', 'MongoDB', 'PostgreSQL'],
  },
  {
    category: 'Design & Tools',
    items:    ['Figma', 'Blender', 'Tailwind CSS', 'Adobe Suite', 'Storybook'],
  },
]

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

function SectionHeading({ label }: { label: string }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      '9px', fontWeight: 500,
          letterSpacing: '0.36em',
          textTransform: 'uppercase',
          color:         'var(--gold)',
          flexShrink:    0,
        }}>
          {label}
        </span>
        <div style={{
          flex:       1,
          height:     '1px',
          background: 'linear-gradient(90deg, var(--gold-border), transparent)',
        }} />
      </div>
    </div>
  )
}

function ExperienceBlock({
  job,
  hovered,
  onEnter,
  onLeave,
}: {
  job:     typeof EXPERIENCE[number]
  hovered: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        background:   hovered ? 'var(--surface-2)' : 'var(--surface)',
        border:       `1px solid ${hovered ? 'var(--gold-border)' : 'var(--border)'}`,
        borderLeft:   `2px solid ${hovered ? 'var(--gold)' : 'rgba(201,168,76,0.22)'}`,
        borderRadius: `0 var(--radius-sm) var(--radius-sm) 0`,
        padding:      '22px 24px',
        cursor:       'none',
        transition:   `background var(--t-base) var(--ease),
                       border-color var(--t-base) var(--ease)`,
      }}
    >
      {/* Header */}
      <div style={{
        display:        'flex',
        alignItems:     'flex-start',
        justifyContent: 'space-between',
        gap:            '12px',
        marginBottom:   '4px',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span style={{
            fontFamily:    "'Inter', sans-serif",
            fontSize:      '9px', fontWeight: 500,
            letterSpacing: '0.18em',
            color:         'var(--text-ghost)',
            flexShrink:    0,
          }}>
            {job.index}
          </span>
          <h3 style={{
            fontFamily:    "'Playfair Display', serif",
            fontSize:      '1.05rem', fontWeight: 600,
            color:         hovered ? '#fff' : 'var(--text-secondary)',
            lineHeight:    1.2,
            letterSpacing: '-0.010em',
            transition:    'color var(--t-base)',
          }}>
            {job.role}
          </h3>
        </div>
        <span style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      '10px', fontWeight: 400,
          letterSpacing: '0.06em',
          color:         'var(--text-dim)',
          flexShrink:    0,
          paddingTop:    '2px',
        }}>
          {job.period}
        </span>
      </div>

      <p style={{
        fontFamily:    "'Inter', sans-serif",
        fontSize:      '9px', fontWeight: 500,
        letterSpacing: '0.20em', textTransform: 'uppercase',
        color:         'var(--gold-muted)',
        marginBottom:  '14px',
      }}>
        {job.company}
      </p>

      {/* Rule */}
      <div style={{ height: '1px', background: 'var(--border)', marginBottom: '14px' }} />

      {/* Points */}
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '7px', margin: 0, padding: 0, listStyle: 'none' }}>
        {job.points.map((point, i) => (
          <li key={i} style={{ display: 'flex', gap: '10px' }}>
            <span style={{
              color:     'var(--gold-border)',
              flexShrink: 0,
              marginTop:  '2px',
              fontSize:   '13px',
              lineHeight: 1.7,
            }}>—</span>
            <span style={{
              fontSize:   '13px',
              color:      'var(--text-muted)',
              lineHeight: 1.75,
            }}>
              {point}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EducationCard({ edu }: { edu: typeof EDUCATION[number] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   hovered ? 'var(--surface-2)' : 'var(--surface)',
        border:       `1px solid ${hovered ? 'var(--gold-border)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        padding:      '20px 22px',
        cursor:       'none',
        transition:   `background var(--t-base) var(--ease),
                       border-color var(--t-base) var(--ease)`,
      }}
    >
      <span style={{
        fontFamily:    "'Inter', sans-serif",
        fontSize:      '10px', fontWeight: 400,
        letterSpacing: '0.06em',
        color:         'var(--text-dim)',
        display:       'block',
        marginBottom:  '10px',
      }}>
        {edu.period}
      </span>

      <h3 style={{
        fontFamily:    "'Playfair Display', serif",
        fontSize:      '1rem', fontWeight: 600,
        color:         '#fff', lineHeight: 1.2,
        letterSpacing: '-0.010em',
        marginBottom:  'subtitle' in edu && edu.subtitle ? '2px' : '6px',
      }}>
        {edu.degree}
      </h3>

      {'subtitle' in edu && edu.subtitle && (
        <p style={{
          fontFamily:  "'Playfair Display', serif",
          fontSize:    '0.85rem', fontStyle: 'italic',
          color:       'var(--gold)', lineHeight: 1.2,
          marginBottom: '6px',
        }}>
          {edu.subtitle}
        </p>
      )}

      <p style={{
        fontFamily:    "'Inter', sans-serif",
        fontSize:      '11px',
        color:         'var(--text-dim)',
        letterSpacing: '0.03em',
        marginBottom:  ('note' in edu && edu.note) || ('thesis' in edu && edu.thesis) ? '10px' : '0',
      }}>
        {edu.institution}
      </p>

      {'note' in edu && edu.note && (
        <p style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      '11px', fontWeight: 500,
          color:         'var(--gold-muted)',
          letterSpacing: '0.04em',
          marginBottom:  'thesis' in edu && edu.thesis ? '3px' : '0',
        }}>
          {edu.note}
        </p>
      )}

      {'thesis' in edu && edu.thesis && (
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize:   '11px', fontStyle: 'italic',
          color:      'var(--text-ghost)',
          lineHeight: 1.5,
        }}>
          {edu.thesis}
        </p>
      )}
    </div>
  )
}

function SkillGroup({ group }: { group: typeof SKILL_GROUPS[number] }) {
  return (
    <div>
      {/* Category header */}
      <p style={{
        fontFamily:    "'Inter', sans-serif",
        fontSize:      '9px', fontWeight: 500,
        letterSpacing: '0.28em', textTransform: 'uppercase',
        color:         'var(--gold)',
        marginBottom:  '10px',
      }}>
        {group.category}
      </p>
      <div style={{
        height:       '1px',
        background:   'linear-gradient(90deg, var(--gold-border), transparent)',
        marginBottom: '16px',
      }} />
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '9px' }}>
        {group.items.map(item => (
          <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '4px', height: '4px', borderRadius: '50%',
              background: 'var(--gold-border)', flexShrink: 0,
            }} />
            <span style={{
              fontFamily:    "'Inter', sans-serif",
              fontSize:      '13px',
              color:         'var(--text-muted)',
              letterSpacing: '0.01em',
            }}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */

export default function CVPage() {
  const [hoveredExp, setHoveredExp] = useState<number | null>(null)

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
        className="min-h-screen pb-32 print-area"
        style={{ background: 'var(--bg)', paddingTop: '112px' }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 clamp(20px, 5vw, 40px)' }}>

          {/* ══════════════════════════════════════
              DOWNLOAD UTILITY
          ══════════════════════════════════════ */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
            <MagneticButton>
              <button className="btn-gold" aria-label="Download Curriculum Vitae as PDF" onClick={() => window.print()}>
                <Download size={13} />
                Download PDF
              </button>
            </MagneticButton>
          </div>

          {/* ══════════════════════════════════════
              HERO — NAME + STATS
          ══════════════════════════════════════ */}
          <motion.header 
            variants={container}
            initial="hidden"
            animate="visible"
            style={{ marginBottom: '56px' }}
          >

            <motion.p variants={item} className="section-label" style={{ marginBottom: '22px' }}>
              Curriculum Vitae
            </motion.p>

            {/* Name row + stats */}
            <div style={{
              display:        'flex',
              alignItems:     'flex-start',
              justifyContent: 'space-between',
              gap:            '32px',
              flexWrap:       'wrap',
              marginBottom:   '20px',
            }}>
              {/* Left: name + title */}
              <div>
                <h1 style={{
                  fontFamily:    "'Playfair Display', serif",
                  fontSize:      'clamp(2.4rem, 7vw, 5rem)',
                  fontWeight:    700,
                  lineHeight:    1.04,
                  letterSpacing: '-0.025em',
                  color:         '#fff',
                  marginBottom:  '16px',
                }}>
                  Your<br />
                  <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Name</em>
                </h1>
                <p style={{
                  fontFamily:    "'Inter', sans-serif",
                  fontSize:      '13px',
                  color:         'var(--text-muted)',
                  letterSpacing: '0.02em',
                  lineHeight:    1.5,
                }}>
                  Creative Developer &amp; 3D Web Designer
                </p>
              </div>

              {/* Right: stats */}
              <div style={{
                display:        'flex',
                alignItems:     'flex-start',
                alignSelf:      'flex-end',
                gap:            '0',
                paddingBottom:  '4px',
              }}>
                {STATS.map((stat, i) => (
                  <div key={stat.label} style={{
                    paddingLeft:  i > 0 ? '22px' : '0',
                    paddingRight: i < STATS.length - 1 ? '22px' : '0',
                    borderLeft:   i > 0 ? '1px solid var(--border)' : 'none',
                    textAlign:    'center',
                  }}>
                    <p style={{
                      fontFamily:    "'Playfair Display', serif",
                      fontSize:      '2.2rem',
                      fontWeight:    700,
                      color:         'var(--gold)',
                      lineHeight:    1,
                      letterSpacing: '-0.020em',
                      marginBottom:  '5px',
                    }}>
                      {stat.value}
                    </p>
                    <p style={{
                      fontFamily:    "'Inter', sans-serif",
                      fontSize:      '9px', fontWeight: 500,
                      letterSpacing: '0.20em', textTransform: 'uppercase',
                      color:         'var(--text-dim)',
                    }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact strip */}
            <div style={{
              display:       'flex',
              flexWrap:      'wrap',
              alignItems:    'center',
              gap:           '0',
              marginBottom:  '28px',
              fontFamily:    "'Inter', sans-serif",
              fontSize:      '11px',
              color:         'var(--text-dim)',
              letterSpacing: '0.04em',
            }}>
              {(['contact@email.com', 'github.com/handle', 'yoursite.com'] as const).map((item, i) => (
                <span key={item} style={{ display: 'flex', alignItems: 'center' }}>
                  {i > 0 && (
                    <span style={{ margin: '0 10px', color: 'var(--gold-border)', fontSize: '9px' }}>·</span>
                  )}
                  {item}
                </span>
              ))}
            </div>

            {/* Gold rule */}
            <motion.div 
              variants={item}
              style={{
                height:     '1px',
                background: 'linear-gradient(90deg, var(--gold-border) 0%, transparent 70%)',
              }} 
            />
          </motion.header>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
          >
            {/* ══════════════════════════════════════
                PROFILE
            ══════════════════════════════════════ */}
            <motion.section variants={item} style={{ marginBottom: '52px' }}>
            <SectionHeading label="Profile" />

            <blockquote style={{
              margin:       0,
              border:       '1px solid var(--border)',
              borderLeft:   '3px solid var(--gold)',
              borderRadius: `0 var(--radius-sm) var(--radius-sm) 0`,
              background:   'var(--surface)',
              padding:      '22px 26px 22px 28px',
            }}>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize:   '14px',
                color:      'var(--text-muted)',
                lineHeight: 1.82,
                margin:     0,
              }}>
                Creative developer with a focus on 3D web experiences and immersive digital design.
                I bridge the gap between engineering precision and artistic vision — building things
                that feel as good as they look. Rooted in Mesopotamian heritage, shaped by Nordic
                minimalism, and driven by the belief that the web is the most powerful creative medium alive.
              </p>
            </blockquote>
          </motion.section>

          {/* ══════════════════════════════════════
              EXPERIENCE
          ══════════════════════════════════════ */}
          <motion.section variants={item} style={{ marginBottom: '52px' }}>
            <SectionHeading label="Experience" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {EXPERIENCE.map((job, i) => (
                <ExperienceBlock
                  key={job.index}
                  job={job}
                  hovered={hoveredExp === i}
                  onEnter={() => setHoveredExp(i)}
                  onLeave={() => setHoveredExp(null)}
                />
              ))}
            </div>
          </motion.section>

          {/* ══════════════════════════════════════
              EDUCATION
          ══════════════════════════════════════ */}
          <motion.section variants={item} style={{ marginBottom: '52px' }}>
            <SectionHeading label="Education" />

            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap:                 '10px',
            }}>
              {EDUCATION.map((edu, i) => (
                <EducationCard key={i} edu={edu} />
              ))}
            </div>
          </motion.section>

          {/* ══════════════════════════════════════
              SKILLS
          ══════════════════════════════════════ */}
          <motion.section variants={item} style={{ marginBottom: '0' }}>
            <SectionHeading label="Selected Skills" />

            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap:                 '32px 40px',
              padding:             '28px 28px 26px',
              border:              '1px solid var(--border)',
              borderRadius:        'var(--radius-sm)',
              background:          'var(--surface)',
            }}>
              {SKILL_GROUPS.map((group, i) => (
                <SkillGroup key={i} group={group} />
              ))}
            </div>
          </motion.section>
          </motion.div>

        </div>
      </main>
    </PageShell>
  )
}
