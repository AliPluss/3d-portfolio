'use client'

import { useEffect, useRef } from 'react'
import { useMigrationProgress } from '@/lib/migration-context'

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const CHARS = ['3', '0', 'M'] as const

function sr(s: number): number {
  return Math.abs(Math.sin(s * 127.1 + 43.7) * 43758.5453) % 1
}
function ss(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
function eio(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
function bz(t: number, p0: number, p1: number, p2: number): number {
  return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2
}
function bz3(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const u = 1 - t
  return u*u*u*p0 + 3*u*u*t*p1 + 3*u*t*t*p2 + t*t*t*p3
}
function lp(a: number, b: number, t: number): number { return a + (b - a) * t }

/* ─── Logo shape particle ─────────────────────────────────────────────────── */
interface ShapePt {
  lxFrac:       number   // [-0.5, 0.5] relative to logo CSS rect
  lyFrac:       number
  ch:           string
  initR: number; initG: number; initB: number   // actual logo pixel colour
  gold:         boolean
  delay:        number   // scatter stagger [0, 0.32]
  size:         number
  jitterAngle:  number   // stage-1 micro-displacement direction (random, ≠ scatter)
  jitterDist:   number   // stage-1 max displacement in CSS px [2, 7]
  scatterAngle: number
  scatterDist:  number
  cpOffset:     number
}

/* ─── Capture actual rendered logo pixels ─────────────────────────────────── *
 * LogoScene must have preserveDrawingBuffer: true (already set).              *
 * Returns [] if the canvas is empty / GLB still loading — caller falls back.  */
function captureLogoPixels(logoEl: HTMLElement): ShapePt[] {
  const src = logoEl.querySelector('canvas') as HTMLCanvasElement | null
  if (!src || src.width === 0 || src.height === 0) return []

  const CW = src.width, CH = src.height
  const off = document.createElement('canvas')
  off.width = CW; off.height = CH
  const ctx = off.getContext('2d')
  if (!ctx) return []

  try { ctx.drawImage(src, 0, 0) } catch { return [] }

  const { data } = ctx.getImageData(0, 0, CW, CH)

  /* Count non-transparent pixels to detect an unloaded canvas */
  let visibleCount = 0
  const STEP = Math.max(1, Math.round(Math.min(CW, CH) / 52))

  const cands: Array<{ lxFrac: number; lyFrac: number; r: number; g: number; b: number }> = []

  for (let y = 0; y < CH; y += STEP) {
    for (let x = 0; x < CW; x += STEP) {
      const i = (y * CW + x) * 4
      if (data[i + 3] < 25) continue
      visibleCount++
      cands.push({ lxFrac: x / CW - 0.5, lyFrac: y / CH - 0.5, r: data[i], g: data[i + 1], b: data[i + 2] })
    }
  }

  /* Fewer than ~30 visible pixels almost certainly means the GLB hasn't rendered yet */
  if (visibleCount < 30) return []

  /* Shuffle so scatter stagger isn't spatially ordered */
  for (let i = cands.length - 1; i > 0; i--) {
    const j = Math.floor(sr(i * 13 + 555) * (i + 1))
    ;[cands[i], cands[j]] = [cands[j], cands[i]]
  }

  let s = 9000
  return cands.slice(0, 360).map(c => {
    const baseAng = Math.atan2(c.lyFrac + (sr(s++) - 0.5) * 0.2, c.lxFrac + (sr(s++) - 0.5) * 0.2)
    return {
      lxFrac: c.lxFrac, lyFrac: c.lyFrac,
      ch: c.lxFrac < -0.17 ? '3' : c.lxFrac < 0.17 ? '0' : 'M',
      initR: c.r, initG: c.g, initB: c.b,
      /* Warm pixels (more red than blue) → gold target; rest stay near white */
      gold:         c.r > c.b + 20,
      delay:        sr(s++) * 0.32,
      size:         1.8 + sr(s++) * 2.8,
      jitterAngle:  sr(s++) * Math.PI * 2,
      jitterDist:   2 + sr(s++) * 5,
      scatterAngle: baseAng + (sr(s++) - 0.5) * Math.PI * 0.85,
      scatterDist:  85 + sr(s++) * 245,
      cpOffset:     (sr(s++) - 0.5) * 130,
    }
  })
}

/* ─── Fallback: rasterize "30M" text ──────────────────────────────────────── *
 * Used only when the WebGL canvas is still empty (GLB loading).               */
function rasterizeLogoShape(): ShapePt[] {
  const OFF = 174
  const off = document.createElement('canvas')
  off.width = off.height = OFF
  const ctx = off.getContext('2d')
  if (!ctx) return []

  ctx.clearRect(0, 0, OFF, OFF)
  ctx.font         = `300 50px 'Playfair Display', serif`
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle    = '#ffffff'
  ctx.fillText('3', OFF / 6,     OFF / 2)
  ctx.fillText('0', OFF / 2,     OFF / 2)
  ctx.fillText('M', OFF * 5 / 6, OFF / 2)

  const { data } = ctx.getImageData(0, 0, OFF, OFF)
  const cands: Array<{ lxFrac: number; lyFrac: number; ch: string }> = []

  for (let y = 0; y < OFF; y += 2) {
    for (let x = 0; x < OFF; x += 2) {
      if (data[(y * OFF + x) * 4 + 3] < 80) continue
      cands.push({ lxFrac: x / OFF - 0.5, lyFrac: y / OFF - 0.5, ch: x < OFF / 3 ? '3' : x < (OFF * 2) / 3 ? '0' : 'M' })
    }
  }

  for (let i = cands.length - 1; i > 0; i--) {
    const j = Math.floor(sr(i * 11 + 777) * (i + 1))
    ;[cands[i], cands[j]] = [cands[j], cands[i]]
  }

  let s = 8000
  return cands.slice(0, 280).map(c => {
    const baseAng = Math.atan2(c.lyFrac + (sr(s++) - 0.5) * 0.25, c.lxFrac + (sr(s++) - 0.5) * 0.25)
    return {
      lxFrac: c.lxFrac, lyFrac: c.lyFrac, ch: c.ch,
      initR: 237, initG: 233, initB: 224,
      gold: sr(s++) < 0.50,
      delay:        sr(s++) * 0.32,
      size:         2.6 + sr(s++) * 3.4,
      jitterAngle:  sr(s++) * Math.PI * 2,
      jitterDist:   2 + sr(s++) * 5,
      scatterAngle: baseAng + (sr(s++) - 0.5) * Math.PI * 0.85,
      scatterDist:  85 + sr(s++) * 245,
      cpOffset:     (sr(s++) - 0.5) * 130,
    }
  })
}

/* ─── Orb particle ────────────────────────────────────────────────────────── */
interface Pt {
  ch:       string
  gold:     boolean
  srcDx:    number; srcDy: number
  cp1Dx:    number; cp1Dy: number   // cubic bezier lift control (offset from launch)
  cp2Dx:    number; cp2Dy: number   // cubic bezier approach control (offset from orb)
  depthAmp: number                  // mid-arc size swell for depth [0.10, 0.32]
  ox: number; oy: number; oz: number
  orbR:     number
  layer:    0 | 1 | 2
  migStart: number
  migEnd:   number
  isMig:    boolean
  bp: number; ba: number
  fszFly:   number
  fszOrb:   number
  boost:    number
}

const LAYER_SPEED: [number, number, number] = [1.14, 1.00, 0.88]

const N_MIG     = 24
const N_CORE    = 160
const N_VOLUME  = 1370
const N_STRANDS = 8
const N_SPR     = 70
const N_ACCUM   = N_CORE + N_VOLUME + N_STRANDS * N_SPR
const N_TOTAL   = N_MIG + N_ACCUM

const CHAR_DX: Record<string, number> = { '3': -14, '0': 0, 'M': 14 }

const FC_BASE  = 0.5
const FC_STEP  = 0.5
const FC_COUNT = 30
const FONT_CACHE = Array.from({ length: FC_COUNT }, (_, i) =>
  `300 ${(FC_BASE + i * FC_STEP).toFixed(1)}px 'Playfair Display', serif`
)
function fontIdx(fsz: number): number {
  return Math.min(FC_COUNT - 1, Math.max(0, Math.round((fsz - FC_BASE) / FC_STEP)))
}

/* Populated by the PARTICLES IIFE; used by orbVis in the render loop */
let _migFirstArrive = 0.54
let _migLastArrive  = 0.88

const PARTICLES: Pt[] = (() => {
  const pts: Pt[] = []
  let seed = 1
  const migArrivals: number[] = []   // migEnd per migration particle, in build order

  for (let i = 0; i < N_MIG; i++) {
    const ci   = Math.floor(i / (N_MIG / 3))
    const ch   = CHARS[ci]
    const nr   = 0.06 + sr(seed++) * 0.80
    const cosθ = 2 * sr(seed++) - 1
    const sinθ = Math.sqrt(Math.max(0, 1 - cosθ * cosθ))
    const φ    = 2 * Math.PI * sr(seed++)
    const layer: 0|1|2 = nr < 0.34 ? 0 : nr < 0.67 ? 1 : 2
    /* Wider per-character stagger so each glyph lifts at a noticeably
     * different moment — '3' first, then '0', then 'M'.                  */
    const migStart = 0.30 + (ci / 3) * 0.09 + sr(seed++) * 0.10

    /* Lift direction — character-specific base angle in CSS canvas coords
     * (y-axis points down, so negative sin = upward screen motion).
     * '3' rises upper-left, '0' straight up, 'M' upper-right.           */
    const liftBase  = ch === '3' ? -0.72 * Math.PI   // ~upper-left
                    : ch === 'M' ? -0.28 * Math.PI   // ~upper-right
                    :              -0.50 * Math.PI   // straight up
    const liftAngle = liftBase + (sr(seed++) - 0.5) * 0.44
    const liftDist  = 80 + sr(seed++) * 95            // 80–175 px

    pts.push({
      ch, gold: sr(seed++) < 0.45,
      srcDx: CHAR_DX[ch] + (sr(seed++) - 0.5) * 6,
      srcDy: (sr(seed++) - 0.5) * 5,
      /* P1 — lift: offset from launch point in the lift direction        */
      cp1Dx: Math.cos(liftAngle) * liftDist + (sr(seed++) - 0.5) * 30,
      cp1Dy: Math.sin(liftAngle) * liftDist + (sr(seed++) - 0.5) * 24,
      /* P2 — approach: above the orb so characters descend into it       */
      cp2Dx: (sr(seed++) - 0.5) * 80,
      cp2Dy: -58 - sr(seed++) * 68,
      ox: sinθ * Math.cos(φ) * nr, oy: cosθ * nr, oz: sinθ * Math.sin(φ) * nr,
      orbR: nr, layer,
      migStart,
      migEnd:  (() => { const e = migStart + 0.22 + sr(seed++) * 0.12; migArrivals.push(e); return e })(),
      isMig:   true,
      bp: sr(seed++) * Math.PI * 2, ba: 0.006 + sr(seed++) * 0.010,
      fszFly:  5 + sr(seed++) * 5,                    // 5–10 px — smaller, more delicate
      fszOrb:  Math.max(3.0, 4.0 + (1 - nr) * 3.2),
      depthAmp: 0.10 + sr(seed++) * 0.22,
      boost: 1.40,
    })
  }

  const core: Pt[] = []
  for (let i = 0; i < N_CORE; i++) {
    const nr   = sr(seed++) * 0.22
    const cosθ = 2 * sr(seed++) - 1
    const sinθ = Math.sqrt(Math.max(0, 1 - cosθ * cosθ))
    const φ    = 2 * Math.PI * sr(seed++)
    core.push({
      ch: CHARS[i % 3], gold: sr(seed++) < 0.72,
      srcDx: 0, srcDy: 0, cp1Dx: 0, cp1Dy: 0, cp2Dx: 0, cp2Dy: 0, depthAmp: 0,
      ox: sinθ * Math.cos(φ) * nr, oy: cosθ * nr, oz: sinθ * Math.sin(φ) * nr,
      orbR: nr, layer: 0,
      migStart: 0, migEnd: 0, isMig: false,
      bp: sr(seed++) * Math.PI * 2, ba: 0.010 + sr(seed++) * 0.014,
      fszFly: 0, fszOrb: Math.max(3.2, 4.5 + (1 - nr) * 3.6), boost: 1.65,
    })
  }
  /* Seal the arrival-time range once all migration particles are built */
  _migFirstArrive = Math.min(...migArrivals)
  _migLastArrive  = Math.max(...migArrivals)

  /* Core — spawns immediately after its assigned migration char arrives,
   * innermost (lowest orbR) first so the nucleus seeds before the shell. */
  core.sort((a, b) => a.orbR - b.orbR)
  core.forEach((p, i) => {
    p.migStart = migArrivals[i % N_MIG] + sr(i * 11 + 2001) * 0.06
  })
  pts.push(...core)

  const vol: Pt[] = []
  for (let i = 0; i < N_VOLUME; i++) {
    const nr    = Math.pow(sr(seed++), 0.44)
    const cosθ  = 2 * sr(seed++) - 1
    const sinθ  = Math.sqrt(Math.max(0, 1 - cosθ * cosθ))
    const φ     = 2 * Math.PI * sr(seed++)
    const goldP = nr < 0.28 ? 0.60 : nr < 0.58 ? 0.24 : 0.08
    const layer: 0|1|2 = nr < 0.34 ? 0 : nr < 0.67 ? 1 : 2
    const boost = nr < 0.35 ? 1.30 : nr < 0.65 ? 1.08 : 0.90
    vol.push({
      ch: CHARS[i % 3], gold: sr(seed++) < goldP,
      srcDx: 0, srcDy: 0, cp1Dx: 0, cp1Dy: 0, cp2Dx: 0, cp2Dy: 0, depthAmp: 0,
      ox: sinθ * Math.cos(φ) * nr, oy: cosθ * nr, oz: sinθ * Math.sin(φ) * nr,
      orbR: nr, layer,
      migStart: 0, migEnd: 0, isMig: false,
      bp: sr(seed++) * Math.PI * 2, ba: 0.006 + sr(seed++) * 0.011,
      fszFly: 0, fszOrb: Math.max(2.6, 3.7 + (1 - nr) * 2.8), boost,
    })
  }
  /* Volume — each particle is assigned to a migration char; it blooms
   * slightly after that char arrives, outer particles a little later. */
  vol.sort((a, b) => a.orbR - b.orbR)
  vol.forEach((p, i) => {
    p.migStart = migArrivals[i % N_MIG] + 0.01 + sr(i * 13 + 3001) * 0.10
  })
  pts.push(...vol)

  let stIdx = 0
  const stTotal = N_STRANDS * N_SPR
  for (let st = 0; st < N_STRANDS; st++) {
    const startAngle = (st / N_STRANDS) * Math.PI * 2
    const axisRot    = sr(st * 37 + 200) * Math.PI * 2
    const numTurns   = 1.6 + sr(st * 41 + 201) * 1.4
    const baseR      = 0.30 + sr(st * 53 + 202) * 0.35
    const cosA = Math.cos(axisRot)
    const sinA = Math.sin(axisRot)

    for (let k = 0; k < N_SPR; k++) {
      const t     = k / (N_SPR - 1)
      const phi   = t * Math.PI
      const theta = t * 2 * Math.PI * numTurns + startAngle

      let ux = Math.sin(phi) * Math.cos(theta)
      const uy = Math.cos(phi)
      let uz = Math.sin(phi) * Math.sin(theta)

      const ux2 =  ux * cosA + uz * sinA
      const uz2 = -ux * sinA + uz * cosA
      ux = ux2; uz = uz2

      const jitter = (sr(k * 17 + st * 101 + 300) - 0.5) * 0.10
      const nr     = Math.min(0.96, Math.max(0.12, baseR + t * 0.25 + jitter))
      const layer: 0|1|2 = nr < 0.34 ? 0 : nr < 0.67 ? 1 : 2
      /* Strand particle spawns after its assigned migration char, then
       * unfurls progressively along the strand length (k/N_SPR factor). */
      const spawnAt = migArrivals[stIdx % N_MIG] + 0.02 + (k / N_SPR) * 0.07

      pts.push({
        ch: CHARS[(st * N_SPR + k) % 3],
        gold: sr(k * 19 + st * 103 + 400) < 0.38,
        srcDx: 0, srcDy: 0, cp1Dx: 0, cp1Dy: 0, cp2Dx: 0, cp2Dy: 0, depthAmp: 0,
        ox: ux * nr, oy: uy * nr, oz: uz * nr,
        orbR: nr, layer,
        migStart: spawnAt, migEnd: spawnAt, isMig: false,
        bp:    sr(k * 23 + st * 107 + 500) * Math.PI * 2,
        ba:    0.008 + sr(k * 29 + st * 109 + 600) * 0.012,
        fszFly: 0, fszOrb: Math.max(2.6, 3.6 + (1 - nr) * 2.6), boost: 1.35,
      })
      stIdx++
    }
  }

  return pts
})()

/* ─── Scatter phase constants ─────────────────────────────────────────────── */
const CAPTURE_THRESHOLD = 0.012   // minimum progress before attempting capture
const SCATTER_DWELL     = 0.025   // particles sit assembled until here (brief "frozen" frame)
const SCATTER_END       = 0.65    // all shape particles dispersed

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function LogoParticles() {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const progRef     = useRef(0)
  const mouseRef    = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const capturedRef = useRef(false)   // true once we've hidden the logo and replaced it
  const progress    = useMigrationProgress()
  progRef.current   = progress

  /* Logo opacity — controlled entirely by capturedRef so the handoff is a
   * single hard switch with no overlap period where both are visible.          */
  useEffect(() => {
    const el = document.getElementById('logo-anchor')
    if (!el) return
    el.style.opacity    = capturedRef.current ? '0' : '1'
    el.style.transition = 'none'
  }, [progress])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width        = window.innerWidth  * dpr
      canvas.height       = window.innerHeight * dpr
      canvas.style.width  = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.tx = (e.clientX / window.innerWidth  - 0.5) * 2
      mouseRef.current.ty = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let shapePts: ShapePt[] = []

    const mats = Array.from({ length: 3 }, () =>
      ({ cY: 1, sY: 0, cX: 1, sX: 0, cZ: 1, sZ: 0 })
    )

    const vSx    = new Float32Array(N_TOTAL)
    const vSy    = new Float32Array(N_TOTAL)
    const vDepth = new Float32Array(N_TOTAL)
    const vOp    = new Float32Array(N_TOTAL)
    const vFsz   = new Float32Array(N_TOTAL)
    const vPidx  = new Int32Array(N_TOTAL)
    const sortBuf = new Int32Array(N_TOTAL)

    let raf: number
    let stopped = false
    let frame   = 0
    let _rt1 = 0, _rt2 = 0

    const render = () => {
      frame++
      const prog = progRef.current

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      if (prog <= 0) {
        if (!stopped) raf = requestAnimationFrame(render)
        return
      }

      const logoEl = document.getElementById('logo-anchor')
      const orbEl  = document.getElementById('orb-anchor')
      if (!logoEl || !orbEl) {
        if (!stopped) raf = requestAnimationFrame(render)
        return
      }

      /* ── One-time logo capture ────────────────────────────────────────────
       * Fires on the first frame where progress crosses CAPTURE_THRESHOLD.
       * We try the WebGL pixel capture first; fall back to text rasterisation
       * if the GLB is still loading.  Either way, we perform a hard cutover:
       * logo opacity goes to 0 in the same RAF frame that particles appear,
       * so there is never a frame where both are visible simultaneously.       */
      if (!capturedRef.current && prog >= CAPTURE_THRESHOLD) {
        const captured = captureLogoPixels(logoEl)
        shapePts = captured.length >= 30 ? captured : rasterizeLogoShape()
        capturedRef.current = true
        /* Hide the logo in the same frame — bypasses React's schedule so
         * the transition is single-frame with zero visual overlap.             */
        logoEl.style.opacity = '0'
      }

      const logR  = logoEl.getBoundingClientRect()
      const oR    = orbEl.getBoundingClientRect()
      const srcX  = logR.left + logR.width  / 2
      const srcY  = logR.top  + logR.height / 2
      const orbCx = oR.left   + oR.width    / 2
      const orbCy = oR.top    + oR.height   / 2

      let sectionProg = 0
      const sectionEl = document.getElementById('work-section')
      if (sectionEl) {
        const sR    = sectionEl.getBoundingClientRect()
        const range = Math.max(1, sR.height - window.innerHeight * 0.55)
        sectionProg = Math.max(0, Math.min(1, -sR.top / range))
      }
      const glowBoost  = 1 + 0.12 * sectionProg
      const charBoost  = 1 + 0.06 * sectionProg
      /* Scroll-reactive axes — each targets a different part of the orb so
       * the response feels differentiated rather than a uniform scale.       */
      const innerBoost = 1 + 0.18 * sectionProg   // hot core brightens at depth
      const outerTaper = 1 - 0.06 * sectionProg   // outer halo pulls back slightly
      /* Gold/ivory RGB targets at sectionProg = 1 (starting values are current
       * baseline; shifts are ≤ 8 units so the change is barely perceptible).  */
      const goldR = 212 + Math.round(8  * sectionProg)   // #d4af37 → slightly richer
      const goldG = 175 - Math.round(4  * sectionProg)
      const goldB =  55 - Math.round(8  * sectionProg)
      const ivyR  = 237 + Math.round(4  * sectionProg)   // #ede9e0 → faint cream warm
      const ivyG  = 233 + Math.round(3  * sectionProg)
      const ivyB  = 224 - Math.round(4  * sectionProg)

      const SIZE   = Math.min(oR.width, oR.height, 228)
      const RADIUS = SIZE * 0.44
      const FOV    = RADIUS * 3.2
      const tSec   = frame * 0.005

      const ms = mouseRef.current
      ms.x += (ms.tx - ms.x) * 0.022
      ms.y += (ms.ty - ms.y) * 0.022

      const angleY = frame * 0.0010
      const angleX = Math.sin(tSec * 0.40) * 0.018 + ms.y * 0.032
      const angleZ = Math.sin(tSec * 0.27) * 0.009 + ms.x * 0.016

      for (let li = 0; li < 3; li++) {
        const spd = LAYER_SPEED[li]
        const m   = mats[li]
        m.cY = Math.cos(angleY * spd);  m.sY = Math.sin(angleY * spd)
        m.cX = Math.cos(angleX * (0.75 + spd * 0.25))
        m.sX = Math.sin(angleX * (0.75 + spd * 0.25))
        m.cZ = Math.cos(angleZ);  m.sZ = Math.sin(angleZ)
      }

      /* ── Logo shape particles ─────────────────────────────────────────────
       *
       * Phase timeline (after capture at CAPTURE_THRESHOLD):
       *
       *   < SCATTER_DWELL  : assembled — particles sit exactly on logo pixels,
       *                       full opacity. First frame looks identical to logo.
       *   SCATTER_DWELL → SCATTER_END: easeOutCubic bezier explosion,
       *                       per-particle stagger, initColor → gold drift.
       *   > SCATTER_END    : skip drawing.
       *
       * Logo opacity is 0 for this entire window (hard switch at capture time).
       */
      if (capturedRef.current && prog < SCATTER_END && shapePts.length > 0) {
        const scatterRange = SCATTER_END - SCATTER_DWELL
        const scatterT     = Math.max(0, (prog - SCATTER_DWELL) / scatterRange)

        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'

        for (const p of shapePts) {
          /* Logo-space to screen-space: use CSS rect size (not device pixels)  */
          const px0 = srcX + p.lxFrac * logR.width
          const py0 = srcY + p.lyFrac * logR.width   // width for both — logo is square

          let px: number, py: number, alpha: number, fsz: number
          let r: number, g: number, b: number

          if (scatterT <= 0) {
            /* Assembled — zero movement, exact logo pixel colours */
            px = px0; py = py0
            alpha = 0.92
            fsz   = p.size
            r = p.initR; g = p.initG; b = p.initB

          } else {
            /* ── Three-stage disintegration ─────────────────────────────────
             *
             * Per-particle effective progress: stagger shifts each particle's
             * start so low-delay particles fragment first, creating the visual
             * impression of cracks propagating through the logo body.
             *
             * Stage 1 (eff 0.00→0.35): micro-jitter only. Particles shift 2–7px
             *   in a random direction unrelated to scatter. Logo silhouette is
             *   fully readable — looks like the material is vibrating internally.
             *
             * Stage 2 (eff 0.35→0.60): structural loosening. Each particle drifts
             *   toward an intermediate point 18% along its scatter path. The logo
             *   shape blurs but is still identifiable as 30M.
             *
             * Stage 3 (eff 0.60→1.00): outward flight. Bezier arc from the
             *   intermediate point to the final scatter destination.             */

            const eff = Math.min(1, Math.max(0,
              (scatterT - p.delay * 0.45) / (1 - p.delay * 0.45)
            ))

            /* Intermediate point — clamped to logo CSS bounds (2px inset).
             *
             * Without clamping, 18% of a 330px scatter distance = 59px, which
             * places p1 far outside the logo for particles near any edge.
             * Stages 1–2 would then drift/launch from below the logo entirely.
             *
             * Clamping guarantees p1 stays inside the logo footprint, so:
             *   - stage-2 drift never leaves the logo silhouette
             *   - stage-3 bezier launches from inside the logo, not from
             *     an off-logo intermediate that creates a detached trail       */
            const hw    = logR.width  * 0.5 - 2   // half-width  inset 2px
            const hh    = logR.height * 0.5 - 2   // half-height inset 2px
            const rawP1x = px0 + Math.cos(p.scatterAngle) * p.scatterDist * 0.18
            const rawP1y = py0 + Math.sin(p.scatterAngle) * p.scatterDist * 0.18
            const p1x = Math.max(srcX - hw, Math.min(srcX + hw, rawP1x))
            const p1y = Math.max(srcY - hh, Math.min(srcY + hh, rawP1y))

            const S1 = 0.35, S2 = 0.60

            if (eff <= S1) {
              /* Stage 1 — micro-fragmentation: jitter within logo body */
              const t1    = eff / S1
              const ease1 = t1 * t1 * (3 - 2 * t1)   // smoothstep — slow start + slow end
              px  = px0 + Math.cos(p.jitterAngle) * p.jitterDist * ease1
              py  = py0 + Math.sin(p.jitterAngle) * p.jitterDist * ease1
              fsz = p.size
              alpha = 0.92
              r = p.initR; g = p.initG; b = p.initB

            } else if (eff <= S2) {
              /* Stage 2 — structural loosening: drift toward clamped p1
               * (which is guaranteed to be within the logo bounds).
               * easeInCubic holds the shape together before releasing it.     */
              const t2    = (eff - S1) / (S2 - S1)
              const ease2 = t2 * t2 * t2
              const jx    = Math.cos(p.jitterAngle) * p.jitterDist
              const jy    = Math.sin(p.jitterAngle) * p.jitterDist
              px  = lp(px0 + jx, p1x, ease2)
              py  = lp(py0 + jy, p1y, ease2)
              fsz = p.size * (1 - ease2 * 0.14)
              alpha = 0.92
              const tint  = ease2 * 0.14
              r = Math.round(lp(p.initR, p.gold ? 212 : 237, tint))
              g = Math.round(lp(p.initG, p.gold ? 175 : 233, tint * 0.8))
              b = Math.round(lp(p.initB, p.gold ?  55 : 224, tint * 0.5))

            } else {
              /* Stage 3 — outward flight: bezier from clamped p1 to final dest.
               * Because p1 is inside the logo, the arc begins from within the
               * logo body — the breakup visibly originates from the logo itself. */
              const t3     = (eff - S2) / (1 - S2)
              const easedT = 1 - Math.pow(1 - t3, 3)   // easeOutCubic

              const p2x   = px0 + Math.cos(p.scatterAngle) * p.scatterDist
              const p2y   = py0 + Math.sin(p.scatterAngle) * p.scatterDist
              const perpA = p.scatterAngle + Math.PI * 0.5
              const cpX   = p1x + Math.cos(perpA) * p.cpOffset * 0.7
              const cpY   = p1y + Math.sin(perpA) * p.cpOffset * 0.7

              px    = bz(easedT, p1x, cpX, p2x)
              py    = bz(easedT, p1y, cpY, p2y)
              fsz   = p.size * (1 - 0.14 - easedT * 0.44)
              alpha = easedT < 0.35 ? 0.92 : 0.92 * (1 - (easedT - 0.35) / 0.65)

              const goldT = Math.min(1, 0.14 + easedT * 1.4)
              r = Math.round(lp(p.initR, p.gold ? 212 : 237, p.gold ? goldT : goldT * 0.4))
              g = Math.round(lp(p.initG, p.gold ? 175 : 233, p.gold ? goldT : goldT * 0.3))
              b = Math.round(lp(p.initB, p.gold ?  55 : 224, p.gold ? goldT : goldT * 0.2))
            }
          }

          if (alpha < 0.012) continue

          ctx.font        = FONT_CACHE[fontIdx(Math.max(0.5, fsz))]
          ctx.fillStyle   = `rgb(${r},${g},${b})`
          ctx.shadowColor = p.gold ? 'rgba(212,168,42,0.42)' : 'rgba(242,236,222,0.30)'
          ctx.shadowBlur  = 2
          ctx.globalAlpha = alpha
          ctx.fillText(p.ch, px, py)
        }

        ctx.globalAlpha = 1
        ctx.shadowBlur  = 0
      }

      /* ── Orb glow ─────────────────────────────────────────────────────────── */
      /* Orb glow begins only once the first migration char actually arrives */
      const orbVis = ss(_migFirstArrive - 0.02, _migFirstArrive + 0.14, prog)
      if (orbVis > 0.01) {
        const pulse = 0.82 + 0.18 * Math.sin(tSec * 0.38)

        /* Hot core — uses innerBoost so it brightens more than the outer layers */
        const hotR = RADIUS * 0.30
        const hot  = ctx.createRadialGradient(orbCx, orbCy, 0, orbCx, orbCy, hotR)
        hot.addColorStop(0,    `rgba(255,218,75,${(0.18 * pulse * orbVis * innerBoost).toFixed(3)})`)
        hot.addColorStop(0.38, `rgba(222,178,52,${(0.09 * pulse * orbVis * innerBoost).toFixed(3)})`)
        hot.addColorStop(1,    'rgba(0,0,0,0)')
        ctx.globalAlpha = 1
        ctx.fillStyle   = hot
        ctx.fillRect(orbCx - hotR, orbCy - hotR, hotR * 2, hotR * 2)

        /* Mid volumetric glow — tracks glowBoost (same as before) */
        const gR2  = RADIUS * 0.90
        const glow = ctx.createRadialGradient(orbCx, orbCy, 0, orbCx, orbCy, gR2)
        glow.addColorStop(0,    `rgba(220,182,60,${(0.11 * pulse * orbVis * glowBoost).toFixed(3)})`)
        glow.addColorStop(0.22, `rgba(212,175,55,${(0.084 * pulse * orbVis * glowBoost).toFixed(3)})`)
        glow.addColorStop(0.48, `rgba(238,232,215,${(0.044 * pulse * orbVis * glowBoost).toFixed(3)})`)
        glow.addColorStop(0.76, `rgba(225,220,208,${(0.013 * orbVis * glowBoost).toFixed(3)})`)
        glow.addColorStop(1,    'rgba(0,0,0,0)')
        ctx.fillStyle = glow
        ctx.fillRect(orbCx - gR2, orbCy - gR2, gR2 * 2, gR2 * 2)

        /* Outer halo — uses outerTaper so it recedes slightly as inner brightens */
        const haloR = RADIUS * 1.18
        const halo  = ctx.createRadialGradient(orbCx, orbCy, RADIUS * 0.58, orbCx, orbCy, haloR)
        halo.addColorStop(0,    `rgba(212,175,55,${(0.024 * pulse * orbVis * glowBoost * outerTaper).toFixed(3)})`)
        halo.addColorStop(0.52, `rgba(238,230,212,${(0.009 * orbVis * glowBoost * outerTaper).toFixed(3)})`)
        halo.addColorStop(1,    'rgba(0,0,0,0)')
        ctx.fillStyle = halo
        ctx.fillRect(orbCx - haloR, orbCy - haloR, haloR * 2, haloR * 2)
      }

      /* ── Orb particles ────────────────────────────────────────────────────── */
      let vLen = 0

      for (let i = 0; i < N_TOTAL; i++) {
        const p = PARTICLES[i]
        if (prog < p.migStart - 0.001) continue

        if (p.isMig) {
          const dur    = Math.max(0.001, p.migEnd - p.migStart)
          const migT   = Math.min(1, (prog - p.migStart) / dur)
          const BLEND  = 0.20
          const blendT = ss(1 - BLEND, 1, migT)

          const bs = 1 + p.ba * Math.sin(tSec + p.bp)
          let ox = p.ox * bs, oy = p.oy * bs, oz = p.oz * bs
          const m = mats[p.layer]
          _rt1 = ox*m.cY + oz*m.sY; oz = -ox*m.sY + oz*m.cY; ox = _rt1
          _rt1 = oy*m.cX - oz*m.sX; oz =  oy*m.sX + oz*m.cX; oy = _rt1
          _rt1 = ox*m.cZ - oy*m.sZ; _rt2 = ox*m.sZ + oy*m.cZ; ox = _rt1; oy = _rt2
          const sc    = FOV / (FOV + oz * RADIUS)
          const orbPx = orbCx + ox * RADIUS * sc
          const orbPy = orbCy + oy * RADIUS * sc
          const depth = (1 - oz) * 0.5

          let px: number, py: number, fsz: number, op: number

          if (migT < 1) {
            /* Cubic bezier flight — easeOutQuad: snappy departure, graceful float
             *
             * P0: launch from logo character position
             * P1: lift control — pulls path upward in a character-specific
             *     direction ('3' upper-left, '0' up, 'M' upper-right)
             * P2: approach control — pulls path above the orb so characters
             *     descend into it from above rather than arriving laterally
             * P3: exact orb landing position                                  */
            const e   = 1 - (1 - migT) * (1 - migT)   // easeOutQuad
            const P0x = srcX + p.srcDx,   P0y = srcY + p.srcDy
            const P1x = P0x  + p.cp1Dx,   P1y = P0y  + p.cp1Dy
            const P2x = orbCx + p.cp2Dx,  P2y = orbCy + p.cp2Dy
            const flyX = bz3(e, P0x, P1x, P2x, orbCx)
            const flyY = bz3(e, P0y, P1y, P2y, orbCy)

            px  = lp(flyX, orbPx, blendT)
            py  = lp(flyY, orbPy, blendT)

            /* Depth swell: character briefly grows larger at arc peak,
             * simulating forward movement through 3-D space.                */
            const swell = 1 + p.depthAmp * Math.sin(Math.PI * migT)
            fsz = lp(p.fszFly * swell, p.fszOrb * sc * (0.88 + depth * 0.12), blendT)

            /* Opacity: quick fade-in (0–6 %), full through arc,
             * then gentle fade-out in the final 15 % before orb arrival.    */
            const flightOp = ss(0, 0.06, migT) * (1 - ss(0.85, 1.0, migT))
            const orbOp    = (0.44 + (1 - p.orbR) * 0.56) * (0.04 + depth * 0.82) * p.boost
            op = lp(flightOp, orbOp, blendT)
          } else {
            px  = orbPx; py = orbPy
            fsz = p.fszOrb * sc * (0.88 + depth * 0.12)
            op  = (0.44 + (1 - p.orbR) * 0.56) * (0.04 + depth * 0.82) * p.boost
          }

          if (op < 0.006) continue
          vSx[vLen]=px; vSy[vLen]=py; vDepth[vLen]=depth
          vOp[vLen]=op; vFsz[vLen]=Math.max(0.5, fsz); vPidx[vLen]=i
          vLen++

        } else {
          const spawnT = ss(p.migStart, p.migStart + 0.055, prog)
          if (spawnT <= 0) continue

          const bs = 1 + p.ba * Math.sin(tSec + p.bp)
          let ox = p.ox * bs, oy = p.oy * bs, oz = p.oz * bs
          const m = mats[p.layer]
          _rt1 = ox*m.cY + oz*m.sY; oz = -ox*m.sY + oz*m.cY; ox = _rt1
          _rt1 = oy*m.cX - oz*m.sX; oz =  oy*m.sX + oz*m.cX; oy = _rt1
          _rt1 = ox*m.cZ - oy*m.sZ; _rt2 = ox*m.sZ + oy*m.cZ; ox = _rt1; oy = _rt2
          const sc    = FOV / (FOV + oz * RADIUS)
          const depth = (1 - oz) * 0.5

          const pulseWave = 0.04 * Math.max(0, Math.sin(p.orbR * 6.0 - tSec * 1.2 + p.bp * 0.30))
          const radGlow   = 0.44 + (1 - p.orbR) * 0.56 + pulseWave
          const op        = radGlow * (0.04 + depth * 0.82) * p.boost * spawnT
          if (op < 0.006) continue

          vSx[vLen] = orbCx + ox * RADIUS * sc
          vSy[vLen] = orbCy + oy * RADIUS * sc
          vDepth[vLen] = depth; vOp[vLen] = op
          vFsz[vLen]   = Math.max(0.5, p.fszOrb * sc * (0.88 + depth * 0.12))
          vPidx[vLen]  = i
          vLen++
        }
      }

      for (let i = 0; i < vLen; i++) sortBuf[i] = i
      sortBuf.subarray(0, vLen).sort((a, b) => vDepth[a] - vDepth[b])

      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'

      let lastFI   = -1
      let lastGold = -1

      for (let j = 0; j < vLen; j++) {
        const k = sortBuf[j]
        const p = PARTICLES[vPidx[k]]

        const fi = fontIdx(vFsz[k])
        if (fi !== lastFI) { ctx.font = FONT_CACHE[fi]; lastFI = fi }

        const isGold = p.gold ? 1 : 0
        if (isGold !== lastGold) {
          if (p.gold) {
            ctx.fillStyle   = `rgb(${goldR},${goldG},${goldB})`
            ctx.shadowColor = `rgba(${goldR},${goldG - 7},42,0.52)`
            ctx.shadowBlur  = 3
          } else {
            ctx.fillStyle   = `rgb(${ivyR},${ivyG},${ivyB})`
            ctx.shadowColor = 'rgba(242,236,222,0.38)'
            ctx.shadowBlur  = 2
          }
          lastGold = isGold
        }

        ctx.globalAlpha = Math.min(1, (p.gold ? vOp[k] * 0.84 : vOp[k]) * charBoost)
        ctx.fillText(p.ch, vSx[k], vSy[k])
      }

      ctx.globalAlpha = 1
      ctx.shadowBlur  = 0

      if (!stopped) raf = requestAnimationFrame(render)
    }

    document.fonts.ready.then(() => { if (!stopped) render() })

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: 'fixed', inset: 0, zIndex: 9000, pointerEvents: 'none' }}
    />
  )
}
