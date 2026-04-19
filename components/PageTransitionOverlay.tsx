'use client'

/**
 * PageTransitionOverlay — cinematic shard transition system.
 *
 * Concept: "fragmentation & assembly"
 *  - COVER   : 7 vertical shards with organic widths sweep down, sealing
 *              the viewport like fault lines closing. Left → right stagger.
 *  - HOLD    : viewport is dark — a gold scan line sweeps upward across
 *              the surface, echoing the homepage halo energy.
 *  - REVEAL  : shards sweep away right → left, assembling the new page
 *              behind them. A subtle depth gradient fades with them.
 *
 * The gold seams between shards + the scan line keep visual continuity
 * with the 3D world (halo ring, gold accent language).
 */

import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import gsap from 'gsap'

/* ─── Context ───────────────────────────────────────────────────────────── */

type TransitionState = 'idle' | 'covering' | 'revealing'

interface TransitionContextValue {
  navigate: (href: string) => void
  state:    TransitionState
}

const TransitionContext = createContext<TransitionContextValue>({
  navigate: () => {},
  state:    'idle',
})

export const useTransition = () => useContext(TransitionContext)

/* ─── Shard configuration ───────────────────────────────────────────────── */

// Organic shard widths (sum ≈ 100%). Irregular widths feel like real cracks.
const SHARD_FLEX   = [1.15, 0.92, 1.10, 0.88, 1.12, 0.95, 1.08]
const SHARD_COUNT  = SHARD_FLEX.length

// Timing
const COVER_DUR    = 0.44   // s — each shard cover sweep
const REVEAL_DUR   = 0.40   // s — each shard reveal sweep
const STAGGER_COV  = 0.038  // s — left-to-right wave
const STAGGER_REV  = 0.028  // s — right-to-left return
const HOLD_MS      = 90     // ms — pause at full coverage before route push

/* ─── Provider ──────────────────────────────────────────────────────────── */

export default function PageTransitionOverlay({ children }: { children: ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()

  const shardsRef   = useRef<(HTMLDivElement | null)[]>([])
  const scanRef     = useRef<HTMLDivElement>(null)
  const stateRef    = useRef<TransitionState>('idle')
  const pendingRef  = useRef<string | null>(null)
  const [state, setState] = useState<TransitionState>('idle')

  const setTransitionState = useCallback((s: TransitionState) => {
    stateRef.current = s
    setState(s)
  }, [])

  /* ── Cover → push route ─────────────────────────────────────────────── */
  const navigate = useCallback((href: string) => {
    if (stateRef.current !== 'idle') return
    if (href === window.location.pathname) return

    pendingRef.current = href
    setTransitionState('covering')

    const shards = shardsRef.current.filter(Boolean) as HTMLDivElement[]

    // Start above viewport
    gsap.set(shards, { yPercent: -105 })

    gsap.to(shards, {
      yPercent:  0,
      duration:  COVER_DUR,
      ease:      'power2.inOut',
      stagger:   STAGGER_COV,
      onComplete() {
        router.push(href)
      },
    })
  }, [router, setTransitionState])

  /* ── Pathname change → reveal ───────────────────────────────────────── */
  useEffect(() => {
    if (stateRef.current !== 'covering') return

    const shards = shardsRef.current.filter(Boolean) as HTMLDivElement[]
    const scan   = scanRef.current

    const timer = setTimeout(() => {
      setTransitionState('revealing')

      // Gold scan line sweeps upward — "world energy" moving through the crack
      if (scan) {
        gsap.timeline()
          .set(scan,  { top: '100%', opacity: 0 })
          .to(scan,   { opacity: 0.7, duration: 0.10, ease: 'power2.out' })
          .to(scan,   { top: '0%',   duration: 0.44, ease: 'power2.inOut' }, 0.04)
          .to(scan,   { opacity: 0,  duration: 0.18, ease: 'power1.in'   }, '-=0.20')
      }

      // Shards reveal right → left (opposite of cover direction)
      gsap.to(shards, {
        yPercent:  105,
        duration:  REVEAL_DUR,
        ease:      'power3.inOut',   // stronger deceleration = "assembly" feel
        stagger:   { from: 'end', amount: STAGGER_REV * SHARD_COUNT },
        onComplete() {
          gsap.set(shards, { yPercent: -105 })
          if (scan) gsap.set(scan, { opacity: 0 })
          setTransitionState('idle')
          pendingRef.current = null
        },
      })
    }, HOLD_MS)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <TransitionContext.Provider value={{ navigate, state }}>
      {children}

      {/* ── Shard overlay ─────────────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position:      'fixed',
          inset:         0,
          zIndex:        9990,
          pointerEvents: 'none',
          display:       'flex',
          overflow:      'hidden',
        }}
      >
        {/* Gold scan line — visible during the hold/reveal moment */}
        <div
          ref={scanRef}
          style={{
            position:   'absolute',
            left:       0,
            right:      0,
            top:        '100%',
            height:     '1px',
            zIndex:     1,
            opacity:    0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.9) 50%, transparent 100%)',
            boxShadow:  '0 0 12px 2px rgba(201,168,76,0.35)',
            pointerEvents: 'none',
          }}
        />

        {/* Shards */}
        {SHARD_FLEX.map((flex, i) => (
          <div
            key={i}
            ref={el => { shardsRef.current[i] = el }}
            style={{
              flex,
              height:     '110%',       // slightly oversize prevents gap at edges
              // Warm, near-black — the background of the 3D world
              background: `linear-gradient(
                180deg,
                #050505 0%,
                #060504 55%,
                #080603 100%
              )`,
              // Gold crack seam on right edge of each shard
              boxShadow:   'inset -1px 0 0 rgba(201,168,76,0.22)',
              // Gold leading edge — the "light bleed" as the shard sweeps
              borderBottom: '2px solid rgba(201,168,76,0.28)',
              transform:    'translateY(-105%)',
              willChange:   'transform',
            }}
          />
        ))}
      </div>
    </TransitionContext.Provider>
  )
}
