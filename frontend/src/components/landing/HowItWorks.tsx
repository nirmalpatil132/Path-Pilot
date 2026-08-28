import type { ReactNode } from 'react'

const steps: { title: string; description: string; icon: ReactNode }[] = [
  {
    title: 'Understand your starting point',
    description: 'Build a picture of your education, skills, experience, interests and goals.',
    icon: (
      <path
        d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 8a6 6 0 0 1 12 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: 'Explore your career options',
    description: "See career paths that may fit your current profile, and understand why.",
    icon: (
      <path
        d="M10 2v2M10 16v2M2 10h2M16 10h2M13.5 6.5 8 12l-1.5 3.5L8 14l4.5-5.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Identify what you're missing",
    description: 'See skill gaps and tell what matters right now from what can wait.',
    icon: (
      <path
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: 'Know what to do next',
    description: 'Turn gaps into practical actions, projects and measurable progress.',
    icon: (
      <path
        d="M4 10.5 8 14.5 16 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="max-w-2xl">
          <p className="text-label uppercase tracking-wide text-primary">How PathPilot works</p>
          <h2 className="mt-2 text-h2 text-text-primary">A clear path, in four steps.</h2>
        </div>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary">
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                    {step.icon}
                  </svg>
                </span>
                <span className="text-caption font-semibold text-text-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="text-h3 text-text-primary">{step.title}</h3>
              <p className="text-body-sm text-text-secondary">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
