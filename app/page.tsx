import dynamic              from 'next/dynamic'
import HomeWorkSection     from '@/components/HomeWorkSection'
import MigrationController from '@/components/MigrationController'
import LogoParticles       from '@/components/LogoParticles'
import ManifestoSection    from '@/components/ManifestoSection'
import CapabilitiesSection from '@/components/CapabilitiesSection'
import ProcessSection      from '@/components/ProcessSection'
import FinalCTA            from '@/components/FinalCTA'

const ThreeScene = dynamic(() => import('@/components/ThreeScene'), { ssr: false })

export default function HomePage() {
  return (
    <MigrationController>
      <main style={{ position: 'relative' }}>
        {/*
          Fixed atmospheric layer — sits behind BOTH sections at z:-1.
          The hero's WebGL canvas renders opaque on top, so this is invisible
          during the hero. Once the hero exits the viewport and HomeWorkSection
          takes over (transparent at its top), this layer bleeds through,
          extending the same deep blue-indigo atmosphere from the 3D scene.
        */}
        <div
          aria-hidden
          style={{
            position:      'fixed',
            inset:         0,
            zIndex:        -1,
            pointerEvents: 'none',
            background: [
              'radial-gradient(ellipse 78% 60% at 30% 48%, rgba(8,10,14,0.72) 0%, transparent 68%)',
              'radial-gradient(ellipse 40% 30% at 30% 74%, rgba(201,168,76,0.032) 0%, transparent 58%)',
              '#050505',
            ].join(', '),
          }}
        />

        <ThreeScene />

        {/*
          ── Migration trigger ────────────────────────────────────────────
          Zero-height boundary marker placed at the exact seam between
          ThreeScene's scroll space and HomeWorkSection.
          MigrationController's ScrollTrigger watches this element to
          derive progress 0 → 1 as the user scrolls across the seam.
        */}
        <div id="migration-trigger" aria-hidden style={{ height: 0, pointerEvents: 'none' }} />

        <ManifestoSection />
        <HomeWorkSection />
        <CapabilitiesSection />
        <ProcessSection />
        <FinalCTA />
      </main>

      {/* Fixed overlay — renders above everything, inside migration context */}
      <LogoParticles />
    </MigrationController>
  )
}
