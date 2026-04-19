/**
 * Motion configuration — shared timing, easing, and Framer Motion variants.
 * All animated components should import from here to ensure consistent rhythm.
 */

import type { Variants, Transition } from 'framer-motion'

/* ─── Easing curves ──────────────────────────────────────────────────────────
   Mirror the CSS custom properties in globals.css so JS-driven animations
   stay in sync with CSS transitions.
   ──────────────────────────────────────────────────────────────────────────── */
export const ease = {
  /** General enter / decelerate */
  out:   [0.16, 1, 0.3, 1]  as [number, number, number, number],
  /** Exit / accelerate */
  in:    [0.4, 0, 1, 1]     as [number, number, number, number],
  /** Standard in-out */
  inOut: [0.4, 0, 0.2, 1]   as [number, number, number, number],
  /** Spring-flavored overshoot */
  spring: { type: 'spring', stiffness: 400, damping: 32 } as const,
}

/* ─── Duration scale ─────────────────────────────────────────────────────── */
export const duration = {
  fast:   0.15,
  base:   0.25,
  medium: 0.38,
  slow:   0.52,
  xslow:  0.78,
} as const

/* ─── Standard transitions ───────────────────────────────────────────────── */
export const transition = {
  fast:   { duration: duration.fast,   ease: ease.out }   satisfies Transition,
  base:   { duration: duration.base,   ease: ease.out }   satisfies Transition,
  medium: { duration: duration.medium, ease: ease.out }   satisfies Transition,
  slow:   { duration: duration.slow,   ease: ease.out }   satisfies Transition,
  reveal: { duration: duration.xslow,  ease: ease.out }   satisfies Transition,
}

/* ─── Reusable variants ──────────────────────────────────────────────────── */

/** Fade in — opacity only (no Y shift to preserve fixed-position children) */
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: transition.medium },
}

/** Slide up into view */
export const slideUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transition.reveal },
}

/** Slide in from right */
export const slideRight: Variants = {
  hidden:  { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: transition.medium },
}

/** Scale-and-fade — good for cards on hover reveal */
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transition.medium },
}

/** Staggered container — wraps lists of children */
export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

/** Staggered item — pair with staggerContainer */
export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: transition.slow },
}

/** Page shell — the wrapping motion.div in PageShell.tsx */
export const pageEnter: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.medium, ease: ease.out } },
}

/* ─── Hover presets (use with whileHover on motion components) ──────────── */
export const hoverLift = {
  y: -4,
  transition: { duration: duration.base, ease: ease.out },
}

export const hoverScale = {
  scale: 1.02,
  transition: { duration: duration.base, ease: ease.out },
}

export const hoverGlow = {
  boxShadow: '0 0 36px rgba(201,168,76,0.18), 0 20px 52px rgba(0,0,0,0.46)',
  transition: { duration: duration.base, ease: ease.out },
}

/* ─── GSAP timing mirrors ────────────────────────────────────────────────── */
export const gsapEase = {
  out:    'power2.out',
  inOut:  'power2.inOut',
  expo:   'expo.out',
  back:   'back.out(1.4)',
  spring: 'elastic.out(1, 0.5)',
} as const
