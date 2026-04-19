'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Lightweight tooltip — no external dependency.
 * Shows on hover/focus after a brief delay.
 */

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ children, content, side = 'top', className }: TooltipProps) {
  const [visible, setVisible] = React.useState(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), 320)
  }
  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }

  React.useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const positionStyles: Record<string, React.CSSProperties> = {
    top:    { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top:    'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    left:   { right:  'calc(100% + 8px)', top:  '50%', transform: 'translateY(-50%)' },
    right:  { left:   'calc(100% + 8px)', top:  '50%', transform: 'translateY(-50%)' },
  }

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={cn(
            'absolute z-50 pointer-events-none whitespace-nowrap',
            'px-2.5 py-1.5 rounded-[var(--radius-sm)]',
            'bg-[var(--surface-raised)] border border-[var(--border)]',
            'shadow-[var(--shadow-md)]',
            "font-['Inter',sans-serif] text-[11px] text-[var(--text-muted)]",
            'animate-[fadeIn_0.12s_ease_forwards]',
            className
          )}
          style={positionStyles[side]}
        >
          {content}
        </span>
      )}
    </span>
  )
}
