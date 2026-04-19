'use client'

/**
 * Unified client providers.
 * Import order matters — LenisProvider first so GSAP ScrollTrigger
 * components lower in the tree can sync with the scroll instance.
 */

import type { ReactNode } from 'react'
import LenisProvider   from './LenisProvider'
import PostHogProvider from './PostHogProvider'

export { useLenis } from './LenisProvider'

interface Props {
  children: ReactNode
}

export default function Providers({ children }: Props) {
  return (
    <LenisProvider>
      <PostHogProvider>
        {children}
      </PostHogProvider>
    </LenisProvider>
  )
}
