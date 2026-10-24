import { Link } from 'react-router-dom'
import { Badge, Card, CardContent } from '@/components/ui'
import type { Project, ProjectStatus } from '@/lib/api'

interface ProjectCardProps {
  project: Project
}

function getStatusBadge(status: ProjectStatus) {
  switch (status) {
    case 'IN_PROGRESS':
      return <Badge variant="primary">⏳ In Progress</Badge>
    case 'COMPLETED':
      return <Badge variant="success">✓ Completed</Badge>
    case 'PLANNED':
      return <Badge variant="default">📋 Planned</Badge>
    case 'ARCHIVED':
      return <Badge variant="neutral">📦 Archived</Badge>
    default:
      return <Badge variant="default">{status}</Badge>
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="flex flex-col justify-between transition-all hover:border-primary-subtle hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge(project.status)}
            {project.careerTitle && (
              <span className="inline-flex items-center text-xs font-medium text-text-secondary bg-surface-raised px-2.5 py-0.5 rounded-full border border-border">
                {project.careerTitle}
              </span>
            )}
            <span className="text-xs text-text-muted">
              {project.source === 'TEMPLATE' ? 'Template' : 'Custom'}
            </span>
          </div>

          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-border text-text-secondary">
            {project.deliverablesCount} {project.deliverablesCount === 1 ? 'Deliverable' : 'Deliverables'}
          </span>
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="text-h4 font-bold text-text-primary hover:text-primary transition-colors block mb-2 line-clamp-1"
        >
          {project.title}
        </Link>

        <p className="text-body-sm text-text-secondary line-clamp-2 mb-4">
          {project.description || 'No description provided.'}
        </p>

        {project.skills && project.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-xs px-2 py-0.5 rounded bg-primary-subtle text-primary font-medium"
              >
                {skill}
              </span>
            ))}
            {project.skills.length > 3 && (
              <span className="text-xs px-1.5 py-0.5 text-text-muted">
                +{project.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
          <div className="flex items-center gap-3 text-xs text-text-muted">
            {project.repositoryUrl && (
              <span className="inline-flex items-center gap-1 text-text-secondary">
                <span aria-hidden="true">📁</span> Repo
              </span>
            )}
            {project.liveDemoUrl && (
              <span className="inline-flex items-center gap-1 text-text-secondary">
                <span aria-hidden="true">🌐</span> Demo
              </span>
            )}
            {!project.repositoryUrl && !project.liveDemoUrl && (
              <span>No public links attached</span>
            )}
          </div>

          <Link
            to={`/projects/${project.id}`}
            className="text-body-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            Open Project →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
