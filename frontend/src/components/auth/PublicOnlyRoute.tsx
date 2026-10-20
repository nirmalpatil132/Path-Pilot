import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context'

export function PublicOnlyRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-body-sm text-text-secondary">Loading…</p>
        </div>
      </div>
    )
  }

  if (user) {
    // Prevent open redirect: only redirect to safe internal paths starting with / and not //
    const rawFrom = (location.state as { from?: string } | null)?.from
    const safeDestination =
      rawFrom && rawFrom.startsWith('/') && !rawFrom.startsWith('//') ? rawFrom : '/app'

    return <Navigate to={safeDestination} replace />
  }

  return <Outlet />
}
