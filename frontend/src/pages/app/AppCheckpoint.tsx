import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button, Card, CardContent, CardHeader } from '@/components/ui'
import { useAuth } from '@/context'
import {
  api,
  type CareerFitOverviewResponse,
  type ProjectSummaryMetrics,
  type Roadmap,
  type StudentProfile,
} from '@/lib/api'
import { GOALS, INTEREST_AREAS } from '../onboarding/constants'
import { CareerFitOverviewCard } from '@/components/careerFit/CareerFitOverviewCard'

export default function AppCheckpoint() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Phase 6: Career Fit State
  const [fitOverview, setFitOverview] = useState<CareerFitOverviewResponse | null>(null)
  const [isLoadingFits, setIsLoadingFits] = useState(false)
  const [fitError, setFitError] = useState<string | null>(null)
  const [showAllFits, setShowAllFits] = useState(false)

  // Phase 7: Roadmap State
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null)

  // Phase 8: Project Metrics State
  const [projectMetrics, setProjectMetrics] = useState<ProjectSummaryMetrics | null>(null)

  const loadProfile = useCallback(async () => {
    try {
      const res = await api.getProfile()
      setProfile(res.profile)
    } catch {
      // Handled gracefully; if unauthenticated, protected route will handle
    } finally {
      setIsLoadingProfile(false)
    }
  }, [])

  const loadFitOverview = useCallback(async () => {
    setIsLoadingFits(true)
    setFitError(null)
    try {
      const res = await api.getCareerFitOverview()
      setFitOverview(res)
    } catch (err: unknown) {
      setFitError(err instanceof Error ? err.message : 'Failed to calculate career fit analysis')
    } finally {
      setIsLoadingFits(false)
    }
  }, [])

  const loadRoadmap = useCallback(async () => {
    try {
      const res = await api.getCurrentRoadmap()
      if (res.hasRoadmap && res.roadmap) {
        setActiveRoadmap(res.roadmap)
      }
    } catch {
      // Ignore if unauthenticated or not yet available
    }
  }, [])

  const loadProjectMetrics = useCallback(async () => {
    try {
      const res = await api.getProjectMetrics()
      setProjectMetrics(res.metrics)
    } catch {
      // Ignore if unauthenticated or not yet available
    }
  }, [])

  useEffect(() => {
    loadProfile()
    loadFitOverview()
    loadRoadmap()
    loadProjectMetrics()
  }, [loadProfile, loadFitOverview, loadRoadmap, loadProjectMetrics])

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

  const careerResults = fitOverview?.results || fitOverview?.fits || []
  const displayedFits = showAllFits ? careerResults : careerResults.slice(0, 3)

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
          <div className="flex items-center gap-4">
            <Link
              to="/roadmap"
              className="text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              My Roadmap
            </Link>
            <Link
              to="/projects"
              className="text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Projects
            </Link>
            <Link
              to="/careers"
              className="text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Explore Careers
            </Link>
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

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
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
              Your personalized academic alignment and career-fit insights are evaluated deterministically from your profile.
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
            <div className="flex flex-col gap-8">
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-h3 text-text-primary font-semibold">Profile Snapshot</h3>
                  <Link to="/onboarding?step=8">
                    <Button variant="ghost" size="sm">
                      Edit Profile ↗
                    </Button>
                  </Link>
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

              {/* ========================================================= */}
              {/* PHASE 6: CAREER FIT & SKILL-GAP ENGINE OVERVIEW            */}
              {/* ========================================================= */}
              <section aria-labelledby="career-fit-heading" className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 id="career-fit-heading" className="text-h2 font-bold text-text-primary">
                        Explainable Career Fit Analysis
                      </h2>
                      <Badge variant="neutral">
                        Policy v{fitOverview?.policyVersion || '1.0.0'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-body-sm text-text-secondary">
                      Deterministic alignment between your saved profile and the PathPilot career catalog. No AI-hallucinated scoring.
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    isLoading={isLoadingFits}
                    onClick={loadFitOverview}
                  >
                    ↻ Refresh Analysis
                  </Button>
                </div>

                {isLoadingFits ? (
                  <Card>
                    <CardContent className="flex items-center justify-center p-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="text-body-sm text-text-secondary">
                          Evaluating skills, experience, and domain alignment...
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : fitError ? (
                  <Card className="border-danger/30 bg-danger/5">
                    <CardContent className="p-6 text-center space-y-3">
                      <p className="text-body font-semibold text-danger-strong">{fitError}</p>
                      <Button variant="secondary" size="sm" onClick={loadFitOverview}>
                        Retry Evaluation
                      </Button>
                    </CardContent>
                  </Card>
                ) : fitOverview?.status === 'INSUFFICIENT_DATA' ? (
                  /* Insufficient Evidence State */
                  <Card className="border-warning/40 bg-warning/5" data-testid="insufficient-evidence-banner">
                    <CardContent className="p-6 sm:p-8 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        <h3 className="text-h3 font-semibold text-text-primary">
                          Insufficient Profile Evidence for Scoring
                        </h3>
                      </div>
                      <p className="text-body text-text-secondary leading-relaxed max-w-2xl">
                        PathPilot enforces an honest, explainable scoring policy. To prevent misleading percentages, a fit score is calculated only when you provide at least one technical skill or multiple profile dimensions.
                      </p>
                      <div className="rounded-md border border-warning/30 bg-surface p-4 text-caption text-text-secondary space-y-1">
                        <p className="font-semibold text-text-primary">Minimum Evidence Policy:</p>
                        <p>• Missing fields are never treated as negative evidence.</p>
                        <p>• Unrecorded skills are simply unassessed, not missing capability.</p>
                      </div>
                      <Link to="/onboarding?step=5">
                        <Button size="md">
                          Add Skills to Your Profile →
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  /* Sufficient Evidence State */
                  <div className="space-y-6">
                    {/* Educational Guidance Notice */}
                    <div className="rounded-lg border border-border bg-surface-muted/30 p-4 text-caption text-text-secondary">
                      <p className="font-semibold text-text-primary">Educational Guidance Aid</p>
                      <p className="mt-0.5 leading-relaxed">
                        Career-fit scores represent your strongest current match based on your available profile data. PathPilot does not claim to predict employment, salary, or hiring outcomes. Personal curiosity and practical project execution remain paramount.
                      </p>
                    </div>

                    {/* Ranked Career Fit Cards */}
                    <div className="space-y-4" data-testid="career-fit-matches-list">
                      {displayedFits.map((fit, idx) => (
                        <CareerFitOverviewCard
                          key={fit.careerId || fit.slug}
                          fit={fit}
                          rank={idx + 1}
                        />
                      ))}
                    </div>

                    {/* Show All / Collapse Toggle */}
                    {careerResults.length > 3 && (
                      <div className="text-center pt-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowAllFits((prev) => !prev)}
                        >
                          {showAllFits
                            ? 'Show Top 3 Matches Only ↑'
                            : `View All ${careerResults.length} Career Catalog Matches ↓`}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Phase 7: Roadmap Dashboard Widget */}
              <Card className="border-border bg-surface">
                <CardContent className="p-6">
                  {activeRoadmap ? (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="primary">Active 30-Day Roadmap</Badge>
                          <Badge variant="neutral">v{activeRoadmap.version}</Badge>
                        </div>
                        <h3 className="text-h3 font-semibold text-text-primary">
                          {activeRoadmap.careerTitle}
                        </h3>
                        <p className="mt-1 text-body-sm text-text-secondary">
                          {activeRoadmap.completedTasks} of {activeRoadmap.totalTasks} tasks completed ({activeRoadmap.progressPercentage.toFixed(1)}%) • {activeRoadmap.weeklyHoursAssumed} hrs/week
                        </p>
                      </div>
                      <Link to="/roadmap" className="shrink-0">
                        <Button size="md">
                          Continue Learning Roadmap →
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="neutral">Phase 7: Roadmap & Progress</Badge>
                        </div>
                        <h3 className="text-h3 font-semibold text-text-primary">
                          Personalized 30-Day Learning Roadmap
                        </h3>
                        <p className="mt-1 text-body-sm text-text-secondary">
                          Turn your career fit analysis into an actionable, day-by-day learning plan based on your verified skill gaps.
                        </p>
                      </div>
                      <Link to="/roadmap" className="shrink-0">
                        <Button size="md">
                          Generate 30-Day Roadmap →
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ========================================================= */}
              {/* PHASE 8: PROJECT WORKSPACE & PORTFOLIO EVIDENCE          */}
              {/* ========================================================= */}
              <Card className="border-border bg-surface">
                <CardHeader className="border-b border-border p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-h3 font-bold text-text-primary">
                          Project-Based Learning & Evidence
                        </h3>
                        <Badge variant="primary">Phase 08</Badge>
                      </div>
                      <p className="mt-1 text-body-sm text-text-secondary">
                        Translate roadmap tasks into verifiable portfolio projects, code repositories, and working demos.
                      </p>
                    </div>

                    <Link to="/projects" className="shrink-0">
                      <Button variant="primary" size="md">
                        Open Project Workspace →
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {projectMetrics && projectMetrics.totalProjects > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="rounded-lg bg-surface-raised p-4 border border-border">
                        <span className="text-xs text-text-muted block mb-1">Total Projects</span>
                        <span className="text-h3 font-bold text-text-primary">{projectMetrics.totalProjects}</span>
                      </div>
                      <div className="rounded-lg bg-surface-raised p-4 border border-border">
                        <span className="text-xs text-text-muted block mb-1">In Progress</span>
                        <span className="text-h3 font-bold text-primary">{projectMetrics.activeProjects}</span>
                      </div>
                      <div className="rounded-lg bg-surface-raised p-4 border border-border">
                        <span className="text-xs text-text-muted block mb-1">Completed</span>
                        <span className="text-h3 font-bold text-success">{projectMetrics.completedProjects}</span>
                      </div>
                      <div className="rounded-lg bg-surface-raised p-4 border border-border">
                        <span className="text-xs text-text-muted block mb-1">Deliverables Added</span>
                        <span className="text-h3 font-bold text-text-primary">{projectMetrics.totalDeliverables}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <p className="text-body-sm text-text-secondary">
                        You haven't started a project yet. Explore curated project ideas matched to your skill gaps.
                      </p>
                      <Link to="/projects">
                        <Button variant="secondary" size="sm">
                          Discover Recommended Projects →
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Career Explorer Link */}
              <Card className="border-border bg-surface">
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-h3 font-semibold text-text-primary">
                      Browse Full Career Catalog
                    </h3>
                    <p className="mt-1 text-body-sm text-text-secondary">
                      Explore detailed responsibilities, interview areas, growth paths, and benchmark portfolio projects across all 10 curated tech careers.
                    </p>
                  </div>
                  <Link to="/careers" className="shrink-0">
                    <Button variant="secondary" size="md">
                      Open Career Explorer →
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Scope Boundary Notification */}
              <div className="rounded-lg border border-dashed border-border bg-surface-muted/30 p-6 text-center">
                <h4 className="text-h3 text-text-primary">Next: Student Dashboard (Phase 5)</h4>
                <p className="mx-auto mt-2 max-w-lg text-body-sm text-text-secondary">
                  You can now explore all 10 curated career paths in the Career Explorer. In Phase 6,
                  PathPilot connects your profile to these careers to calculate deterministic skill
                  matches and personalized skill-gap roadmaps.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <Link to="/careers">
                    <Button variant="secondary" size="sm">
                      Browse Career Catalog
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button variant="ghost" size="sm">
                      Landing Page
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
