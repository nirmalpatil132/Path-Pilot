import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button, Card, CardContent, CardHeader } from '@/components/ui'
import { useAuth } from '@/context'
import { api, type StudentProfile } from '@/lib/api'
import { GOALS, INTEREST_AREAS } from '../onboarding/constants'

export default function AppCheckpoint() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      try {
        const res = await api.getProfile()
        if (isMounted) {
          setProfile(res.profile)
        }
      } catch {
        // Handled gracefully; if unauthenticated, protected route will handle
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false)
        }
      }
    }

    loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      navigate('/login', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getGoalTitle = (id: string | null | undefined) => {
    if (!id) return 'Not selected'
    return GOALS.find((g) => g.id === id)?.title || id
  }

  const getInterestTitle = (id: string) => {
    return INTEREST_AREAS.find((i) => i.id === id)?.title || id
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
              {profile?.isOnboardingCompleted ? (
                <Badge variant="default">Onboarding Complete</Badge>
              ) : (
                <Badge variant="warning">Onboarding Pending</Badge>
              )}
            </div>
            <h1 className="mt-3 text-h1 text-text-primary">Welcome, {user?.name || 'Student'}!</h1>
            <p className="mt-1 font-mono text-caption text-text-muted">{user?.id}</p>
            <p className="mt-2 text-body text-text-secondary">
              Your authenticated account is active and verified by the PathPilot backend.
            </p>
          </div>

          {isLoadingProfile ? (
            <Card>
              <CardContent className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-body-sm text-text-secondary">Loading profile status...</p>
                </div>
              </CardContent>
            </Card>
          ) : !profile?.isOnboardingCompleted ? (
            /* Incomplete Onboarding Banner */
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-h3 font-semibold text-text-primary">
                    Finish Setting Up Your Profile
                  </h2>
                  <p className="mt-1 text-body-sm text-text-secondary">
                    {profile?.currentStep && profile.currentStep > 1
                      ? `You left off at Step ${profile.currentStep} of 8. Your previously entered data has been preserved.`
                      : 'Complete the multi-step onboarding wizard to unlock personalized career paths and skill gaps.'}
                  </p>
                </div>
                <Link to="/onboarding" className="shrink-0">
                  <Button size="md">
                    {profile?.currentStep && profile.currentStep > 1
                      ? `Resume Step ${profile.currentStep} →`
                      : 'Start Onboarding →'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            /* Completed Profile Overview */
            <div className="flex flex-col gap-6">
              <Card className="border-success/30 bg-success/5">
                <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-caption font-semibold uppercase text-success">
                      ✓ Profile Successfully Saved
                    </span>
                    <h2 className="text-h3 font-semibold text-text-primary">
                      Student Onboarding Completed
                    </h2>
                    <p className="mt-1 text-body-sm text-text-secondary">
                      Your educational background, skills, interests, and career goals have been
                      securely persisted to your account.
                    </p>
                  </div>
                  <Link to="/onboarding?step=8" className="shrink-0">
                    <Button variant="secondary" size="sm">
                      Review / Edit Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Profile Details Grid */}
              <Card>
                <CardHeader>
                  <h3 className="text-h3 text-text-primary">Profile Snapshot</h3>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border border-border bg-surface-muted/40 p-4">
                      <p className="text-caption text-text-secondary">Academic Program</p>
                      <p className="mt-1 text-body font-semibold text-text-primary">
                        {profile.degree} • {profile.branch}
                      </p>
                      <p className="text-caption text-text-muted mt-0.5">{profile.currentYear}</p>
                    </div>

                    <div className="rounded-md border border-border bg-surface-muted/40 p-4">
                      <p className="text-caption text-text-secondary">College / Institute</p>
                      <p className="mt-1 text-body font-semibold text-text-primary">
                        {profile.college || profile.university || 'Not specified'}
                      </p>
                      {profile.cgpa !== null && profile.cgpa !== undefined && (
                        <p className="text-caption text-text-muted mt-0.5">CGPA: {profile.cgpa} / 10</p>
                      )}
                    </div>

                    <div className="rounded-md border border-border bg-surface-muted/40 p-4">
                      <p className="text-caption text-text-secondary">Primary Focus</p>
                      <p className="mt-1 text-body font-semibold text-text-primary">
                        {getGoalTitle(profile.primaryGoal)}
                      </p>
                    </div>

                    <div className="rounded-md border border-border bg-surface-muted/40 p-4">
                      <p className="text-caption text-text-secondary">Work Preference</p>
                      <p className="mt-1 text-body font-semibold text-text-primary capitalize">
                        {profile.workMode || 'Flexible'} • {profile.preferredLocation || 'Any Location'}
                      </p>
                    </div>
                  </div>

                  {/* Skills summary */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div>
                      <h4 className="text-body font-semibold text-text-primary mb-2">
                        Recorded Skills ({profile.skills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((s) => (
                          <span
                            key={s.name}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-caption font-medium text-text-primary"
                          >
                            <span>{s.name}</span>
                            <span className="text-text-muted text-[10px]">({s.proficiency})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interests summary */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div>
                      <h4 className="text-body font-semibold text-text-primary mb-2">
                        Target Domains ({profile.interests.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.interests.map((id) => (
                          <span
                            key={id}
                            className="rounded-full bg-primary/10 px-2.5 py-0.5 text-caption font-medium text-primary"
                          >
                            {getInterestTitle(id)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Scope Boundary Notification */}
              <div className="rounded-lg border border-dashed border-border bg-surface-muted/30 p-6 text-center">
                <h4 className="text-h3 text-text-primary">Next: Student Dashboard (Phase 5)</h4>
                <p className="mx-auto mt-2 max-w-lg text-body-sm text-text-secondary">
                  You have completed Phase 4 Onboarding. In Phase 5, this route evolves into the full
                  student dashboard with career exploration, skill-gap analysis, and prioritized
                  action items.
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
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
