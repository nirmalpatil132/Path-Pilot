import { prisma } from '../lib/prisma.js'
import { CAREER_CATALOG_DATA, type CareerSeedItem } from '../data/careerCatalogData.js'

/**
 * Idempotently seeds the career catalog into SQLite via Prisma.
 * Ensures that running multiple times never creates duplicates.
 */
export async function seedCareerCatalog(catalogData: CareerSeedItem[] = CAREER_CATALOG_DATA) {
  const seededSlugs: string[] = []

  for (const item of catalogData) {
    const career = await prisma.career.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        category: item.category,
        summary: item.summary,
        description: item.description,
        responsibilities: JSON.stringify(item.responsibilities),
        commonJobTitles: JSON.stringify(item.commonJobTitles),
        exampleProjects: JSON.stringify(item.exampleProjects),
        prerequisites: JSON.stringify(item.prerequisites),
        relatedCareerSlugs: JSON.stringify(item.relatedCareerSlugs),
        growthPaths: JSON.stringify(item.growthPaths),
        interviewAreas: JSON.stringify(item.interviewAreas),
      },
      create: {
        slug: item.slug,
        title: item.title,
        category: item.category,
        summary: item.summary,
        description: item.description,
        responsibilities: JSON.stringify(item.responsibilities),
        commonJobTitles: JSON.stringify(item.commonJobTitles),
        exampleProjects: JSON.stringify(item.exampleProjects),
        prerequisites: JSON.stringify(item.prerequisites),
        relatedCareerSlugs: JSON.stringify(item.relatedCareerSlugs),
        growthPaths: JSON.stringify(item.growthPaths),
        interviewAreas: JSON.stringify(item.interviewAreas),
      },
    })

    // Sync skills idempotently: delete existing skills for this career and insert fresh skills
    await prisma.careerSkill.deleteMany({
      where: { careerId: career.id },
    })

    const skillRecords = [
      ...item.coreSkills.map((s) => ({
        careerId: career.id,
        name: s.name,
        type: 'core',
        description: s.description || null,
      })),
      ...item.supportingSkills.map((s) => ({
        careerId: career.id,
        name: s.name,
        type: 'supporting',
        description: s.description || null,
      })),
    ]

    for (const skill of skillRecords) {
      await prisma.careerSkill.create({
        data: skill,
      })
    }

    seededSlugs.push(career.slug)
  }

  return {
    count: seededSlugs.length,
    seededSlugs,
  }
}

// Allow direct CLI invocation via: npx tsx src/db/seedCareers.ts
if (process.argv[1]?.replace(/\\/g, '/').endsWith('seedCareers.ts') || process.argv[1]?.replace(/\\/g, '/').endsWith('seedCareers.js')) {
  seedCareerCatalog()
    .then((res) => {
      console.log(`[seedCareers] Successfully seeded ${res.count} careers:`, res.seededSlugs)
      process.exit(0)
    })
    .catch((err) => {
      console.error('[seedCareers] Seeding failed:', err)
      process.exit(1)
    })
}
