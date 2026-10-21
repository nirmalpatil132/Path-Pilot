import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  Input,
} from '@/components/ui'
import { PublicNavbar } from '@/components/landing/PublicNavbar'
import { Footer } from '@/components/landing/Footer'
import { api, type CareerSummary } from '@/lib/api'
import { getCategoryBadgeVariant } from './categoryBadge'

export default function CareerExplorer() {
  const [careers, setCareers] = useState<CareerSummary[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchCareers = async (search?: string, category?: string) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await api.getCareers({
        search: search || undefined,
        category: category && category !== 'All' ? category : undefined,
      })
      setCareers(res.careers)
      // Only set categories from the unfiltered response if categories is empty
      if (categories.length === 0 && res.categories) {
        setCategories(['All', ...res.categories])
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load career catalog'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchCareers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refetch when search query or category changes
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCareers(searchQuery, selectedCategory)
    }, 200)

    return () => clearTimeout(handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 md:px-8 md:py-12">
        {/* Page Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <Badge variant="primary">Phase 5</Badge>
            <span className="text-caption text-text-muted">Curated Tech Catalog</span>
          </div>
          <h1 className="mt-2 text-h1 text-text-primary md:text-display">
            Career Explorer
          </h1>
          <p className="mt-3 text-body text-text-secondary leading-relaxed">
            Browse PathPilot's curated collection of 10 tech career paths across engineering,
            data, security, infrastructure, and design. Explore realistic day-to-day
            responsibilities, core skills, common entry-level titles, and projects to build.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="mt-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="w-full sm:max-w-md">
            <Input
              type="search"
              placeholder="Search by title, skill (e.g. React, SQL, Docker), or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search career paths"
            />
          </div>

          {/* Results Count */}
          <div className="text-body-sm text-text-muted shrink-0">
            {isLoading ? (
              <span>Loading careers...</span>
            ) : (
              <span>
                Showing <strong className="text-text-primary">{careers.length}</strong>{' '}
                {careers.length === 1 ? 'career path' : 'career paths'}
              </span>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-caption font-medium text-text-secondary mr-1">Categories:</span>
          {(categories.length > 0 ? categories : ['All', 'Engineering', 'Data', 'Security', 'Infrastructure', 'Design']).map(
            (cat) => {
              const isSelected = selectedCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3 py-1 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                    isSelected
                      ? 'bg-primary text-text-inverse shadow-sm'
                      : 'bg-surface-muted text-text-secondary hover:bg-border/60 hover:text-text-primary border border-border'
                  }`}
                  aria-pressed={isSelected}
                >
                  {cat}
                </button>
              )
            },
          )}
        </div>

        {/* Content Area */}
        <div className="mt-8">
          {isLoading && careers.length === 0 ? (
            /* Loading Skeleton Grid */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <Card key={idx} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 w-24 rounded bg-surface-muted" />
                    <div className="mt-2 h-6 w-3/4 rounded bg-surface-muted" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-14 rounded bg-surface-muted" />
                    <div className="flex flex-wrap gap-1.5">
                      <div className="h-6 w-16 rounded bg-surface-muted" />
                      <div className="h-6 w-20 rounded bg-surface-muted" />
                      <div className="h-6 w-14 rounded bg-surface-muted" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : errorMessage ? (
            /* Error State */
            <EmptyState
              title="Failed to Load Careers"
              description={errorMessage}
              action={
                <Button variant="secondary" onClick={() => fetchCareers(searchQuery, selectedCategory)}>
                  Try Again
                </Button>
              }
            />
          ) : careers.length === 0 ? (
            /* Empty Search Results */
            <EmptyState
              title="No Career Paths Found"
              description={
                searchQuery
                  ? `No careers matched "${searchQuery}" in ${selectedCategory === 'All' ? 'any category' : selectedCategory}.`
                  : 'No careers found in this category.'
              }
              action={
                <Button variant="secondary" onClick={handleResetFilters}>
                  Reset Filters
                </Button>
              }
            />
          ) : (
            /* Careers Grid */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {careers.map((career) => (
                <Card
                  key={career.slug}
                  className="flex flex-col justify-between transition-shadow hover:shadow-md border-border"
                >
                  <div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={getCategoryBadgeVariant(career.category)}>
                          {career.category}
                        </Badge>
                        <span className="text-[11px] text-text-muted">
                          {career.exampleProjectsCount} example {career.exampleProjectsCount === 1 ? 'project' : 'projects'}
                        </span>
                      </div>
                      <h2 className="mt-2 text-h3 text-text-primary font-semibold">
                        {career.title}
                      </h2>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-body-sm text-text-secondary line-clamp-3">
                        {career.summary}
                      </p>

                      {/* Core Skills Preview */}
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                          Key Core Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {career.coreSkills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="default" className="text-[11px]">
                              {skill}
                            </Badge>
                          ))}
                          {career.coreSkills.length > 4 && (
                            <span className="text-[11px] text-text-muted self-center">
                              +{career.coreSkills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Typical Entry Title */}
                      {career.commonJobTitles && career.commonJobTitles.length > 0 && (
                        <div className="rounded border border-border/60 bg-surface-muted/40 px-2.5 py-1.5 text-[12px] text-text-muted">
                          <span className="font-medium text-text-secondary">Typical Entry:</span>{' '}
                          {career.commonJobTitles[0]}
                        </div>
                      )}
                    </CardContent>
                  </div>

                  {/* Card Action Link */}
                  <div className="border-t border-border p-4 bg-surface-muted/20 rounded-b-lg">
                    <Link
                      to={`/careers/${career.slug}`}
                      className="inline-flex w-full items-center justify-center rounded-md bg-surface border border-border px-3 py-2 text-body-sm font-medium text-text-primary transition-colors hover:bg-surface-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      View Career Details →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Phase Scope Disclaimer Banner */}
        <div className="mt-12 rounded-lg border border-dashed border-border bg-surface-muted/30 p-6 text-center">
          <p className="text-body-sm text-text-secondary max-w-2xl mx-auto">
            <strong className="text-text-primary">Curated Catalog Note:</strong> Career descriptions,
            skills, and projects reflect standardized entry-level industry expectations. Personalized
            fit percentages, skill-gap analysis, and tailored roadmaps will connect to these catalog
            paths in subsequent phases.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
