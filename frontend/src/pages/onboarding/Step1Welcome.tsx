import { Button, Card, CardContent } from '@/components/ui'

interface Step1WelcomeProps {
  onStart: () => void
}

export function Step1Welcome({ onStart }: Step1WelcomeProps) {
  const stepsOverview = [
    { num: '1', title: 'Education', desc: 'Degree, branch, year, and college details' },
    { num: '2', title: 'Skills', desc: 'Technical skills, libraries, and confidence levels' },
    { num: '3', title: 'Experience', desc: 'Projects, internships, and open-source work (optional)' },
    { num: '4', title: 'Interests', desc: 'Tech domains and industry areas you care about' },
    { num: '5', title: 'Goals', desc: 'Jobs, internships, higher studies, or exploratory goals' },
    { num: '6', title: 'Constraints', desc: 'Location, work mode, and weekly hours (optional)' },
    { num: '7', title: 'Review', desc: 'Verify and persist your complete student profile' },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-caption font-semibold text-primary">
          Step 1 of 8 • Introduction
        </span>
        <h2 className="mt-3 text-h1 text-text-primary">Welcome to PathPilot!</h2>
        <p className="mt-2 text-body text-text-secondary">
          To provide personalized career options, explainable skill gaps, and prioritized action
          plans, PathPilot needs an authentic picture of where you currently stand.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-h3 font-semibold text-text-primary">What we will cover</h3>
          <p className="mt-1 text-body-sm text-text-secondary">
            This setup is designed to be thoughtful yet low-stress. Optional sections can be skipped,
            and your answers save automatically as you progress.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {stepsOverview.map((item) => (
              <div
                key={item.num}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface-muted/40 p-4 transition-colors hover:border-primary/40"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-bold text-white">
                  {item.num}
                </span>
                <div>
                  <h4 className="text-body font-semibold text-text-primary">{item.title}</h4>
                  <p className="text-caption text-text-secondary">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
            <div className="text-body-sm text-text-secondary">
              <span className="font-medium text-text-primary">Estimated effort:</span> Approx. 5–10
              minutes • You can pause and resume anytime.
            </div>
            <Button size="lg" onClick={onStart}>
              Start Onboarding →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
