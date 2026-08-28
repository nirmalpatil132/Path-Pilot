import { forwardRef, useId, type SelectHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  helperText?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, helperText, error, required, disabled, id, className, children, ...props },
    ref,
  ) => {
    const generatedId = useId()
    const selectId = id ?? generatedId
    const helperId = `${selectId}-helper`
    const errorId = `${selectId}-error`
    const describedBy = error ? errorId : helperText ? helperId : undefined

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-label text-text-primary">
            {label}
            {required && (
              <span className="text-danger" aria-hidden="true">
                {' '}
                *
              </span>
            )}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            disabled={disabled}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy}
            className={cn(
              'h-10 w-full appearance-none rounded-md border bg-surface px-3 pr-9 text-body text-text-primary',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
              'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted',
              error
                ? 'border-danger focus-visible:ring-danger'
                : 'border-border focus-visible:border-primary focus-visible:ring-focus',
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
          >
            <path
              d="M5 7.5 10 12.5 15 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {error ? (
          <p id={errorId} className="text-caption font-normal text-danger">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-caption font-normal text-text-secondary">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  },
)

Select.displayName = 'Select'
