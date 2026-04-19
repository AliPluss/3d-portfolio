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
function lp(a: number, b: number, t: number): number { return a + (b - a) * t }

/* ─── Particle ────────────────────────────────────────────────────────────── */
interface Pt {
  ch:     string
  gold:   boolean
  srcDx:  number; srcDy: number
  cpDx:   number; cpDy: number
  ox: number; oy: number; oz: number
  orbR:   number
  layer:  0 | 1 | 2
  migStart: number
  migEnd:   number
  isMig:    boolean
  bp: number; ba: number
  fszFly:   number
  fszOrb:   number
  boost:    number
}

/* ─── Layer differential rotation speeds ─────────────────────────────────── *
 * Narrowed gap (14 %) over previous (35 %): inner still drifts visibly ahead  *
 * of the outer shell, but all layers read as one coherent calm mass.          */
const LAYER_SPEED: [number, number, number] = [1.14, 1.00, 0.88]

/* ─── Particle counts ────────────────────────────────────────────────────── */
const N_MIG     = 24              // travel from logo (8 per char)
const N_CORE    = 160             // bright nucleus (r ≤ 0.22) — denser inner mass
const N_VOLUME  = 1370            // centre-weighted volume fill
const N_STRANDS = 8               // helical energy flows through interior
const N_SPR     = 70              // particles per strand
const N_ACCUM   = N_CORE + N_VOLUME + N_STRANDS * N_SPR   // 2090
const N_TOTAL   = N_MIG + N_ACCUM                          // 2114

const CHAR_DX: Record<string, number> = { '3': -14, '0': 0, 'M': 14 }

/* ─── Font string cache (0.5 px steps, 0.5 → 15.0) ─────────────────────── */
const FC_BASE  = 0.5
const FC_STEP  = 0.5
const FC_COUNT = 30
const FONT_CACHE = Array.from({ length: FC_COUNT }, (_, i) =>
  `300 ${(FC_BASE + i * FC_STEP).toFixed(1)}px 'Playfair Display', serif`
)
function fontIdx(fsz: number): number {
  return Math.min(FC_COUNT - 1, Math.max(0, Math.round((fsz - FC_BASE) / FC_STEP)))
}

/* ─── Build particle set ─────────────────────────────────────────────────── */
const PARTICLES: Pt[] = (() => {
  const pts: Pt[] = []
  let seed = 1

  /* ══ 1. Migration particles ═══════════════════════════════════════════════ */
  for (let i = 0; i < N_MIG; i++) {
    const ci    = Math.floor(i / (N_MIG / 3))
    const ch    = CHARS[ci]
    const nr    = 0.06 + sr(seed++) * 0.80
    const cosθ  = 2 * sr(seed++) - 1
    const sinθ  = Math.sqrt(Math.max(0, 1 - cosθ * cosθ))
    const φ     = 2 * Math.PI * sr(seed++)
    const layer: 0|1|2 = nr < 0.34 ? 0 : nr < 0.67 ? 1 : 2
    const migStart = 0.04 + (ci / 3) * 0.06 + sr(seed++) * 0.08
    pts.push({
      ch, gold: sr(seed++) < 0.45,
      srcDx: CHAR_DX[ch] + (sr(seed++) - 0.5) * 6,
      srcDy: (sr(seed++) - 0.5) * 5,
      cpDx:  (sr(seed++) - 0.5) * 80,
      cpDy:  -45 - sr(seed++) * 55,
      ox: sinθ * Math.cos(φ) * nr, oy: cosθ * nr, oz: sinθ * Math.sin(φ) * nr,
      orbR: nr, layer,
      migStart,
      migEnd:  migStart + 0.22 + sr(seed++) * 0.14,
      isMig:   true,
      bp: sr(seed++) * Math.PI * 2, ba: 0.006 + sr(seed++) * 0.010,
      fszFly: 9 + sr(seed++) * 5,
      fszOrb: Math.max(3.0, 4.0 + (1 - nr) * 3.2),
      boost: 1.40,
    })
  }

  /* ══ 2. Core nucleus — dense warm glowing interior ════════════════════════ *
   * r ≤ 0.22. Elevated count (160) and boost create the luminous centre mass. */
  const core: Pt[] = []
  for (let i = 0; i < N_CORE; i++) {
    const nr   = sr(seed++) * 0.22
    const cosθ = 2 * sr(seed++) - 1
    const sinθ = Math.sqrt(Math.max(0, 1 - cosθ * cosθ))
    const φ    = 2 * Math.PI * sr(seed++)
    core.push({
      ch: CHARS[i % 3], gold: sr(seed++) < 0.72,
      srcDx: 0, srcDy: 0, cpDx: 0, cpDy: 0,
      ox: sinθ * Math.cos(φ) * nr, oy: cosθ * nr, oz: sinθ * Math.sin(φ) * nr,
      orbR: nr, layer: 0,
      migStart: 0, migEnd: 0, isMig: false,
      bp: sr(seed++) * Math.PI * 2, ba: 0.010 + sr(seed++) * 0.014,
      fszFly: 0, fszOrb: Math.max(3.2, 4.5 + (1 - nr) * 3.6), boost: 1.65,
    })
  }
  core.sort((a, b) => a.orbR - b.orbR)
  core.forEach((p, i) => { p.migStart = 0.28 + (i / N_CORE) * 0.18 })
  pts.push(...core)

  /* ══ 3. Volume fill — pow(u, 0.44) concentrates ~65 % mass in inner half ══ *
   * More inner concentration than before; boost is radially graded so the     *
   * interior feels luminous and the shell feels naturally dimmer.             */
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
      srcDx: 0, srcDy: 0, cpDx: 0, cpDy: 0,
      ox: sinθ * Math.cos(φ) * nr, oy: cosθ * nr, oz: sinθ * Math.sin(φ) * nr,
      orbR: nr, layer,
      migStart: 0, migEnd: 0, isMig: false,
      bp: sr(seed++) * Math.PI * 2, ba: 0.006 + sr(seed++) * 0.011,
      fszFly: 0, fszOrb: Math.max(2.6, 3.7 + (1 - nr) * 2.8), boost,
    })
  }
  vol.sort((a, b) => a.orbR - b.orbR)
  vol.forEach((p, i) => { p.migStart = 0.30 + (i / N_VOLUME) * 0.52 })
  pts.push(...vol)

  /* ══ 4. Helical energy strands ════════════════════════════════════════════ */
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
      const spawnAt = 0.36 + (stIdx / stTotal) * 0.44

      pts.push({
        ch: CHARS[(st * N_SPR + k) % 3],
        gold: sr(k * 19 + st * 103 + 400) < 0.38,
        srcDx: 0, srcDy: 0, cpDx: 0, cpDy: 0,
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

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function LogoParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progRef   = useRef(0)
  /* Smoothed mouse offset — lerps toward raw target at 2 % per frame so the
   * orb tilts gently in response to the cursor without any snapping.          */
  const mouseRef  = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const progress  = useMigrationProgress()
  progRef.current = progress

  useEffect(() => {
    const el = document.getElementById('logo-anchor')
    if (!el) return
    el.style.opacity    = String(Math.max(0, 1 - progress / 0.40))
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

    /* Mouse tracking — normalised −1…+1 relative to viewport centre */
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.tx = (e.clientX / window.innerWidth  - 0.5) * 2
      mouseRef.current.ty = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

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

      const logR  = logoEl.getBoundingClientRect()
      const oR    = orbEl.getBoundingClientRect()
      const srcX  = logR.left + logR.width  / 2
      const srcY  = logR.top  + logR.height / 2
      const orbCx = oR.left   + oR.width    / 2
      const orbCy = oR.top    + oR.height   / 2

      /* Section scroll progress — 0 at section entry, 1 at section exit.
       * Drives a subtle glow/brightness evolution tied to scroll depth.   */
      let sectionProg = 0
      const sectionEl = document.getElementById('work-section')
      if (sectionEl) {
        const sR    = sectionEl.getBoundingClientRect()
        const range = Math.max(1, sR.height - window.innerHeight * 0.55)
        sectionProg = Math.max(0, Math.min(1, -sR.top / range))
      }
      /* glowBoost: up to 12 % brighter glow as user scrolls deeper       */
      const glowBoost  = 1 + 0.12 * sectionProg
      /* charBoost: up to 6 % more opaque characters as section deepens   */
      const charBoost  = 1 + 0.06 * sectionProg

      const SIZE   = Math.min(oR.width, oR.height, 228)
      const RADIUS = SIZE * 0.44
      const FOV    = RADIUS * 3.2
      /* Slower time base: all oscillations (tilt, breathe, pulse) run calmer */
      const tSec   = frame * 0.005

      /* Smooth mouse lerp — 2 % per frame ≈ 0.8 s to reach target */
      const ms = mouseRef.current
      ms.x += (ms.tx - ms.x) * 0.022
      ms.y += (ms.ty - ms.y) * 0.022

      /* ── Rotation matrices ────────────────────────────────────────────── *
       * angleY: primary slow drift — full rotation ≈ 105 s at 60 fps       *
       * angleX/Z: gentle breathing tilt + soft mouse parallax              */
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

      const orbVis = ss(0.26, 0.54, prog)
      if (orbVis > 0.01) {
        const pulse = 0.82 + 0.18 * Math.sin(tSec * 0.38)

        /* Innermost hot-core glow — tight warm gold at very centre */
        const hotR = RADIUS * 0.30
        const hot = ctx.createRadialGradient(orbCx, orbCy, 0, orbCx, orbCy, hotR)
        hot.addColorStop(0,    `rgba(255,218,75,${(0.18 * pulse * orbVis * glowBoost).toFixed(3)})`)
        hot.addColorStop(0.38, `rgba(222,178,52,${(0.09 * pulse * orbVis * glowBoost).toFixed(3)})`)
        hot.addColorStop(1,    'rgba(0,0,0,0)')
        ctx.globalAlpha = 1
        ctx.fillStyle = hot
        ctx.fillRect(orbCx - hotR, orbCy - hotR, hotR * 2, hotR * 2)

        /* Mid volumetric glow — warm gold fading to ivory */
        const gR2 = RADIUS * 0.90
        const glow = ctx.createRadialGradient(orbCx, orbCy, 0, orbCx, orbCy, gR2)
        glow.addColorStop(0,    `rgba(220,182,60,${(0.11 * pulse * orbVis * glowBoost).toFixed(3)})`)
        glow.addColorStop(0.22, `rgba(212,175,55,${(0.084 * pulse * orbVis * glowBoost).toFixed(3)})`)
        glow.addColorStop(0.48, `rgba(238,232,215,${(0.044 * pulse * orbVis * glowBoost).toFixed(3)})`)
        glow.addColorStop(0.76, `rgba(225,220,208,${(0.013 * orbVis * glowBoost).toFixed(3)})`)
        glow.addColorStop(1,    'rgba(0,0,0,0)')
        ctx.fillStyle = glow
        ctx.fillRect(orbCx - gR2, orbCy - gR2, gR2 * 2, gR2 * 2)

        /* Outer ambient halo — characters collectively contribute to edge glow */
        const haloR = RADIUS * 1.18
        const halo = ctx.createRadialGradient(orbCx, orbCy, RADIUS * 0.58, orbCx, orbCy, haloR)
        halo.addColorStop(0,    `rgba(212,175,55,${(0.024 * pulse * orbVis * glowBoost).toFixed(3)})`)
        halo.addColorStop(0.52, `rgba(238,230,212,${(0.009 * orbVis * glowBoost).toFixed(3)})`)
        halo.addColorStop(1,    'rgba(0,0,0,0)')
        ctx.fillStyle = halo
        ctx.fillRect(orbCx - haloR, orbCy - haloR, haloR * 2, haloR * 2)
      }

      /* ── Project all active particles ────────────────────────────────── */
      let vLen = 0

      for (let i = 0; i < N_TOTAL; i++) {
        const p = PARTICLES[i]
        if (prog < p.migStart - 0.001) continue

        if (p.isMig) {
          const dur   = Math.max(0.001, p.migEnd - p.migStart)
          const migT  = Math.min(1, (prog - p.migStart) / dur)
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
            const e   = eio(migT)
            const mpX = (srcX + orbCx) * 0.50
            const mpY = srcY + (orbCy - srcY) * 0.24 - 16
            const flyX = bz(e, srcX + p.srcDx, mpX + p.cpDx + p.srcDx * 0.35, orbCx)
            const flyY = bz(e, srcY + p.srcDy, mpY + p.cpDy,                   orbCy)

            px  = lp(flyX, orbPx, blendT)
            py  = lp(flyY, orbPy, blendT)
            fsz = lp(p.fszFly, p.fszOrb * sc * (0.88 + depth * 0.12), blendT)

            const flightOp = ss(0, 0.14, migT)
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

          /* Radial pulse wave — brightness ripples outward from centre.
           * Reduced to 0.04 amp and slower speed for a calmer energy feel. */
          const pulseWave = 0.04 * Math.max(0, Math.sin(p.orbR * 6.0 - tSec * 1.2 + p.bp * 0.30))

          /* Volumetric opacity: inner glow + depth cue + radial pulse + spawn fade */
          const radGlow = 0.44 + (1 - p.orbR) * 0.56 + pulseWave
          const op      = radGlow * (0.04 + depth * 0.82) * p.boost * spawnT
          if (op < 0.006) continue

          /* Depth-modulated size — nearer characters read slightly larger */
          const fszDepth = p.fszOrb * sc * (0.88 + depth * 0.12)

          vSx[vLen] = orbCx + ox * RADIUS * sc
          vSy[vLen] = orbCy + oy * RADIUS * sc
          vDepth[vLen] = depth; vOp[vLen] = op
          vFsz[vLen]   = Math.max(0.5, fszDepth); vPidx[vLen] = i
          vLen++
        }
      }

      /* ── Painter's sort: back → front ────────────────────────────────── */
      for (let i = 0; i < vLen; i++) sortBuf[i] = i
      sortBuf.subarray(0, vLen).sort((a, b) => vDepth[a] - vDepth[b])

      /* ── Draw ─────────────────────────────────────────────────────────── *
       * shadowBlur adds per-character glow contribution — soft warm gold    *
       * for gold chars, cool ivory for white chars. Kept at 3px to stay     *
       * elegant and controlled without neon bloom or heavy performance hit.  */
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'

      let lastFI   = -1
      let lastGold = -1

      for (let j = 0; j < vLen; j++) {
        const k  = sortBuf[j]
        const p  = PARTICLES[vPidx[k]]

        const fi = fontIdx(vFsz[k])
        if (fi !== lastFI) { ctx.font = FONT_CACHE[fi]; lastFI = fi }

        const isGold = p.gold ? 1 : 0
        if (isGold !== lastGold) {
          if (p.gold) {
            ctx.fillStyle   = '#d4af37'
            ctx.shadowColor = 'rgba(212,168,42,0.52)'
            ctx.shadowBlur  = 3
          } else {
            ctx.fillStyle   = '#ede9e0'
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
