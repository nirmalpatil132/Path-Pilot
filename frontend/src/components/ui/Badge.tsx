import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'neutral'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface text-text-primary border border-border',
  primary: 'bg-primary-subtle text-primary-active',
  success: 'bg-success-subtle text-success-strong',
  warning: 'bg-warning-subtle text-warning-strong',
  danger: 'bg-danger-subtle text-danger-strong',
  neutral: 'bg-neutral-subtle text-text-secondary',
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-medium leading-normal',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
