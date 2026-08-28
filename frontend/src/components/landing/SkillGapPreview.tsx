import { Badge } from '@/components/ui'

const mastered = ['Python', 'SQL', 'Git']
const needsWork = ['REST APIs', 'Testing', 'Docker']
const flow = ['Learn', 'Practice', 'Build', 'Deploy', 'Prove']
const exampleActions = [
  'Build and deploy a small REST API',
  'Practice authentication end to end',
  'Add automated tests to an existing project',
]

export function SkillGapPreview() {
  return (
    <section id="skill-gaps" className="scroll-mt-20 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="max-w-2xl">
          <p className="text-label uppercase tracking-wide text-primary">Skill gaps → action</p>
          <h2 className="mt-2 text-h2 text-text-primary">Know what to work on next.</h2>
          <p className="mt-3 text-body text-text-secondary">
            A gap list on its own is just more information. PathPilot separates what already
            works from what needs attention, then turns that into something you can actually do.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-5">
            <p className="text-label uppercase tracking-wide text-text-muted">Where you're strong</p>
            <ul className="mt-3 flex flex-col gap-2">
              {mastered.map((skill) => (
                <li key={skill} className="flex items-center gap-2 text-body-sm text-text-primary">
                  <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0 text-success">
                    <path
                      d="M3 8.5 6.5 12 13 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-background p-5">
            <p className="text-label uppercase tracking-wide text-text-muted">Needs work</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {needsWork.map((skill) => (
                <Badge key={skill} variant="warning">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-stretch gap-2 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-3">
          {flow.map((step, index) => (
            <div key={step} className="flex items-center gap-2 md:gap-3">
              <span className="rounded-full border border-primary/25 bg-primary-subtle px-4 py-2 text-body-sm font-medium text-primary-active">
                {step}
              </span>
              {index < flow.length - 1 && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="h-4 w-4 shrink-0 rotate-90 text-border-strong md:rotate-0"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-lg rounded-lg border border-border bg-background p-5">
          <p className="text-label uppercase tracking-wide text-text-muted">Example next actions</p>
          <ul className="mt-3 flex flex-col gap-2">
            {exampleActions.map((action) => (
              <li key={action} className="flex items-start gap-2 text-body-sm text-text-secondary">
                <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
