import { forwardRef, useId, type InputHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, disabled, id, className, ...props }, ref) => {
    const generatedId = useId()
    const toggleId = id ?? generatedId

    return (
      <label
        htmlFor={toggleId}
        className={cn(
          'inline-flex items-center gap-3',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        )}
      >
        <span className="relative inline-flex h-6 w-11 shrink-0">
          {/* input, track, and thumb must all be direct siblings — see the
              same peer-checked note in Checkbox.tsx. */}
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={toggleId}
            disabled={disabled}
            className={cn('peer sr-only', className)}
            {...props}
          />
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-0 rounded-full bg-border-strong transition-colors duration-150',
              'peer-checked:bg-primary',
              'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-focus peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-background',
            )}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition-transform duration-150 peer-checked:translate-x-5"
          />
        </span>
        {label && <span className="text-body text-text-primary">{label}</span>}
      </label>
    )
  },
)

Toggle.displayName = 'Toggle'
