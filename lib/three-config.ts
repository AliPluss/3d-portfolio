/**
 * Shared Three.js / React Three Fiber configuration.
 * Central place for renderer settings, camera defaults, and scene constants.
 *
 * The existing ThreeScene (imperative) lives alongside this config.
 * New R3F-based scenes should import from here.
 */

import type { ColorSpace, ShadowMapType, ToneMapping } from 'three'

/* ─── Renderer defaults ──────────────────────────────────────────────────── */
export const rendererConfig = {
  /** Anti-aliasing — disable on mobile/low-dpi for perf */
  antialias: true,
  /** Pre-multiplied alpha for correct compositing over CSS background */
  alpha: true,
  /** Power preference for battery life vs performance */
  powerPreference: 'high-performance' as const,
} as const

/* ─── Post-creation renderer settings ───────────────────────────────────── */
export interface RendererSettings {
  outputColorSpace: ColorSpace
  toneMapping:      ToneMapping
  toneMappingExposure: number
  shadowMapEnabled: boolean
  shadowMapType:    ShadowMapType
}

export async function applyRendererSettings(
  renderer: import('three').WebGLRenderer
): Promise<void> {
  const THREE = await import('three')
  renderer.outputColorSpace      = THREE.SRGBColorSpace
  renderer.toneMapping           = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure   = 1.2
  renderer.shadowMap.enabled     = true
  renderer.shadowMap.type        = THREE.PCFSoftShadowMap
}

/* ─── Camera defaults ────────────────────────────────────────────────────── */
export const cameraConfig = {
  fov:   35,
  near:  0.1,
  far:   100,
  position: [0, 0, 8] as [number, number, number],
} as const

/* ─── Scene colours (mirrors CSS design tokens) ─────────────────────────── */
export const sceneColors = {
  /** Main background — matches --bg (#050505) */
  bg:            0x050505,
  /** Gold primary accent */
  gold:          0xC9A84C,
  /** Warm fill — right hemisphere, warm bounce */
  warmFill:      0xC9A84C,
  /** Cool atmosphere — key light */
  coolKey:       0x8AABD4,
  /** Neutral ambient */
  ambient:       0x1a1a2e,
} as const

/* ─── Performance helpers ────────────────────────────────────────────────── */
/** Returns true if device pixel ratio warrants reduced quality */
export function isLowDpr(): boolean {
  if (typeof window === 'undefined') return false
  return window.devicePixelRatio < 1.5
}

/** Clamp pixel ratio so high-DPR screens don't destroy GPU */
export function clampedDpr(max = 2): number {
  if (typeof window === 'undefined') return 1
  return Math.min(window.devicePixelRatio, max)
}
