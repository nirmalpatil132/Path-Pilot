import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
} from '@/components/ui'
import { PublicNavbar } from '@/components/landing/PublicNavbar'
import { Footer } from '@/components/landing/Footer'
import { api, type CareerDetail as CareerDetailType } from '@/lib/api'
import { getCategoryBadgeVariant } from './categoryBadge'

export default function CareerDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [career, setCareer] = useState<CareerDetailType | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isNotFound, setIsNotFound] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadCareer(careerSlug: string) {
      setIsLoading(true)
      setIsNotFound(false)
      setErrorMessage(null)

      try {
        const res = await api.getCareerBySlug(careerSlug)
        if (isMounted) {
          setCareer(res.career)
        }
      } catch (err: unknown) {
        if (!isMounted) return
        const status = (err as { statusCode?: number })?.statusCode
        if (status === 404) {
          setIsNotFound(true)
        } else {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to load career details')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (slug) {
      loadCareer(slug)
    }

    return () => {
      isMounted = false
    }
  }, [slug])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 md:px-8 md:py-12">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/careers"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
          >
            ← Back to Career Explorer
          </Link>
        </div>

        {isLoading ? (
          /* Loading State */
          <div className="space-y-6 animate-pulse">
            <div className="h-6 w-28 rounded bg-surface-muted" />
            <div className="h-10 w-2/3 rounded bg-surface-muted" />
            <div className="h-20 rounded bg-surface-muted" />
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="h-48 rounded bg-surface-muted" />
              <div className="h-48 rounded bg-surface-muted" />
            </div>
          </div>
        ) : isNotFound ? (
          /* Not Found State */
          <EmptyState
            title="Career Path Not Found"
            description={`We couldn't find a career path corresponding to "${slug}". It may have been renamed or does not exist in the initial catalog.`}
            action={
              <Link to="/careers">
                <Button>Return to Career Explorer</Button>
              </Link>
            }
          />
        ) : errorMessage ? (
          /* Error State */
          <EmptyState
            title="Error Loading Career"
            description={errorMessage}
            action={
              <Link to="/careers">
                <Button variant="secondary">Back to Career Explorer</Button>
              </Link>
            }
          />
        ) : career ? (
          /* Career Detail Content */
          <div className="space-y-10">
            {/* Header Section */}
            <div className="border-b border-border pb-8">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={getCategoryBadgeVariant(career.category)}>
                  {career.category}
                </Badge>
                <span className="text-caption text-text-muted">
                  Catalog Path • Stable ID: {career.slug}
                </span>
              </div>
              <h1 className="mt-3 text-h1 text-text-primary md:text-display font-bold">
                {career.title}
              </h1>
              <p className="mt-3 text-body-lg text-text-secondary max-w-3xl leading-relaxed">
                {career.summary}
              </p>
            </div>

            {/* Section 1: Role Overview & Work Description */}
            <section aria-labelledby="about-role-heading">
              <Card>
                <CardHeader>
                  <h2 id="about-role-heading" className="text-h3 text-text-primary font-semibold">
                    About the Role
                  </h2>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-body text-text-secondary leading-relaxed">
                    {career.description}
                  </p>

                  {/* Daily Responsibilities */}
                  {career.responsibilities && career.responsibilities.length > 0 && (
                    <div>
                      <h3 className="text-body font-semibold text-text-primary mb-3">
                        Typical Responsibilities
                      </h3>
                      <ul className="grid gap-2.5 sm:grid-cols-2">
                        {career.responsibilities.map((resp, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 rounded-md border border-border/70 bg-surface-muted/30 p-3 text-body-sm text-text-secondary"
                          >
                            <span className="text-primary font-bold mt-0.5">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Common Entry-Level Titles */}
                  {career.commonJobTitles && career.commonJobTitles.length > 0 && (
                    <div>
                      <h3 className="text-body font-semibold text-text-primary mb-2">
                        Common Entry-Level Job Titles
                      </h3>
                      <p className="text-body-sm text-text-muted mb-2.5">
                        Look for these titles when searching for internships or campus placement openings:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {career.commonJobTitles.map((title) => (
                          <span
                            key={title}
                            className="inline-flex items-center rounded-md border border-border bg-surface px-3 py-1 text-body-sm font-medium text-text-primary"
                          >
                            {title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Section 2: Skills Matrix */}
            <section aria-labelledby="skills-matrix-heading" className="space-y-6">
              <div>
                <h2 id="skills-matrix-heading" className="text-h2 text-text-primary font-semibold">
                  Required &amp; Supporting Skills
                </h2>
                <p className="mt-1 text-body-sm text-text-secondary">
                  Distinguishing core baseline competencies from secondary skills that give candidates a hiring edge.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Core Skills */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-h3 text-text-primary font-semibold">Core Technical Skills</h3>
                      <Badge variant="primary">Mandatory Foundation</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {career.coreSkills.map((skill) => (
                      <div
                        key={skill.name}
                        className="rounded-lg border border-border bg-surface p-3.5"
                      >
                        <p className="text-body-sm font-semibold text-text-primary">{skill.name}</p>
                        {skill.description && (
                          <p className="mt-1 text-caption text-text-secondary">{skill.description}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Supporting Skills */}
                <Card className="border-border bg-surface">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-h3 text-text-primary font-semibold">Supporting Skills</h3>
                      <Badge variant="neutral">Complementary Edge</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {career.supportingSkills.map((skill) => (
                      <div
                        key={skill.name}
                        className="rounded-lg border border-border bg-surface-muted/40 p-3.5"
                      >
                        <p className="text-body-sm font-semibold text-text-primary">{skill.name}</p>
                        {skill.description && (
                          <p className="mt-1 text-caption text-text-secondary">{skill.description}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Prerequisites & Foundations */}
              {career.prerequisites && career.prerequisites.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="text-h3 text-text-primary font-semibold">
                      Foundational Prerequisites
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {career.prerequisites.map((req, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 rounded-md border border-border/60 bg-surface-muted/20 px-3 py-2 text-body-sm text-text-secondary"
                        >
                          <span className="text-success font-bold">✓</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Section 3: Example Projects to Build */}
            {career.exampleProjects && career.exampleProjects.length > 0 && (
              <section aria-labelledby="example-projects-heading">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h2 id="example-projects-heading" className="text-h3 text-text-primary font-semibold">
                        Practical Projects to Prove Competency
                      </h2>
                      <span className="text-caption text-text-muted">Portfolio Evidence</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body-sm text-text-secondary mb-4">
                      Recruiters evaluate practical evidence. Here are benchmark projects a student can build to demonstrate readiness for this role:
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {career.exampleProjects.map((proj, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col justify-between rounded-lg border border-border bg-surface-muted/30 p-4"
                        >
                          <div>
                            <h4 className="text-body font-semibold text-text-primary">{proj.title}</h4>
                            <p className="mt-1.5 text-body-sm text-text-secondary leading-relaxed">
                              {proj.description}
                            </p>
                          </div>
                          {proj.skills && proj.skills.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap gap-1.5">
                              {proj.skills.map((s) => (
                                <Badge key={s} variant="default" className="text-[10px]">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Section 4: Interview & Growth Path */}
            <section aria-labelledby="interview-growth-heading" className="grid gap-6 sm:grid-cols-2">
              {/* Interview Areas */}
              {career.interviewAreas && career.interviewAreas.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="text-h3 text-text-primary font-semibold">Interview Focus Areas</h3>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {career.interviewAreas.map((area, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-body-sm text-text-secondary"
                        >
                          <span className="text-primary font-bold mt-0.5">→</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Career Progression Paths */}
              {career.growthPaths && career.growthPaths.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="text-h3 text-text-primary font-semibold">Growth &amp; Career Trajectories</h3>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {career.growthPaths.map((path, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-body-sm text-text-secondary"
                        >
                          <span className="text-success font-bold mt-0.5">↗</span>
                          <span>{path}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Section 5: Related Careers */}
            {career.relatedCareers && career.relatedCareers.length > 0 && (
              <section aria-labelledby="related-careers-heading">
                <Card>
                  <CardHeader>
                    <h2 id="related-careers-heading" className="text-h3 text-text-primary font-semibold">
                      Related Career Paths
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body-sm text-text-secondary mb-4">
                      Students considering {career.title} also explore these adjacent roles:
                    </p>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {career.relatedCareers.map((rel) => (
                        <Link
                          key={rel.slug}
                          to={`/careers/${rel.slug}`}
                          className="flex flex-col justify-between rounded-lg border border-border bg-surface p-4 transition-all hover:border-primary hover:shadow-sm"
                        >
                          <div>
                            <Badge variant={getCategoryBadgeVariant(rel.category)} className="w-fit mb-2">
                              {rel.category}
                            </Badge>
                            <h4 className="text-body font-semibold text-text-primary">{rel.title}</h4>
                            <p className="mt-1 text-caption text-text-muted line-clamp-2">
                              {rel.summary}
                            </p>
                          </div>
                          <span className="mt-3 text-caption font-medium text-primary">
                            Explore {rel.title} →
                          </span>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Phase Disclaimer */}
            <div className="rounded-lg border border-dashed border-border bg-surface-muted/30 p-6 text-center">
              <h3 className="text-body font-semibold text-text-primary">
                Next in Phase 6: Deterministic Career-Fit &amp; Skill-Gap Engine
              </h3>
              <p className="mt-1 text-body-sm text-text-secondary max-w-xl mx-auto">
                In Phase 6, PathPilot will evaluate your active student profile against these required
                skills to compute honest skill matches, highlight missing competencies, and recommend
                prioritized actions.
              </p>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}
