import { Badge, Button, Card, CardContent } from '@/components/ui'
import type { ProjectRecommendation } from '@/lib/api'

interface ProjectRecommendationCardProps {
  recommendation: ProjectRecommendation
  onStartProject: (recommendation: ProjectRecommendation) => void
  isStarting?: boolean
}

export function ProjectRecommendationCard({
  recommendation,
  onStartProject,
  isStarting = false,
}: ProjectRecommendationCardProps) {
  const getPriorityBadge = (priority: ProjectRecommendation['priority']) => {
    switch (priority) {
      case 'HIGH':
        return <Badge variant="warning">⭐ High Priority</Badge>
      case 'RECOMMENDED':
        return <Badge variant="primary">💡 Recommended</Badge>
      case 'ELECTIVE':
        return <Badge variant="neutral">Elective</Badge>
    }
  }

  return (
    <Card className="flex flex-col justify-between border-border hover:border-primary-subtle transition-all">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {getPriorityBadge(recommendation.priority)}
            <span className="text-xs font-medium text-text-secondary bg-surface-raised px-2.5 py-0.5 rounded-full border border-border">
              {recommendation.careerTitle}
            </span>
          </div>

          {recommendation.isAlreadyStarted ? (
            <Badge variant="success">✓ Already in Workspace</Badge>
          ) : (
            <span className="text-xs text-text-muted">Catalog Template</span>
          )}
        </div>

        <h3 className="text-h4 font-bold text-text-primary mb-2 line-clamp-1">
          {recommendation.title}
        </h3>

        <p className="text-body-sm text-text-secondary line-clamp-2 mb-4">
          {recommendation.description}
        </p>

        {/* Why Recommended Reasons */}
        <div className="bg-surface-raised border border-border rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Why Recommended
          </p>
          <ul className="text-xs text-text-secondary space-y-1">
            {recommendation.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Skills Tag Cloud */}
        {recommendation.skills && recommendation.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Skills Exercised
            </p>
            <div className="flex flex-wrap gap-1.5">
              {recommendation.skills.map((skill) => {
                const isCritical = recommendation.matchedCriticalSkills.includes(skill)
                const isRecommended = recommendation.matchedRecommendedSkills.includes(skill)
                return (
                  <span
                    key={skill}
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      isCritical
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300'
                        : isRecommended
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-300'
                        : 'bg-surface text-text-secondary border border-border'
                    }`}
                  >
                    {skill} {isCritical && '★'}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-border mt-auto flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {recommendation.isAlreadyStarted
              ? `Status: ${recommendation.existingProjectStatus || 'Active'}`
              : 'Ready to build'}
          </span>

          <Button
            size="sm"
            variant={recommendation.isAlreadyStarted ? 'secondary' : 'primary'}
            disabled={recommendation.isAlreadyStarted || isStarting}
            onClick={() => onStartProject(recommendation)}
          >
            {recommendation.isAlreadyStarted ? 'In Workspace' : 'Start This Project →'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
