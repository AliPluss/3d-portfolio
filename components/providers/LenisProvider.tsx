'use client'

/**
 * Lenis smooth scroll provider.
 *
 * Key fixes over the scaffold:
 *  - useState (not just useRef) so the context value is non-null after init
 *  - GSAP ticker drives Lenis — single source of truth for frame timing,
 *    prevents jitter when GSAP animations and Lenis run simultaneously
 *  - ScrollTrigger.update() called on every scroll event so the homepage
 *    ThreeScene card trigger stays in sync with smooth scroll progress
 *  - Scroll-to-top on route change — happens while transition shards cover
 *    the viewport, so the snap is invisible
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import Lenis           from 'lenis'

const LenisContext = createContext<Lenis | null>(null)

export function useLenis(): Lenis | null {
  return useContext(LenisContext)
}

export default function LenisProvider({ children }: { children: ReactNode }) {
  const [instance, setInstance] = useState<Lenis | null>(null)
  const lenisRef    = useRef<Lenis | null>(null)
  const cleanupRef  = useRef<() => void>(() => {})
  const pathname    = usePathname()

  useEffect(() => {
    const lenis = new Lenis({
      duration:        1.1,
      easing:          (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation:     'vertical',
      smoothWheel:     true,
      touchMultiplier: 2,
    })

    lenisRef.current = lenis
    setInstance(lenis)

    // Start with a simple RAF loop (works immediately, even before GSAP loads)
    let rafId: number
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // Upgrade to GSAP ticker once GSAP is available — single animation frame
    // source eliminates scroll jitter between Lenis and GSAP timeline animations
    let mounted = true
    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (!mounted) return

      // Switch from manual RAF to GSAP ticker
      cancelAnimationFrame(rafId)
      gsap.registerPlugin(ScrollTrigger)

      // Notify ScrollTrigger on each Lenis scroll tick so the homepage
      // ThreeScene panel trigger receives smooth progress values
      const onScroll = () => ScrollTrigger.update()
      lenis.on('scroll', onScroll)

      const tickerFn = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(tickerFn)
      gsap.ticker.lagSmoothing(0)

      cleanupRef.current = () => {
        lenis.off('scroll', onScroll)
        gsap.ticker.remove(tickerFn)
      }
    }).catch(() => {
      // GSAP unavailable — keep the manual RAF loop running
    })

    return () => {
      mounted = false
      cancelAnimationFrame(rafId)
      cleanupRef.current()
      lenis.destroy()
      lenisRef.current = null
      setInstance(null)
    }
  }, [])

  // Scroll to top instantly on route change.
  // Runs while transition shards cover the screen — the snap is invisible.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true })
  }, [pathname])

  return (
    <LenisContext.Provider value={instance}>
      {children}
    </LenisContext.Provider>
  )
}
