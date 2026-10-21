import { useState } from 'react'
import { Button, Card, CardContent, Input, Select, Textarea } from '@/components/ui'
import { WORK_MODES, WEEKLY_HOURS, TARGET_TIMELINES } from './constants'
import type { StudentProfile } from '@/lib/api'

interface Step7ConstraintsProps {
  initialData: Partial<StudentProfile>
  onSaveAndContinue: (data: Partial<StudentProfile>) => Promise<void>
  onBack: () => void
  isSaving: boolean
}

export function Step7Constraints({
  initialData,
  onSaveAndContinue,
  onBack,
  isSaving,
}: Step7ConstraintsProps) {
  const [preferredLocation, setPreferredLocation] = useState(
    initialData.preferredLocation || '',
  )
  const [workMode, setWorkMode] = useState(initialData.workMode || 'flexible')
  const [weeklyHours, setWeeklyHours] = useState(initialData.weeklyHours || '10-20 hours')
  const [targetTimeline, setTargetTimeline] = useState(
    initialData.targetTimeline || '3-6 months',
  )
  const [financialContext, setFinancialContext] = useState(
    initialData.financialContext || '',
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSaveAndContinue({
      preferredLocation: preferredLocation.trim() || null,
      workMode: workMode || null,
      weeklyHours: weeklyHours || null,
      targetTimeline: targetTimeline || null,
      financialContext: financialContext.trim() || null,
    })
  }

  const handleSkip = async () => {
    await onSaveAndContinue({
      preferredLocation: null,
      workMode: 'flexible',
      weeklyHours: null,
      targetTimeline: null,
      financialContext: null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-caption font-semibold text-primary">
          Step 7 of 8 • Practical Constraints (Optional)
        </span>
        <h2 className="mt-3 text-h1 text-text-primary">Preferences & Realities</h2>
        <p className="mt-2 text-body text-text-secondary">
          These optional preferences help tailor realistic timelines. All fields can be adjusted or
          skipped.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              id="prefLocation"
              label="Preferred Job / Internship Locations"
              placeholder="e.g. Bangalore, Pune, Hyderabad, Remote"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              helperText="Cities or states you are comfortable relocating to, or Remote."
            />

            <Select
              id="workMode"
              label="Work Mode Preference"
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
            >
              {WORK_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </Select>

            <Select
              id="weeklyHours"
              label="Available Time for Career Prep"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(e.target.value)}
              helperText="Realistic hours per week outside college classes and exams."
            >
              {WEEKLY_HOURS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.label}
                </option>
              ))}
            </Select>

            <Select
              id="targetTimeline"
              label="Target Placement / Internship Timeline"
              value={targetTimeline}
              onChange={(e) => setTargetTimeline(e.target.value)}
            >
              {TARGET_TIMELINES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            id="financialContext"
            label="Financial or Equipment Constraints (Optional)"
            placeholder="e.g. Relying primarily on open-source tools; limited budget for paid bootcamps or expensive certifications."
            rows={2}
            value={financialContext}
            onChange={(e) => setFinancialContext(e.target.value)}
            helperText="Helps PathPilot prioritize free, high-quality open-source projects and platforms over costly paid resources."
          />

          <div className="flex items-center justify-between border-t border-border pt-6">
            <Button type="button" variant="secondary" onClick={onBack} disabled={isSaving}>
              ← Back
            </Button>
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" onClick={handleSkip} disabled={isSaving}>
                Skip this step
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Review Profile →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
