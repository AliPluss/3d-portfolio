'use client'

import { MouseEvent, ReactNode } from 'react'
import { useTransition } from './PageTransitionOverlay'

interface TransitionLinkProps {
  href:      string
  children:  ReactNode
  className?: string
  style?:    React.CSSProperties
  onClick?:  () => void
  /** When true the link opens externally and bypasses the transition */
  external?: boolean
}

export default function TransitionLink({
  href,
  children,
  className,
  style,
  onClick,
  external,
}: TransitionLinkProps) {
  const { navigate } = useTransition()

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    // Let external links, modifier-key clicks, and anchor-only hrefs pass through
    if (
      external ||
      href.startsWith('http') ||
      href.startsWith('mailto') ||
      href === '#' ||
      e.ctrlKey || e.metaKey || e.shiftKey || e.altKey
    ) {
      onClick?.()
      return
    }

    e.preventDefault()
    onClick?.()            // e.g. close mobile menu before animating
    navigate(href)
  }

  return (
    <a
      href={href}
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}
