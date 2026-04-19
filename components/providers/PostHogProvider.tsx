'use client'

/**
 * PostHog analytics provider — non-invasive scaffold.
 * Does nothing unless NEXT_PUBLIC_POSTHOG_KEY is set in env.
 * Tracks page views on route changes automatically when enabled.
 */

import { useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { initAnalytics, trackPageView } from '@/lib/analytics'

interface Props {
  children: ReactNode
}

export default function PostHogProvider({ children }: Props) {
  // Initialise once on mount
  useEffect(() => {
    initAnalytics()
  }, [])

  // Track page views on navigation
  const pathname = usePathname()
  useEffect(() => {
    if (pathname) trackPageView(pathname)
  }, [pathname])

  return <>{children}</>
}
