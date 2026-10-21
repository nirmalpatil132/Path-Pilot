import { Badge } from '@/components/ui'
import type { CareerFitResult } from '@/lib/api'

interface FitScoreBadgeProps {
  fit: CareerFitResult
  size?: 'sm' | 'md' | 'lg'
  showBar?: boolean
}

export function FitScoreBadge({ fit, size = 'md', showBar = true }: FitScoreBadgeProps) {
  if (fit.status === 'INSUFFICIENT_DATA' || fit.scoreDisplay === null) {
    return (
      <div className="flex flex-col gap-1.5" data-testid="fit-insufficient-badge">
        <div className="flex items-center gap-2">
          <Badge variant="warning">
            Insufficient Evidence
          </Badge>
          <span className="text-caption text-text-muted">
            Profile needs more data
          </span>
        </div>
        {fit.dataLimitations && fit.dataLimitations.length > 0 && (
          <p className="text-caption text-text-secondary">
            {fit.dataLimitations[0]}
          </p>
        )}
      </div>
    )
  }

  const score = fit.scoreDisplay
  const fitLevel = fit.fitLevel

  const getVariant = () => {
    if (score >= 75) return 'success'
    if (score >= 50) return 'default'
    return 'neutral'
  }

  const badgeVariant = getVariant()

  return (
    <div className="flex flex-col gap-2" data-testid="fit-score-badge">
      <div className="flex items-center gap-3">
        <span
          className={`font-bold font-mono text-text-primary ${
            size === 'lg' ? 'text-h2 md:text-h1' : size === 'sm' ? 'text-body font-semibold' : 'text-h3'
          }`}
          data-testid="fit-score-percentage"
        >
          {score}%
        </span>
        <Badge variant={badgeVariant} data-testid="fit-level-badge">
          {fitLevel}
        </Badge>
      </div>

      {showBar && (
        <div className="w-full">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Career fit score: ${score}%, ${fitLevel}`}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                score >= 75 ? 'bg-success' : score >= 50 ? 'bg-primary' : 'bg-warning'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
