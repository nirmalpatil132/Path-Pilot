import { Alert, Badge, Button, Card, CardContent } from '@/components/ui'
import { INTEREST_AREAS, GOALS } from './constants'
import type { StudentProfile } from '@/lib/api'

interface Step8ReviewProps {
  profile: Partial<StudentProfile>
  onComplete: () => Promise<void>
  onJumpToStep: (stepNumber: number) => void
  onBack: () => void
  isSubmitting: boolean
  error: string | null
}

export function Step8Review({
  profile,
  onComplete,
  onJumpToStep,
  onBack,
  isSubmitting,
  error,
}: Step8ReviewProps) {
  const getGoalTitle = (id: string | null | undefined) => {
    if (!id) return 'Not specified'
    return GOALS.find((g) => g.id === id)?.title || id
  }

  const getInterestTitle = (id: string) => {
    return INTEREST_AREAS.find((i) => i.id === id)?.title || id
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-caption font-semibold text-primary">
          Step 8 of 8 • Review & Persist
        </span>
        <h2 className="mt-3 text-h1 text-text-primary">Review Your Profile</h2>
        <p className="mt-2 text-body text-text-secondary">
          Review your answers before completing onboarding. You can update any section by clicking
          the Edit button.
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="Could not complete onboarding">
          {error}
        </Alert>
      )}

      {/* Section 1: Education */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-caption font-bold text-primary">
                1
              </span>
              <h3 className="text-h3 font-semibold text-text-primary">Academic Background</h3>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onJumpToStep(2)}
            >
              Edit
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-caption text-text-secondary">Degree & Branch</p>
              <p className="text-body font-medium text-text-primary">
                {profile.degree || 'Not provided'} • {profile.branch || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-caption text-text-secondary">Current Year</p>
              <p className="text-body font-medium text-text-primary">
                {profile.currentYear || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-caption text-text-secondary">College / University</p>
              <p className="text-body font-medium text-text-primary">
                {profile.college || 'Not provided'}
                {profile.university ? ` (${profile.university})` : ''}
              </p>
            </div>
            <div>
              <p className="text-caption text-text-secondary">CGPA</p>
              <p className="text-body font-medium text-text-primary">
                {profile.cgpa !== null && profile.cgpa !== undefined ? `${profile.cgpa} / 10.0` : 'Not provided'}
              </p>
            </div>
          </div>
          {profile.academicContext && (
            <div className="rounded border border-border bg-surface-muted/40 p-3">
              <p className="text-caption text-text-secondary">Context</p>
              <p className="mt-0.5 text-body-sm text-text-primary">{profile.academicContext}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Skills */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-caption font-bold text-primary">
                2
              </span>
              <h3 className="text-h3 font-semibold text-text-primary">
                Technical Skills ({profile.skills?.length || 0})
              </h3>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onJumpToStep(3)}
            >
              Edit
            </Button>
          </div>

          {!profile.skills || profile.skills.length === 0 ? (
            <p className="text-body-sm text-text-muted italic">No skills recorded yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1 text-body-sm"
                >
                  <span className="font-medium text-text-primary">{s.name}</span>
                  <Badge
                    variant={
                      s.proficiency === 'Advanced'
                        ? 'success'
                        : s.proficiency === 'Intermediate'
                          ? 'default'
                          : 'neutral'
                    }
                  >
                    {s.proficiency}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Experience */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-caption font-bold text-primary">
                3
              </span>
              <h3 className="text-h3 font-semibold text-text-primary">
                Projects & Experience ({profile.experiences?.length || 0})
              </h3>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onJumpToStep(4)}
            >
              Edit
            </Button>
          </div>

          {!profile.experiences || profile.experiences.length === 0 ? (
            <p className="text-body-sm text-text-muted italic">No project or internship entries added (skipped).</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.experiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border bg-surface-muted/30 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-semibold uppercase text-primary">
                      {exp.type}
                    </span>
                    {(exp.startDate || exp.endDate) && (
                      <span className="text-caption text-text-muted">
                        {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                      </span>
                    )}
                  </div>
                  <h4 className="mt-1 text-body font-semibold text-text-primary">{exp.title}</h4>
                  {exp.organization && (
                    <p className="text-caption text-text-secondary">{exp.organization}</p>
                  )}
                  {exp.description && (
                    <p className="mt-1 text-caption text-text-secondary line-clamp-2">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Interests & Goals */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-caption font-bold text-primary">
                4
              </span>
              <h3 className="text-h3 font-semibold text-text-primary">Interests & Goals</h3>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onJumpToStep(5)}
            >
              Edit
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-caption text-text-secondary">Primary Career Goal</p>
              <p className="mt-0.5 text-body font-semibold text-text-primary">
                {getGoalTitle(profile.primaryGoal)}
              </p>
              {profile.secondaryGoals && profile.secondaryGoals.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-caption text-text-muted mr-1">Secondary:</span>
                  {profile.secondaryGoals.map((g) => (
                    <span
                      key={g}
                      className="rounded bg-surface-muted px-2 py-0.5 text-caption font-medium text-text-secondary"
                    >
                      {getGoalTitle(g)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-caption text-text-secondary">Target Domains ({profile.interests?.length || 0})</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {profile.interests && profile.interests.length > 0 ? (
                  profile.interests.map((id) => (
                    <span
                      key={id}
                      className="rounded bg-primary/10 px-2 py-0.5 text-caption font-medium text-primary"
                    >
                      {getInterestTitle(id)}
                    </span>
                  ))
                ) : (
                  <p className="text-body-sm text-text-muted italic">None selected</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scope Disclaimer Card */}
      <div className="rounded-xl border border-dashed border-border bg-surface-muted/30 p-5 text-center">
        <p className="text-body-sm text-text-secondary">
          <span className="font-semibold text-text-primary">Note on Phase 4 Scope:</span> Completing
          onboarding saves your profile securely to your authenticated account. Career matching,
          skill gap evaluations, and personalized action roadmaps will be unlocked in upcoming
          phases.
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-6">
        <Button type="button" variant="secondary" onClick={onBack} disabled={isSubmitting}>
          ← Back
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={onComplete}
          isLoading={isSubmitting}
        >
          Save & Complete Profile ✓
        </Button>
      </div>
    </div>
  )
}
