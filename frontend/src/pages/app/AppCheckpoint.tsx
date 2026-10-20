import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button, Card, CardContent, CardHeader } from '@/components/ui'
import { useAuth } from '@/context'

export default function AppCheckpoint() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      navigate('/login', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-h3 font-bold text-text-primary transition-opacity hover:opacity-90"
          >
            PathPilot
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-body-sm text-text-secondary sm:inline-block">
              {user?.email}
            </span>
            <Button
              variant="secondary"
              size="sm"
              isLoading={isLoggingOut}
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-3">
              <Badge variant="success">Authenticated</Badge>
              <span className="text-caption text-text-secondary">Phase 3 Security Checkpoint</span>
            </div>
            <h1 className="mt-3 text-h1 text-text-primary">Welcome, {user?.name || 'Student'}!</h1>
            <p className="mt-2 text-body text-text-secondary">
              Your authentication session is active, securely persisted, and verified by the
              PathPilot backend.
            </p>
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-h3 text-text-primary">Session Details</h2>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-border bg-surface-muted/50 p-4">
                  <p className="text-caption text-text-secondary">Full Name</p>
                  <p className="mt-1 text-body font-semibold text-text-primary">{user?.name}</p>
                </div>
                <div className="rounded-md border border-border bg-surface-muted/50 p-4">
                  <p className="text-caption text-text-secondary">Email Address</p>
                  <p className="mt-1 text-body font-semibold text-text-primary">{user?.email}</p>
                </div>
                <div className="rounded-md border border-border bg-surface-muted/50 p-4">
                  <p className="text-caption text-text-secondary">Account ID</p>
                  <p className="mt-1 font-mono text-body-sm text-text-primary">{user?.id}</p>
                </div>
                <div className="rounded-md border border-border bg-surface-muted/50 p-4">
                  <p className="text-caption text-text-secondary">Session Storage</p>
                  <p className="mt-1 text-body font-semibold text-text-primary">
                    HttpOnly Cookie (Server-Revocable)
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-dashed border-border bg-surface-muted/30 p-6 text-center">
                <h3 className="text-h3 text-text-primary">Next: Student Onboarding (Phase 4)</h3>
                <p className="mx-auto mt-2 max-w-lg text-body-sm text-text-secondary">
                  This route serves strictly as an authenticated gate and verification checkpoint.
                  Student profile collection (education, skills, interests) and the student dashboard
                  will be established in Phase 4 and Phase 5.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <Link to="/">
                    <Button variant="secondary" size="sm">
                      Back to Landing Page
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Sign out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
