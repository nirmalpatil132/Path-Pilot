import { Badge, Card, CardContent, CardHeader } from '@/components/ui'

const strengths = ['Python foundation', 'SQL experience', 'Relevant projects']
const gaps = ['REST APIs', 'Testing', 'Deployment']

export function ExplainableFit() {
  return (
    <section id="explainable-fit" className="scroll-mt-20 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="flex flex-col gap-5 lg:order-2">
          <p className="text-label uppercase tracking-wide text-primary">Why PathPilot</p>
          <h2 className="text-h2 text-text-primary">
            Don't just get a recommendation.
            <br />
            Understand why.
          </h2>
          <p className="max-w-lg text-body text-text-secondary">
            An unexplained score doesn't help you make a decision — it just asks you to trust it.
            PathPilot shows the reasons behind every fit: which parts of your profile line up with
            a career, and which gaps stand between you and it. The scores are signals for your own
            judgment, not a verdict.
          </p>
        </div>

        <Card className="lg:order-1">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-h3 text-text-primary">Backend Developer</h3>
              <Badge variant="success">Strong current fit</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <p className="text-caption text-text-muted">Example analysis — illustrative, not your data</p>

            <div className="flex flex-col gap-2">
              <p className="text-label uppercase tracking-wide text-text-muted">Why it fits</p>
              <ul className="flex flex-col gap-1.5">
                {strengths.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-body-sm text-text-primary">
                    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0 text-success">
                      <path
                        d="M3 8.5 6.5 12 13 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-label uppercase tracking-wide text-text-muted">Current gaps</p>
              <ul className="flex flex-col gap-1.5">
                {gaps.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-body-sm text-text-secondary">
                    <span aria-hidden="true" className="h-3.5 w-3.5 shrink-0 rounded-full border border-border-strong" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
