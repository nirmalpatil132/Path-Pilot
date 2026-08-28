import type { ReactNode } from 'react'

import { Badge, Button, Card } from '@/components/ui'
import { scrollToId } from '@/lib/scrollToId'

const profileSkills = ['Python', 'SQL', 'Git', 'JavaScript']

const careerOptions: { name: string; badge: string; variant: 'success' | 'primary' }[] = [
  { name: 'Backend Developer', badge: 'Strong fit', variant: 'success' },
  { name: 'Data Analyst', badge: 'Worth exploring', variant: 'primary' },
]

const skillGaps = ['REST APIs', 'Testing', 'Docker']

const nextActions = ['Build and deploy a small REST API', 'Add automated tests to an existing project']

function FlowConnector() {
  return (
    <div aria-hidden="true" className="flex justify-center py-1">
      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-border-strong">
        <path d="M8 2v10M4 8.5 8 12.5 12 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function PreviewLabel({ children }: { children: ReactNode }) {
  return <p className="text-label uppercase tracking-wide text-text-muted">{children}</p>
}

export function Hero() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <div className="animate-fade-up flex flex-col gap-6">
          <p className="text-label uppercase tracking-wide text-primary">
            For 2nd–4th year engineering &amp; CS students
          </p>
          <h1 className="text-h1 text-text-primary md:text-display">
            Understand where you are.
            <br />
            Explore where you can go.
            <br />
            Know what to do next.
          </h1>
          <p className="max-w-xl text-body text-text-secondary">
            Students learn from a dozen scattered sources — college, YouTube, LinkedIn, courses,
            friends — without a clear sense of which direction actually fits them. PathPilot turns
            your current profile into career options, an explainable fit, honest skill gaps, and
            the next action worth taking.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button size="lg" onClick={() => scrollToId('how-it-works')}>
              Find My Path
            </Button>
            <Button variant="secondary" size="lg" onClick={() => scrollToId('careers')}>
              Explore Careers
            </Button>
          </div>
        </div>

        <div className="animate-fade-up flex justify-center lg:justify-end" style={{ animationDelay: '120ms' }}>
          <Card className="w-full max-w-md">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" aria-hidden="true" />
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" aria-hidden="true" />
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" aria-hidden="true" />
              <span className="ml-2 text-caption text-text-muted">Example preview — not your data</span>
            </div>

            <div className="flex flex-col gap-4 px-5 py-5">
              <div className="flex flex-col gap-2">
                <PreviewLabel>Your profile</PreviewLabel>
                <div className="flex flex-wrap gap-1.5">
                  {profileSkills.map((skill) => (
                    <Badge key={skill} variant="neutral">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <FlowConnector />

              <div className="flex flex-col gap-2">
                <PreviewLabel>Career options</PreviewLabel>
                <div className="flex flex-col gap-2">
                  {careerOptions.map((career) => (
                    <div
                      key={career.name}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                    >
                      <span className="text-body-sm font-medium text-text-primary">{career.name}</span>
                      <Badge variant={career.variant}>{career.badge}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <FlowConnector />

              <div className="flex flex-col gap-2">
                <PreviewLabel>Skill gaps</PreviewLabel>
                <div className="flex flex-wrap gap-1.5">
                  {skillGaps.map((gap) => (
                    <Badge key={gap} variant="warning">
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>

              <FlowConnector />

              <div className="flex flex-col gap-2">
                <PreviewLabel>Next actions</PreviewLabel>
                <ul className="flex flex-col gap-1.5">
                  {nextActions.map((action) => (
                    <li key={action} className="flex items-start gap-2 text-body-sm text-text-secondary">
                      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-primary">
                        <path
                          d="M3 8.5 6.5 12 13 4.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
