import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base — layout, cursor, font, transition
  [
    'inline-flex items-center justify-center gap-2',
    'font-[Inter,sans-serif] text-[11px] font-medium tracking-[0.12em] uppercase',
    'rounded-[var(--radius-sm)] border',
    'transition-all duration-[var(--t-base)]',
    'cursor-none select-none',
    'disabled:pointer-events-none disabled:opacity-40',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-border)]',
  ].join(' '),
  {
    variants: {
      variant: {
        /** Primary gold CTA */
        gold: [
          'bg-[var(--gold)] text-[#050505] border-transparent',
          'hover:bg-[var(--gold-bright)] hover:shadow-[0_0_24px_var(--gold-glow)]',
          'active:scale-[0.98]',
        ].join(' '),

        /** Outlined — ghost with gold border */
        outline: [
          'bg-transparent text-[var(--gold)] border-[var(--gold-border)]',
          'hover:bg-[var(--gold-subtle)] hover:border-[var(--gold-muted)]',
          'active:scale-[0.98]',
        ].join(' '),

        /** Subtle surface button */
        ghost: [
          'bg-transparent text-[var(--text-muted)] border-transparent',
          'hover:bg-[var(--surface)] hover:text-[var(--text)]',
          'active:scale-[0.98]',
        ].join(' '),

        /** Destructive */
        destructive: [
          'bg-red-500/10 text-red-400 border-red-500/20',
          'hover:bg-red-500/20 hover:border-red-500/40',
          'active:scale-[0.98]',
        ].join(' '),
      },
      size: {
        sm: 'h-8  px-4  text-[10px]',
        md: 'h-10 px-6',
        lg: 'h-12 px-8  text-[12px]',
        icon: 'h-9 w-9 px-0',
      },
    },
    defaultVariants: {
      variant: 'gold',
      size:    'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
