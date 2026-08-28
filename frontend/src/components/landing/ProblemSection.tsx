const sources = ['College', 'YouTube', 'LinkedIn', 'Courses', 'Projects', 'Friends', 'Job descriptions']

const journey = ['Information', 'Too many choices', 'Confusion', 'Random learning', 'Skill gaps discovered late']

export function ProblemSection() {
  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-2 lg:items-start lg:gap-16">
        <div className="flex flex-col gap-5">
          <h2 className="text-h2 text-text-primary">
            Too much information.
            <br />
            Not enough direction.
          </h2>
          <p className="max-w-lg text-body text-text-secondary">
            None of these sources are wrong on their own — the problem is that none of them are
            personalized to your specific profile, so it's hard to tell which advice actually
            applies to you.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {sources.map((source) => (
              <span
                key={source}
                className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-body-sm text-text-secondary"
              >
                {source}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6">
          <p className="text-label uppercase tracking-wide text-text-muted">What usually happens</p>
          <ol className="mt-4 flex flex-col">
            {journey.map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-caption font-semibold ${
                      index === journey.length - 1
                        ? 'bg-danger-subtle text-danger-strong'
                        : 'bg-surface-muted text-text-secondary'
                    }`}
                  >
                    {index + 1}
                  </span>
                  {index < journey.length - 1 && (
                    <span aria-hidden="true" className="h-8 w-px bg-border" />
                  )}
                </div>
                <p
                  className={`pb-8 pt-0.5 text-body-sm ${
                    index === journey.length - 1
                      ? 'font-medium text-text-primary'
                      : 'text-text-secondary'
                  }`}
                >
                  {step}
                </p>
              </li>
            ))}
          </ol>
          <p className="text-body-sm text-text-secondary">
            PathPilot exists to connect these pieces — turning scattered information into a
            direction you can actually act on.
          </p>
        </div>
      </div>
    </section>
  )
}
