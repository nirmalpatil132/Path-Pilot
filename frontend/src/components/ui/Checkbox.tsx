import { forwardRef, useId, type InputHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error = false, disabled, id, className, ...props }, ref) => {
    const generatedId = useId()
    const checkboxId = id ?? generatedId

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          'inline-flex items-center gap-2.5',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        )}
      >
        <span className="relative inline-flex h-5 w-5 shrink-0">
          {/* input, box, and checkmark must all be direct siblings here —
              Tailwind's peer-checked: only matches direct siblings of the
              peer, not descendants nested inside another sibling. */}
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            aria-invalid={error || undefined}
            className={cn('peer sr-only', className)}
            {...props}
          />
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-0 rounded-sm border bg-surface transition-colors duration-150',
              'peer-checked:bg-primary peer-checked:border-primary',
              'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-focus peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-background',
              error ? 'border-danger' : 'border-border-strong',
            )}
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 12 10"
            fill="none"
            className="pointer-events-none absolute inset-0 m-auto h-2.5 w-3 text-text-inverse opacity-0 peer-checked:opacity-100"
          >
            <path
              d="M1 5 4.5 8.5 11 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {label && <span className="text-body text-text-primary">{label}</span>}
      </label>
    )
  },
)

Checkbox.displayName = 'Checkbox'
