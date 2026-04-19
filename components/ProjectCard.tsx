'use client'

import { useState }            from 'react'
import Image                   from 'next/image'
import { ArrowUpRight, Github } from 'lucide-react'

export interface Project {
  _id:         string
  title:       string
  description: string
  image:       string
  link:        string
  github?:     string
  tags?:       string[]
}

export interface ProjectCardProps {
  project: Project
  index?:  number
  variant?: 'featured' | 'duo' | 'grid'
}

/* ── Shared: editorial dot-separated tag strip ────────────────────────────── */
function TagStrip({ tags, light = false }: { tags: string[]; light?: boolean }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      {tags.map((tag, i) => (
        <span key={tag} style={{ display: 'flex', alignItems: 'center' }}>
          {i > 0 && (
            <span style={{
              color:    light ? 'rgba(255,255,255,0.22)' : 'var(--gold-border)',
              margin:   '0 7px',
              fontSize: '9px',
              lineHeight: 1,
            }}>·</span>
          )}
          <span style={{
            fontFamily:    "'Inter', sans-serif",
            fontSize:      '9px',
            fontWeight:    500,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color:         light ? 'rgba(255,255,255,0.40)' : 'var(--text-dim)',
          }}>{tag}</span>
        </span>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   FEATURED CARD — full-width, editorial horizontal layout
   ══════════════════════════════════════════════════════════════════════════════ */
function FeaturedCard({ project, index }: { project: Project; index: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius:  'var(--radius-lg)',
        border:        `1px solid ${hovered ? 'rgba(201,168,76,0.30)' : 'var(--border)'}`,
        background:    'var(--surface)',
        overflow:      'hidden',
        cursor:        'none',
        boxShadow:     hovered
          ? 'inset 0 1px 0 rgba(255,255,255,0.08), var(--shadow-gold)'
          : 'inset 0 1px 0 rgba(255,255,255,0.05), var(--shadow-md)',
        transform:     hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition:    `border-color var(--t-base) var(--ease),
                        box-shadow var(--t-base) var(--ease),
                        transform var(--t-slow) var(--ease)`,
      }}
    >
      {/* ── Cinematic image banner ── */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '16/7',
        overflow: 'hidden', background: 'rgba(5,5,5,0.9)',
      }}>
        {project.image && (
          <Image
            src={project.image}
            alt={project.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 90vw"
            className="object-cover"
            style={{
              transform:  hovered ? 'scale(1.04)' : 'scale(1.0)',
              transition: 'transform 0.80s cubic-bezier(0.16,1,0.3,1)',
              filter:     'brightness(0.68) contrast(1.08) saturate(0.85)',
            }}
          />
        )}
        {/* Depth gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(
            to bottom,
            transparent 30%,
            rgba(5,5,5,0.50) 75%,
            rgba(5,5,5,0.85) 100%
          )`,
        }} />
        {/* Left rim fade — blends image into content below */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(5,5,5,0.25) 0%, transparent 30%)',
        }} />

        {/* Index pill */}
        <span style={{
          position: 'absolute', top: '22px', left: '26px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em',
          color: 'var(--gold)',
          padding: '4px 11px',
          border: '1px solid var(--gold-border)',
          borderRadius: '100px',
          background: 'rgba(5,5,5,0.55)',
          backdropFilter: 'blur(10px)',
        }}>
          {index} — Featured
        </span>

        {/* Hover arrow badge */}
        <div style={{
          position:   'absolute', top: '22px', right: '26px',
          opacity:    hovered ? 1 : 0,
          transform:  hovered ? 'translate(0,0) scale(1)' : 'translate(5px,-5px) scale(0.75)',
          transition: 'opacity var(--t-base) var(--ease), transform var(--t-base) var(--ease)',
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowUpRight size={16} color="#0a0700" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* ── Editorial content row ── */}
      <div style={{
        display:   'flex',
        flexWrap:  'wrap',
        gap:       '0',
        padding:   '30px 30px 28px',
        alignItems: 'flex-start',
      }}>
        {/* Left: title + description */}
        <div style={{ flex: '1 1 300px', paddingRight: '36px', paddingBottom: '8px' }}>
          <p style={{
            fontFamily:    "'Inter', sans-serif",
            fontSize:      '9px', fontWeight: 500,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color:         'var(--gold)',
            marginBottom:  '12px',
          }}>
            Featured Work
          </p>
          <h3 style={{
            fontFamily:    "'Playfair Display', serif",
            fontSize:      'clamp(1.5rem, 2.4vw, 2.1rem)',
            fontWeight:    700,
            color:         '#fff',
            lineHeight:    1.12,
            letterSpacing: '-0.020em',
            marginBottom:  '14px',
          }}>
            {project.title}
          </h3>
          {project.description && (
            <p style={{
              fontSize: '13px', color: 'var(--text-muted)',
              lineHeight: 1.72, maxWidth: '56ch',
            }}>
              {project.description}
            </p>
          )}
        </div>

        {/* Right: stacked tags + links */}
        <div style={{
          flex:          '0 1 auto',
          display:       'flex',
          flexDirection: 'column',
          justifyContent:'space-between',
          alignSelf:     'stretch',
          gap:           '20px',
          paddingTop:    '2px',
          minWidth:      '120px',
        }}>
          {project.tags && project.tags.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {project.tags.map(tag => (
                <span key={tag} style={{
                  fontFamily:    "'Inter', sans-serif",
                  fontSize:      '10px', fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color:         'var(--text-dim)',
                  paddingLeft:   '11px',
                  borderLeft:    '1px solid var(--gold-border)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {project.link && project.link !== '#' && (
              <a href={project.link} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.06em',
                textDecoration: 'none', cursor: 'none',
              }}>
                <ArrowUpRight size={13} />
                View Project
              </a>
            )}
            {project.github && project.github !== '#' && (
              <a href={project.github} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '11px', color: 'var(--text-dim)',
                textDecoration: 'none', cursor: 'none',
              }}>
                <Github size={13} />
                Code
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Gold bottom accent line */}
      <div style={{
        margin: '0 30px',
        height: '1px',
        background: 'linear-gradient(90deg, var(--gold-border), transparent)',
        opacity: hovered ? 1 : 0.5,
        transition: 'opacity var(--t-base)',
      }} />
      <div style={{ height: '4px' }} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   DUO CARD — tall image-forward, content overlaid on gradient
   ══════════════════════════════════════════════════════════════════════════════ */
function DuoCard({ project, index }: { project: Project; index: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:    'relative',
        borderRadius:'var(--radius)',
        border:      `1px solid ${hovered ? 'rgba(201,168,76,0.28)' : 'var(--border)'}`,
        overflow:    'hidden',
        aspectRatio: '3/4',
        cursor:      'none',
        background:  '#0a0a0a',
        boxShadow:   hovered ? 'var(--shadow-gold)' : 'var(--shadow-sm)',
        transform:   hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition:  `border-color var(--t-base) var(--ease),
                      box-shadow var(--t-base) var(--ease),
                      transform var(--t-slow) var(--ease)`,
      }}
    >
      {/* Full-cover image */}
      {project.image && (
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          style={{
            transform:  hovered ? 'scale(1.07)' : 'scale(1.0)',
            transition: 'transform 0.80s cubic-bezier(0.16,1,0.3,1)',
            filter:     hovered ? 'brightness(0.52) contrast(1.05)' : 'brightness(0.42) contrast(1.05)',
          }}
        />
      )}

      {/* Persistent gradient — image to solid at bottom */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(
          to top,
          rgba(5,5,5,0.96) 0%,
          rgba(5,5,5,0.60) 40%,
          rgba(5,5,5,0.10) 70%,
          transparent 100%
        )`,
      }} />

      {/* Index — top left */}
      <span style={{
        position:      'absolute', top: '20px', left: '20px',
        fontFamily:    "'Inter', sans-serif",
        fontSize:      '9px', fontWeight: 500, letterSpacing: '0.22em',
        color:         'var(--gold-muted)',
      }}>
        {index}
      </span>

      {/* Hover arrow — top right */}
      <div style={{
        position:   'absolute', top: '18px', right: '20px',
        opacity:    hovered ? 1 : 0,
        transform:  hovered ? 'translate(0,0) scale(1)' : 'translate(4px,-4px) scale(0.7)',
        transition: 'opacity var(--t-base) var(--ease), transform var(--t-base) var(--ease)',
      }}>
        <ArrowUpRight size={18} color="rgba(201,168,76,0.75)" />
      </div>

      {/* Content — bottom overlay */}
      <div style={{
        position:   'absolute',
        bottom: 0, left: 0, right: 0,
        padding:    '24px 22px 22px',
        transform:  hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: `transform var(--t-slow) var(--ease)`,
      }}>
        <h3 style={{
          fontFamily:    "'Playfair Display', serif",
          fontSize:      'clamp(1.1rem, 1.8vw, 1.35rem)',
          fontWeight:    700,
          color:         '#fff',
          lineHeight:    1.2,
          letterSpacing: '-0.012em',
          marginBottom:  '10px',
        }}>
          {project.title}
        </h3>

        {project.tags && project.tags.length > 0 && (
          <TagStrip tags={project.tags.slice(0, 4)} light />
        )}

        {/* Description slides in on hover */}
        <div style={{
          overflow:   'hidden',
          maxHeight:  hovered ? '72px' : '0',
          opacity:    hovered ? 1 : 0,
          marginTop:  hovered ? '10px' : '0',
          transition: `max-height 0.40s var(--ease), opacity 0.28s var(--ease), margin-top 0.40s var(--ease)`,
        }}>
          <p style={{
            fontSize: '11.5px', color: 'rgba(255,255,255,0.50)',
            lineHeight: 1.65,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {project.description}
          </p>
        </div>
      </div>

      {/* Gold bottom seam — visible on hover */}
      <div style={{
        position:   'absolute', bottom: 0, left: '20%', right: '20%',
        height:     '1px',
        background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
        opacity:    hovered ? 1 : 0,
        transition: 'opacity var(--t-base) var(--ease)',
      }} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   GRID CARD — compact, refined
   ══════════════════════════════════════════════════════════════════════════════ */
export default function ProjectCard({ project, index = 0, variant = 'grid' }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false)
  const idx = String(index + 1).padStart(2, '0')

  if (variant === 'featured') return <FeaturedCard project={project} index={idx} />
  if (variant === 'duo')      return <DuoCard      project={project} index={idx} />

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius:  'var(--radius)',
        border:        `1px solid ${hovered ? 'var(--gold-border)' : 'var(--border)'}`,
        background:    hovered ? 'var(--surface-hover)' : 'var(--surface)',
        overflow:      'hidden',
        display:       'flex',
        flexDirection: 'column',
        cursor:        'none',
        boxShadow:     hovered
          ? 'inset 0 1px 0 rgba(255,255,255,0.08), var(--shadow-gold)'
          : 'inset 0 1px 0 rgba(255,255,255,0.05), var(--shadow-sm)',
        transform:     hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition:    `border-color var(--t-base) var(--ease),
                        background var(--t-base) var(--ease),
                        box-shadow var(--t-base) var(--ease),
                        transform var(--t-slow) var(--ease)`,
      }}
    >
      {/* Image */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '4/3',
        overflow: 'hidden', background: 'rgba(5,5,5,0.9)',
      }}>
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            style={{
              transform:  hovered ? 'scale(1.07)' : 'scale(1.0)',
              transition: 'transform 0.65s cubic-bezier(0.16,1,0.3,1)',
              filter:     'brightness(0.78) contrast(1.06)',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          }} />
        )}
        {/* Depth fade */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 45%, rgba(5,5,5,0.50) 100%)',
        }} />
        {/* Index */}
        <span style={{
          position: 'absolute', top: '13px', left: '15px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '9px', fontWeight: 500, letterSpacing: '0.20em',
          color: 'var(--gold-muted)',
        }}>
          {idx}
        </span>
        {/* Hover arrow */}
        <div style={{
          position:   'absolute', top: '13px', right: '15px',
          opacity:    hovered ? 1 : 0,
          transform:  hovered ? 'translate(0,0)' : 'translate(3px,-3px)',
          transition: 'opacity var(--t-base) var(--ease), transform var(--t-base) var(--ease)',
        }}>
          <ArrowUpRight size={14} color="rgba(201,168,76,0.65)" />
        </div>
      </div>

      {/* Body */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        gap: '7px', padding: '17px 17px 15px', flexGrow: 1,
      }}>
        <h3 style={{
          fontFamily:    "'Playfair Display', serif",
          fontSize:      '1rem',
          fontWeight:    600,
          color:         hovered ? '#fff' : 'var(--text-secondary)',
          transition:    'color var(--t-base)',
          lineHeight:    1.25,
          letterSpacing: '-0.01em',
        }}>
          {project.title}
        </h3>

        {project.description && (
          <p style={{
            fontSize: '12px', color: 'var(--text-muted)',
            lineHeight: 1.65, flexGrow: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {project.description}
          </p>
        )}

        {/* Tags — editorial */}
        {project.tags && project.tags.length > 0 && (
          <div style={{ marginTop: '3px' }}>
            <TagStrip tags={project.tags.slice(0, 3)} />
          </div>
        )}

        {/* Links */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          marginTop: '8px', paddingTop: '11px',
          borderTop: '1px solid var(--border)',
        }}>
          {project.link && project.link !== '#' && (
            <a href={project.link} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '10px', color: 'var(--blue)',
              letterSpacing: '0.06em', textDecoration: 'none', cursor: 'none',
            }}>
              <ArrowUpRight size={12} />
              Live
            </a>
          )}
          {project.github && project.github !== '#' && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '10px', color: 'var(--text-dim)',
              textDecoration: 'none', cursor: 'none',
            }}>
              <Github size={12} />
              Code
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
