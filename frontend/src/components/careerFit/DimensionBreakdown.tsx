import { Card, CardContent, CardHeader, Badge } from '@/components/ui'
import type { CareerFitResult } from '@/lib/api'

interface DimensionBreakdownProps {
  fit: CareerFitResult
}

export function DimensionBreakdown({ fit }: DimensionBreakdownProps) {
  const dimensions = [
    {
      key: 'skills' as const,
      name: 'Technical Skills',
      configuredWeight: '50%',
      detail: fit.dimensionScores.skills,
      icon: '⚡',
    },
    {
      key: 'projects' as const,
      name: 'Projects & Experience',
      configuredWeight: '25%',
      detail: fit.dimensionScores.projects,
      icon: '🛠️',
    },
    {
      key: 'interests' as const,
      name: 'Domain Interests',
      configuredWeight: '15%',
      detail: fit.dimensionScores.interests,
      icon: '🎯',
    },
    {
      key: 'academics' as const,
      name: 'Academic Context',
      configuredWeight: '10%',
      detail: fit.dimensionScores.academics,
      icon: '🎓',
    },
  ]

  const hasExcluded = fit.excludedDimensions && fit.excludedDimensions.length > 0

  return (
    <div className="space-y-4" data-testid="dimension-breakdown-container">
      <div>
        <h3 className="text-h3 font-semibold text-text-primary">
          Explainable Scoring Breakdown
        </h3>
        <p className="mt-1 text-body-sm text-text-secondary">
          Scores are deterministically evaluated across 4 dimensions according to policy v{fit.policyVersion}.
        </p>
      </div>

      {hasExcluded && (
        <div className="rounded-lg border border-warning/40 bg-warning/5 p-4 text-body-sm text-text-secondary">
          <p className="font-medium text-text-primary">
            ℹ️ Missing-Data Normalization Applied
          </p>
          <p className="mt-1 text-caption text-text-secondary">
            Unavailable dimensions are excluded and remaining weights are proportionally normalized so that unrecorded information is never penalized as negative evidence.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {dimensions.map((dim) => {
          const isAvail = dim.detail.isAvailable
          const effWeight = Math.round(dim.detail.effectiveWeight * 100)

          return (
            <Card
              key={dim.key}
              className={`border transition-colors ${
                isAvail ? 'border-border bg-surface' : 'border-border/60 bg-surface-muted/30'
              }`}
              data-testid={`dimension-card-${dim.key}`}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-body font-semibold text-text-primary">
                    <span>{dim.icon}</span>
                    <span>{dim.name}</span>
                  </span>
                  {isAvail ? (
                    <span
                      className="font-mono text-body font-bold text-text-primary"
                      data-testid={`dimension-score-${dim.key}`}
                    >
                      {dim.detail.score}/100
                    </span>
                  ) : (
                    <Badge variant="warning">
                      Excluded
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-caption text-text-muted">
                  <span>Configured: {dim.configuredWeight}</span>
                  <span>•</span>
                  <span>Effective: {effWeight}%</span>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2">
                {isAvail ? (
                  <div className="space-y-2">
                    <p className="text-caption text-text-secondary">
                      {dim.detail.explanation}
                    </p>
                    {dim.detail.evidence && dim.detail.evidence.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {dim.detail.evidence.slice(0, 3).map((ev, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-secondary"
                          >
                            ✓ {ev}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-caption text-text-muted italic">
                    {dim.detail.explanation || 'No profile evidence recorded for this dimension.'}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
