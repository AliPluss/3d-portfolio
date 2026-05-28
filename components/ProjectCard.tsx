'use client'

import { useState }            from 'react'
import Image                   from 'next/image'
import { ArrowUpRight, Github } from 'lucide-react'
import { cn }                  from '@/lib/utils'

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
    <div className="flex flex-wrap items-center">
      {tags.map((tag, i) => (
        <span key={tag} className="flex items-center">
          {i > 0 && (
            <span 
              className="mx-2 text-[9px] leading-none"
              style={{ color: light ? 'rgba(255,255,255,0.22)' : 'var(--gold-border)' }}
            >·</span>
          )}
          <span 
            className="font-inter text-[9px] font-medium tracking-[0.10em] uppercase"
            style={{ color: light ? 'rgba(255,255,255,0.40)' : 'var(--text-dim)' }}
          >{tag}</span>
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
      className="group relative rounded-[var(--radius-lg)] overflow-hidden cursor-none"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hovered ? 'rgba(201,168,76,0.25)' : 'var(--border)'}`,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered 
          ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 48px -12px rgba(0,0,0,0.5), 0 0 40px rgba(201,168,76,0.06)' 
          : 'inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 24px -10px rgba(0,0,0,0.4)',
        transition: 'border-color 0.4s ease, box-shadow 0.4s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* ── Cinematic image banner ── */}
      <div className="relative w-full aspect-[16/7] overflow-hidden bg-[#050505]">
        {project.image && (
          <Image
            src={project.image}
            alt={project.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 90vw"
            className="object-cover"
            style={{
              transform: hovered ? 'scale(1.05)' : 'scale(1.0)',
              filter: hovered ? 'brightness(0.85) contrast(1.1) saturate(0.95)' : 'brightness(0.65) contrast(1.05) saturate(0.8)',
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s ease',
            }}
          />
        )}
        
        {/* Depth gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/40 to-transparent" />

        {/* Index pill */}
        <span className="absolute top-6 left-6 md:top-8 md:left-8 font-inter text-[10px] font-medium tracking-[0.18em] text-gold px-3 py-1.5 rounded-full bg-[#050505]/40 backdrop-blur-md border border-gold/20">
          {index} — Featured
        </span>

        {/* Floating action button */}
        <div 
          className="absolute top-6 right-6 md:top-8 md:right-8 w-11 h-11 rounded-full bg-gold flex items-center justify-center shadow-[0_0_20px_rgba(201,168,76,0.3)]"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translate(0,0) scale(1)' : 'translate(10px,-10px) scale(0.8)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <ArrowUpRight size={18} color="#0a0700" strokeWidth={2.5} className="group-hover:rotate-12 transition-transform duration-300" />
        </div>
      </div>

      {/* ── Editorial content row ── */}
      <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12 p-6 md:p-10 bg-gradient-to-b from-transparent to-[#050505]/60">
        
        {/* Left: title + description */}
        <div className="flex-1">
          <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            {project.title}
          </h3>
          {project.description && (
            <p className="text-[13px] md:text-[14px] text-white/50 leading-relaxed max-w-[56ch]">
              {project.description}
            </p>
          )}
        </div>

        {/* Right: stacked tags + links */}
        <div className="flex flex-col justify-between self-stretch gap-6 min-w-[140px]">
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-col gap-2.5">
              {project.tags.map(tag => (
                <span key={tag} className="font-inter text-[10px] font-medium tracking-[0.08em] uppercase text-white/40 pl-3 border-l border-gold/20">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-5">
            {project.link && project.link !== '#' && (
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] font-medium tracking-widest text-gold uppercase transition-colors hover:text-white cursor-none">
                <ArrowUpRight size={14} />
                Live
              </a>
            )}
            {project.github && project.github !== '#' && (
              <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] font-medium tracking-widest text-white/30 uppercase transition-colors hover:text-white cursor-none">
                <Github size={13} />
                Code
              </a>
            )}
          </div>
        </div>
      </div>
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
      className="group relative rounded-[var(--radius)] overflow-hidden aspect-[3/4] cursor-none bg-[#0a0a0a]"
      style={{
        border: `1px solid ${hovered ? 'rgba(201,168,76,0.28)' : 'var(--border)'}`,
        boxShadow: hovered ? '0 24px 48px -12px rgba(0,0,0,0.6), 0 0 30px rgba(201,168,76,0.08)' : '0 8px 24px rgba(0,0,0,0.4)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'border-color 0.4s ease, box-shadow 0.4s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
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
            transform: hovered ? 'scale(1.08)' : 'scale(1.0)',
            filter: hovered ? 'brightness(0.65) contrast(1.1)' : 'brightness(0.45) contrast(1.05)',
            transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s ease',
          }}
        />
      )}

      {/* Persistent gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/95 via-[#050505]/50 to-transparent" />

      {/* Index */}
      <span className="absolute top-5 left-5 font-inter text-[9px] font-medium tracking-[0.22em] text-gold/60">
        {index}
      </span>

      {/* Hover action icon */}
      <div 
        className="absolute top-4 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translate(0,0) scale(1)' : 'translate(0,-10px) scale(0.8)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <ArrowUpRight size={16} className="text-gold group-hover:rotate-12 transition-transform duration-300" />
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col justify-end">
        
        {project.tags && project.tags.length > 0 && (
          <div className="mb-3 transform translate-y-2 opacity-80 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <TagStrip tags={project.tags.slice(0, 3)} light />
          </div>
        )}

        <h3 className="font-display text-xl md:text-2xl font-bold text-white leading-tight tracking-tight mb-2 transform group-hover:-translate-y-1 transition-transform duration-500" style={{ fontFamily: "'Playfair Display', serif" }}>
          {project.title}
        </h3>

        {/* Expandable description — uses max-height for smooth CSS transition */}
        <div 
          className="overflow-hidden"
          style={{
            maxHeight: hovered ? '80px' : '0px',
            opacity: hovered ? 1 : 0,
            transition: 'max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
          }}
        >
          <p className="text-[12px] text-white/50 leading-relaxed line-clamp-3 pb-2 pt-1">
            {project.description}
          </p>
        </div>
      </div>
      
      {/* Bottom accent glow */}
      <div 
        className="absolute bottom-0 left-[20%] right-[20%] h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }} 
      />
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
      className="group flex flex-col rounded-[var(--radius)] overflow-hidden cursor-none"
      style={{
        background: hovered ? 'var(--surface-hover)' : 'var(--surface)',
        border: `1px solid ${hovered ? 'var(--gold-border)' : 'var(--border)'}`,
        boxShadow: hovered 
          ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 16px 32px -8px rgba(0,0,0,0.5)' 
          : 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 16px -4px rgba(0,0,0,0.3)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#050505]">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            style={{
              transform: hovered ? 'scale(1.08)' : 'scale(1.0)',
              filter: hovered ? 'brightness(0.9) contrast(1.1)' : 'brightness(0.7) contrast(1.05)',
              transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease',
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-white/5" />
        )}
        
        {/* Subtle inner shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]/70" />

        {/* Top-left Index */}
        <span className="absolute top-4 left-4 font-inter text-[9px] font-medium tracking-[0.20em] text-gold/70">
          {idx}
        </span>

        {/* Top-right Action */}
        <div 
          className="absolute top-4 right-4"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translate(0,0)' : 'translate(-5px,5px)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <ArrowUpRight size={16} className="text-gold" />
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-col flex-1 p-5 md:p-6">
        
        {project.tags && project.tags.length > 0 && (
          <div className="mb-3">
            <TagStrip tags={project.tags.slice(0, 3)} />
          </div>
        )}

        <h3 className="font-display text-lg md:text-xl font-bold text-white tracking-tight leading-snug mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          {project.title}
        </h3>

        {project.description && (
          <p className="text-[12.5px] text-white/50 leading-relaxed line-clamp-2 flex-1">
            {project.description}
          </p>
        )}

        {/* Footer Links */}
        <div className="flex items-center gap-5 mt-6 pt-4 border-t border-white/5">
          {project.link && project.link !== '#' && (
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] font-medium tracking-widest text-gold uppercase transition-colors hover:text-white cursor-none">
              <ArrowUpRight size={13} />
              Live
            </a>
          )}
          {project.github && project.github !== '#' && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] font-medium tracking-widest text-white/30 uppercase transition-colors hover:text-white cursor-none">
              <Github size={13} />
              Code
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
