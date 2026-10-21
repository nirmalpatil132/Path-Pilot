import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'
import { seedCareerCatalog } from '../src/db/seedCareers.js'

describe('PathPilot Career Catalog & Explorer API', () => {
  beforeAll(async () => {
    // Ensure catalog is seeded before running tests
    await seedCareerCatalog()
  })

  describe('GET /careers - Catalog listing', () => {
    it('retrieves the full career catalog of 10 curated careers', async () => {
      const res = await request(app).get('/careers')
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('careers')
      expect(res.body).toHaveProperty('categories')
      expect(res.body).toHaveProperty('total')

      expect(res.body.total).toBe(10)
      expect(res.body.careers.length).toBe(10)
      expect(res.body.categories).toContain('Engineering')
      expect(res.body.categories).toContain('Data')
      expect(res.body.categories).toContain('Security')
      expect(res.body.categories).toContain('Infrastructure')
      expect(res.body.categories).toContain('Design')

      // Check structure of first career
      const career = res.body.careers[0]
      expect(career).toHaveProperty('id')
      expect(career).toHaveProperty('slug')
      expect(career).toHaveProperty('title')
      expect(career).toHaveProperty('category')
      expect(career).toHaveProperty('summary')
      expect(career).toHaveProperty('description')
      expect(career).toHaveProperty('coreSkills')
      expect(Array.isArray(career.coreSkills)).toBe(true)
      expect(career.coreSkills.length).toBeGreaterThan(0)
    })

    it('filters careers by category', async () => {
      const res = await request(app).get('/careers?category=Engineering')
      expect(res.status).toBe(200)
      expect(res.body.careers.length).toBe(4)
      res.body.careers.forEach((c: { category: string }) => {
        expect(c.category).toBe('Engineering')
      })

      const dataRes = await request(app).get('/careers?category=Data')
      expect(dataRes.status).toBe(200)
      expect(dataRes.body.careers.length).toBe(3)
      dataRes.body.careers.forEach((c: { category: string }) => {
        expect(c.category).toBe('Data')
      })
    })

    it('searches careers by title keyword (case-insensitive)', async () => {
      const res = await request(app).get('/careers?search=backend')
      expect(res.status).toBe(200)
      expect(res.body.careers.length).toBeGreaterThanOrEqual(1)
      const backendDev = res.body.careers.find((c: { slug: string }) => c.slug === 'backend-developer')
      expect(backendDev).toBeDefined()
      expect(backendDev?.title).toBe('Backend Developer')
    })

    it('searches careers by skill keyword', async () => {
      const res = await request(app).get('/careers?search=React')
      expect(res.status).toBe(200)
      // Frontend and Full Stack developer have React
      const slugs = res.body.careers.map((c: { slug: string }) => c.slug)
      expect(slugs).toContain('frontend-developer')
      expect(slugs).toContain('full-stack-developer')
    })

    it('searches careers by common job titles', async () => {
      const res = await request(app).get('/careers?search=SRE')
      expect(res.status).toBe(200)
      const slugs = res.body.careers.map((c: { slug: string }) => c.slug)
      expect(slugs).toContain('cloud-devops-engineer')
    })

    it('combines search and category filters correctly', async () => {
      const res = await request(app).get('/careers?category=Engineering&search=Frontend%20Developer')
      expect(res.status).toBe(200)
      expect(res.body.careers.length).toBe(1)
      expect(res.body.careers[0].slug).toBe('frontend-developer')
    })

    it('returns empty list gracefully when no careers match the search criteria', async () => {
      const res = await request(app).get('/careers?search=nonexistentcareerxyz123')
      expect(res.status).toBe(200)
      expect(res.body.careers).toEqual([])
      expect(res.body.total).toBe(0)
    })

    it('rejects invalid query parameters with 400', async () => {
      const longSearch = 'a'.repeat(105)
      const res = await request(app).get(`/careers?search=${longSearch}`)
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/invalid query/i)
    })
  })

  describe('GET /careers/:slug - Single career details', () => {
    it('retrieves complete structured details for a valid career slug', async () => {
      const res = await request(app).get('/careers/backend-developer')
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('career')

      const career = res.body.career
      expect(career.slug).toBe('backend-developer')
      expect(career.title).toBe('Backend Developer')
      expect(career.category).toBe('Engineering')
      expect(career.summary).toBeDefined()
      expect(career.description).toBeDefined()

      // Structured array checks
      expect(Array.isArray(career.responsibilities)).toBe(true)
      expect(career.responsibilities.length).toBeGreaterThan(0)

      expect(Array.isArray(career.coreSkills)).toBe(true)
      expect(career.coreSkills.length).toBeGreaterThan(0)
      expect(career.coreSkills[0]).toHaveProperty('name')

      expect(Array.isArray(career.supportingSkills)).toBe(true)
      expect(career.supportingSkills.length).toBeGreaterThan(0)

      expect(Array.isArray(career.commonJobTitles)).toBe(true)
      expect(career.commonJobTitles.length).toBeGreaterThan(0)

      expect(Array.isArray(career.exampleProjects)).toBe(true)
      expect(career.exampleProjects.length).toBeGreaterThan(0)
      expect(career.exampleProjects[0]).toHaveProperty('title')
      expect(career.exampleProjects[0]).toHaveProperty('description')

      expect(Array.isArray(career.prerequisites)).toBe(true)
      expect(Array.isArray(career.growthPaths)).toBe(true)
      expect(Array.isArray(career.interviewAreas)).toBe(true)

      // Related careers should be resolved to previews
      expect(Array.isArray(career.relatedCareers)).toBe(true)
      expect(career.relatedCareers.length).toBeGreaterThan(0)
      expect(career.relatedCareers[0]).toHaveProperty('slug')
      expect(career.relatedCareers[0]).toHaveProperty('title')
      expect(career.relatedCareers[0]).toHaveProperty('summary')
    })

    it('returns 404 for an unknown career slug', async () => {
      const res = await request(app).get('/careers/astronomer-specialist')
      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Career not found')
    })

    it('returns 400 for a malformed slug parameter', async () => {
      const res = await request(app).get('/careers/INVALID_SLUG!!')
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/invalid career slug/i)
    })
  })

  describe('Database Seeding Idempotency', () => {
    it('re-seeding does not create duplicate career records or duplicate skills', async () => {
      // Re-run seed
      const seedResult = await seedCareerCatalog()
      expect(seedResult.count).toBe(10)

      const totalCount = await prisma.career.count()
      expect(totalCount).toBe(10)

      // Verify skills count for a career didn't double
      const backend = await prisma.career.findUnique({
        where: { slug: 'backend-developer' },
        include: { skills: true },
      })
      expect(backend).not.toBeNull()
      // 5 core skills + 4 supporting skills = 9 skills
      expect(backend?.skills.length).toBe(9)
    })
  })
})
