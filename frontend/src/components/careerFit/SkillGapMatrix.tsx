import { Badge, Card, CardContent, CardHeader } from '@/components/ui'
import type { SkillGapAnalysis, SkillGapItem } from '@/lib/api'

interface SkillGapMatrixProps {
  analysis: SkillGapAnalysis
}

export function SkillGapMatrix({ analysis }: SkillGapMatrixProps) {
  const criticalGaps = analysis.gaps.filter((g) => g.category === 'CRITICAL_MISSING')
  const recommendedGaps = analysis.gaps.filter((g) => g.category === 'RECOMMENDED_NEXT')
  const optionalGaps = analysis.gaps.filter((g) => g.category === 'OPTIONAL_ADVANTAGE')

  const renderGapGroup = (
    title: string,
    badgeVariant: 'danger' | 'warning' | 'neutral',
    gaps: SkillGapItem[],
    description: string,
    testId: string,
  ) => {
    return (
      <div className="space-y-3" data-testid={testId}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={badgeVariant}>{title}</Badge>
            <span className="text-body-sm font-semibold text-text-primary">
              ({gaps.length})
            </span>
          </div>
          <span className="text-caption text-text-muted hidden sm:inline-block">
            {description}
          </span>
        </div>

        {gaps.length === 0 ? (
          <div className="rounded-lg border border-border/60 bg-surface-muted/20 p-4 text-caption text-text-secondary">
            ✓ No missing skills in this priority tier. You have recorded all relevant competencies.
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {gaps.map((gap) => (
              <div
                key={gap.id}
                className="flex flex-col justify-between rounded-lg border border-border bg-surface p-3.5 transition-shadow hover:shadow-xs"
                data-testid={`skill-gap-item-${gap.name}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-body-sm font-semibold text-text-primary">
                      {gap.name}
                    </span>
                    <span className="text-[11px] font-medium text-text-muted">
                      {gap.categoryLabel}
                    </span>
                  </div>
                  {gap.description && (
                    <p className="mt-1 text-caption text-text-secondary leading-snug">
                      {gap.description}
                    </p>
                  )}
                </div>
                <div className="mt-2.5 pt-2 border-t border-border/50 text-[11px] text-text-muted">
                  Rule: {gap.classificationRule}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="skill-gap-matrix">
      {/* Overview Card: Core Coverage and Matched Skills */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="p-4 sm:p-6 pb-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-h3 font-semibold text-text-primary">
                Skills Alignment &amp; Coverage
              </h3>
              <p className="text-body-sm text-text-secondary">
                Matched against {analysis.totalCoreSkills} core requirements and {analysis.totalSupportingSkills} supporting competencies.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-h3 font-bold text-primary">
                {analysis.coreCoveragePercentage}%
              </span>
              <span className="text-caption text-text-secondary">Core Coverage</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-2 space-y-4">
          {/* Progress bar */}
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
            role="progressbar"
            aria-valuenow={analysis.coreCoveragePercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Core skill coverage: ${analysis.coreCoveragePercentage}%`}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${analysis.coreCoveragePercentage}%` }}
            />
          </div>

          {/* Matched Skills */}
          {analysis.allMatchedSkills && analysis.allMatchedSkills.length > 0 && (
            <div>
              <h4 className="text-caption font-semibold uppercase tracking-wider text-text-secondary mb-2">
                Demonstrated in Your Profile ({analysis.allMatchedSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5" data-testid="matched-skills-list">
                {analysis.allMatchedSkills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-md border border-success/30 bg-success/10 px-2.5 py-1 text-caption font-medium text-success-strong"
                  >
                    <span>✓</span>
                    <span>{s}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Educational Notice */}
      <div className="rounded-lg border border-border bg-surface-muted/30 p-4 text-body-sm text-text-secondary">
        <p className="font-medium text-text-primary">
          💡 Educational Guidance Note
        </p>
        <p className="mt-1 text-caption text-text-secondary leading-relaxed">
          Unrecorded skills represent areas not currently found in your profile. They are not proof of lack of capability — if you already know any of these tools or concepts, simply add them to your student profile anytime to update your match score.
        </p>
      </div>

      {/* Tier 1: Critical Missing */}
      {renderGapGroup(
        'Critical Missing',
        'danger',
        criticalGaps,
        'Mandatory core competencies required for entry-level hiring',
        'critical-missing-group',
      )}

      {/* Tier 2: Recommended Next */}
      {renderGapGroup(
        'Recommended Next',
        'warning',
        recommendedGaps,
        'High-value supporting skills that provide strong competitive advantages',
        'recommended-next-group',
      )}

      {/* Tier 3: Optional Advantage */}
      {renderGapGroup(
        'Optional Advantage',
        'neutral',
        optionalGaps,
        'Complementary tools and prerequisites that accelerate specialized workflows',
        'optional-advantage-group',
      )}
    </div>
  )
}
