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
function s5(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * t * (t * (t * 6 - 15) + 10)
}
function eio(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
function eoc(t: number): number {
  return 1 - Math.pow(1 - t, 3)
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
      delay:        sr(s++) * 0.24,
      size:         1.8 + sr(s++) * 2.8,
      jitterAngle:  sr(s++) * Math.PI * 2,
      jitterDist:   3 + sr(s++) * 8,
      scatterAngle: baseAng + (sr(s++) - 0.5) * Math.PI * 0.85,
      scatterDist:  130 + sr(s++) * 330,
      cpOffset:     (sr(s++) - 0.5) * 190,
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
      delay:        sr(s++) * 0.24,
      size:         2.6 + sr(s++) * 3.4,
      jitterAngle:  sr(s++) * Math.PI * 2,
      jitterDist:   3 + sr(s++) * 8,
      scatterAngle: baseAng + (sr(s++) - 0.5) * Math.PI * 0.85,
      scatterDist:  130 + sr(s++) * 330,
      cpOffset:     (sr(s++) - 0.5) * 190,
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
  tone:     number
  alpha:    number
  glint:    number
  kind:      'text' | 'halo'
  textRole?: TextTargetRole
}

const LAYER_SPEED: [number, number, number] = [1.14, 1.00, 0.88]

const N_MIG     = 54
const N_CORE    = 160
const N_VOLUME  = 1370
const N_STRANDS = 8
const N_SPR     = 70
const N_ACCUM   = N_CORE + N_VOLUME + N_STRANDS * N_SPR
const N_TOTAL   = N_MIG + N_ACCUM
const N_HALO    = 204
const N_TEXT    = N_TOTAL - N_HALO

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

type TextTargetRole = 'core' | 'scatter'

interface TextTarget {
  x: number
  y: number
  z: number
  ch: string
  gold: boolean
  role: TextTargetRole
}

function addStroke(
  out: TextTarget[],
  ch: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  count: number,
  width: number,
  seedBase: number,
  role: TextTargetRole = 'core',
  goldProb = 0.30,
) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.max(0.001, Math.sqrt(dx * dx + dy * dy))
  const nx = -dy / len
  const ny = dx / len

  for (let i = 0; i < count; i++) {
    const t = (i + 0.5 + (sr(seedBase + i * 7) - 0.5) * 0.30) / count
    const spread = (sr(seedBase + i * 11 + 3) - 0.5) * width
    out.push({
      x: x1 + dx * t + nx * spread,
      y: y1 + dy * t + ny * spread,
      z: (sr(seedBase + i * 13 + 5) - 0.5) * 0.045,
      ch,
      gold: sr(seedBase + i * 17 + 9) < goldProb,
      role,
    })
  }
}

function addArc(
  out: TextTarget[],
  ch: string,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  a0: number,
  a1: number,
  count: number,
  width: number,
  seedBase: number,
  role: TextTargetRole = 'core',
  goldProb = 0.28,
) {
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5 + (sr(seedBase + i * 7) - 0.5) * 0.28) / count
    const a = lp(a0, a1, t)
    const spread = (sr(seedBase + i * 11 + 2) - 0.5) * width
    const x = cx + Math.cos(a) * (rx + spread)
    const y = cy + Math.sin(a) * (ry + spread)
    out.push({
      x,
      y,
      z: (sr(seedBase + i * 13 + 4) - 0.5) * 0.045,
      ch,
      gold: sr(seedBase + i * 17 + 8) < goldProb,
      role,
    })
  }
}

function addStrokeScatter(
  out: TextTarget[],
  ch: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  count: number,
  width: number,
  seedBase: number,
) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.max(0.001, Math.sqrt(dx * dx + dy * dy))
  const nx = -dy / len
  const ny = dx / len

  for (let i = 0; i < count; i++) {
    const t = (i + 0.5 + (sr(seedBase + i * 5) - 0.5) * 0.62) / count
    const side = sr(seedBase + i * 7 + 2) < 0.5 ? -1 : 1
    const normal = side * (width * (0.50 + sr(seedBase + i * 11 + 4) * 1.35))
    const along = (sr(seedBase + i * 13 + 6) - 0.5) * 0.070
    out.push({
      x: x1 + dx * t + nx * normal + (dx / len) * along,
      y: y1 + dy * t + ny * normal + (dy / len) * along,
      z: (sr(seedBase + i * 17 + 8) - 0.5) * 0.16,
      ch,
      gold: sr(seedBase + i * 19 + 10) < 0.36,
      role: 'scatter',
    })
  }
}

function addArcScatter(
  out: TextTarget[],
  ch: string,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  a0: number,
  a1: number,
  count: number,
  spread: number,
  seedBase: number,
) {
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5 + (sr(seedBase + i * 5) - 0.5) * 0.60) / count
    const a = lp(a0, a1, t)
    const outward = spread * (0.30 + Math.pow(sr(seedBase + i * 7 + 2), 0.62) * 1.28)
    const tangent = (sr(seedBase + i * 11 + 4) - 0.5) * spread * 0.42
    const ca = Math.cos(a)
    const sa = Math.sin(a)
    out.push({
      x: cx + ca * (rx + outward) - sa * tangent,
      y: cy + sa * (ry + outward * 0.74) + ca * tangent * 0.55,
      z: (sr(seedBase + i * 13 + 6) - 0.5) * 0.17,
      ch,
      gold: sr(seedBase + i * 17 + 8) < 0.34,
      role: 'scatter',
    })
  }
}

function shuffleTargets(out: TextTarget[], seedBase: number) {
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(sr(i * 23 + seedBase) * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
}

function build30MTargets(count: number): TextTarget[] {
  const core: TextTarget[] = []
  const scatter: TextTarget[] = []
  const coreCount = Math.round(count * 0.68)
  const scatterCount = count - coreCount
  const coreScale = coreCount / (N_TEXT * 0.68)
  const scatterScale = scatterCount / (N_TEXT * 0.32)

  const nCore = (v: number) => Math.max(1, Math.round(v * coreScale))
  const nScatter = (v: number) => Math.max(1, Math.round(v * scatterScale))
  const stroke = 0.070

  addStroke(core, '3', -0.88, -0.50, -0.50, -0.50, nCore(135), stroke, 1000, 'core', 0.26)
  addStroke(core, '3', -0.82,  0.00, -0.50,  0.00, nCore(120), stroke, 1200, 'core', 0.24)
  addStroke(core, '3', -0.88,  0.50, -0.50,  0.50, nCore(135), stroke, 1400, 'core', 0.28)
  addArc(core, '3', -0.57, -0.25, 0.18, 0.25, -Math.PI * 0.52, Math.PI * 0.50, nCore(170), stroke, 1600, 'core', 0.26)
  addArc(core, '3', -0.57,  0.25, 0.18, 0.25, -Math.PI * 0.50, Math.PI * 0.52, nCore(170), stroke, 1800, 'core', 0.28)

  addArc(core, '0', -0.06, 0.00, 0.25, 0.53, 0, Math.PI * 2, nCore(560), stroke * 1.03, 2200, 'core', 0.29)

  addStroke(core, 'M', 0.36,  0.52, 0.36, -0.52, nCore(190), stroke, 3000, 'core', 0.30)
  addStroke(core, 'M', 0.36, -0.52, 0.61,  0.10, nCore(170), stroke, 3200, 'core', 0.32)
  addStroke(core, 'M', 0.61,  0.10, 0.86, -0.52, nCore(170), stroke, 3400, 'core', 0.32)
  addStroke(core, 'M', 0.86, -0.52, 0.86,  0.52, nCore(190), stroke, 3600, 'core', 0.30)

  addArcScatter(scatter, '3', -0.58, -0.25, 0.20, 0.27, -Math.PI * 0.68, Math.PI * 0.60, nScatter(165), 0.105, 4300)
  addArcScatter(scatter, '3', -0.58,  0.25, 0.20, 0.27, -Math.PI * 0.60, Math.PI * 0.68, nScatter(165), 0.105, 4500)
  addStrokeScatter(scatter, '3', -0.91, -0.52, -0.50, -0.52, nScatter(46), 0.085, 4700)
  addStrokeScatter(scatter, '3', -0.85,  0.00, -0.49,  0.00, nScatter(40), 0.070, 4900)
  addStrokeScatter(scatter, '3', -0.91,  0.52, -0.50,  0.52, nScatter(46), 0.085, 5100)

  addArcScatter(scatter, '0', -0.06, 0.00, 0.29, 0.58, 0, Math.PI * 2, nScatter(300), 0.112, 5500)
  addArcScatter(scatter, '0', -0.06, 0.00, 0.21, 0.47, 0, Math.PI * 2, nScatter(96), 0.075, 5700)

  addStrokeScatter(scatter, 'M', 0.34,  0.55, 0.34, -0.55, nScatter(104), 0.100, 6200)
  addStrokeScatter(scatter, 'M', 0.34, -0.55, 0.61,  0.12, nScatter(92), 0.092, 6400)
  addStrokeScatter(scatter, 'M', 0.61,  0.12, 0.88, -0.55, nScatter(92), 0.092, 6600)
  addStrokeScatter(scatter, 'M', 0.88, -0.55, 0.88,  0.55, nScatter(104), 0.100, 6800)

  shuffleTargets(core, 4040)
  shuffleTargets(scatter, 7040)

  return [...core.slice(0, coreCount), ...scatter.slice(0, scatterCount)]
}

function applyFinalTargets(pts: Pt[]) {
  const textTargets = build30MTargets(N_TEXT)

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]
    if (i < N_TEXT) {
      const t = textTargets[i]
      const depth = Math.abs(t.z)
      const isScatter = t.role === 'scatter'
      p.kind = 'text'
      p.textRole = t.role
      p.ch = t.ch
      p.gold = t.gold
      p.ox = t.x
      p.oy = t.y
      p.oz = t.z
      p.orbR = Math.min(1, Math.sqrt(t.x * t.x + t.y * t.y))
      p.layer = depth < 0.015 ? 1 : depth < 0.032 ? 0 : 2
      p.ba *= isScatter ? 0.72 : 0.24
      p.boost *= isScatter ? (t.gold ? 0.66 : 0.74) : (t.gold ? 1.08 : 1.18)
      p.alpha = Math.min(1, p.alpha * (isScatter ? 0.78 : 1.18))
      p.fszOrb = Math.max(isScatter ? 2.0 : 3.0, p.fszOrb * (isScatter ? 0.70 : 1.08))
    } else {
      const h = i - N_TEXT
      const a = h * 2.399963229728653 + sr(h * 31 + 5000) * 0.36
      const r = 0.62 + sr(h * 37 + 5010) * 0.44
      const flatten = 0.58 + sr(h * 41 + 5020) * 0.18
      p.kind = 'halo'
      p.textRole = undefined
      p.ch = CHARS[h % 3]
      p.gold = sr(h * 43 + 5030) < 0.22
      p.ox = Math.cos(a) * r
      p.oy = Math.sin(a) * r * flatten
      p.oz = (sr(h * 47 + 5040) - 0.5) * 0.18
      p.orbR = r
      p.layer = 2
      p.ba *= 0.42
      p.boost *= 0.18
      p.alpha *= 0.32
      p.fszOrb = Math.max(1.4, p.fszOrb * 0.56)
    }
  }
}

/* ─── Explicit migration phases ───────────────────────────────────────────── */
const LOGO_HIDE_AT      = 0.060
const LOGO_SHOW_AT      = 0.010
const CAPTURE_THRESHOLD = LOGO_HIDE_AT
const CAPTURE_END       = 0.14
const SCATTER_START     = 0.14
const SCATTER_END       = 0.38
const MIGRATE_START     = 0.38
const MIGRATE_END       = 0.86
const ORB_FORM_START    = 0.62
const ORB_FORM_END      = 0.995

function arrivalWave(t: number): number {
  if (t < 0.15) return lp(ORB_FORM_START, 0.76, eio(t / 0.15))
  if (t < 0.60) return lp(0.76, 0.91, eio((t - 0.15) / 0.45))
  return lp(0.91, ORB_FORM_END, eio((t - 0.60) / 0.40))
}

const PARTICLES: Pt[] = (() => {
  const pts: Pt[] = []
  let seed = 1

  for (let i = 0; i < N_MIG; i++) {
    const ci   = Math.floor(i / (N_MIG / 3))
    const ch   = CHARS[ci]
    const waveRank = i / Math.max(1, N_MIG - 1)
    const waveJitter = (sr(i * 19 + 901) - 0.5) * 0.008
    const arriveAt = Math.max(ORB_FORM_START, Math.min(ORB_FORM_END, arrivalWave(waveRank) + waveJitter))
    const nr   = 0.06 + sr(seed++) * 0.80
    const cosθ = 2 * sr(seed++) - 1
    const sinθ = Math.sqrt(Math.max(0, 1 - cosθ * cosθ))
    const φ    = 2 * Math.PI * sr(seed++)
    const layer: 0|1|2 = nr < 0.34 ? 0 : nr < 0.67 ? 1 : 2
    /* Wider per-character stagger so each glyph lifts at a noticeably
     * different moment — '3' first, then '0', then 'M'.                  */
    const migStart = Math.min(
      arriveAt - 0.24,
      MIGRATE_START + (ci / 3) * 0.045 + sr(seed++) * 0.09,
      MIGRATE_END - 0.08,
    )

    /* Lift direction — character-specific base angle in CSS canvas coords
     * (y-axis points down, so negative sin = upward screen motion).
     * '3' rises upper-left, '0' straight up, 'M' upper-right.           */
    const liftBase  = ch === '3' ? -0.72 * Math.PI   // ~upper-left
                    : ch === 'M' ? -0.28 * Math.PI   // ~upper-right
                    :              -0.50 * Math.PI   // straight up
    const liftAngle = liftBase + (sr(seed++) - 0.5) * 0.44
    const liftDist  = 170 + sr(seed++) * 210           // 170–380 px
    const driftSide = ch === '3' ? -1 : ch === 'M' ? 1 : (sr(seed++) < 0.5 ? -1 : 1)

    pts.push({
      ch, gold: sr(seed++) < 0.45,
      srcDx: CHAR_DX[ch] + (sr(seed++) - 0.5) * 6,
      srcDy: (sr(seed++) - 0.5) * 5,
      /* P1 — lift: offset from launch point in the lift direction        */
      cp1Dx: Math.cos(liftAngle) * liftDist + driftSide * (36 + sr(seed++) * 70),
      cp1Dy: Math.sin(liftAngle) * liftDist + (sr(seed++) - 0.5) * 24,
      /* P2 — approach: below the orb so the final arc visibly travels
       * downward into the next section before settling into the sphere. */
      cp2Dx: (sr(seed++) - 0.5) * 190,
      cp2Dy: 220 + sr(seed++) * 300,
      ox: sinθ * Math.cos(φ) * nr, oy: cosθ * nr, oz: sinθ * Math.sin(φ) * nr,
      orbR: nr, layer,
      migStart,
      migEnd:  arriveAt,
      isMig:   true,
      bp: sr(seed++) * Math.PI * 2, ba: 0.006 + sr(seed++) * 0.010,
      fszFly:  6.6 + sr(seed++) * 7.8,
      fszOrb:  Math.max(3.0, 3.8 + (1 - nr) * 3.1 + sr(seed++) * 0.45),
      depthAmp: 0.10 + sr(seed++) * 0.22,
      boost: 1.40,
      tone: sr(seed++),
      alpha: 0.82 + sr(seed++) * 0.30,
      glint: sr(seed++) * Math.PI * 2,
      kind: 'text',
    })
  }

  const core: Pt[] = []
  for (let i = 0; i < N_CORE; i++) {
    const rank = (i + 0.5) / N_CORE
    const nr   = Math.pow(rank, 0.72) * 0.22
    const cosθ = 1 - 2 * ((i + sr(seed++) * 0.42) / N_CORE)
    const sinθ = Math.sqrt(Math.max(0, 1 - cosθ * cosθ))
    const φ    = i * 2.399963229728653 + sr(seed++) * 0.22
    core.push({
      ch: CHARS[i % 3], gold: sr(seed++) < 0.72,
      srcDx: 0, srcDy: 0, cp1Dx: 0, cp1Dy: 0, cp2Dx: 0, cp2Dy: 0, depthAmp: 0,
      ox: sinθ * Math.cos(φ) * nr, oy: cosθ * nr, oz: sinθ * Math.sin(φ) * nr,
      orbR: nr, layer: 0,
      migStart: 0, migEnd: 0, isMig: false,
      bp: sr(seed++) * Math.PI * 2, ba: 0.010 + sr(seed++) * 0.014,
      fszFly: 0, fszOrb: Math.max(3.2, 4.3 + (1 - nr) * 3.35 + sr(seed++) * 0.35), boost: 1.56,
      tone: sr(seed++),
      alpha: 0.78 + sr(seed++) * 0.26,
      glint: sr(seed++) * Math.PI * 2,
      kind: 'text',
    })
  }
  /* Core is held back so the shell reads first; the hot center resolves late. */
  core.sort((a, b) => b.orbR - a.orbR)
  core.forEach((p, i) => {
    const rank = i / Math.max(1, N_CORE - 1)
    p.migStart = Math.min(ORB_FORM_END, lp(0.86, ORB_FORM_END, s5(0, 1, rank)) + sr(i * 11 + 2001) * 0.014)
  })
  pts.push(...core)

  const vol: Pt[] = []
  for (let i = 0; i < N_VOLUME; i++) {
    const shellRank = (i + sr(seed++) * 0.55) / N_VOLUME
    const nr    = Math.pow(shellRank, 0.42)
    const cosθ  = 1 - 2 * ((i + sr(seed++) * 0.45) / N_VOLUME)
    const sinθ  = Math.sqrt(Math.max(0, 1 - cosθ * cosθ))
    const φ     = i * 2.399963229728653 + sr(seed++) * 0.30
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
      fszFly: 0, fszOrb: Math.max(2.5, 3.5 + (1 - nr) * 2.65 + sr(seed++) * 0.32), boost,
      tone: sr(seed++),
      alpha: 0.74 + sr(seed++) * 0.32,
      glint: sr(seed++) * Math.PI * 2,
      kind: 'text',
    })
  }
  /* Volume resolves shell-first, then tightens inward for a cleaner sphere. */
  vol.sort((a, b) => b.orbR - a.orbR)
  vol.forEach((p, i) => {
    const rank = i / Math.max(1, N_VOLUME - 1)
    p.migStart = Math.min(ORB_FORM_END, arrivalWave(rank) + sr(i * 13 + 3001) * 0.016 + (1 - p.orbR) * 0.038)
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
      const strandRank = (stIdx % stTotal) / Math.max(1, stTotal - 1)
      const spawnAt = Math.min(ORB_FORM_END, arrivalWave(strandRank) + sr(k * 31 + st * 113 + 700) * 0.018)

      pts.push({
        ch: CHARS[(st * N_SPR + k) % 3],
        gold: sr(k * 19 + st * 103 + 400) < 0.38,
        srcDx: 0, srcDy: 0, cp1Dx: 0, cp1Dy: 0, cp2Dx: 0, cp2Dy: 0, depthAmp: 0,
        ox: ux * nr, oy: uy * nr, oz: uz * nr,
        orbR: nr, layer,
        migStart: spawnAt, migEnd: spawnAt, isMig: false,
        bp:    sr(k * 23 + st * 107 + 500) * Math.PI * 2,
        ba:    0.008 + sr(k * 29 + st * 109 + 600) * 0.012,
        fszFly: 0, fszOrb: Math.max(2.6, 3.5 + (1 - nr) * 2.55 + sr(k * 37 + st * 127 + 701) * 0.28), boost: 1.30,
        tone: sr(k * 41 + st * 131 + 702),
        alpha: 0.76 + sr(k * 43 + st * 137 + 703) * 0.28,
        glint: sr(k * 47 + st * 139 + 704) * Math.PI * 2,
        kind: 'text',
      })
      stIdx++
    }
  }

  applyFinalTargets(pts)
  return pts
})()

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function LogoParticles() {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const markerRef   = useRef<HTMLSpanElement>(null)
  const progRef     = useRef(0)
  const mouseRef    = useRef({ x: 0, y: 0, tx: 0, ty: 0, has: false, strength: 0 })
  const capturedRef = useRef(false)   // true once we've hidden the logo and replaced it
  const progress    = useMigrationProgress()
  progRef.current   = progress

  /* Keep the real navbar logo visible until canvas particles take over.
   * Hysteresis prevents flicker near the top of the migration range. */
  useEffect(() => {
    const el = document.getElementById('logo-anchor')
    if (!el) return
    if (progress <= LOGO_SHOW_AT) {
      capturedRef.current = false
      el.style.transition = 'none'
      el.style.opacity = '1'
    } else if (capturedRef.current) {
      el.style.transition = 'opacity 180ms ease-out'
      el.style.opacity = '0'
    }
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

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    const onMouseMove = (e: MouseEvent) => {
      if (!canHover) return
      const ms = mouseRef.current
      ms.tx = e.clientX
      ms.ty = e.clientY
      if (!ms.has) {
        ms.x = ms.tx
        ms.y = ms.ty
        ms.has = true
      }
    }
    const onMouseLeave = () => {
      mouseRef.current.has = false
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

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
    let lastScrollY = window.scrollY
    let scrollVelocity = 0
    let scrollActivity = 0

    const render = () => {
      frame++
      const prog = progRef.current

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      const logoEl = document.getElementById('logo-anchor')

      if (prog <= LOGO_SHOW_AT) {
        capturedRef.current = false
        shapePts = []
        if (logoEl) {
          logoEl.style.transition = 'none'
          logoEl.style.opacity = '1'
        }
      }

      if (prog <= 0) {
        if (!stopped) raf = requestAnimationFrame(render)
        return
      }

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
        logoEl.style.transition = 'opacity 90ms ease-out'
        logoEl.style.opacity = '0'
      }

      const logR  = logoEl.getBoundingClientRect()
      const oR    = orbEl.getBoundingClientRect()
      const srcX  = logR.left + logR.width  / 2
      const srcY  = logR.top  + logR.height / 2
      const orbCx = oR.left   + oR.width    / 2
      const orbCy = oR.top    + oR.height   / 2

      const markerEl = markerRef.current
      if (markerEl) {
        markerEl.style.left = `${orbCx}px`
        markerEl.style.top = `${orbCy + Math.min(oR.height * 0.32, 82)}px`
        markerEl.style.opacity = '0.78'
      }

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
      const scrollY = window.scrollY
      const scrollDelta = scrollY - lastScrollY
      lastScrollY = scrollY
      const scrollTarget = Math.max(-1, Math.min(1, scrollDelta / 80))
      const activityTarget = Math.min(1, Math.abs(scrollDelta) / 46)
      scrollVelocity += (scrollTarget - scrollVelocity) * 0.16
      scrollActivity += (activityTarget - scrollActivity) * (activityTarget > scrollActivity ? 0.22 : 0.052)

      const ms = mouseRef.current
      if (canHover && ms.has) {
        ms.x += (ms.tx - ms.x) * 0.085
        ms.y += (ms.ty - ms.y) * 0.085
      }

      const pDx = ms.x - orbCx
      const pDy = ms.y - orbCy
      const pointerDist = Math.sqrt(pDx * pDx + pDy * pDy)
      const pointerTarget = canHover && ms.has ? 1 - ss(RADIUS * 0.62, RADIUS * 2.08, pointerDist) : 0
      ms.strength += (pointerTarget - ms.strength) * (pointerTarget > ms.strength ? 0.12 : 0.055)

      const pointerX = Math.max(-1, Math.min(1, pDx / Math.max(1, RADIUS * 1.45))) * ms.strength
      const pointerY = Math.max(-1, Math.min(1, pDy / Math.max(1, RADIUS * 1.45))) * ms.strength
      const formedT = ss(ORB_FORM_START, ORB_FORM_END, prog)
      const scrollEnergy = scrollActivity * formedT
      const scrollDrift = scrollVelocity * formedT
      const interactionScale = 1 + scrollEnergy * 0.016 + ms.strength * formedT * 0.006
      const interactionGlow = 1 + scrollEnergy * 0.15 + ms.strength * formedT * 0.10
      const pointerActive = ms.strength * formedT
      const pointerRadius = RADIUS * 1.15
      const pointerRadius2 = pointerRadius * pointerRadius
      const pointerPush = RADIUS * 0.052

      const angleY = frame * (0.0010 + scrollEnergy * 0.00025) + scrollDrift * 0.018
      const angleX = Math.sin(tSec * 0.40) * 0.018 + pointerY * 0.036 + scrollDrift * 0.010
      const angleZ = Math.sin(tSec * 0.27) * 0.009 + pointerX * 0.020 - scrollDrift * 0.007

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
       *   < SCATTER_START  : assembled — particles sit exactly on logo pixels,
       *                       full opacity. First frame looks identical to logo.
       *   SCATTER_START → SCATTER_END: easeOutCubic bezier explosion,
       *                       per-particle stagger, initColor → gold drift.
       *   > SCATTER_END    : skip drawing.
       *
       * Logo opacity is 0 for this entire window (hard switch at capture time).
       */
      if (capturedRef.current && prog < SCATTER_END && shapePts.length > 0) {
        const scatterRange = SCATTER_END - SCATTER_START
        const scatterT     = Math.max(0, (prog - SCATTER_START) / scatterRange)
        const flashT       = Math.max(0, 1 - Math.abs((prog - CAPTURE_THRESHOLD) / 0.055))

        if (flashT > 0.01) {
          const flash = eoc(flashT)
          const g = ctx.createRadialGradient(srcX, srcY, 0, srcX, srcY, logR.width * 1.9)
          g.addColorStop(0, `rgba(255,255,255,${(0.32 * flash).toFixed(3)})`)
          g.addColorStop(0.18, `rgba(248,226,154,${(0.22 * flash).toFixed(3)})`)
          g.addColorStop(0.48, `rgba(212,175,55,${(0.10 * flash).toFixed(3)})`)
          g.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.globalAlpha = 1
          ctx.fillStyle = g
          ctx.fillRect(srcX - logR.width * 2, srcY - logR.width * 2, logR.width * 4, logR.width * 4)
        }

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
              (scatterT - p.delay * 0.34) / (1 - p.delay * 0.34)
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
              const cpX   = p1x + Math.cos(perpA) * p.cpOffset
              const cpY   = p1y + Math.sin(perpA) * p.cpOffset

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
      const softGlowVis = Math.pow(ss(0.68, ORB_FORM_END, prog), 2.2)
      const coreGlowVis = Math.pow(ss(0.88, ORB_FORM_END, prog), 2.4)
      if (softGlowVis > 0.01 || coreGlowVis > 0.01) {
        const pulse = (0.86 + 0.14 * Math.sin(tSec * 0.34 + scrollDrift * 0.42)) * interactionGlow
        const haloBreath = 0.92 + 0.08 * Math.sin(tSec * 0.24 + 0.7) + scrollEnergy * 0.035
        const colorPhase = tSec * 0.055 + scrollDrift * 0.10 + pointerActive * 0.16
        const warmShift = 0.5 + 0.5 * Math.sin(colorPhase)
        const centerR = Math.round(lp(238, 247, warmShift))
        const centerG = Math.round(lp(222, 204, warmShift))
        const centerB = Math.round(lp(184, 123, warmShift))
        const accentVis = Math.min(1, 0.62 + scrollEnergy * 0.20 + pointerActive * 0.24)
        const reflectedR = Math.round(lp(230, centerR, 0.34))
        const reflectedG = Math.round(lp(214, centerG, 0.30))
        const reflectedB = Math.round(lp(188, centerB, 0.26))

        /* Hot core carries the restrained color shift; letters remain white/gold. */
        const hotR = RADIUS * 0.30 * interactionScale
        const hot  = ctx.createRadialGradient(orbCx, orbCy, 0, orbCx, orbCy, hotR)
        hot.addColorStop(0,    `rgba(${centerR},${centerG},${centerB},${(0.070 * pulse * coreGlowVis * innerBoost * accentVis).toFixed(3)})`)
        hot.addColorStop(0.34, `rgba(255,222,132,${(0.040 * pulse * coreGlowVis * innerBoost).toFixed(3)})`)
        hot.addColorStop(0.68, `rgba(${reflectedR},${reflectedG},${reflectedB},${(0.014 * pulse * coreGlowVis * accentVis).toFixed(3)})`)
        hot.addColorStop(1,    'rgba(0,0,0,0)')
        ctx.globalAlpha = 1
        ctx.fillStyle   = hot
        ctx.fillRect(orbCx - hotR, orbCy - hotR, hotR * 2, hotR * 2)

        /* Mid volumetric glow — tracks glowBoost (same as before) */
        const gR2  = RADIUS * 0.90 * interactionScale
        const glow = ctx.createRadialGradient(orbCx, orbCy, 0, orbCx, orbCy, gR2)
        glow.addColorStop(0,    `rgba(${reflectedR},${reflectedG},${reflectedB},${(0.030 * pulse * softGlowVis * glowBoost * accentVis).toFixed(3)})`)
        glow.addColorStop(0.22, `rgba(212,175,55,${(0.036 * pulse * softGlowVis * glowBoost).toFixed(3)})`)
        glow.addColorStop(0.48, `rgba(238,232,215,${(0.018 * pulse * softGlowVis * glowBoost).toFixed(3)})`)
        glow.addColorStop(0.72, `rgba(${centerR},${centerG},${centerB},${(0.004 * softGlowVis * glowBoost * accentVis).toFixed(3)})`)
        glow.addColorStop(0.84, `rgba(225,220,208,${(0.004 * softGlowVis * glowBoost).toFixed(3)})`)
        glow.addColorStop(1,    'rgba(0,0,0,0)')
        ctx.fillStyle = glow
        ctx.fillRect(orbCx - gR2, orbCy - gR2, gR2 * 2, gR2 * 2)

        /* Outer halo — uses outerTaper so it recedes slightly as inner brightens */
        const haloR = RADIUS * 1.20 * interactionScale
        const halo  = ctx.createRadialGradient(orbCx, orbCy, RADIUS * 0.58, orbCx, orbCy, haloR)
        halo.addColorStop(0,    `rgba(${reflectedR},${reflectedG},${reflectedB},${(0.008 * haloBreath * softGlowVis * glowBoost * outerTaper * accentVis).toFixed(3)})`)
        halo.addColorStop(0.34, `rgba(212,175,55,${(0.006 * haloBreath * softGlowVis * glowBoost * outerTaper).toFixed(3)})`)
        halo.addColorStop(0.52, `rgba(238,230,212,${(0.004 * softGlowVis * glowBoost * outerTaper).toFixed(3)})`)
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
          const BLEND  = 0.18
          const blendT = s5(1 - BLEND, 1, migT)

          const bs = 1 + p.ba * Math.sin(tSec + p.bp)
          let ox = p.ox * bs, oy = p.oy * bs, oz = p.oz * bs
          if (p.kind === 'text') {
            ox += Math.sin(tSec * 0.54 + p.bp) * 0.004
            oy += Math.cos(tSec * 0.46 + p.glint) * 0.003
            oz += Math.sin(tSec * 0.38 + p.bp) * 0.012
          } else {
            const m = mats[p.layer]
            _rt1 = ox*m.cY + oz*m.sY; oz = -ox*m.sY + oz*m.cY; ox = _rt1
            _rt1 = oy*m.cX - oz*m.sX; oz =  oy*m.sX + oz*m.cX; oy = _rt1
            _rt1 = ox*m.cZ - oy*m.sZ; _rt2 = ox*m.sZ + oy*m.cZ; ox = _rt1; oy = _rt2
          }
          const sc    = FOV / (FOV + oz * RADIUS)
          const orbPx = orbCx + ox * RADIUS * sc * interactionScale
          const orbPy = orbCy + oy * RADIUS * sc * interactionScale
          const depth = (1 - oz) * 0.5

          let px: number, py: number, fsz: number, op: number

          if (migT < 1) {
            /* Cubic bezier flight — easeOutQuad: snappy departure, graceful float
             *
             * P0: launch from logo character position
             * P1: lift control — pulls path upward in a character-specific
             *     direction ('3' upper-left, '0' up, 'M' upper-right)
             * P2: approach control — pulls path below the orb so characters
             *     sweep downward into the next section before settling
             * P3: exact orb landing position                                  */
            const e   = s5(0, 1, migT)
            const P0x = srcX + p.srcDx,   P0y = srcY + p.srcDy
            const P1x = P0x  + p.cp1Dx,   P1y = P0y  + p.cp1Dy
            const P2x = orbCx + p.cp2Dx,  P2y = orbCy + p.cp2Dy
            const gravity = Math.sin(Math.PI * migT) * Math.sin(Math.PI * migT) * (18 + p.orbR * 18)
            const swirl = Math.sin(migT * Math.PI) * (13 + p.orbR * 26)
            const flyX = bz3(e, P0x, P1x, P2x, orbCx) + Math.cos(p.bp + migT * Math.PI * 1.6) * swirl
            const flyY = bz3(e, P0y, P1y, P2y, orbCy) + Math.sin(p.bp + migT * Math.PI * 1.2) * swirl * 0.36 + gravity

            px  = lp(flyX, orbPx, blendT)
            py  = lp(flyY, orbPy, blendT)

            /* Depth swell: character briefly grows larger at arc peak,
             * simulating forward movement through 3-D space.                */
            const swell = 1 + p.depthAmp * Math.sin(Math.PI * migT)
            fsz = lp(p.fszFly * swell, p.fszOrb * sc * (0.88 + depth * 0.12), blendT)

            /* Opacity: quick fade-in (0–6 %), full through arc,
             * then gentle fade-out in the final 15 % before orb arrival.    */
            const flightOp = s5(0, 0.08, migT) * (1 - s5(0.86, 1.0, migT))
            const orbOp    = (0.44 + (1 - p.orbR) * 0.56) * (0.04 + depth * 0.82) * p.boost
            op = lp(flightOp, orbOp, blendT) * p.alpha

            if (migT > 0.08 && migT < 0.98 && op > 0.02) {
              const tone = p.tone - 0.5
              const tr = Math.round(p.gold ? goldR + tone * 16 : ivyR + tone * 7)
              const tg = Math.round(p.gold ? goldG + tone * 10 : ivyG + tone * 5)
              const tb = Math.round(p.gold ? goldB + tone * 5 : ivyB + tone * 4)

              ctx.fillStyle = `rgb(${tr},${tg},${tb})`
              ctx.shadowColor = p.gold ? 'rgba(218,176,56,0.24)' : 'rgba(242,236,222,0.16)'
              ctx.shadowBlur = 2

              for (let echo = 2; echo >= 1; echo--) {
                const tt = Math.max(0, migT - echo * 0.052)
                const te = s5(0, 1, tt)
                const tbT = s5(1 - BLEND, 1, tt)
                const twirl = Math.sin(tt * Math.PI) * (13 + p.orbR * 26)
                const sag = Math.sin(Math.PI * tt) * Math.sin(Math.PI * tt) * (18 + p.orbR * 18)
                const tx = bz3(te, P0x, P1x, P2x, orbCx) + Math.cos(p.bp + tt * Math.PI * 1.6) * twirl
                const ty = bz3(te, P0y, P1y, P2y, orbCy) + Math.sin(p.bp + tt * Math.PI * 1.2) * twirl * 0.36 + sag
                const trailX = lp(tx, orbPx, tbT)
                const trailY = lp(ty, orbPy, tbT)
                const trailOp = op * (echo === 1 ? 0.18 : 0.08) * (1 - blendT)
                if (trailOp < 0.006) continue
                ctx.font = FONT_CACHE[fontIdx(Math.max(0.5, fsz * (echo === 1 ? 0.82 : 0.68)))]
                ctx.globalAlpha = trailOp
                ctx.fillText(p.ch, trailX, trailY)
              }
              ctx.globalAlpha = 1
              ctx.shadowBlur = 0
            }
          } else {
            px  = orbPx; py = orbPy
            fsz = p.fszOrb * sc * (0.88 + depth * 0.12)
            op  = (0.44 + (1 - p.orbR) * 0.56) * (0.04 + depth * 0.82) * p.boost * p.alpha
          }

          if (op < 0.006) continue
          if (pointerActive > 0.004) {
            const ix = px - ms.x
            const iy = py - ms.y
            const id2 = ix * ix + iy * iy
            if (id2 < pointerRadius2 && id2 > 0.01) {
              const id = Math.sqrt(id2)
              const local = Math.pow(1 - id / pointerRadius, 2) * pointerActive
              const textMotion = p.textRole === 'scatter' ? 0.62 : 0.18
              const push = pointerPush * local * (0.45 + depth * 0.55) * (p.kind === 'text' ? textMotion : 1)
              px += (ix / id) * push
              py += (iy / id) * push
              fsz *= 1 + local * (p.textRole === 'scatter' ? 0.044 : 0.018)
              op *= 1 + local * (p.textRole === 'scatter' ? 0.18 : 0.07)
            }
          }
          if (scrollEnergy > 0.001) {
            const scatterBreath = p.textRole === 'scatter' ? 1.55 : 0.82
            const scrollLift = scrollDrift * (1 - p.orbR * 0.42) * 3.2 * scatterBreath
            py += scrollLift
            fsz *= 1 + scrollEnergy * 0.010 * (1 - p.orbR * 0.35) * scatterBreath
            op *= 1 + scrollEnergy * 0.045 * (0.35 + depth * 0.65) * (p.textRole === 'scatter' ? 1.35 : 0.88)
          }
          vSx[vLen]=px; vSy[vLen]=py; vDepth[vLen]=depth
          vOp[vLen]=op; vFsz[vLen]=Math.max(0.5, fsz); vPidx[vLen]=i
          vLen++

        } else {
          const spawnT = s5(p.migStart, Math.min(1, p.migStart + 0.16), prog)
          if (spawnT <= 0) continue

          const bs = 1 + p.ba * Math.sin(tSec + p.bp)
          let ox = p.ox * bs, oy = p.oy * bs, oz = p.oz * bs
          if (p.kind === 'text') {
            ox += Math.sin(tSec * 0.54 + p.bp) * 0.004
            oy += Math.cos(tSec * 0.46 + p.glint) * 0.003
            oz += Math.sin(tSec * 0.38 + p.bp) * 0.012
          } else {
            const m = mats[p.layer]
            _rt1 = ox*m.cY + oz*m.sY; oz = -ox*m.sY + oz*m.cY; ox = _rt1
            _rt1 = oy*m.cX - oz*m.sX; oz =  oy*m.sX + oz*m.cX; oy = _rt1
            _rt1 = ox*m.cZ - oy*m.sZ; _rt2 = ox*m.sZ + oy*m.cZ; ox = _rt1; oy = _rt2
          }
          const sc    = FOV / (FOV + oz * RADIUS)
          const depth = (1 - oz) * 0.5

          const pulseWave = 0.04 * Math.max(0, Math.sin(p.orbR * 6.0 - tSec * 1.2 + p.bp * 0.30))
          const radGlow   = 0.44 + (1 - p.orbR) * 0.56 + pulseWave
          let op          = radGlow * (0.04 + depth * 0.82) * p.boost * spawnT * p.alpha
          if (op < 0.006) continue

          let px = orbCx + ox * RADIUS * sc * interactionScale
          let py = orbCy + oy * RADIUS * sc * interactionScale
          let fsz = p.fszOrb * sc * (0.88 + depth * 0.12) * (0.985 + 0.015 * Math.sin(tSec * 0.72 + p.glint))
          if (pointerActive > 0.004) {
            const ix = px - ms.x
            const iy = py - ms.y
            const id2 = ix * ix + iy * iy
            if (id2 < pointerRadius2 && id2 > 0.01) {
              const id = Math.sqrt(id2)
              const local = Math.pow(1 - id / pointerRadius, 2) * pointerActive
              const textMotion = p.textRole === 'scatter' ? 0.62 : 0.18
              const push = pointerPush * local * (0.45 + depth * 0.55) * (p.kind === 'text' ? textMotion : 1)
              px += (ix / id) * push
              py += (iy / id) * push
              fsz *= 1 + local * (p.textRole === 'scatter' ? 0.044 : 0.018)
              op *= 1 + local * (p.textRole === 'scatter' ? 0.18 : 0.07)
            }
          }
          if (scrollEnergy > 0.001) {
            const scatterBreath = p.textRole === 'scatter' ? 1.55 : 0.82
            const scrollLift = scrollDrift * (1 - p.orbR * 0.42) * 3.2 * scatterBreath
            py += scrollLift
            fsz *= 1 + scrollEnergy * 0.010 * (1 - p.orbR * 0.35) * scatterBreath
            op *= 1 + scrollEnergy * 0.045 * (0.35 + depth * 0.65) * (p.textRole === 'scatter' ? 1.35 : 0.88)
          }

          vSx[vLen] = px
          vSy[vLen] = py
          vDepth[vLen] = depth; vOp[vLen] = op
          vFsz[vLen]   = Math.max(0.5, fsz)
          vPidx[vLen]  = i
          vLen++
        }
      }

      for (let i = 0; i < vLen; i++) sortBuf[i] = i
      sortBuf.subarray(0, vLen).sort((a, b) => vDepth[a] - vDepth[b])

      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'

      let lastFI   = -1
      let lastStyle = -1

      for (let j = 0; j < vLen; j++) {
        const k = sortBuf[j]
        const p = PARTICLES[vPidx[k]]

        const fi = fontIdx(vFsz[k])
        if (fi !== lastFI) { ctx.font = FONT_CACHE[fi]; lastFI = fi }

        const toneBand = Math.max(0, Math.min(5, Math.round(p.tone * 5)))
        const styleKey = (p.gold ? 10 : 0) + toneBand
        if (styleKey !== lastStyle) {
          const tone = (toneBand - 2.5) / 2.5
          if (p.gold) {
            const r = Math.round(goldR + tone * 12)
            const g = Math.round(goldG + tone * 7)
            const b = Math.round(goldB + tone * 4)
            ctx.fillStyle   = `rgb(${r},${g},${b})`
            ctx.shadowColor = `rgba(${r},${Math.max(0, g - 7)},42,0.48)`
            ctx.shadowBlur  = 3
          } else {
            const r = Math.round(ivyR + tone * 5)
            const g = Math.round(ivyG + tone * 4)
            const b = Math.round(ivyB + tone * 4)
            ctx.fillStyle   = `rgb(${r},${g},${b})`
            ctx.shadowColor = 'rgba(242,236,222,0.34)'
            ctx.shadowBlur  = 2
          }
          lastStyle = styleKey
        }

        const scatterLife = p.textRole === 'scatter' ? 0.08 : 0.04
        const life = 1 - scatterLife + scatterLife * Math.sin(tSec * (p.textRole === 'scatter' ? 1.08 : 0.82) + p.glint)
        ctx.globalAlpha = Math.min(1, (p.gold ? vOp[k] * 0.84 : vOp[k]) * charBoost * life)
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
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ position: 'fixed', inset: 0, zIndex: 9000, pointerEvents: 'none' }}
      />
      <span
        ref={markerRef}
        aria-hidden
        style={{
          position:      'fixed',
          left:          '50%',
          top:           '50%',
          zIndex:        9001,
          color:         'rgba(242,236,222,0.86)',
          fontSize:      '10px',
          lineHeight:    1,
          letterSpacing: '0.08em',
          opacity:       0,
          pointerEvents: 'none',
          textShadow:    '0 0 10px rgba(212,175,55,0.26)',
          transform:     'translateX(-50%)',
          whiteSpace:    'nowrap',
        }}
      >
        30M NEW VERSION
      </span>
    </>
  )
}
