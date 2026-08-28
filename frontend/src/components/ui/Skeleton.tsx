import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export type SkeletonVariant = 'text' | 'rect' | 'circle'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
  width?: number | string
  height?: number | string
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: 'h-3.5 w-full rounded',
  rect: 'h-24 w-full rounded-md',
  circle: 'h-10 w-10 rounded-full',
}

export function Skeleton({ variant = 'text', width, height, className, style, ...props }: SkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-surface-muted motion-reduce:animate-none',
        variantClasses[variant],
        className,
      )}
      style={{ width, height, ...style }}
      {...props}
    />
  )
}
