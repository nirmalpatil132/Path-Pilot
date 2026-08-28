import { useState, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface NavbarShellProps {
  brand?: ReactNode
  children?: ReactNode
  actions?: ReactNode
  className?: string
}

/**
 * Structural navbar shell only — brand / nav-links / actions slots. No real
 * PathPilot navigation is defined here; callers supply placeholder or real
 * content later.
 */
export function NavbarShell({ brand, children, actions, className }: NavbarShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className={cn('sticky top-0 z-30 border-b border-border bg-surface', className)}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-2 text-h3 text-text-primary">{brand}</div>

        {children && <nav className="hidden md:flex md:items-center md:gap-6">{children}</nav>}

        <div className="hidden items-center gap-3 md:flex">{actions}</div>

        {(children || actions) && (
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="flex h-9 w-9 items-center justify-center rounded-md text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 md:hidden"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              {mobileOpen ? (
                <path
                  d="M5 5l10 10M15 5 5 15"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 5h14M3 10h14M3 15h14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        )}
      </div>

      {mobileOpen && (children || actions) && (
        <div className="flex flex-col gap-4 border-t border-border px-4 py-4 md:hidden">
          {children && <nav className="flex flex-col gap-3">{children}</nav>}
          {actions && <div className="flex flex-col gap-2">{actions}</div>}
        </div>
      )}
    </header>
  )
}
