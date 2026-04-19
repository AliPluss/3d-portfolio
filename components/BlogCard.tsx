'use client'

import { useState }     from 'react'
import Image            from 'next/image'
import Link             from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export interface Post {
  _id:          string
  title:        string
  excerpt:      string
  thumbnail:    string
  date:         string
  slug:         string
  category?:    string
  readingTime?: number
}

interface BlogCardProps {
  post:     Post
  variant?: 'featured' | 'horizontal' | 'compact'
  index?:   number
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function formatDate(raw: string, style: 'short' | 'long' = 'short'): string {
  const d = new Date(raw)
  if (style === 'long') {
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function MetaRow({
  post,
  light = false,
  size = 'sm',
}: {
  post:   Post
  light?: boolean
  size?:  'sm' | 'xs'
}) {
  const color  = light ? 'rgba(255,255,255,0.45)' : 'var(--text-dim)'
  const dotClr = light ? 'rgba(255,255,255,0.22)' : 'var(--gold-border)'
  const fs     = size === 'xs' ? '9px' : '10px'

  return (
    <div style={{
      display:    'flex',
      alignItems: 'center',
      flexWrap:   'wrap',
      gap:        '0',
      fontFamily: "'Inter', sans-serif",
      fontSize:   fs,
      fontWeight: 500,
      letterSpacing: '0.11em',
      textTransform: 'uppercase',
      color,
    }}>
      {post.category && (
        <>
          <span style={{ color: 'var(--gold)', letterSpacing: '0.13em' }}>{post.category}</span>
          <span style={{ margin: '0 8px', color: dotClr, fontSize: '9px' }}>·</span>
        </>
      )}
      {post.readingTime && (
        <>
          <span>{post.readingTime} min read</span>
          <span style={{ margin: '0 8px', color: dotClr, fontSize: '9px' }}>·</span>
        </>
      )}
      <time dateTime={post.date}>{formatDate(post.date, 'short')}</time>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   FEATURED — full-bleed cinematic, title overlaid on gradient
   ══════════════════════════════════════════════════════════════════════════════ */
function FeaturedCard({ post }: { post: Post }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={`/blog/${post.slug || post._id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        'block',
        position:       'relative',
        borderRadius:   'var(--radius-lg)',
        overflow:       'hidden',
        border:         `1px solid ${hovered ? 'rgba(201,168,76,0.30)' : 'var(--border)'}`,
        aspectRatio:    '21/9',
        minHeight:      '340px',
        background:     '#060604',
        cursor:         'none',
        textDecoration: 'none',
        boxShadow:      hovered ? 'var(--shadow-gold)' : 'var(--shadow-md)',
        transform:      hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition:     `border-color var(--t-base) var(--ease),
                         box-shadow var(--t-base) var(--ease),
                         transform var(--t-slow) var(--ease)`,
      }}
    >
      {/* Full-bleed image */}
      {post.thumbnail && (
        <Image
          src={post.thumbnail}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{
            transform:  hovered ? 'scale(1.04)' : 'scale(1.0)',
            transition: 'transform 0.80s cubic-bezier(0.16,1,0.3,1)',
            filter:     hovered
              ? 'brightness(0.50) contrast(1.06) saturate(0.80)'
              : 'brightness(0.42) contrast(1.06) saturate(0.80)',
          }}
        />
      )}

      {/* Gradient — pools at bottom for readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(
          to bottom,
          transparent 0%,
          rgba(5,5,5,0.10) 30%,
          rgba(5,5,5,0.55) 55%,
          rgba(5,5,5,0.92) 100%
        )`,
      }} />
      {/* Left vignette — softens image edge */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(5,5,5,0.30) 0%, transparent 28%)',
      }} />

      {/* Index + badge — top right */}
      <div style={{
        position:    'absolute', top: '22px', right: '26px',
        display:     'flex', alignItems: 'center', gap: '10px',
      }}>
        <span style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      '9px', fontWeight: 500, letterSpacing: '0.22em',
          color:         'rgba(255,255,255,0.30)',
        }}>01</span>
        <span style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      '9px', fontWeight: 500, letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color:         'var(--gold)',
          padding:       '3px 10px',
          border:        '1px solid var(--gold-border)',
          borderRadius:  '100px',
          background:    'rgba(5,5,5,0.50)',
          backdropFilter:'blur(8px)',
        }}>
          Featured
        </span>
      </div>

      {/* Hover arrow — top left */}
      <div style={{
        position:   'absolute', top: '22px', left: '26px',
        opacity:    hovered ? 1 : 0,
        transform:  hovered ? 'translate(0,0) scale(1)' : 'translate(-4px,4px) scale(0.75)',
        transition: 'opacity var(--t-base) var(--ease), transform var(--t-base) var(--ease)',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'var(--gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ArrowUpRight size={15} color="#0a0700" strokeWidth={2.5} />
        </div>
      </div>

      {/* Overlaid content — bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding:  '0 34px 32px',
        transform:  hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: `transform var(--t-slow) var(--ease)`,
      }}>
        <MetaRow post={post} light size="xs" />

        {/* Gold rule */}
        <div style={{
          width: '32px', height: '1px',
          background: 'var(--gold)',
          margin: '14px 0',
          opacity: 0.7,
        }} />

        <h2 style={{
          fontFamily:    "'Playfair Display', serif",
          fontSize:      'clamp(1.6rem, 3vw, 2.6rem)',
          fontWeight:    700,
          color:         '#fff',
          lineHeight:    1.12,
          letterSpacing: '-0.022em',
          marginBottom:  '12px',
          maxWidth:      '20ch',
        }}>
          {post.title}
        </h2>

        {post.excerpt && (
          <p style={{
            fontSize:    '13px',
            color:       'rgba(255,255,255,0.55)',
            lineHeight:  1.70,
            maxWidth:    '58ch',
            display:     '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow:    'hidden',
            marginBottom:'18px',
          }}>
            {post.excerpt}
          </p>
        )}

        <div style={{
          display:    'flex', alignItems: 'center', gap: '7px',
          fontFamily: "'Inter', sans-serif",
          fontSize:   '11px', fontWeight: 500,
          letterSpacing: '0.10em', textTransform: 'uppercase',
          color:      'var(--gold)',
        }}>
          Read Article
          <ArrowUpRight
            size={13}
            style={{
              transform:  hovered ? 'translate(2px,-2px)' : 'translate(0,0)',
              transition: 'transform var(--t-base) var(--ease)',
            }}
          />
        </div>
      </div>

      {/* Gold bottom seam */}
      <div style={{
        position:   'absolute', bottom: 0, left: '16%', right: '16%',
        height:     '1px',
        background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
        opacity:    hovered ? 1 : 0,
        transition: 'opacity var(--t-base) var(--ease)',
      }} />
    </Link>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   HORIZONTAL — image left, editorial content right
   ══════════════════════════════════════════════════════════════════════════════ */
function HorizontalCard({ post, index = 0 }: { post: Post; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={`/blog/${post.slug || post._id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        'flex',
        flexDirection:  'row',
        borderRadius:   'var(--radius)',
        overflow:       'hidden',
        border:         `1px solid ${hovered ? 'var(--gold-border)' : 'var(--border)'}`,
        background:     hovered ? 'var(--surface-2)' : 'var(--surface)',
        cursor:         'none',
        textDecoration: 'none',
        boxShadow:      hovered
          ? 'inset 0 1px 0 rgba(255,255,255,0.08), var(--shadow-gold)'
          : 'inset 0 1px 0 rgba(255,255,255,0.05), var(--shadow-sm)',
        transform:      hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition:     `border-color var(--t-base) var(--ease),
                         background var(--t-base) var(--ease),
                         box-shadow var(--t-base) var(--ease),
                         transform var(--t-slow) var(--ease)`,
        minHeight:      '190px',
      }}
    >
      {/* Thumbnail — left column */}
      <div style={{
        position:  'relative',
        flexShrink: 0,
        width:     '38%',
        overflow:  'hidden',
        background:'rgba(5,5,5,0.9)',
      }}>
        {post.thumbnail ? (
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
            style={{
              transform:  hovered ? 'scale(1.06)' : 'scale(1.0)',
              transition: 'transform 0.70s cubic-bezier(0.16,1,0.3,1)',
              filter:     'brightness(0.72) contrast(1.05)',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(201,168,76,0.06), rgba(255,255,255,0.02))',
          }} />
        )}
        {/* Fade right edge into card surface */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, transparent 60%, var(--surface) 100%)',
          opacity: hovered ? 0 : 0.6,
          transition: 'opacity var(--t-base) var(--ease)',
        }} />
        {/* Index */}
        <span style={{
          position: 'absolute', bottom: '14px', left: '14px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '9px', fontWeight: 500, letterSpacing: '0.22em',
          color: 'rgba(255,255,255,0.28)',
        }}>
          {String(index + 2).padStart(2, '0')}
        </span>
      </div>

      {/* Content — right column */}
      <div style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'space-between',
        padding:        '22px 24px 22px',
        gap:            '10px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <MetaRow post={post} size="xs" />

          <h3 style={{
            fontFamily:    "'Playfair Display', serif",
            fontSize:      'clamp(1.05rem, 1.6vw, 1.25rem)',
            fontWeight:    700,
            color:         hovered ? '#fff' : 'var(--text-secondary)',
            lineHeight:    1.25,
            letterSpacing: '-0.012em',
            transition:    'color var(--t-base)',
            display:       '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow:      'hidden',
          }}>
            {post.title}
          </h3>

          {post.excerpt && (
            <p style={{
              fontSize:  '12px',
              color:     'var(--text-muted)',
              lineHeight: 1.68,
              display:   '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow:  'hidden',
            }}>
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display:    'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop:  '1px solid var(--border)',
        }}>
          <time style={{
            fontFamily:    "'Inter', sans-serif",
            fontSize:      '10px', fontWeight: 400,
            letterSpacing: '0.06em',
            color:         'var(--text-dim)',
          }}>
            {formatDate(post.date, 'long')}
          </time>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '10px', fontWeight: 500,
            letterSpacing: '0.10em', textTransform: 'uppercase',
            color:  hovered ? 'var(--gold)' : 'var(--text-dim)',
            transition: 'color var(--t-base) var(--ease)',
          }}>
            Read
            <ArrowUpRight
              size={12}
              style={{
                transform:  hovered ? 'translate(2px,-2px)' : 'translate(0,0)',
                transition: 'transform var(--t-base) var(--ease)',
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   COMPACT — image top, clean editorial grid card
   ══════════════════════════════════════════════════════════════════════════════ */
function CompactCard({ post, index = 0 }: { post: Post; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={`/blog/${post.slug || post._id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        'flex',
        flexDirection:  'column',
        borderRadius:   'var(--radius)',
        overflow:       'hidden',
        border:         `1px solid ${hovered ? 'var(--gold-border)' : 'var(--border)'}`,
        background:     hovered ? 'var(--surface-2)' : 'var(--surface)',
        cursor:         'none',
        textDecoration: 'none',
        boxShadow:      hovered
          ? 'inset 0 1px 0 rgba(255,255,255,0.08), var(--shadow-gold)'
          : 'inset 0 1px 0 rgba(255,255,255,0.05), var(--shadow-sm)',
        transform:      hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition:     `border-color var(--t-base) var(--ease),
                         background var(--t-base) var(--ease),
                         box-shadow var(--t-base) var(--ease),
                         transform var(--t-slow) var(--ease)`,
      }}
    >
      {/* Thumbnail */}
      <div style={{
        position:    'relative',
        width:       '100%',
        aspectRatio: '16/10',
        overflow:    'hidden',
        background:  'rgba(5,5,5,0.9)',
        flexShrink:  0,
      }}>
        {post.thumbnail ? (
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            style={{
              transform:  hovered ? 'scale(1.07)' : 'scale(1.0)',
              transition: 'transform 0.65s cubic-bezier(0.16,1,0.3,1)',
              filter:     'brightness(0.75) contrast(1.05)',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(201,168,76,0.06), rgba(255,255,255,0.02))',
          }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 45%, rgba(5,5,5,0.48) 100%)',
        }} />
        {/* Index */}
        <span style={{
          position: 'absolute', top: '12px', left: '14px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '9px', fontWeight: 500, letterSpacing: '0.20em',
          color: 'rgba(201,168,76,0.45)',
        }}>
          {String(index + 4).padStart(2, '0')}
        </span>
        {/* Arrow */}
        <div style={{
          position:   'absolute', top: '12px', right: '14px',
          opacity:    hovered ? 1 : 0,
          transform:  hovered ? 'translate(0,0)' : 'translate(3px,-3px)',
          transition: 'opacity var(--t-base) var(--ease), transform var(--t-base) var(--ease)',
        }}>
          <ArrowUpRight size={14} color="rgba(201,168,76,0.65)" />
        </div>
      </div>

      {/* Body */}
      <div style={{
        display:       'flex',
        flexDirection: 'column',
        gap:           '8px',
        padding:       '16px 16px 15px',
        flexGrow:       1,
      }}>
        <MetaRow post={post} size="xs" />

        <h3 style={{
          fontFamily:    "'Playfair Display', serif",
          fontSize:      '1rem',
          fontWeight:    600,
          color:         hovered ? '#fff' : 'var(--text-secondary)',
          lineHeight:    1.28,
          letterSpacing: '-0.010em',
          display:       '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow:      'hidden',
          transition:    'color var(--t-base)',
        }}>
          {post.title}
        </h3>

        {post.excerpt && (
          <p style={{
            fontSize:  '12px',
            color:     'var(--text-muted)',
            lineHeight: 1.65,
            flexGrow:  1,
            display:   '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow:  'hidden',
          }}>
            {post.excerpt}
          </p>
        )}

        {/* Footer bar */}
        <div style={{
          display:    'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '10px',
          marginTop:  'auto',
          borderTop:  '1px solid var(--border)',
        }}>
          <time style={{
            fontFamily:    "'Inter', sans-serif",
            fontSize:      '9px', fontWeight: 400,
            letterSpacing: '0.06em',
            color:         'var(--text-dim)',
          }}>
            {formatDate(post.date, 'long')}
          </time>
          <div style={{
            fontFamily:    "'Inter', sans-serif",
            fontSize:      '9px', fontWeight: 500,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color:         hovered ? 'var(--gold)' : 'var(--text-dim)',
            transition:    'color var(--t-base) var(--ease)',
          }}>
            Read →
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── Export ──────────────────────────────────────────────────────────────────── */
export default function BlogCard({ post, variant = 'compact', index = 0 }: BlogCardProps) {
  if (variant === 'featured')    return <FeaturedCard    post={post} />
  if (variant === 'horizontal')  return <HorizontalCard  post={post} index={index} />
  return <CompactCard post={post} index={index} />
}
