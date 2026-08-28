import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-text-secondary">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <h3 className="text-h3 text-text-primary">{title}</h3>
        {description && (
          <p className="max-w-sm text-body-sm text-text-secondary">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
