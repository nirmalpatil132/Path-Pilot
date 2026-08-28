import { forwardRef, useId, type InputHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, required, disabled, id, className, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const helperId = `${inputId}-helper`
    const errorId = `${inputId}-error`
    const describedBy = error ? errorId : helperText ? helperId : undefined

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-label text-text-primary">
            {label}
            {required && (
              <span className="text-danger" aria-hidden="true">
                {' '}
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-10 w-full rounded-md border bg-surface px-3 text-body text-text-primary',
            'placeholder:text-text-muted transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
            'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted',
            error
              ? 'border-danger focus-visible:ring-danger'
              : 'border-border focus-visible:border-primary focus-visible:ring-focus',
            className,
          )}
          {...props}
        />
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

Input.displayName = 'Input'
