import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Base card primitives — unstyled enough to compose, opinionated enough
 * to enforce the dark luxury language (surface bg, subtle border, large radius).
 *
 * Usage:
 *   <Card>
 *     <CardHeader><CardTitle>…</CardTitle></CardHeader>
 *     <CardContent>…</CardContent>
 *   </Card>
 */

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative overflow-hidden',
      'bg-[var(--surface)] border border-[var(--border)]',
      'rounded-[var(--radius)] shadow-[var(--shadow-md)]',
      'transition-[border-color,box-shadow] duration-[var(--t-base)]',
      'hover:border-[var(--border-hover)]',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-['Playfair_Display',serif] text-xl font-semibold leading-tight",
      'tracking-[-0.01em] text-white',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "font-['Inter',sans-serif] text-[13px] leading-relaxed text-[var(--text-muted)]",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6 pt-0', className)}
    {...props}
  />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center p-6 pt-0',
      'border-t border-[var(--border)] mt-auto',
      className
    )}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
