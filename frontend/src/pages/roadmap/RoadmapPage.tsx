import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Alert, Button, Card, CardContent } from '@/components/ui'
import { RoadmapHeader } from '@/components/roadmap/RoadmapHeader'
import { RoadmapWeekSection } from '@/components/roadmap/RoadmapWeekSection'
import { RegenerateRoadmapModal } from '@/components/roadmap/RegenerateRoadmapModal'
import {
  api,
  type CareerListItem,
  type Roadmap,
  type RoadmapTaskStatus,
} from '@/lib/api'

export default function RoadmapPage() {
  const [searchParams] = useSearchParams()
  const careerParam = searchParams.get('career')

  const [isLoading, setIsLoading] = useState(true)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [availableCareers, setAvailableCareers] = useState<CareerListItem[]>([])
  const [selectedCareerSlug, setSelectedCareerSlug] = useState<string>('')
  const [selectedWeeklyHours, setSelectedWeeklyHours] = useState<number>(12)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isRegenModalOpen, setIsRegenModalOpen] = useState(false)
  const [weekFilter, setWeekFilter] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [roadmapRes, careersRes] = await Promise.all([
        api.getCurrentRoadmap().catch(() => ({ hasRoadmap: false, roadmap: null })),
        api.getCareers().catch(() => ({ careers: [], categories: [], total: 0 })),
      ])

      setAvailableCareers(careersRes.careers || [])

      if (roadmapRes.hasRoadmap && roadmapRes.roadmap) {
        setRoadmap(roadmapRes.roadmap)
      } else {
        setRoadmap(null)
        // If a career was specified in URL, pre-select it
        if (careerParam && careersRes.careers.some((c) => c.slug === careerParam)) {
          setSelectedCareerSlug(careerParam)
        } else if (careersRes.careers.length > 0) {
          setSelectedCareerSlug(careersRes.careers[0].slug)
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load roadmap data')
    } finally {
      setIsLoading(false)
    }
  }, [careerParam])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleGenerate = async () => {
    if (!selectedCareerSlug) return
    setIsGenerating(true)
    setErrorMessage(null)
    try {
      const res = await api.generateRoadmap({
        careerSlug: selectedCareerSlug,
        weeklyHours: selectedWeeklyHours,
      })
      setRoadmap(res.roadmap)
      setSuccessMessage('30-day roadmap generated successfully!')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to generate roadmap')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUpdateTaskStatus = async (
    taskId: string,
    status: RoadmapTaskStatus,
    notes?: string,
  ) => {
    try {
      const res = await api.updateTaskStatus(taskId, { status, notes })

      // Update local roadmap state
      setRoadmap((prev) => {
        if (!prev) return null

        const updatedTasks = prev.tasks.map((t) => (t.id === taskId ? res.task : t))

        const updatedWeeks = prev.weeks.map((week) => {
          const weekTasks = updatedTasks.filter((t) => t.weekNumber === week.weekNumber)
          const weekCompleted = weekTasks.filter((t) => t.status === 'COMPLETED').length
          const weekProgress =
            weekTasks.length > 0
              ? Math.round((weekCompleted / weekTasks.length) * 1000) / 10
              : 0

          return {
            ...week,
            tasks: weekTasks,
            completedTasks: weekCompleted,
            progressPercentage: weekProgress,
          }
        })

        return {
          ...prev,
          tasks: updatedTasks,
          weeks: updatedWeeks,
          completedTasks: res.roadmapProgress.completedTasks,
          inProgressTasks: res.roadmapProgress.inProgressTasks,
          blockedTasks: res.roadmapProgress.blockedTasks,
          progressPercentage: res.roadmapProgress.progressPercentage,
        }
      })
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update task status')
    }
  }

  const handleRegenerate = async (options: {
    careerSlug: string
    weeklyHours: number
    preserveCompletedTasks: boolean
  }) => {
    const res = await api.regenerateRoadmap({
      careerSlug: options.careerSlug,
      weeklyHours: options.weeklyHours,
      preserveCompletedTasks: options.preserveCompletedTasks,
    })
    setRoadmap(res.roadmap)
    setSuccessMessage('Roadmap regenerated and updated successfully.')
  }

  const displayedWeeks =
    roadmap?.weeks.filter((w) => (weekFilter === 'ALL' ? true : w.weekNumber === weekFilter)) || []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              to="/app"
              className="text-h3 font-bold text-text-primary transition-opacity hover:opacity-90"
            >
              PathPilot
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-body-sm">
              <Link
                to="/app"
                className="text-text-secondary hover:text-text-primary transition-colors font-medium"
              >
                Dashboard
              </Link>
              <span className="text-primary font-semibold border-b-2 border-primary py-4">
                My Roadmap
              </span>
              <Link
                to="/projects"
                className="text-text-secondary hover:text-text-primary transition-colors font-medium"
              >
                Projects
              </Link>
              <Link
                to="/careers"
                className="text-text-secondary hover:text-text-primary transition-colors font-medium"
              >
                Explore Careers
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/app">
              <Button variant="secondary" size="sm">
                ← Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 md:px-8 md:py-10">
        {errorMessage && (
          <div className="mb-6">
            <Alert variant="danger">
              <div className="flex items-center justify-between">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-caption font-bold ml-4"
                >
                  ✕
                </button>
              </div>
            </Alert>
          </div>
        )}

        {successMessage && (
          <div className="mb-6">
            <Alert variant="success">
              <div className="flex items-center justify-between">
                <span>{successMessage}</span>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="text-caption font-bold ml-4"
                >
                  ✕
                </button>
              </div>
            </Alert>
          </div>
        )}

        {isLoading ? (
          /* Loading Skeleton */
          <div className="space-y-6 animate-pulse">
            <div className="h-44 rounded-xl bg-surface-muted" />
            <div className="h-10 w-64 rounded bg-surface-muted" />
            <div className="space-y-4">
              <div className="h-32 rounded-xl bg-surface-muted" />
              <div className="h-32 rounded-xl bg-surface-muted" />
              <div className="h-32 rounded-xl bg-surface-muted" />
            </div>
          </div>
        ) : !roadmap ? (
          /* Empty State: Create Your First Roadmap */
          <Card className="border-border bg-surface shadow-sm overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center max-w-2xl mx-auto">
              <div className="text-4xl mb-3">🧭</div>
              <h1 className="text-h2 font-bold text-text-primary tracking-tight">
                Create Your Personalized 30-Day Learning Roadmap
              </h1>
              <p className="text-body text-text-secondary mt-2 leading-relaxed">
                Transform your verified skill gaps into an actionable, day-by-day learning plan.
                PathPilot prioritizes foundational competencies, sets realistic milestones, and builds practical portfolio evidence.
              </p>

              <div className="mt-8 text-left space-y-4 bg-surface-muted/30 p-6 rounded-xl border border-border/60">
                <div>
                  <label
                    htmlFor="career-select"
                    className="block text-body-sm font-semibold text-text-primary mb-1.5"
                  >
                    Select Target Career Path
                  </label>
                  <select
                    id="career-select"
                    value={selectedCareerSlug}
                    onChange={(e) => setSelectedCareerSlug(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-surface text-text-primary text-body-sm focus:border-focus focus:ring-1 focus:ring-focus outline-none"
                  >
                    {availableCareers.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.title} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="hours-select"
                    className="block text-body-sm font-semibold text-text-primary mb-1.5"
                  >
                    Weekly Study Time Budget
                  </label>
                  <select
                    id="hours-select"
                    value={selectedWeeklyHours}
                    onChange={(e) => setSelectedWeeklyHours(Number(e.target.value))}
                    className="w-full p-3 rounded-lg border border-border bg-surface text-text-primary text-body-sm focus:border-focus focus:ring-1 focus:ring-focus outline-none"
                  >
                    <option value={8}>8 hours/week (Light / Part-time)</option>
                    <option value={12}>12 hours/week (Balanced standard)</option>
                    <option value={15}>15 hours/week (Accelerated study)</option>
                    <option value={20}>20 hours/week (Intensive sprint)</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedCareerSlug}
                  className="w-full sm:w-auto"
                >
                  {isGenerating ? 'Generating 30-Day Plan...' : 'Generate 30-Day Roadmap'}
                </Button>
                <Link to="/careers" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Explore Career Catalog First
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Active Roadmap View */
          <div>
            <RoadmapHeader
              roadmap={roadmap}
              onOpenRegenerate={() => setIsRegenModalOpen(true)}
            />

            {/* Week Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-border pb-3">
              <span className="text-caption font-semibold text-text-secondary uppercase tracking-wider mr-2">
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setWeekFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-body-sm font-medium transition-colors ${
                  weekFilter === 'ALL'
                    ? 'bg-primary text-white'
                    : 'bg-surface-muted text-text-secondary hover:text-text-primary'
                }`}
              >
                All 4 Weeks (30 Days)
              </button>
              {[1, 2, 3, 4].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeekFilter(w as 1 | 2 | 3 | 4)}
                  className={`px-3 py-1.5 rounded-lg text-body-sm font-medium transition-colors ${
                    weekFilter === w
                      ? 'bg-primary text-white'
                      : 'bg-surface-muted text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Week {w}
                </button>
              ))}
            </div>

            {/* Render Weeks */}
            <div className="space-y-6">
              {displayedWeeks.map((week) => (
                <RoadmapWeekSection
                  key={week.weekNumber}
                  week={week}
                  onUpdateStatus={handleUpdateTaskStatus}
                />
              ))}
            </div>

            {/* Regenerate Confirmation Modal */}
            <RegenerateRoadmapModal
              isOpen={isRegenModalOpen}
              onClose={() => setIsRegenModalOpen(false)}
              currentCareerSlug={roadmap.careerSlug}
              currentCareerTitle={roadmap.careerTitle}
              currentVersion={roadmap.version}
              availableCareers={availableCareers}
              onConfirm={handleRegenerate}
            />
          </div>
        )}
      </main>
    </div>
  )
}
