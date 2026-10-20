import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-body-sm text-text-secondary">Verifying session…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Preserve the intended location so post-login redirects back here
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
