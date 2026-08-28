const loop = [
  { title: 'Starting point', description: 'Your education, skills, experience and goals today.' },
  { title: 'Career direction', description: 'The paths that currently fit your profile.' },
  { title: 'Skill development', description: 'Working on the gaps that matter most right now.' },
  { title: 'Projects & evidence', description: 'Turning learning into something you can show.' },
  { title: 'Progress', description: 'A clearer picture of how far you’ve come.' },
  { title: 'Reassessment', description: 'Your direction updates as your profile does.' },
]

export function ProgressPreview() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-label uppercase tracking-wide text-primary">Not a one-time quiz</p>
          <h2 className="mt-2 text-h2 text-text-primary">Your path can evolve.</h2>
          <p className="mt-3 text-body text-text-secondary">
            As you learn, build and gain experience, your strongest direction can change.
            PathPilot is built to reassess, not just to score you once and stop.
          </p>
        </div>

        <ol className="mx-auto mt-12 flex max-w-md flex-col">
          {loop.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-caption font-semibold text-primary-active">
                  {index + 1}
                </span>
                {index < loop.length - 1 && <span aria-hidden="true" className="w-px flex-1 bg-border" />}
              </div>
              <div className={index < loop.length - 1 ? 'pb-8' : ''}>
                <p className="text-body font-medium text-text-primary">{step.title}</p>
                <p className="mt-0.5 text-body-sm text-text-secondary">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mx-auto mt-2 max-w-md text-center text-caption text-text-muted">
          Reassessment feeds back into career direction — the loop continues as you grow.
        </p>
      </div>
    </section>
  )
}
