'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef     = useRef<HTMLDivElement>(null)
  const ringRef    = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    ;(async () => {
      const { gsap } = await import('gsap')

      // quickTo creates the tween configuration once.
      // Calling quickX(val) just updates the target value — far cheaper than
      // spawning a new gsap.to() tween on every mousemove event.
      const quickX = gsap.quickTo(ring, 'x', { duration: 0.28, ease: 'power2.out' })
      const quickY = gsap.quickTo(ring, 'y', { duration: 0.28, ease: 'power2.out' })

      const onMove = (e: MouseEvent) => {
        gsap.set(dot, { x: e.clientX, y: e.clientY })
        quickX(e.clientX)
        quickY(e.clientY)
      }

      const onEnter = (e: MouseEvent) => {
        if ((e.target as Element).closest('a, button, [role="button"], input, textarea, [data-cursor]')) {
          gsap.to(ring, { scale: 1.8, opacity: 0.65, duration: 0.22, ease: 'power2.out' })
          gsap.to(dot,  { scale: 0,                  duration: 0.18, ease: 'power2.out' })
        }
      }

      const onLeave = (e: MouseEvent) => {
        if ((e.target as Element).closest('a, button, [role="button"], input, textarea, [data-cursor]')) {
          gsap.to(ring, { scale: 1, opacity: 1, duration: 0.22, ease: 'power2.out' })
          gsap.to(dot,  { scale: 1,             duration: 0.18, ease: 'power2.out' })
        }
      }

      document.addEventListener('mousemove', onMove,  { passive: true })
      document.addEventListener('mouseover', onEnter)
      document.addEventListener('mouseout',  onLeave)

      // Store cleanup so the outer useEffect return can call it even though
      // this callback is async (the previous pattern leaked all three listeners).
      cleanupRef.current = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseover', onEnter)
        document.removeEventListener('mouseout',  onLeave)
        gsap.killTweensOf([dot, ring])
      }
    })()

    // React calls this when the component unmounts.
    // cleanupRef.current will be null only if unmount races the async import,
    // in which case no listeners were added — nothing to clean up.
    return () => cleanupRef.current?.()
  }, [])

  return (
    <>
      <div ref={dotRef}  className="custom-cursor-dot"  aria-hidden="true" />
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden="true" />
    </>
  )
}
