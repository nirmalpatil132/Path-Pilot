import { Badge, Button, Card, CardContent } from '@/components/ui'
import type { DeliverableType, ProjectDeliverable } from '@/lib/api'

interface DeliverableCardProps {
  deliverable: ProjectDeliverable
  onEdit?: (deliverable: ProjectDeliverable) => void
  onDelete?: (deliverableId: string) => void
  isDeleting?: boolean
}

function getTypeLabel(type: DeliverableType): string {
  switch (type) {
    case 'CODE_REPOSITORY':
      return 'Code Repository'
    case 'DEPLOYED_DEMO':
      return 'Live Demo'
    case 'FEATURE_MODULE':
      return 'Feature Module'
    case 'TEST_SUITE':
      return 'Test Suite'
    case 'DESIGN_PROTOTYPE':
      return 'Design Prototype'
    case 'TECHNICAL_DOCS':
      return 'Technical Documentation'
    case 'IMPLEMENTATION_NOTE':
      return 'Implementation Note'
    default:
      return type
  }
}

export function DeliverableCard({
  deliverable,
  onEdit,
  onDelete,
  isDeleting = false,
}: DeliverableCardProps) {
  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-subtle text-primary border border-primary/20">
              {getTypeLabel(deliverable.type)}
            </span>
            <Badge variant={deliverable.status === 'SUBMITTED' ? 'success' : 'default'}>
              {deliverable.status === 'SUBMITTED' ? '✓ Student-submitted' : '📋 Planned'}
            </Badge>
          </div>

          <span className="text-xs text-text-muted">
            Added on {new Date(deliverable.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h4 className="text-body-lg font-bold text-text-primary mb-1">
          {deliverable.title}
        </h4>

        {deliverable.description && (
          <p className="text-body-sm text-text-secondary whitespace-pre-line mb-3">
            {deliverable.description}
          </p>
        )}

        {deliverable.roadmapTaskTitle && (
          <div className="mb-3 flex items-center gap-2 text-xs text-text-secondary bg-surface-raised border border-border rounded px-2.5 py-1.5">
            <span className="font-semibold text-text-primary">Linked Roadmap Task:</span>
            <span className="line-clamp-1">{deliverable.roadmapTaskTitle}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border mt-2">
          <div>
            {deliverable.url ? (
              <a
                href={deliverable.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-sm font-medium text-primary hover:underline inline-flex items-center gap-1.5"
              >
                <span>🔗 View Deliverable Evidence</span>
                <span className="text-xs text-text-muted" aria-hidden="true">↗</span>
              </a>
            ) : (
              <span className="text-xs text-text-muted">No external URL attached</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(deliverable)}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                disabled={isDeleting}
                onClick={() => onDelete(deliverable.id)}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
