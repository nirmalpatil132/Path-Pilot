import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

export interface AlertProps {
  variant?: AlertVariant
  title?: string
  children?: ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

const variantClasses: Record<AlertVariant, string> = {
  info: 'bg-primary-subtle border-primary/20 text-primary-active',
  success: 'bg-success-subtle border-success/20 text-success-strong',
  warning: 'bg-warning-subtle border-warning/30 text-warning-strong',
  danger: 'bg-danger-subtle border-danger/20 text-danger-strong',
}

const icons: Record<AlertVariant, ReactNode> = {
  info: (
    <path
      d="M10 6.5h.01M9.25 9.5H10v4h.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  success: (
    <path
      d="M6 10.5 8.5 13 14 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  warning: (
    <path
      d="M10 8v3.5M10 14h.01M8.86 4.86 2.98 15a1 1 0 0 0 .86 1.5h12.32a1 1 0 0 0 .86-1.5L11.14 4.86a1 1 0 0 0-1.72 0Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  danger: (
    <path
      d="M10 6.5v4M10 13.5h.01M17.5 10a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
}

export function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 rounded-lg border px-4 py-3.5 text-body-sm',
        variantClasses[variant],
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="mt-0.5 h-5 w-5 shrink-0"
      >
        {icons[variant]}
      </svg>
      <div className="flex-1 space-y-0.5">
        {title && <p className="font-semibold text-text-primary">{title}</p>}
        {children && <div className="text-text-secondary">{children}</div>}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
