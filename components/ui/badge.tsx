import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  [
    'inline-flex items-center',
    'font-[Inter,sans-serif] text-[9px] font-medium tracking-[0.18em] uppercase',
    'rounded-full border',
    'transition-colors duration-[var(--t-fast)]',
    'select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        /** Gold — category labels, featured tags */
        gold: [
          'px-3 py-1',
          'bg-[var(--gold-subtle)] text-[var(--gold)] border-[var(--gold-border)]',
        ].join(' '),

        /** Subtle surface — secondary tags */
        surface: [
          'px-3 py-1',
          'bg-[var(--surface)] text-[var(--text-dim)] border-[var(--border)]',
        ].join(' '),

        /** Dot bullet — compact inline chips */
        dot: [
          'px-2.5 py-0.5 gap-1.5',
          'bg-transparent text-[var(--text-dim)] border-transparent',
          'before:content-[""] before:w-1 before:h-1 before:rounded-full before:bg-[var(--gold-muted)] before:flex-shrink-0',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'surface',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
