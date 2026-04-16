'use client'

import Link          from 'next/link'
import { usePathname } from 'next/navigation'
import { useState }  from 'react'
import { Menu, X }   from 'lucide-react'
import { cn }        from '@/lib/utils'

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
        'px-6 md:px-10 h-[60px]',
        isHome
          ? 'bg-transparent'
          : 'bg-[#050505]/80 backdrop-blur-md border-b border-white/[0.05]',
      )}
      style={{ transition: 'background 0.4s ease, border-color 0.4s ease' }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="font-display text-base font-bold tracking-wide text-white hover:text-gold transition-colors"
        style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.04em' }}
      >
        Portfolio
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'nav-link text-[11px] tracking-widest uppercase transition-colors',
                active ? 'text-white active' : 'text-white/35 hover:text-white/80',
              )}
            >
              {label}
            </Link>
          )
        })}

        {/* Gold accent divider */}
        <span
          aria-hidden
          style={{ width: '1px', height: '16px', background: 'rgba(201,168,76,0.25)' }}
        />

        <Link
          href="/admin"
          className="text-[10px] tracking-widest uppercase text-white/20 hover:text-white/50 transition-colors"
        >
          Admin
        </Link>
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
        <nav className="md:hidden absolute top-[60px] inset-x-0 border-b border-white/[0.06]
                        bg-[#050505]/95 backdrop-blur-md flex flex-col py-8 px-6 gap-7">
          {[...NAV_LINKS, { href: '/admin', label: 'Admin' }].map(({ href, label }) => (
            <Link
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
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
