'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // Check touch device — bail early
    if (window.matchMedia('(pointer: coarse)').matches) return

    let gsapInstance: typeof import('gsap')['gsap'] | null = null

    ;(async () => {
      const { gsap } = await import('gsap')
      gsapInstance = gsap

      let mx = -100, my = -100

      const onMove = (e: MouseEvent) => {
        mx = e.clientX
        my = e.clientY

        // Dot follows instantly
        gsap.set(dot, { x: mx, y: my })

        // Ring lags behind
        gsap.to(ring, {
          x: mx, y: my,
          duration: 0.28,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }

      const onEnterInteractive = (e: MouseEvent) => {
        const target = (e.target as Element)
        if (target.closest('a, button, [role="button"], input, textarea, [data-cursor]')) {
          gsap.to(ring, { scale: 1.8, opacity: 0.7, duration: 0.2 })
          gsap.to(dot,  { scale: 0,   duration: 0.2 })
        }
      }

      const onLeaveInteractive = (e: MouseEvent) => {
        const target = (e.target as Element)
        if (target.closest('a, button, [role="button"], input, textarea, [data-cursor]')) {
          gsap.to(ring, { scale: 1, opacity: 1, duration: 0.2 })
          gsap.to(dot,  { scale: 1, duration: 0.2 })
        }
      }

      document.addEventListener('mousemove',  onMove)
      document.addEventListener('mouseover',  onEnterInteractive)
      document.addEventListener('mouseout',   onLeaveInteractive)

      return () => {
        document.removeEventListener('mousemove',  onMove)
        document.removeEventListener('mouseover',  onEnterInteractive)
        document.removeEventListener('mouseout',   onLeaveInteractive)
      }
    })()

    return () => {
      if (gsapInstance) gsapInstance.killTweensOf([dot, ring])
    }
  }, [])

  return (
    <>
      <div ref={dotRef}  className="custom-cursor-dot"  aria-hidden="true" />
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden="true" />
    </>
  )
}
