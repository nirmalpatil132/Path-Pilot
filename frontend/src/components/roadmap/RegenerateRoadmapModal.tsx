import { useState } from 'react'
import { Button } from '@/components/ui'
import type { CareerListItem } from '@/lib/api'

interface RegenerateRoadmapModalProps {
  isOpen: boolean
  onClose: () => void
  currentCareerSlug: string
  currentCareerTitle: string
  currentVersion: number
  availableCareers: CareerListItem[]
  onConfirm: (options: {
    careerSlug: string
    weeklyHours: number
    preserveCompletedTasks: boolean
  }) => Promise<void>
}

export function RegenerateRoadmapModal({
  isOpen,
  onClose,
  currentCareerSlug,
  currentCareerTitle,
  currentVersion,
  availableCareers,
  onConfirm,
}: RegenerateRoadmapModalProps) {
  const [selectedSlug, setSelectedSlug] = useState(currentCareerSlug)
  const [weeklyHours, setWeeklyHours] = useState(12)
  const [preserveCompleted, setPreserveCompleted] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      await onConfirm({
        careerSlug: selectedSlug,
        weeklyHours,
        preserveCompletedTasks: preserveCompleted,
      })
      onClose()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to regenerate roadmap')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface rounded-xl border border-border shadow-xl overflow-hidden">
        <div className="p-6 border-b border-border bg-surface-muted/30">
          <h3 className="text-h3 font-bold text-text-primary">
            Regenerate 30-Day Learning Roadmap
          </h3>
          <p className="text-body-sm text-text-secondary mt-1">
            Current plan: <strong className="text-text-primary">{currentCareerTitle}</strong> (Version {currentVersion})
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-lg text-body-sm text-amber-800 dark:text-amber-200">
            ⚠️ <strong>Preservation Policy:</strong> Regenerating will archive your Version {currentVersion} roadmap. No completed records or history will be erased.
          </div>

          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-lg text-body-sm text-rose-700 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          {/* Career Selection */}
          <div>
            <label htmlFor="regen-career-select" className="block text-body-sm font-semibold text-text-primary mb-1.5">
              Target Career Path
            </label>
            <select
              id="regen-career-select"
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-border bg-surface text-text-primary text-body-sm focus:border-focus focus:ring-1 focus:ring-focus outline-none"
            >
              {availableCareers.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title} ({c.category})
                </option>
              ))}
            </select>
          </div>

          {/* Weekly Hours Commitment */}
          <div>
            <label htmlFor="regen-hours-select" className="block text-body-sm font-semibold text-text-primary mb-1.5">
              Weekly Time Budget Commitment
            </label>
            <select
              id="regen-hours-select"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-border bg-surface text-text-primary text-body-sm focus:border-focus focus:ring-1 focus:ring-focus outline-none"
            >
              <option value={8}>8 hours/week (Light / Part-time study)</option>
              <option value={12}>12 hours/week (Balanced standard)</option>
              <option value={15}>15 hours/week (Accelerated study)</option>
              <option value={20}>20 hours/week (Intensive sprint)</option>
            </select>
          </div>

          {/* Preserve completed tasks checkbox */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="preserve-tasks"
              checked={preserveCompleted}
              onChange={(e) => setPreserveCompleted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-focus"
            />
            <label htmlFor="preserve-tasks" className="text-body-sm text-text-secondary">
              <strong className="text-text-primary">Preserve completed skills: </strong>
              Automatically carry over completed tasks for skills already mastered in your previous roadmap.
            </label>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-border bg-surface-muted/30 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Regenerating...' : 'Confirm & Regenerate'}
          </Button>
        </div>
      </div>
    </div>
  )
}
