/**
 * Analytics scaffold — PostHog integration.
 *
 * Non-invasive: does nothing until NEXT_PUBLIC_POSTHOG_KEY is set.
 * Designed to be enabled without code changes — just add the env var.
 *
 * Usage:
 *   import { track } from '@/lib/analytics'
 *   track('project_viewed', { title: 'My Project' })
 */

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com'

let _ph: any = null

/** Lazily initialise PostHog on the client. Safe to call multiple times. */
export async function initAnalytics(): Promise<void> {
  if (typeof window === 'undefined') return
  if (!KEY) return  // disabled until key is configured
  if (_ph) return   // already initialised

  const { default: posthog } = await import('posthog-js')
  posthog.init(KEY, {
    api_host:              HOST,
    capture_pageview:      false,  // handled manually via router events
    capture_pageleave:     true,
    autocapture:           false,  // opt-in only
    session_recording:     { maskAllInputs: true },
    persistence:           'localStorage',
    loaded(ph: any) { _ph = ph },
  })
}

/** Fire a named event with optional properties. No-op if not initialised. */
export function track(event: string, properties?: Record<string, unknown>): void {
  _ph?.capture(event, properties)
}

/** Track a page view. Call on route changes. */
export function trackPageView(url: string): void {
  _ph?.capture('$pageview', { $current_url: url })
}

/** Identify an authenticated user. Call after login. */
export function identify(id: string, traits?: Record<string, unknown>): void {
  _ph?.identify(id, traits)
}

/** Reset identity on logout. */
export function reset(): void {
  _ph?.reset()
}
