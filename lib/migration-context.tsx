'use client'

import { useEffect, useState } from 'react'

/**
 * Module-level subscription store — avoids React Context re-renders.
 * Only components that call useMigrationProgress() re-render on scroll.
 * The rest of the tree (Navbar, HomeWorkSection, ThreeScene) is untouched.
 */
let _progress = 0
const _subs   = new Set<(p: number) => void>()

export function setMigrationProgress(p: number): void {
  _progress = p
  _subs.forEach(fn => fn(p))
}

export function useMigrationProgress(): number {
  const [p, setP] = useState(_progress)
  useEffect(() => {
    setP(_progress)      // sync immediately on mount in case progress already moved
    _subs.add(setP)
    return () => { _subs.delete(setP) }
  }, [])
  return p
}
