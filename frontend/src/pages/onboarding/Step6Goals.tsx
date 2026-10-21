import { useState } from 'react'
import { Button, Card, CardContent } from '@/components/ui'
import { GOALS } from './constants'

interface Step6GoalsProps {
  initialPrimaryGoal: string | null
  initialSecondaryGoals: string[]
  onSaveAndContinue: (data: {
    primaryGoal: string | null
    secondaryGoals: string[]
  }) => Promise<void>
  onBack: () => void
  isSaving: boolean
}

export function Step6Goals({
  initialPrimaryGoal,
  initialSecondaryGoals,
  onSaveAndContinue,
  onBack,
  isSaving,
}: Step6GoalsProps) {
  const [primaryGoal, setPrimaryGoal] = useState<string | null>(initialPrimaryGoal || 'job')
  const [secondaryGoals, setSecondaryGoals] = useState<string[]>(initialSecondaryGoals || [])

  const handleToggleSecondary = (id: string) => {
    if (id === primaryGoal) return
    setSecondaryGoals((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleSelectPrimary = (id: string) => {
    setPrimaryGoal(id)
    // Remove from secondary if it was there
    setSecondaryGoals((prev) => prev.filter((item) => item !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSaveAndContinue({
      primaryGoal,
      secondaryGoals,
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-caption font-semibold text-primary">
          Step 6 of 8 • Primary & Secondary Goals
        </span>
        <h2 className="mt-3 text-h1 text-text-primary">What is your primary focus?</h2>
        <p className="mt-2 text-body text-text-secondary">
          Select your main target after college. It is completely okay to explore or feel unsure.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-8 p-6">
          {/* Primary Goal Selection */}
          <div>
            <h3 className="text-h3 font-semibold text-text-primary">Primary Goal</h3>
            <p className="text-caption text-text-secondary">Choose the one that matters most today</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {GOALS.map((goal) => {
                const isSelected = primaryGoal === goal.id
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => handleSelectPrimary(goal.id)}
                    aria-pressed={isSelected}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary'
                        : 'border-border bg-surface hover:border-primary/40'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 rounded-full border ${
                        isSelected
                          ? 'border-4 border-primary bg-white'
                          : 'border-border bg-surface'
                      }`}
                    />
                    <div>
                      <h4 className="text-body font-semibold text-text-primary">{goal.title}</h4>
                      <p className="mt-0.5 text-caption text-text-secondary">{goal.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Secondary Goals */}
          <div className="border-t border-border pt-6">
            <h3 className="text-h3 font-semibold text-text-primary">
              Secondary / Backup Goals (Optional)
            </h3>
            <p className="text-caption text-text-secondary">
              Keep your options open by choosing parallel paths
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {GOALS.filter((g) => g.id !== primaryGoal).map((goal) => {
                const isSelected = secondaryGoals.includes(goal.id)
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => handleToggleSecondary(goal.id)}
                    className={`rounded-full px-3 py-1.5 text-body-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                      isSelected
                        ? 'border border-primary bg-primary/10 text-primary font-semibold'
                        : 'border border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {goal.title}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <Button type="button" variant="secondary" onClick={onBack} disabled={isSaving}>
              ← Back
            </Button>
            <Button type="button" onClick={handleSubmit} isLoading={isSaving}>
              Continue to Preferences →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
