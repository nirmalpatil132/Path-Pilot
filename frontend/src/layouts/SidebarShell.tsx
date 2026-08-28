import { useState, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface SidebarShellProps {
  sidebar: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Structural sidebar shell only — a fixed sidebar column on desktop that
 * collapses into an off-canvas drawer below the md breakpoint. No real
 * dashboard navigation is defined here.
 */
export function SidebarShell({ sidebar, children, className }: SidebarShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className={cn('flex min-h-screen bg-background', className)}>
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:block">
        <div className="sticky top-0 flex h-screen flex-col overflow-y-auto px-4 py-6">
          {sidebar}
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-text-primary/40"
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col overflow-y-auto bg-surface px-4 py-6 shadow-lg">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-md text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <path
                d="M3 5h14M3 10h14M3 15h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <span className="text-h3 text-text-primary">Menu</span>
        </div>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}
