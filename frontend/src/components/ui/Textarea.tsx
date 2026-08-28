import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, helperText, error, required, disabled, id, rows = 4, className, ...props },
    ref,
  ) => {
    const generatedId = useId()
    const textareaId = id ?? generatedId
    const helperId = `${textareaId}-helper`
    const errorId = `${textareaId}-error`
    const describedBy = error ? errorId : helperText ? helperId : undefined

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-label text-text-primary">
            {label}
            {required && (
              <span className="text-danger" aria-hidden="true">
                {' '}
                *
              </span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          className={cn(
            'w-full resize-y rounded-md border bg-surface px-3 py-2 text-body text-text-primary',
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

Textarea.displayName = 'Textarea'
