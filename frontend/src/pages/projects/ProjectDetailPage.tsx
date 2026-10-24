import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, CardContent, Select, Textarea } from '@/components/ui'
import { useAuth } from '@/context'
import {
  api,
  type CreateDeliverablePayload,
  type DeliverableStatus,
  type DeliverableType,
  type Project,
  type ProjectDeliverable,
  type ProjectStatus,
  type RoadmapTask,
} from '@/lib/api'
import { DeliverableCard } from '@/components/project/DeliverableCard'
import { AddDeliverableModal } from '@/components/project/AddDeliverableModal'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>([] )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingDeliverable, setEditingDeliverable] = useState<{
    id?: string
    title: string
    description: string
    type: DeliverableType
    status: DeliverableStatus
    url?: string | null
    roadmapTaskId?: string | null
  } | null>(null)

  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notesDraft, setNotesDraft] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [isDeletingProject, setIsDeletingProject] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const [projectRes, roadmapRes] = await Promise.all([
        api.getProjectById(id),
        api.getCurrentRoadmap().catch(() => ({ hasRoadmap: false, roadmap: null })),
      ])

      setProject(projectRes.project)
      setNotesDraft(projectRes.project.notes || '')
      if (roadmapRes.hasRoadmap && roadmapRes.roadmap) {
        setRoadmapTasks(roadmapRes.roadmap.tasks || [])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load project details')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project || !id) return
    try {
      const res = await api.updateProject(id, { status: newStatus })
      setProject((prev) => (prev ? { ...prev, status: res.project.status, completionDate: res.project.completionDate } : null))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update project status')
    }
  }

  const handleSaveNotes = async () => {
    if (!project || !id) return
    setIsSavingNotes(true)
    try {
      const res = await api.updateProject(id, { notes: notesDraft })
      setProject((prev) => (prev ? { ...prev, notes: res.project.notes } : null))
      setIsEditingNotes(false)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save notes')
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!project || !id) return
    if (!window.confirm(`Are you sure you want to delete "${project.title}"? This will also remove its deliverable records.`)) {
      return
    }

    setIsDeletingProject(true)
    try {
      await api.deleteProject(id)
      navigate('/projects', { replace: true })
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete project')
      setIsDeletingProject(false)
    }
  }

  const handleAddDeliverable = async (payload: CreateDeliverablePayload) => {
    if (!id) return
    if (editingDeliverable && editingDeliverable.id) {
      await api.updateDeliverable(id, editingDeliverable.id, payload)
    } else {
      await api.addDeliverable(id, payload)
    }
    await loadData()
  }

  const handleDeleteDeliverable = async (deliverableId: string) => {
    if (!id) return
    if (!window.confirm('Are you sure you want to delete this deliverable evidence?')) {
      return
    }
    try {
      await api.deleteDeliverable(id, deliverableId)
      await loadData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete deliverable')
    }
  }

  const handleEditDeliverable = (del: ProjectDeliverable) => {
    setEditingDeliverable({
      id: del.id,
      title: del.title,
      description: del.description,
      type: del.type,
      status: del.status,
      url: del.url,
      roadmapTaskId: del.roadmapTaskId,
    })
    setIsAddModalOpen(true)
  }

  const handleOpenAddDeliverable = () => {
    setEditingDeliverable(null)
    setIsAddModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-3" />
        <p className="text-body-sm text-text-muted">Loading project details...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-xl mx-auto bg-surface border border-border rounded-xl p-8 text-center">
          <h2 className="text-h3 font-bold text-text-primary mb-2">Project Not Found</h2>
          <p className="text-body-sm text-text-secondary mb-6">{error || 'This project does not exist or you do not have permission to view it.'}</p>
          <Link to="/projects">
            <Button variant="primary">Return to Projects</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              to="/projects"
              className="text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              ← Back to Projects
            </Link>
            <Link
              to="/roadmap"
              className="text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              My Roadmap
            </Link>
            <span className="hidden text-body-sm text-text-secondary sm:inline-block">
              {user?.email}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-raised text-text-secondary border border-border">
                {project.source === 'TEMPLATE' ? 'Catalog Template' : 'Self-Directed Custom'}
              </span>
              {project.careerTitle && (
                <span className="text-xs font-medium text-text-secondary bg-primary-subtle text-primary px-2.5 py-0.5 rounded-full">
                  {project.careerTitle}
                </span>
              )}
            </div>
            <h1 className="text-h2 font-bold text-text-primary mb-2">
              {project.title}
            </h1>
            <p className="text-body-sm text-text-muted">
              Created on {new Date(project.createdAt).toLocaleDateString()}
              {project.completionDate && ` • Completed on ${new Date(project.completionDate).toLocaleDateString()}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary">Status:</span>
              <Select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
                className="w-36 text-xs"
              >
                <option value="PLANNED">📋 Planned</option>
                <option value="IN_PROGRESS">⏳ In Progress</option>
                <option value="COMPLETED">✓ Completed</option>
                <option value="ARCHIVED">📦 Archived</option>
              </Select>
            </div>

            <Button
              variant="danger"
              size="sm"
              disabled={isDeletingProject}
              onClick={handleDeleteProject}
            >
              Delete Project
            </Button>
          </div>
        </div>

        {/* Project Overview Card */}
        <Card className="border-border mb-8">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-h4 font-bold text-text-primary mb-2">
                Project Overview
              </h2>
              <p className="text-body-md text-text-secondary whitespace-pre-line">
                {project.description || 'No description provided for this project.'}
              </p>
            </div>

            {/* Skills */}
            {project.skills && project.skills.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Target Competencies & Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-medium px-2.5 py-1 rounded bg-primary-subtle text-primary border border-primary/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="pt-4 border-t border-border flex flex-wrap gap-6 text-body-sm">
              <div>
                <span className="text-xs font-semibold text-text-muted block mb-1">
                  Repository Link:
                </span>
                {project.repositoryUrl ? (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    📁 {project.repositoryUrl} ↗
                  </a>
                ) : (
                  <span className="text-text-muted">Not provided</span>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-text-muted block mb-1">
                  Live Demo Link:
                </span>
                {project.liveDemoUrl ? (
                  <a
                    href={project.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    🌐 {project.liveDemoUrl} ↗
                  </a>
                ) : (
                  <span className="text-text-muted">Not provided</span>
                )}
              </div>
            </div>

            {/* Reflection / Learning Notes */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Learning Notes & Reflection
                </h3>
                {!isEditingNotes && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingNotes(true)}>
                    Edit Notes
                  </Button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-3">
                  <Textarea
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    placeholder="Document architecture decisions, performance trade-offs, and reflections on your learning..."
                    rows={4}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setIsEditingNotes(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" isLoading={isSavingNotes} onClick={handleSaveNotes}>
                      Save Notes
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-body-sm text-text-secondary whitespace-pre-line bg-surface-raised p-4 rounded-lg border border-border">
                  {project.notes || 'No learning reflections recorded yet. Click "Edit Notes" to capture your architectural decisions.'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Deliverables and Practical Evidence Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-h3 font-bold text-text-primary">
                  Deliverables & Practical Evidence ({project.deliverables?.length || 0})
                </h2>
              </div>
              <p className="text-body-sm text-text-secondary">
                Document pull requests, deployed modules, test suites, and documentation that prove your hands-on mastery.
              </p>
            </div>

            <Button variant="primary" size="sm" onClick={handleOpenAddDeliverable}>
              + Add Evidence / Deliverable
            </Button>
          </div>

          <div className="mb-6">
            <Alert variant="info" title="Verification Policy Notice">
              Deliverable records are student-submitted practical evidence. External reviewer or automated verification is not currently supported.
            </Alert>
          </div>

          {project.deliverables && project.deliverables.length > 0 ? (
            <div className="space-y-4">
              {project.deliverables.map((del) => (
                <DeliverableCard
                  key={del.id}
                  deliverable={del}
                  onEdit={handleEditDeliverable}
                  onDelete={handleDeleteDeliverable}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
              <p className="text-body-md font-semibold text-text-primary mb-1">
                No deliverables or evidence attached yet.
              </p>
              <p className="text-body-sm text-text-secondary max-w-md mx-auto mb-4">
                Record your first working module, pull request, demo URL, or technical README to demonstrate your practical progress.
              </p>
              <Button variant="primary" size="sm" onClick={handleOpenAddDeliverable}>
                Add Deliverable
              </Button>
            </div>
          )}
        </div>
      </main>

      <AddDeliverableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddDeliverable}
        roadmapTasks={roadmapTasks}
        initialValues={editingDeliverable}
      />
    </div>
  )
}
