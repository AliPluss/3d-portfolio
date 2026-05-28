'use client'

import { usePathname }  from 'next/navigation'
import { useState }     from 'react'
import { Menu, X }      from 'lucide-react'
import dynamic          from 'next/dynamic'
import { cn }           from '@/lib/utils'
import TransitionLink   from '@/components/TransitionLink'

const LogoScene = dynamic(
  () => import('@/components/scene/LogoScene'),
  { ssr: false },
)

const NAV_LINKS = [
  { href: '/projects', label: 'Work'  },
  { href: '/blog',     label: 'Blog'  },
  { href: '/cv',       label: 'CV'    },
]

export default function Navbar() {
  const pathname = usePathname()
  const isHome   = pathname === '/'
  const [open, setOpen] = useState(false)

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50',
        'flex items-center justify-between',
        'px-6 md:px-12 h-[72px]',
        isHome
          ? 'bg-[rgba(5,5,5,0.02)] backdrop-blur-md border-b border-transparent'
          : 'bg-[#050505]/75 backdrop-blur-2xl border-b border-white/[0.04]',
      )}
      style={{ transition: 'background 0.5s ease, border-color 0.5s ease, backdrop-filter 0.5s ease' }}
    >
      {/* Logo — 3D brand mark from /logo_avatar.glb */}
      <TransitionLink
        href="/"
        style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
      >
        {/* id used by the migration system to read the logo's screen position */}
        <div id="logo-anchor" style={{ width: '58px', height: '58px', flexShrink: 0, position: 'relative' }}>
          <LogoScene />
        </div>
      </TransitionLink>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-9">
        {NAV_LINKS.map(({ href, label }, i) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <TransitionLink
              key={href}
              href={href}
              className={cn(
                'nav-link relative text-[10px] tracking-[0.2em] uppercase transition-all duration-300',
                active ? 'text-white active' : 'text-white/40 hover:text-white',
              )}
            >
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: active ? 500 : 400,
              }}>
                {String(i + 1).padStart(2, '0')}&nbsp;{label}
              </span>
            </TransitionLink>
          )
        })}

        {/* Gold accent divider */}
        <span
          aria-hidden
          style={{ width: '1px', height: '14px', background: 'rgba(201,168,76,0.22)', flexShrink: 0 }}
        />

        <TransitionLink
          href="/admin"
          className="text-[9px] tracking-[0.16em] uppercase text-white/18 hover:text-white/45 transition-colors duration-200"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Admin
        </TransitionLink>
      </nav>

      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden p-2 text-white/50 hover:text-white transition-colors"
        aria-label="Toggle navigation"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden absolute top-[72px] inset-x-0 border-b border-white/[0.04]
                        bg-[#050505]/95 backdrop-blur-2xl flex flex-col py-8 px-6 gap-7 shadow-2xl">
          {[...NAV_LINKS, { href: '/admin', label: 'Admin' }].map(({ href, label }) => (
            <TransitionLink
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'font-display text-lg transition-colors',
                pathname === href ? 'text-gold' : 'text-white/50 hover:text-white',
              )}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {label}
            </TransitionLink>
          ))}
        </nav>
      )}
    </header>
  )
}
