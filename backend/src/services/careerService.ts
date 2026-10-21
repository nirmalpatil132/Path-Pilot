import { prisma } from '../lib/prisma.js'

export interface FormattedCareerSummary {
  id: string
  slug: string
  title: string
  category: string
  summary: string
  description: string
  coreSkills: string[]
  supportingSkills: string[]
  commonJobTitles: string[]
  exampleProjectsCount: number
}

export interface FormattedCareerDetail {
  id: string
  slug: string
  title: string
  category: string
  summary: string
  description: string
  responsibilities: string[]
  coreSkills: Array<{ name: string; description?: string | null }>
  supportingSkills: Array<{ name: string; description?: string | null }>
  commonJobTitles: string[]
  exampleProjects: Array<{ title: string; description: string; skills?: string[] }>
  prerequisites: string[]
  relatedCareers: Array<{ slug: string; title: string; category: string; summary: string }>
  growthPaths: string[]
  interviewAreas: string[]
}

function safeJsonParse<T>(jsonStr: string | null | undefined, fallback: T): T {
  if (!jsonStr) return fallback
  try {
    return JSON.parse(jsonStr) as T
  } catch {
    return fallback
  }
}

/**
 * Retrieves the list of careers with optional search and category filters.
 */
export async function listCareers(filter?: {
  search?: string
  category?: string
}): Promise<{
  careers: FormattedCareerSummary[]
  categories: string[]
  total: number
}> {
  // Fetch all careers with their skills
  const allCareers = await prisma.career.findMany({
    include: {
      skills: true,
    },
    orderBy: {
      title: 'asc',
    },
  })

  // Extract all distinct categories available in catalog
  const categories = Array.from(new Set(allCareers.map((c) => c.category)))

  let filtered = allCareers

  // Apply category filter if provided
  if (filter?.category && filter.category.trim() !== '') {
    const targetCategory = filter.category.trim().toLowerCase()
    filtered = filtered.filter((c) => c.category.toLowerCase() === targetCategory)
  }

  // Apply text search if provided
  if (filter?.search && filter.search.trim() !== '') {
    const query = filter.search.trim().toLowerCase()
    filtered = filtered.filter((c) => {
      const matchTitle = c.title.toLowerCase().includes(query)
      const matchSummary = c.summary.toLowerCase().includes(query)
      const matchDesc = c.description.toLowerCase().includes(query)
      const matchCategory = c.category.toLowerCase().includes(query)
      const matchSkills = c.skills.some((s) => s.name.toLowerCase().includes(query))
      const matchTitles = safeJsonParse<string[]>(c.commonJobTitles, []).some((t) =>
        t.toLowerCase().includes(query),
      )
      return matchTitle || matchSummary || matchDesc || matchCategory || matchSkills || matchTitles
    })
  }

  const formattedCareers: FormattedCareerSummary[] = filtered.map((c) => {
    const coreSkills = c.skills
      .filter((s) => s.type === 'core')
      .map((s) => s.name)
    const supportingSkills = c.skills
      .filter((s) => s.type === 'supporting')
      .map((s) => s.name)
    const commonJobTitles = safeJsonParse<string[]>(c.commonJobTitles, [])
    const exampleProjects = safeJsonParse<unknown[]>(c.exampleProjects, [])

    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      category: c.category,
      summary: c.summary,
      description: c.description,
      coreSkills,
      supportingSkills,
      commonJobTitles,
      exampleProjectsCount: exampleProjects.length,
    }
  })

  return {
    careers: formattedCareers,
    categories,
    total: formattedCareers.length,
  }
}

/**
 * Retrieves a single career by its unique slug with full details and resolved related careers.
 */
export async function getCareerBySlug(slug: string): Promise<FormattedCareerDetail | null> {
  const career = await prisma.career.findUnique({
    where: { slug },
    include: {
      skills: true,
    },
  })

  if (!career) {
    return null
  }

  const relatedCareerSlugs = safeJsonParse<string[]>(career.relatedCareerSlugs, [])

  // Resolve related career previews
  const relatedRecords = relatedCareerSlugs.length > 0
    ? await prisma.career.findMany({
        where: {
          slug: { in: relatedCareerSlugs },
        },
        select: {
          slug: true,
          title: true,
          category: true,
          summary: true,
        },
      })
    : []

  const coreSkills = career.skills
    .filter((s) => s.type === 'core')
    .map((s) => ({
      name: s.name,
      description: s.description,
    }))

  const supportingSkills = career.skills
    .filter((s) => s.type === 'supporting')
    .map((s) => ({
      name: s.name,
      description: s.description,
    }))

  return {
    id: career.id,
    slug: career.slug,
    title: career.title,
    category: career.category,
    summary: career.summary,
    description: career.description,
    responsibilities: safeJsonParse<string[]>(career.responsibilities, []),
    coreSkills,
    supportingSkills,
    commonJobTitles: safeJsonParse<string[]>(career.commonJobTitles, []),
    exampleProjects: safeJsonParse<Array<{ title: string; description: string; skills?: string[] }>>(
      career.exampleProjects,
      [],
    ),
    prerequisites: safeJsonParse<string[]>(career.prerequisites, []),
    relatedCareers: relatedRecords,
    growthPaths: safeJsonParse<string[]>(career.growthPaths, []),
    interviewAreas: safeJsonParse<string[]>(career.interviewAreas, []),
  }
}
