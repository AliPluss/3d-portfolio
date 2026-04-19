import * as React from 'react'
import { cn } from '@/lib/utils'

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  /** Gold gradient variant instead of default border color */
  gold?: boolean
  /** Optional center label */
  label?: string
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', gold = false, label, ...props }, ref) => {
    if (label) {
      return (
        <div
          ref={ref}
          role="separator"
          className={cn(
            'flex items-center gap-4',
            className
          )}
          {...props}
        >
          <div
            className="flex-1 h-px"
            style={{ background: 'linear-gradient(90deg, var(--gold-border), transparent)' }}
          />
          <span
            className="shrink-0"
            style={{
              fontFamily:    "'Inter', sans-serif",
              fontSize:      '9px',
              fontWeight:    500,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color:         'var(--text-dim)',
            }}
          >
            {label}
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: 'linear-gradient(270deg, var(--gold-border), transparent)' }}
          />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        role="separator"
        className={cn(
          orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
          className
        )}
        style={
          gold
            ? { background: 'linear-gradient(90deg, transparent, var(--gold-border), transparent)' }
            : { background: 'var(--border)' }
        }
        {...props}
      />
    )
  }
)
Separator.displayName = 'Separator'

export { Separator }
