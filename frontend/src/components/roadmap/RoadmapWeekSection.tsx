import { ProgressBar } from '@/components/ui'
import { RoadmapTaskCard } from './RoadmapTaskCard'
import type { RoadmapTask, RoadmapTaskStatus, RoadmapWeek } from '@/lib/api'

interface RoadmapWeekSectionProps {
  week: RoadmapWeek
  onUpdateStatus: (taskId: string, status: RoadmapTaskStatus, notes?: string) => Promise<void>
}

export function RoadmapWeekSection({ week, onUpdateStatus }: RoadmapWeekSectionProps) {
  const totalHours = (week.totalMinutes / 60).toFixed(1).replace('.0', '')

  return (
    <section className="mb-10 last:mb-0">
      {/* Week Header */}
      <div className="bg-surface rounded-xl border border-border p-5 md:p-6 mb-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-caption font-bold text-primary uppercase tracking-wider">
                {week.dayRange}
              </span>
              <span className="text-text-muted">•</span>
              <span className="text-caption text-text-secondary">
                ~{totalHours} planned task hours
              </span>
            </div>
            <h2 className="text-h3 font-bold text-text-primary">
              {week.title}
            </h2>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right">
              <div className="text-caption text-text-secondary">
                {week.completedTasks} of {week.totalTasks} complete
              </div>
              <div className="text-body-sm font-bold text-primary">
                {week.progressPercentage.toFixed(0)}%
              </div>
            </div>
            <div className="w-20">
              <ProgressBar
                value={week.progressPercentage}
                label={`${week.title} progress`}
              />
            </div>
          </div>
        </div>

        {/* Objective & Milestone Callout */}
        <div className="mt-4 pt-3.5 border-t border-border/60 grid sm:grid-cols-2 gap-3 text-body-sm">
          <div className="bg-surface-muted/40 p-3 rounded-lg border border-border/30">
            <div className="text-caption uppercase font-semibold text-text-secondary tracking-wider">
              🎯 Weekly Objective
            </div>
            <p className="text-text-primary mt-0.5 text-body-sm">
              {week.objective}
            </p>
          </div>

          <div className="bg-surface-muted/40 p-3 rounded-lg border border-border/30">
            <div className="text-caption uppercase font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider">
              🏆 Measurable Milestone Outcome
            </div>
            <p className="text-text-primary mt-0.5 text-body-sm">
              {week.milestoneOutcome}
            </p>
          </div>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-4 pl-0 sm:pl-2">
        {week.tasks.map((task: RoadmapTask) => (
          <RoadmapTaskCard
            key={task.id}
            task={task}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
      </div>
    </section>
  )
}
