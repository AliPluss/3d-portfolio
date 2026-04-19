/**
 * Design tokens — typed JS mirrors of the CSS custom properties in globals.css.
 *
 * Use these when you need token values in JavaScript contexts:
 *   - GSAP inline style overrides
 *   - Three.js color assignments (use hexValues)
 *   - Framer Motion style objects
 *
 * For CSS/Tailwind contexts, always prefer the CSS variable directly
 * (var(--gold), var(--border), etc.) — this file is for JS-land only.
 */

/* ─── Gold palette ───────────────────────────────────────────────────────── */
export const gold = {
  base:        '#C9A84C',
  bright:      '#D4B85A',
  muted:       'rgba(201,168,76,0.50)',
  subtle:      'rgba(201,168,76,0.10)',
  border:      'rgba(201,168,76,0.20)',
  glow:        'rgba(201,168,76,0.22)',
  glowLg:      'rgba(201,168,76,0.36)',
  /** Numeric hex for Three.js */
  hex:         0xC9A84C,
} as const

/* ─── Blue palette ───────────────────────────────────────────────────────── */
export const blue = {
  base:        '#5B8AD4',
  subtle:      'rgba(91,138,212,0.08)',
  border:      'rgba(91,138,212,0.22)',
  glow:        'rgba(91,138,212,0.18)',
  hex:         0x5B8AD4,
} as const

/* ─── Backgrounds & surfaces ─────────────────────────────────────────────── */
export const bg = {
  base:        '#050505',
  surface:     'rgba(255,255,255,0.038)',
  surface2:    'rgba(255,255,255,0.060)',
  surfaceHover:'rgba(255,255,255,0.060)',
  raised:      'rgba(12,10,8,0.94)',
  hex:         0x050505,
} as const

/* ─── Borders ────────────────────────────────────────────────────────────── */
export const border = {
  default:     'rgba(255,255,255,0.072)',
  hover:       'rgba(255,255,255,0.140)',
  bright:      'rgba(255,255,255,0.180)',
} as const

/* ─── Text hierarchy ─────────────────────────────────────────────────────── */
export const text = {
  primary:     '#ffffff',
  secondary:   'rgba(255,255,255,0.78)',
  muted:       'rgba(255,255,255,0.48)',
  dim:         'rgba(255,255,255,0.28)',
  ghost:       'rgba(255,255,255,0.12)',
} as const

/* ─── Motion timing (mirrors motion-config.ts, but as plain numbers) ─────── */
export const timing = {
  fast:   150,
  base:   250,
  medium: 380,
  slow:   520,
  xslow:  780,
} as const

/* ─── Radius ─────────────────────────────────────────────────────────────── */
export const radius = {
  sm:      '10px',
  default: '16px',
  lg:      '24px',
  xl:      '32px',
} as const
