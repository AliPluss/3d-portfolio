'use client'

import { useRef, useState } from 'react'
import Image                from 'next/image'
import { ExternalLink, Github, ArrowUpRight } from 'lucide-react'

export interface Project {
  _id:         string
  title:       string
  description: string
  image:       string
  link:        string
  github?:     string
  tags?:       string[]
}

interface ProjectCardProps {
  project: Project
  index?:  number
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const cardRef  = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  // 3D tilt on mouse move
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el   = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx   = rect.left + rect.width  / 2
    const cy   = rect.top  + rect.height / 2
    const dx   = (e.clientX - cx) / (rect.width  / 2)  // -1 to 1
    const dy   = (e.clientY - cy) / (rect.height / 2)  // -1 to 1
    setTilt({ x: dy * -6, y: dx * 6 })
  }

  const resetTilt = () => { setTilt({ x: 0, y: 0 }); setHovered(false) }

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={resetTilt}
      style={{
        borderRadius: 'var(--radius)',
        border:       `1px solid ${hovered ? 'var(--gold-border)' : 'var(--border)'}`,
        background:   hovered ? 'var(--surface-hover)' : 'var(--surface)',
        overflow:     'hidden',
        display:      'flex',
        flexDirection:'column',
        cursor:       'none',
        transformStyle: 'preserve-3d',
        transform:    `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        boxShadow:    hovered
          ? '0 0 30px var(--gold-glow), 0 24px 60px rgba(0,0,0,0.5)'
          : '0 4px 24px rgba(0,0,0,0.25)',
        transition:   'border-color 0.25s, background 0.25s, box-shadow 0.25s',
        animationDelay: `${index * 0.07}s`,
        animationFillMode: 'both',
      }}
      className="animate-fade-in opacity-0"
    >
      {/* Image */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '16/9',
        overflow: 'hidden', background: 'rgba(255,255,255,0.03)',
      }}>
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            style={{
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
              filter: 'brightness(0.85)',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          }} />
        )}
        {/* Gold overlay shimmer on hover */}
        {hovered && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, transparent 60%, rgba(201,168,76,0.08) 100%)',
          }} />
        )}
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px', flexGrow: 1 }}>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1rem',
          fontWeight: 600,
          color: hovered ? '#fff' : 'rgba(255,255,255,0.88)',
          transition: 'color 0.2s',
          lineHeight: 1.3,
        }}>
          {project.title}
        </h3>

        {project.description && (
          <p style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: 1.75,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flexGrow: 1,
          }}>
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
            {project.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: '10px',
                padding: '3px 10px',
                borderRadius: '100px',
                border: '1px solid var(--gold-border)',
                color: 'var(--gold-muted)',
                background: 'var(--gold-subtle)',
                letterSpacing: '0.04em',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          marginTop: '10px', paddingTop: '14px',
          borderTop: '1px solid var(--border)',
        }}>
          {project.link && project.link !== '#' && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.06em',
                textDecoration: 'none',
                cursor: 'none',
              }}
            >
              <ArrowUpRight className="w-3 h-3" />
              Live
            </a>
          )}
          {project.github && project.github !== '#' && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '11px', color: 'var(--text-dim)',
                textDecoration: 'none', cursor: 'none',
              }}
            >
              <Github className="w-3 h-3" />
              Code
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// Suppress unused import warning
void ExternalLink
