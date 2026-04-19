'use client'

/**
 * ParallaxLayer — subtle scroll-driven vertical offset.
 *
 * Lightweight: uses a single IntersectionObserver + passive scroll listener,
 * only active when the element is in the viewport.
 *
 * Usage:
 *   <ParallaxLayer speed={0.12}>
 *     <HeroImage />
 *   </ParallaxLayer>
 *
 * speed: fraction of scroll offset applied as translateY.
 *        0.10 = barely perceptible (good for backgrounds)
 *        0.20 = subtle foreground depth
 *        Avoid > 0.25 — looks wrong on fast scroll.
 */

import { useEffect, useRef, type ReactNode } from 'react'

interface ParallaxLayerProps {
  children: ReactNode
  speed?:   number
  className?: string
}

export default function ParallaxLayer({
  children,
  speed     = 0.10,
  className,
}: ParallaxLayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const isVisible  = useRef(false)
  const baseY      = useRef(0)
  const currentY   = useRef(0)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    // Record element's initial viewport offset once
    const onScroll = () => {
      if (!isVisible.current) return
      const target = (window.scrollY - baseY.current) * speed
      // Lerp for smoothness — avoids snapping with Lenis
      currentY.current += (target - currentY.current) * 0.12
      el.style.transform = `translateY(${currentY.current.toFixed(2)}px)`
    }

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        isVisible.current = true
        baseY.current = window.scrollY
      } else {
        isVisible.current = false
      }
    }, { threshold: 0 })

    obs.observe(el)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      obs.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [speed])

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ willChange: 'transform' }}
    >
      {children}
    </div>
  )
}
