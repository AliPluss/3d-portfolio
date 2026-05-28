'use client'

import { ArrowUpRight, Github, Twitter, Linkedin } from 'lucide-react'
import TransitionLink from '@/components/TransitionLink'

const SOCIAL_LINKS = [
  { label: 'Twitter', href: '#', icon: Twitter },
  { label: 'LinkedIn', href: '#', icon: Linkedin },
  { label: 'GitHub', href: '#', icon: Github },
]

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.05] bg-[#050505] pt-16 pb-8 px-6 md:px-12">
      {/* Subtle top glow */}
      <div 
        aria-hidden 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)' }}
      />
      
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
        
        {/* Left: Brand / CTA */}
        <div className="max-w-sm">
          <p className="font-display text-2xl font-bold tracking-tight text-white mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Let's build something<br/>
            <em className="text-gold italic font-normal">extraordinary.</em>
          </p>
          <TransitionLink 
            href="/contact" 
            className="group inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.15em] uppercase text-gold hover:text-white transition-colors cursor-none"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Get in touch
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </TransitionLink>
        </div>

        {/* Right: Socials & Copyright */}
        <div className="flex flex-col items-start md:items-end gap-6">
          <div className="flex items-center gap-5">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a 
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-gold transition-colors cursor-none p-2 -m-2"
                aria-label={label}
              >
                <Icon size={18} strokeWidth={1.5} />
              </a>
            ))}
          </div>
          
          <div className="flex items-center gap-4 text-[10px] text-white/30 tracking-widest uppercase font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span>© {new Date().getFullYear()}</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>All rights reserved</span>
          </div>
        </div>
        
      </div>
    </footer>
  )
}
