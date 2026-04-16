import Link  from 'next/link'
import Image from 'next/image'

export interface Post {
  _id:       string
  title:     string
  excerpt:   string
  thumbnail: string
  date:      string
  slug:      string
}

interface BlogCardProps {
  post:      Post
  featured?: boolean
  index?:    number
}

export default function BlogCard({ post, featured = false, index = 0 }: BlogCardProps) {
  const date = new Date(post.date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  // ── Featured — large editorial card ──────────────────────────────────────
  if (featured) {
    return (
      <Link
        href={`/blog/${post.slug || post._id}`}
        style={{
          display:       'flex',
          flexDirection: 'column',
          gap:           0,
          borderRadius:  'var(--radius-lg)',
          overflow:      'hidden',
          border:        '1px solid var(--border)',
          background:    'var(--surface)',
          textDecoration:'none',
          cursor:        'none',
        }}
        className="group"
      >
        {/* Thumbnail */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '21/9', overflow: 'hidden' }}>
          {post.thumbnail ? (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              priority
              className="object-cover"
              style={{
                filter: 'brightness(0.7)',
                transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.4s ease',
              }}
              sizes="100vw"
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(255,255,255,0.02))',
            }} />
          )}

          {/* Featured label */}
          <div style={{
            position: 'absolute', top: '20px', left: '20px',
            fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase',
            color: 'var(--gold)',
            background: 'rgba(5,5,5,0.6)',
            border: '1px solid var(--gold-border)',
            borderRadius: '100px',
            padding: '4px 12px',
            backdropFilter: 'blur(8px)',
          }}>
            Featured
          </div>
        </div>

        {/* Text */}
        <div style={{ padding: '28px 28px 24px' }}>
          <time style={{
            fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--gold-muted)', display: 'block', marginBottom: '12px',
          }}>
            {date}
          </time>
          <h2 style={{
            fontFamily:  "'Playfair Display', serif",
            fontSize:    'clamp(1.5rem, 3vw, 2.4rem)',
            fontWeight:  700,
            color:       '#fff',
            lineHeight:  1.2,
            marginBottom:'12px',
            transition:  'color 0.2s',
          }}>
            {post.title}
          </h2>
          {post.excerpt && (
            <p style={{
              fontSize: '13px', color: 'var(--text-muted)',
              lineHeight: 1.75, maxWidth: '640px',
              display: '-webkit-box', WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {post.excerpt}
            </p>
          )}
          <div style={{
            marginTop: '20px',
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Read article
            <span style={{ display: 'inline-block', transition: 'transform 0.2s' }}>→</span>
          </div>
        </div>
      </Link>
    )
  }

  // ── Regular card ──────────────────────────────────────────────────────────
  return (
    <Link
      href={`/blog/${post.slug || post._id}`}
      style={{
        display:       'flex',
        flexDirection: 'column',
        borderRadius:  'var(--radius)',
        overflow:      'hidden',
        border:        '1px solid var(--border)',
        background:    'var(--surface)',
        textDecoration:'none',
        cursor:        'none',
        transition:    'border-color 0.25s, background 0.25s, box-shadow 0.25s',
        animationDelay: `${index * 0.07}s`,
        animationFillMode: 'both',
      }}
      className="group glass-card animate-fade-in opacity-0"
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', overflow: 'hidden' }}>
        {post.thumbnail ? (
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className="object-cover"
            style={{
              filter: 'brightness(0.8)',
              transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
            }}
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(201,168,76,0.05), rgba(255,255,255,0.02))',
          }} />
        )}
      </div>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '18px 18px 20px', flexGrow: 1 }}>
        <time style={{
          fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--gold-muted)',
        }}>
          {date}
        </time>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1rem', fontWeight: 600,
          color: 'rgba(255,255,255,0.88)',
          lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          transition: 'color 0.2s',
        }}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p style={{
            fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7, flexGrow: 1,
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  )
}
