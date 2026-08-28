import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-text-inverse hover:bg-primary-hover active:bg-primary-active',
  secondary:
    'bg-surface text-text-primary border border-border hover:bg-surface-muted active:bg-surface-muted',
  ghost:
    'bg-transparent text-text-primary hover:bg-surface-muted active:bg-border/40',
  danger:
    'bg-danger text-text-inverse hover:bg-danger-strong active:bg-danger-strong',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-body-sm gap-1.5 rounded-md',
  md: 'h-10 px-4 text-body gap-2 rounded-md',
  lg: 'h-12 px-5 text-body gap-2 rounded-lg',
}

const spinnerSizeClasses: Record<ButtonSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-4.5 w-4.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={props.type ?? 'button'}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={cn(
          'relative inline-flex select-none items-center justify-center whitespace-nowrap font-medium',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        <span className={cn('inline-flex items-center gap-2', isLoading && 'invisible')}>
          {children}
        </span>
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <span
              className={cn(
                'animate-spin rounded-full border-2 border-current border-t-transparent',
                spinnerSizeClasses[size],
              )}
            />
          </span>
        )}
        {isLoading && <span className="sr-only">Loading…</span>}
      </button>
    )
  },
)

Button.displayName = 'Button'
