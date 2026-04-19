'use client'

import { type ReactNode } from 'react'
import { motion }         from 'framer-motion'

/**
 * PageShell — wraps each inner page with a cinematic assembly reveal.
 *
 * Uses opacity + a very subtle Y translation (10px → 0) so the content
 * feels like it's rising into place as the shards pull away.
 *
 * The Y is intentionally small — enough to convey "assembling upward"
 * without creating layout shift. Fixed-position elements (Navbar, cursor,
 * ScrollIndicator) are siblings in the layout tree, not descendants here,
 * so the transform on this wrapper does NOT affect them.
 */
export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{
        duration: 0.60,
        ease:     [0.16, 1, 0.3, 1],
        delay:    0.06,   // slight delay so first shard has fully cleared
      }}
    >
      {children}
    </motion.div>
  )
}
