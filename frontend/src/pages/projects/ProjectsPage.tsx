import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button } from '@/components/ui'
import { useAuth } from '@/context'
import {
  api,
  type CareerListItem,
  type CreateProjectPayload,
  type Project,
  type ProjectRecommendation,
} from '@/lib/api'
import { ProjectCard } from '@/components/project/ProjectCard'
import { ProjectRecommendationCard } from '@/components/project/ProjectRecommendationCard'
import { CreateProjectModal } from '@/components/project/CreateProjectModal'

export default function ProjectsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [projects, setProjects] = useState<Project[]>([])
  const [recommendations, setRecommendations] = useState<ProjectRecommendation[]>([])
  const [careers, setCareers] = useState<CareerListItem[]>([])
  const [targetCareerSlug, setTargetCareerSlug] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('ALL')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<{
    templateId: string
    title: string
    description: string
    skills: string[]
    careerSlug: string
    careerTitle: string
  } | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [projectsRes, recsRes, careersRes] = await Promise.all([
        api.getProjects(),
        api.getProjectRecommendations(),
        api.getCareers().catch(() => ({ careers: [] })),
      ])

      setProjects(projectsRes.projects)
      setRecommendations(recsRes.recommendations)
      setTargetCareerSlug(recsRes.targetCareerSlug)
      setCareers(careersRes.careers || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load project workspace data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreateProject = async (payload: CreateProjectPayload) => {
    const res = await api.createProject(payload)
    await loadData()
    navigate(`/projects/${res.project.id}`)
  }

  const handleStartFromRecommendation = (rec: ProjectRecommendation) => {
    setSelectedTemplate({
      templateId: rec.templateId,
      title: rec.title,
      description: rec.description,
      skills: rec.skills,
      careerSlug: rec.careerSlug,
      careerTitle: rec.careerTitle,
    })
    setIsCreateModalOpen(true)
  }

  const handleOpenCustomModal = () => {
    setSelectedTemplate(null)
    setIsCreateModalOpen(true)
  }

  // Filter projects by status tab
  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'ALL') return true
    return p.status === activeTab
  })

  const inProgressCount = projects.filter((p) => p.status === 'IN_PROGRESS').length
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length
  const plannedCount = projects.filter((p) => p.status === 'PLANNED').length
  const archivedCount = projects.filter((p) => p.status === 'ARCHIVED').length

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
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
              to="/app"
              className="text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Dashboard
            </Link>
            <Link
              to="/roadmap"
              className="text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              My Roadmap
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
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Workspace Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h1 className="text-h2 font-bold text-text-primary">
                Project Workspace & Portfolio Evidence
              </h1>
              <Badge variant="primary">Phase 08</Badge>
            </div>
            <p className="text-body-md text-text-secondary">
              Build credible, verifiable evidence connecting your target career competencies, roadmap tasks, and working code.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={handleOpenCustomModal}>
              + Create Custom Project
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-body-sm text-danger font-medium flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="secondary" onClick={loadData}>
              Retry
            </Button>
          </div>
        )}

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-border pb-3 mb-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 text-body-sm font-medium rounded-lg transition-colors ${
              activeTab === 'ALL'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
            }`}
          >
            All Projects ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('IN_PROGRESS')}
            className={`px-3 py-1.5 text-body-sm font-medium rounded-lg transition-colors ${
              activeTab === 'IN_PROGRESS'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PLANNED')}
            className={`px-3 py-1.5 text-body-sm font-medium rounded-lg transition-colors ${
              activeTab === 'PLANNED'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
            }`}
          >
            Planned ({plannedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 text-body-sm font-medium rounded-lg transition-colors ${
              activeTab === 'COMPLETED'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ARCHIVED')}
            className={`px-3 py-1.5 text-body-sm font-medium rounded-lg transition-colors ${
              activeTab === 'ARCHIVED'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
            }`}
          >
            Archived ({archivedCount})
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-16 text-center text-text-muted">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-3" />
            <p className="text-body-sm">Loading project workspace and recommendations...</p>
          </div>
        ) : (
          <>
            {/* Student Projects Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h3 font-bold text-text-primary">
                  Your Projects ({filteredProjects.length})
                </h2>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
                  <p className="text-body-md font-semibold text-text-primary mb-1">
                    {activeTab === 'ALL'
                      ? 'You have not added any projects yet.'
                      : `No projects found in status "${activeTab.toLowerCase().replace('_', ' ')}".`}
                  </p>
                  <p className="text-body-sm text-text-secondary max-w-md mx-auto mb-4">
                    Turn your roadmap learning into practical portfolio evidence. Choose a recommended project below or start a self-directed custom project.
                  </p>
                  <Button variant="primary" size="sm" onClick={handleOpenCustomModal}>
                    Create Custom Project
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Projects Section */}
            <div>
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-h3 font-bold text-text-primary">
                    Curated Project Recommendations
                  </h2>
                  {targetCareerSlug && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-subtle text-primary border border-primary/20">
                      Tailored for your path
                    </span>
                  )}
                </div>
                <p className="text-body-sm text-text-secondary">
                  Grounded in actual career competencies and prioritized to bridge your Critical Missing and Recommended Next skills.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.slice(0, 6).map((rec) => (
                  <ProjectRecommendationCard
                    key={rec.templateId}
                    recommendation={rec}
                    onStartProject={handleStartFromRecommendation}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        careers={careers}
        initialTemplate={selectedTemplate}
      />
    </div>
  )
}
