'use client'

/**
 * ScrollReveal — reusable intersection-based reveal wrapper.
 *
 * Drop-in replacement for the manual useEffect + IntersectionObserver
 * pattern used across pages. Children slide up and fade in when they
 * enter the viewport.
 *
 * Usage:
 *   <ScrollReveal>
 *     <div>content</div>
 *   </ScrollReveal>
 *
 *   // Staggered list — each child gets delay * index
 *   <ScrollReveal stagger={0.08}>
 *     {items.map(item => <Card key={item.id} {...item} />)}
 *   </ScrollReveal>
 */

import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react'

interface ScrollRevealProps {
  children:   ReactNode
  className?: string
  style?:     CSSProperties
  /** Additional delay in seconds before the reveal starts */
  delay?:     number
  /** Threshold 0-1: how much of element must be visible to trigger */
  threshold?: number
  /** Once revealed, keep revealed (default true) */
  once?:      boolean
}

export default function ScrollReveal({
  children,
  className,
  style,
  delay     = 0,
  threshold = 0.06,
  once      = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          if (once) obs.unobserve(el)
        } else if (!once) {
          el.classList.remove('is-visible')
        }
      },
      { threshold },
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold, once])

  return (
    <div
      ref={ref}
      className={['reveal', className].filter(Boolean).join(' ')}
      style={{ transitionDelay: delay ? `${delay}s` : undefined, ...style }}
    >
      {children}
    </div>
  )
}
