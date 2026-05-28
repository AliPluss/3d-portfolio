'use client'

import { useEffect, type ReactNode } from 'react'
import { setMigrationProgress }      from '@/lib/migration-context'

interface Props { children: ReactNode }

/**
 * Owns the GSAP ScrollTrigger for the logo → orb migration.
 * Renders no DOM — it just drives setMigrationProgress on every scroll frame.
 * Only LogoParticles (and future orb) subscribe and re-render.
 */
export default function MigrationController({ children }: Props) {
  useEffect(() => {
    let st: { kill(): void } | undefined

    ;(async () => {
      const { gsap }          = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const trigger = document.getElementById('migration-trigger')
      if (!trigger) return

      st = ScrollTrigger.create({
        trigger,
        start:    'top 88%',
        end:      'top -170%',
        scrub:    1.6,
        onUpdate: (self) => setMigrationProgress(self.progress),
      })
    })()

    return () => {
      st?.kill()
      setMigrationProgress(0)   // reset on unmount / HMR
    }
  }, [])

  return <>{children}</>
}
