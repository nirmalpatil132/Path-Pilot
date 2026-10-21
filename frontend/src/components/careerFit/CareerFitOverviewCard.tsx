import { Link } from 'react-router-dom'
import { Badge, Button, Card, CardContent } from '@/components/ui'
import type { CareerFitResult } from '@/lib/api'
import { FitScoreBadge } from './FitScoreBadge'
import { getCategoryBadgeVariant } from '@/pages/careers/categoryBadge'

interface CareerFitOverviewCardProps {
  fit: CareerFitResult
  rank: number
}

export function CareerFitOverviewCard({ fit, rank }: CareerFitOverviewCardProps) {
  const isInsufficient = fit.status === 'INSUFFICIENT_DATA' || fit.scoreDisplay === null

  return (
    <Card
      className={`border transition-all hover:border-primary/40 ${
        rank === 1 && !isInsufficient ? 'border-primary/30 ring-1 ring-primary/20 bg-surface' : 'border-border bg-surface'
      }`}
      data-testid={`career-fit-card-${fit.slug}`}
    >
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header row: Rank, Title, Category, Fit Score */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-caption font-bold text-text-muted">
                #{rank}
              </span>
              <Badge variant={getCategoryBadgeVariant(fit.category)}>
                {fit.category}
              </Badge>
              {rank === 1 && !isInsufficient && (
                <Badge variant="success">
                  Strongest Current Match
                </Badge>
              )}
            </div>
            <h3 className="text-h3 font-bold text-text-primary">
              <Link
                to={`/careers/${fit.slug}`}
                className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:underline"
              >
                {fit.title}
              </Link>
            </h3>
          </div>

          <div className="shrink-0 sm:text-right">
            <FitScoreBadge fit={fit} size="md" showBar={false} />
          </div>
        </div>

        {/* Dimension score pills */}
        {!isInsufficient && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-1">
            <div className="rounded-md border border-border/70 bg-surface-muted/40 p-2 text-center">
              <p className="text-[11px] text-text-muted">Skills (50%)</p>
              <p className="font-mono text-body-sm font-semibold text-text-primary">
                {fit.dimensionScores.skills.isAvailable ? `${fit.dimensionScores.skills.score}/100` : 'Excluded'}
              </p>
            </div>
            <div className="rounded-md border border-border/70 bg-surface-muted/40 p-2 text-center">
              <p className="text-[11px] text-text-muted">Projects (25%)</p>
              <p className="font-mono text-body-sm font-semibold text-text-primary">
                {fit.dimensionScores.projects.isAvailable ? `${fit.dimensionScores.projects.score}/100` : 'Excluded'}
              </p>
            </div>
            <div className="rounded-md border border-border/70 bg-surface-muted/40 p-2 text-center">
              <p className="text-[11px] text-text-muted">Interests (15%)</p>
              <p className="font-mono text-body-sm font-semibold text-text-primary">
                {fit.dimensionScores.interests.isAvailable ? `${fit.dimensionScores.interests.score}/100` : 'Excluded'}
              </p>
            </div>
            <div className="rounded-md border border-border/70 bg-surface-muted/40 p-2 text-center">
              <p className="text-[11px] text-text-muted">Academics (10%)</p>
              <p className="font-mono text-body-sm font-semibold text-text-primary">
                {fit.dimensionScores.academics.isAvailable ? `${fit.dimensionScores.academics.score}/100` : 'Excluded'}
              </p>
            </div>
          </div>
        )}

        {/* Strengths & evidence snippet */}
        {fit.strengths && fit.strengths.length > 0 && (
          <p className="text-body-sm text-text-secondary">
            <span className="font-semibold text-text-primary">Key Match: </span>
            {fit.strengths[0]}
          </p>
        )}

        {/* Data limitation or missing dimensions notice */}
        {fit.dataLimitations && fit.dataLimitations.length > 0 && (
          <p className="text-caption text-text-muted">
            <span className="font-semibold">Note: </span>
            {fit.dataLimitations[0]}
          </p>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="flex items-center gap-2 text-caption text-text-muted">
            <span>Core coverage: {fit.coreCoveragePercentage}%</span>
            <span>•</span>
            <span>Matched: {fit.matchedSkills.length} skills</span>
          </div>

          <Link to={`/careers/${fit.slug}`}>
            <Button variant="secondary" size="sm">
              Inspect Fit &amp; Skill Gaps →
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
