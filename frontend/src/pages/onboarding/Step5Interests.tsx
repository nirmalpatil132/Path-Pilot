import { useState } from 'react'
import { Button, Card, CardContent } from '@/components/ui'
import { INTEREST_AREAS } from './constants'

interface Step5InterestsProps {
  initialInterests: string[]
  onSaveAndContinue: (interests: string[]) => Promise<void>
  onBack: () => void
  isSaving: boolean
}

export function Step5Interests({
  initialInterests,
  onSaveAndContinue,
  onBack,
  isSaving,
}: Step5InterestsProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialInterests || [])

  const handleToggle = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSaveAndContinue(selectedInterests)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-caption font-semibold text-primary">
          Step 5 of 8 • Interests
        </span>
        <h2 className="mt-3 text-h1 text-text-primary">Domains of Interest</h2>
        <p className="mt-2 text-body text-text-secondary">
          Select the technological areas and industries you find genuinely exciting. Select as many
          as you like.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {INTEREST_AREAS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id)
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => handleToggle(interest.id)}
                  aria-pressed={isSelected}
                  className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                      : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-muted/30'
                  }`}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {interest.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-body font-semibold text-text-primary">
                        {interest.title}
                      </h4>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border text-caption font-bold ${
                          isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-border bg-surface text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                    </div>
                    <p className="mt-1 text-caption text-text-secondary">
                      {interest.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <Button type="button" variant="secondary" onClick={onBack} disabled={isSaving}>
              ← Back
            </Button>
            <Button type="button" onClick={handleSubmit} isLoading={isSaving}>
              Continue to Goals →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
