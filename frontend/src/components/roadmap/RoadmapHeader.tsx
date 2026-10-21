import { useState } from 'react'
import { Badge, Button, Card, CardContent, ProgressBar } from '@/components/ui'
import type { Roadmap } from '@/lib/api'

interface RoadmapHeaderProps {
  roadmap: Roadmap
  onOpenRegenerate: () => void
}

export function RoadmapHeader({ roadmap, onOpenRegenerate }: RoadmapHeaderProps) {
  const [showAssumptions, setShowAssumptions] = useState(false)

  return (
    <Card className="border-border bg-surface shadow-sm overflow-hidden mb-8">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {roadmap.careerCategory && (
                <Badge variant="primary">
                  {roadmap.careerCategory}
                </Badge>
              )}
              <Badge variant="neutral">
                Version {roadmap.version}
              </Badge>
              <Badge variant="success">
                {roadmap.status === 'ACTIVE' ? 'Active Roadmap' : roadmap.status}
              </Badge>
              <Badge variant="neutral">
                {roadmap.weeklyHoursAssumed} hrs/week
              </Badge>
            </div>
            <h1 className="text-h2 font-bold text-text-primary tracking-tight">
              {roadmap.careerTitle}
            </h1>
            <p className="text-body text-text-secondary mt-1 max-w-2xl">
              A structured, 30-day personalized learning roadmap prioritized from your verified profile skills and skill gaps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenRegenerate}
              className="whitespace-nowrap"
            >
              🔄 Regenerate Roadmap
            </Button>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between text-body-sm font-medium mb-2">
            <span className="text-text-primary flex items-center gap-2">
              Overall Roadmap Progress
              <span className="text-text-muted font-normal">
                ({roadmap.completedTasks} of {roadmap.totalTasks} tasks complete)
              </span>
            </span>
            <span className="font-semibold text-primary">
              {roadmap.progressPercentage.toFixed(1)}%
            </span>
          </div>
          <ProgressBar
            value={roadmap.progressPercentage}
            label="Overall Roadmap Progress"
          />
        </div>

        {/* Milestone Metric Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="rounded-lg bg-surface-muted/50 p-3 border border-border/50">
            <div className="text-caption text-text-secondary uppercase tracking-wider font-semibold">
              Duration
            </div>
            <div className="text-h3 font-bold text-text-primary mt-0.5">
              {roadmap.totalDays} Days
            </div>
            <div className="text-caption text-text-muted mt-0.5">4 Weekly Sections</div>
          </div>

          <div className="rounded-lg bg-surface-muted/50 p-3 border border-border/50">
            <div className="text-caption text-text-secondary uppercase tracking-wider font-semibold">
              Completed
            </div>
            <div className="text-h3 font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {roadmap.completedTasks}
            </div>
            <div className="text-caption text-text-muted mt-0.5">Tasks verified</div>
          </div>

          <div className="rounded-lg bg-surface-muted/50 p-3 border border-border/50">
            <div className="text-caption text-text-secondary uppercase tracking-wider font-semibold">
              In Progress
            </div>
            <div className="text-h3 font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {roadmap.inProgressTasks}
            </div>
            <div className="text-caption text-text-muted mt-0.5">Active right now</div>
          </div>

          <div className="rounded-lg bg-surface-muted/50 p-3 border border-border/50">
            <div className="text-caption text-text-secondary uppercase tracking-wider font-semibold">
              Remaining
            </div>
            <div className="text-h3 font-bold text-text-secondary mt-0.5">
              {roadmap.totalTasks - roadmap.completedTasks}
            </div>
            <div className="text-caption text-text-muted mt-0.5">
              {roadmap.blockedTasks > 0 ? `${roadmap.blockedTasks} blocked` : 'Ready to start'}
            </div>
          </div>
        </div>

        {/* Assumptions & Disclaimers Accordion */}
        <div className="mt-6 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={() => setShowAssumptions(!showAssumptions)}
            className="flex items-center justify-between w-full text-body-sm font-medium text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded py-1"
          >
            <span className="flex items-center gap-1.5">
              ℹ️ Roadmap Assumptions & Scope Boundaries
              <span className="text-caption text-text-muted font-normal">
                ({roadmap.assumptions.length} notes)
              </span>
            </span>
            <span className="text-text-muted text-xs">
              {showAssumptions ? '▲ Hide' : '▼ View Details'}
            </span>
          </button>

          {showAssumptions && (
            <div className="mt-3 space-y-2 text-caption text-text-secondary bg-surface-muted/40 p-3.5 rounded-lg border border-border/40">
              <ul className="list-disc list-inside space-y-1">
                {roadmap.assumptions.map((assumption, idx) => (
                  <li key={idx}>{assumption}</li>
                ))}
              </ul>
              {roadmap.deferredSkills.length > 0 && (
                <div className="pt-2 border-t border-border/40 text-caption">
                  <span className="font-semibold text-text-primary">
                    Skills deferred to post-30-day roadmap:{' '}
                  </span>
                  <span className="text-text-secondary">
                    {roadmap.deferredSkills.join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
