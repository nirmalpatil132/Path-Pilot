import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../src/app.js'
import { seedCareerCatalog } from '../src/db/seedCareers.js'
import {
  getAllProjectTemplates,
  recommendProjects,
} from '../src/services/project/projectRecommendationEngine.js'

describe('PathPilot Phase 08: Project-Based Learning & Portfolio Evidence', () => {
  beforeAll(async () => {
    await seedCareerCatalog()
  })

  // ========================================================
  // 1. Project Recommendation Engine Unit Tests
  // ========================================================
  describe('Project Recommendation Engine Unit Tests', () => {
    it('retrieves all 20 curated project templates from canonical career catalog', () => {
      const templates = getAllProjectTemplates()
      expect(templates.length).toBe(20)

      // Verify each template has required non-empty fields
      templates.forEach((t) => {
        expect(t.templateId).toBeTruthy()
        expect(t.title).toBeTruthy()
        expect(t.description).toBeTruthy()
        expect(t.careerSlug).toBeTruthy()
        expect(t.careerTitle).toBeTruthy()
        expect(Array.isArray(t.skills)).toBe(true)
        expect(t.skills.length).toBeGreaterThan(0)
      })
    })

    it('prioritizes projects exercising Critical Missing skills for the student', () => {
      const recs = recommendProjects({
        targetCareerSlug: 'backend-developer',
        studentSkills: [{ name: 'Git & Version Control' }],
        skillGaps: [
          { name: 'RESTful API Design', category: 'CRITICAL_MISSING' },
          { name: 'Relational Databases & SQL', category: 'CRITICAL_MISSING' },
          { name: 'Caching (Redis)', category: 'RECOMMENDED_NEXT' },
        ],
        existingProjects: [],
      })

      expect(recs.length).toBeGreaterThan(0)
      const topRec = recs[0]

      // Top recommendation should match backend developer and have HIGH priority
      expect(topRec.careerSlug).toBe('backend-developer')
      expect(topRec.priority).toBe('HIGH')
      expect(topRec.matchedCriticalSkills.length).toBeGreaterThan(0)
      expect(topRec.reasons.some((r) => r.includes('Critical Missing'))).toBe(true)
    })

    it('correctly categorizes Recommended Next and Optional Advantage skills', () => {
      const recs = recommendProjects({
        targetCareerSlug: 'frontend-developer',
        studentSkills: [
          { name: 'HTML5 & Semantic Markup' },
          { name: 'Modern CSS & Responsive Design' },
          { name: 'JavaScript (ES6+)' },
          { name: 'React' },
          { name: 'TypeScript' },
        ],
        skillGaps: [
          { name: 'Web Accessibility (a11y)', category: 'RECOMMENDED_NEXT' },
          { name: 'Web Performance & Core Web Vitals', category: 'RECOMMENDED_NEXT' },
          { name: 'Design Tokens & Figma Basics', category: 'OPTIONAL_ADVANTAGE' },
        ],
        existingProjects: [],
      })

      // The Accessible E-Commerce Product Catalog exercises Web Accessibility (a11y)
      const ecomProject = recs.find((r) => r.title.includes('Accessible E-Commerce'))
      expect(ecomProject).toBeDefined()
      expect(ecomProject?.matchedRecommendedSkills).toContain('Web Accessibility (a11y)')
      expect(ecomProject?.priority).toBe('RECOMMENDED')
    })

    it('handles canonical skill matching and developer shorthands', () => {
      const recs = recommendProjects({
        targetCareerSlug: 'full-stack-developer',
        studentSkills: [],
        skillGaps: [
          { name: 'React', category: 'CRITICAL_MISSING' },
          { name: 'Node.js', category: 'CRITICAL_MISSING' },
        ],
        existingProjects: [],
      })

      // Projects requiring React should match regardless of punctuation/case
      const reactRecs = recs.filter((r) => r.matchedCriticalSkills.some((s) => s.toLowerCase().includes('react')))
      expect(reactRecs.length).toBeGreaterThan(0)
    })

    it('handles empty or insufficient profile data gracefully with deterministic ordering', () => {
      const recs = recommendProjects({
        targetCareerSlug: null,
        studentSkills: [],
        skillGaps: [],
        existingProjects: [],
      })

      expect(recs.length).toBe(20)
      recs.forEach((r) => {
        expect(r.priority).toBe('ELECTIVE')
        expect(r.reasons.length).toBeGreaterThan(0)
      })

      // Deterministic sort check: run twice and ensure identical order
      const recs2 = recommendProjects({
        targetCareerSlug: null,
        studentSkills: [],
        skillGaps: [],
        existingProjects: [],
      })

      expect(recs.map((r) => r.templateId)).toEqual(recs2.map((r) => r.templateId))
    })

    it('deprioritizes projects that the student has already started', () => {
      const recs = recommendProjects({
        targetCareerSlug: 'backend-developer',
        studentSkills: [],
        skillGaps: [{ name: 'RESTful API Design', category: 'CRITICAL_MISSING' }],
        existingProjects: [
          {
            templateId: 'backend-developer-1',
            title: 'High-Concurrency URL Shortener Service',
            status: 'IN_PROGRESS',
          },
        ],
      })

      const startedProject = recs.find((r) => r.templateId === 'backend-developer-1')
      expect(startedProject).toBeDefined()
      expect(startedProject?.isAlreadyStarted).toBe(true)
      expect(startedProject?.existingProjectStatus).toBe('IN_PROGRESS')

      // Started project must sort after unstarted projects with equal or similar relevance
      const unstartedTop = recs[0]
      expect(unstartedTop.isAlreadyStarted).toBe(false)
    })
  })

  // ========================================================
  // 2. Project Workspace REST Endpoints Integration Tests
  // ========================================================
  describe('Project Workspace REST Endpoints', () => {
    let studentACookie: string
    let studentBCookie: string
    let studentAId: string
    let studentBId: string

    beforeAll(async () => {
      // Register Student A
      const emailA = `project-a-${Date.now()}@example.com`
      const resA = await request(app)
        .post('/auth/register')
        .send({ name: 'Project Student A', email: emailA, password: 'Password123!' })
      expect(resA.status).toBe(201)
      studentACookie = resA.headers['set-cookie'][0]
      studentAId = resA.body.user.id

      // Register Student B
      const emailB = `project-b-${Date.now()}@example.com`
      const resB = await request(app)
        .post('/auth/register')
        .send({ name: 'Project Student B', email: emailB, password: 'Password123!' })
      expect(resB.status).toBe(201)
      studentBCookie = resB.headers['set-cookie'][0]
      studentBId = resB.body.user.id
    })

    it('requires authentication for project workspace routes', async () => {
      const res = await request(app).get('/projects')
      expect(res.status).toBe(401)
    })

    it('returns empty list for newly registered student who has not created projects', async () => {
      const res = await request(app)
        .get('/projects')
        .set('Cookie', studentACookie)

      expect(res.status).toBe(200)
      expect(res.body.projects).toEqual([])
    })

    it('returns explainable recommendations endpoint GET /projects/recommendations', async () => {
      const res = await request(app)
        .get('/projects/recommendations?career=backend-developer')
        .set('Cookie', studentACookie)

      expect(res.status).toBe(200)
      expect(res.body.targetCareerSlug).toBe('backend-developer')
      expect(res.body.totalRecommendations).toBe(20)
      expect(Array.isArray(res.body.recommendations)).toBe(true)
      expect(res.body.recommendations[0].priority).toBeDefined()
      expect(res.body.recommendations[0].reasons.length).toBeGreaterThan(0)
    })

    it('returns catalog templates endpoint GET /projects/templates', async () => {
      const res = await request(app)
        .get('/projects/templates?career=frontend-developer')
        .set('Cookie', studentACookie)

      expect(res.status).toBe(200)
      expect(res.body.templates.length).toBe(2)
      expect(res.body.templates[0].careerSlug).toBe('frontend-developer')
    })

    let createdProjectId: string

    it('creates a custom project with valid data and status PLANNED', async () => {
      const res = await request(app)
        .post('/projects')
        .set('Cookie', studentACookie)
        .send({
          title: 'Distributed Log Aggregator',
          description: 'A microservice log pipeline using Node.js and SQLite.',
          source: 'CUSTOM',
          careerSlug: 'backend-developer',
          skills: ['RESTful API Design', 'Node.js', 'SQL'],
          status: 'PLANNED',
          notes: 'Goal is to test high-volume JSON streams.',
        })

      expect(res.status).toBe(201)
      expect(res.body.project).toBeDefined()
      expect(res.body.project.title).toBe('Distributed Log Aggregator')
      expect(res.body.project.status).toBe('PLANNED')
      expect(res.body.project.skills).toEqual(['RESTful API Design', 'Node.js', 'SQL'])
      expect(res.body.project.careerSlug).toBe('backend-developer')
      expect(res.body.project.userId).toBe(studentAId)
      createdProjectId = res.body.project.id
    })

    it('creates a project from a catalog template', async () => {
      const res = await request(app)
        .post('/projects')
        .set('Cookie', studentACookie)
        .send({
          title: 'High-Concurrency URL Shortener Service',
          source: 'TEMPLATE',
          templateId: 'backend-developer-1',
          careerSlug: 'backend-developer',
          status: 'IN_PROGRESS',
        })

      expect(res.status).toBe(201)
      expect(res.body.project.source).toBe('TEMPLATE')
      expect(res.body.project.templateId).toBe('backend-developer-1')
      expect(res.body.project.status).toBe('IN_PROGRESS')
      expect(res.body.project.startDate).toBeTruthy()
    })

    it('validates URL fields and rejects unsafe or unsupported protocols (javascript:, ftp:)', async () => {
      // Invalid repositoryUrl
      const res1 = await request(app)
        .post('/projects')
        .set('Cookie', studentACookie)
        .send({
          title: 'Malicious Project',
          repositoryUrl: 'javascript:alert(1)',
        })
      expect(res1.status).toBe(400)
      expect(res1.body.error).toMatch(/valid HTTP or HTTPS URL/i)

      // Invalid liveDemoUrl
      const res2 = await request(app)
        .post('/projects')
        .set('Cookie', studentACookie)
        .send({
          title: 'FTP Demo Project',
          liveDemoUrl: 'ftp://files.example.com/demo',
        })
      expect(res2.status).toBe(400)
      expect(res2.body.error).toMatch(/valid HTTP or HTTPS URL/i)

      // Valid HTTPS URLs succeed
      const res3 = await request(app)
        .post('/projects')
        .set('Cookie', studentACookie)
        .send({
          title: 'Valid Web Project',
          repositoryUrl: 'https://github.com/student/my-project',
          liveDemoUrl: 'https://my-project.vercel.app',
        })
      expect(res3.status).toBe(201)
      expect(res3.body.project.repositoryUrl).toBe('https://github.com/student/my-project')
      expect(res3.body.project.liveDemoUrl).toBe('https://my-project.vercel.app')
    })

    it('rejects missing or empty title and invalid status', async () => {
      const res1 = await request(app)
        .post('/projects')
        .set('Cookie', studentACookie)
        .send({ title: '' })
      expect(res1.status).toBe(400)

      const res2 = await request(app)
        .post('/projects')
        .set('Cookie', studentACookie)
        .send({ title: 'Valid Title', status: 'INVALID_STATUS' })
      expect(res2.status).toBe(400)
    })

    it('retrieves single project by ID with deliverables list', async () => {
      const res = await request(app)
        .get(`/projects/${createdProjectId}`)
        .set('Cookie', studentACookie)

      expect(res.status).toBe(200)
      expect(res.body.project.id).toBe(createdProjectId)
      expect(res.body.project.title).toBe('Distributed Log Aggregator')
      expect(Array.isArray(res.body.project.deliverables)).toBe(true)
    })

    it('updates project fields, status transitions, and repository/demo links', async () => {
      const res = await request(app)
        .patch(`/projects/${createdProjectId}`)
        .set('Cookie', studentACookie)
        .send({
          status: 'COMPLETED',
          repositoryUrl: 'https://github.com/student/log-aggregator',
          liveDemoUrl: 'https://log-aggregator.internal.net',
          notes: 'Completed all core features and benchmarks.',
        })

      expect(res.status).toBe(200)
      expect(res.body.project.status).toBe('COMPLETED')
      expect(res.body.project.completionDate).toBeTruthy()
      expect(res.body.project.repositoryUrl).toBe('https://github.com/student/log-aggregator')
    })

    let deliverableId: string

    it('adds a deliverable/evidence record to the project', async () => {
      const res = await request(app)
        .post(`/projects/${createdProjectId}/evidence`)
        .set('Cookie', studentACookie)
        .send({
          title: 'Core REST Ingestion Endpoints',
          description: 'POST /api/v1/logs handler with batched SQLite transactions and schema validation.',
          type: 'FEATURE_MODULE',
          status: 'SUBMITTED',
          url: 'https://github.com/student/log-aggregator/pull/1',
        })

      expect(res.status).toBe(201)
      expect(res.body.deliverable).toBeDefined()
      expect(res.body.deliverable.title).toBe('Core REST Ingestion Endpoints')
      expect(res.body.deliverable.status).toBe('SUBMITTED')
      expect(res.body.deliverable.type).toBe('FEATURE_MODULE')
      deliverableId = res.body.deliverable.id
    })

    it('updates deliverable title, description, and status', async () => {
      const res = await request(app)
        .patch(`/projects/${createdProjectId}/evidence/${deliverableId}`)
        .set('Cookie', studentACookie)
        .send({
          description: 'Updated with benchmark numbers: 5,000 req/sec.',
        })

      expect(res.status).toBe(200)
      expect(res.body.deliverable.description).toContain('5,000 req/sec')
    })

    it('validates roadmap task association and rejects tasks belonging to another student', async () => {
      // 1. Generate roadmap for Student B
      const genB = await request(app)
        .post('/roadmap/generate')
        .set('Cookie', studentBCookie)
        .send({ careerSlug: 'frontend-developer' })
      expect(genB.status).toBe(201)
      const studentBTaskId = genB.body.roadmap.tasks[0].id

      // 2. Student A tries to link Student B's roadmap task to Student A's project
      const res = await request(app)
        .post(`/projects/${createdProjectId}/evidence`)
        .set('Cookie', studentACookie)
        .send({
          title: 'Unauthorized Task Link',
          roadmapTaskId: studentBTaskId,
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/unauthorized roadmap task/i)
    })

    it('links a valid roadmap task belonging to the student', async () => {
      // Generate roadmap for Student A
      const genA = await request(app)
        .post('/roadmap/generate')
        .set('Cookie', studentACookie)
        .send({ careerSlug: 'backend-developer' })
      expect(genA.status).toBe(201)
      const studentATaskId = genA.body.roadmap.tasks[0].id

      const res = await request(app)
        .post(`/projects/${createdProjectId}/evidence`)
        .set('Cookie', studentACookie)
        .send({
          title: 'Week 1 Foundation Milestone Code',
          description: 'Initial express scaffolding linked to Week 1 Task.',
          type: 'CODE_REPOSITORY',
          roadmapTaskId: studentATaskId,
          url: 'https://github.com/student/log-aggregator/tree/week-1',
        })

      expect(res.status).toBe(201)
      expect(res.body.deliverable.roadmapTaskId).toBe(studentATaskId)
      expect(res.body.deliverable.roadmapTaskTitle).toBeTruthy()
    })

    it('enforces strict cross-user ownership isolation (Student B cannot access Student A project)', async () => {
      // Student B attempts to get Student A's project
      const getRes = await request(app)
        .get(`/projects/${createdProjectId}`)
        .set('Cookie', studentBCookie)
      expect(getRes.status).toBe(403)

      // Student B attempts to patch Student A's project
      const patchRes = await request(app)
        .patch(`/projects/${createdProjectId}`)
        .set('Cookie', studentBCookie)
        .send({ title: 'Hijacked Title' })
      expect(patchRes.status).toBe(403)

      // Student B attempts to add evidence to Student A's project
      const addEvRes = await request(app)
        .post(`/projects/${createdProjectId}/evidence`)
        .set('Cookie', studentBCookie)
        .send({ title: 'Hijacked Evidence' })
      expect(addEvRes.status).toBe(403)

      // Student B attempts to delete deliverable on Student A's project
      const delEvRes = await request(app)
        .delete(`/projects/${createdProjectId}/evidence/${deliverableId}`)
        .set('Cookie', studentBCookie)
      expect(delEvRes.status).toBe(403)

      // Student B attempts to delete Student A's project
      const delRes = await request(app)
        .delete(`/projects/${createdProjectId}`)
        .set('Cookie', studentBCookie)
      expect(delRes.status).toBe(403)
    })

    it('returns dashboard summary metrics endpoint GET /projects/metrics', async () => {
      const res = await request(app)
        .get('/projects/metrics')
        .set('Cookie', studentACookie)

      expect(res.status).toBe(200)
      expect(res.body.metrics).toBeDefined()
      expect(res.body.metrics.totalProjects).toBeGreaterThanOrEqual(2)
      expect(res.body.metrics.totalDeliverables).toBeGreaterThanOrEqual(1)
    })

    it('deletes a deliverable and verifies it is removed', async () => {
      const res = await request(app)
        .delete(`/projects/${createdProjectId}/evidence/${deliverableId}`)
        .set('Cookie', studentACookie)

      expect(res.status).toBe(200)

      // Verify deliverable is gone
      const getRes = await request(app)
        .get(`/projects/${createdProjectId}`)
        .set('Cookie', studentACookie)

      expect(getRes.status).toBe(200)
      expect(getRes.body.project.deliverables.some((d: { id: string }) => d.id === deliverableId)).toBe(false)
    })

    it('safely deletes a project without deleting or harming roadmap tasks', async () => {
      // 1. Verify student A roadmap has tasks
      const roadmapBefore = await request(app)
        .get('/roadmap/current')
        .set('Cookie', studentACookie)
      expect(roadmapBefore.body.hasRoadmap).toBe(true)
      const tasksCountBefore = roadmapBefore.body.roadmap.tasks.length

      // 2. Delete project
      const delRes = await request(app)
        .delete(`/projects/${createdProjectId}`)
        .set('Cookie', studentACookie)
      expect(delRes.status).toBe(200)

      // 3. Verify project is 404
      const getRes = await request(app)
        .get(`/projects/${createdProjectId}`)
        .set('Cookie', studentACookie)
      expect(getRes.status).toBe(404)

      // 4. Verify roadmap tasks remain 100% intact
      const roadmapAfter = await request(app)
        .get('/roadmap/current')
        .set('Cookie', studentACookie)
      expect(roadmapAfter.body.hasRoadmap).toBe(true)
      expect(roadmapAfter.body.roadmap.tasks.length).toBe(tasksCountBefore)
    })
  })
})
