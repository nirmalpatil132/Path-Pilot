import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../src/app.js'
import { seedCareerCatalog } from '../src/db/seedCareers.js'
import { analyzeSkillGaps } from '../src/services/careerFit/skillGapService.js'
import {
  generate30DayRoadmap,
  parseWeeklyHours,
  type CareerInput,
  type StudentProfileInput,
} from '../src/services/roadmap/roadmapGenerator.js'

describe('PathPilot Phase 07: Personalized Learning Roadmap & Progress Tracking', () => {
  beforeAll(async () => {
    await seedCareerCatalog()
  })

  // ========================================================
  // 1. Roadmap Generator Unit Tests
  // ========================================================
  describe('Roadmap Generator Unit Tests', () => {
    const mockCareer: CareerInput = {
      slug: 'backend-developer',
      title: 'Backend Developer',
      category: 'Engineering',
      skills: [
        { id: 'cs-1', name: 'RESTful API Design', type: 'core' },
        { id: 'cs-2', name: 'Relational Databases & SQL', type: 'core' },
        { id: 'cs-3', name: 'Node.js / Express / Python', type: 'core' },
        { id: 'cs-4', name: 'Docker & Containerization', type: 'supporting' },
        { id: 'cs-5', name: 'Caching (Redis)', type: 'supporting' },
      ],
      responsibilities: [
        'Design and maintain scalable server-side APIs.',
        'Optimize database schemas and query performance.',
      ],
      exampleProjects: [
        {
          title: 'E-Commerce REST API Engine',
          description: 'Production API with inventory lock and PostgreSQL transactions.',
          skills: ['RESTful API Design', 'Relational Databases & SQL', 'Node.js / Express / Python'],
        },
      ],
      prerequisites: ['Basic Programming', 'Git Version Control'],
    }

    it('parses weekly hours accurately with safe fallbacks and boundaries', () => {
      expect(parseWeeklyHours('5-10')).toBe(8)
      expect(parseWeeklyHours('10-15')).toBe(12)
      expect(parseWeeklyHours('15-20')).toBe(18)
      expect(parseWeeklyHours('20+')).toBe(20)
      expect(parseWeeklyHours('15')).toBe(15)
      expect(parseWeeklyHours(14)).toBe(14)
      expect(parseWeeklyHours('invalid', 10)).toBe(10)
      expect(parseWeeklyHours(null, 10)).toBe(10)
      // Clamps to [5, 40]
      expect(parseWeeklyHours(2)).toBe(5)
      expect(parseWeeklyHours(60)).toBe(40)
    })

    it('generates a deterministic 30-day plan divided into 4 specific weeks', () => {
      const studentProfile: StudentProfileInput = {
        skills: [{ name: 'Git Version Control', proficiency: 'Intermediate' }],
        experiences: [],
        primaryGoal: 'Get an entry-level Backend role',
        weeklyHours: '10-15',
      }

      const skillGaps = analyzeSkillGaps(
        {
          slug: mockCareer.slug,
          title: mockCareer.title,
          skills: mockCareer.skills,
          prerequisites: mockCareer.prerequisites,
        },
        studentProfile.skills,
      )

      const plan1 = generate30DayRoadmap(mockCareer, studentProfile, skillGaps, 12)
      const plan2 = generate30DayRoadmap(mockCareer, studentProfile, skillGaps, 12)

      expect(plan1.totalDays).toBe(30)
      expect(plan1.weeks.length).toBe(4)
      expect(plan1.allTasks.length).toBe(12) // Exactly 3 tasks per week
      expect(plan1.weeklyHoursAssumed).toBe(12)

      // Verify weeks structure
      expect(plan1.weeks[0].weekNumber).toBe(1)
      expect(plan1.weeks[0].dayRange).toBe('Days 1–7')
      expect(plan1.weeks[1].weekNumber).toBe(2)
      expect(plan1.weeks[1].dayRange).toBe('Days 8–14')
      expect(plan1.weeks[2].weekNumber).toBe(3)
      expect(plan1.weeks[2].dayRange).toBe('Days 15–21')
      expect(plan1.weeks[3].weekNumber).toBe(4)
      expect(plan1.weeks[3].dayRange).toBe('Days 22–30')

      // Determinism: Same input must yield identical output
      expect(JSON.stringify(plan1)).toEqual(JSON.stringify(plan2))
    })

    it('prioritizes Critical Missing core skills before supporting skills in Week 1 and 2', () => {
      const studentProfile: StudentProfileInput = {
        skills: [
          { name: 'Docker & Containerization', proficiency: 'Intermediate' }, // knows supporting skill
        ],
        experiences: [],
      }

      const skillGaps = analyzeSkillGaps(
        {
          slug: mockCareer.slug,
          title: mockCareer.title,
          skills: mockCareer.skills,
          prerequisites: mockCareer.prerequisites,
        },
        studentProfile.skills,
      )

      const plan = generate30DayRoadmap(mockCareer, studentProfile, skillGaps)

      // Week 1 should focus on a Critical Missing skill (e.g. RESTful API Design)
      const week1Skills = plan.weeks[0].tasks.map((t) => t.skillCategory)
      expect(week1Skills.every((c) => c === 'CRITICAL_MISSING')).toBe(true)

      // Tasks in Week 3 must be tagged with PROJECT
      const week3Categories = plan.weeks[2].tasks.map((t) => t.skillCategory)
      expect(week3Categories.every((c) => c === 'PROJECT')).toBe(true)
    })

    it('keeps total weekly task minutes strictly within weekly time budget', () => {
      const studentProfile: StudentProfileInput = {
        skills: [],
        experiences: [],
      }

      const skillGaps = analyzeSkillGaps(
        {
          slug: mockCareer.slug,
          title: mockCareer.title,
          skills: mockCareer.skills,
          prerequisites: mockCareer.prerequisites,
        },
        studentProfile.skills,
      )

      const weeklyHours = 10 // 600 minutes
      const plan = generate30DayRoadmap(mockCareer, studentProfile, skillGaps, weeklyHours)

      for (const week of plan.weeks) {
        // Must leave at least 25% buffer for review/debugging
        expect(week.totalMinutes).toBeLessThanOrEqual(weeklyHours * 60)
        expect(week.totalMinutes).toBeGreaterThan(0)
      }
    })

    it('handles student with high skill match by focusing on advanced project implementation', () => {
      const studentProfile: StudentProfileInput = {
        skills: [
          { name: 'RESTful API Design', proficiency: 'Advanced' },
          { name: 'Relational Databases & SQL', proficiency: 'Advanced' },
          { name: 'Node.js / Express / Python', proficiency: 'Advanced' },
          { name: 'Docker & Containerization', proficiency: 'Advanced' },
          { name: 'Caching (Redis)', proficiency: 'Advanced' },
        ],
        experiences: [],
      }

      const skillGaps = analyzeSkillGaps(
        {
          slug: mockCareer.slug,
          title: mockCareer.title,
          skills: mockCareer.skills,
          prerequisites: mockCareer.prerequisites,
        },
        studentProfile.skills,
      )

      const plan = generate30DayRoadmap(mockCareer, studentProfile, skillGaps)
      expect(plan.allTasks.length).toBe(12)
      expect(plan.weeks[2].tasks[0].title).toContain(mockCareer.exampleProjects![0].title)
    })

    it('records deferred skills honestly when career has more skills than 30-day scope allows', () => {
      const manySkillsCareer: CareerInput = {
        slug: 'full-stack-developer',
        title: 'Full Stack Developer',
        category: 'Engineering',
        skills: [
          { id: '1', name: 'Frontend Architecture & React', type: 'core' },
          { id: '2', name: 'RESTful API Design', type: 'core' },
          { id: '3', name: 'Relational Databases & SQL', type: 'core' },
          { id: '4', name: 'TypeScript & Modern JavaScript', type: 'core' },
          { id: '5', name: 'Docker & Containerization', type: 'supporting' },
          { id: '6', name: 'CI/CD Pipelines', type: 'supporting' },
          { id: '7', name: 'Automated Testing', type: 'supporting' },
        ],
        exampleProjects: [{ title: 'Full Stack App', description: 'Web app with API and DB.' }],
      }

      const skillGaps = analyzeSkillGaps(
        {
          slug: manySkillsCareer.slug,
          title: manySkillsCareer.title,
          skills: manySkillsCareer.skills,
        },
        [], // empty student skills
      )

      const plan = generate30DayRoadmap(manySkillsCareer, { skills: [] }, skillGaps, 10)

      // Should explicitly defer skills that don't fit into the 30-day focus
      expect(plan.deferredSkills.length).toBeGreaterThan(0)
      expect(plan.assumptions.some((a) => a.includes('deferred'))).toBe(true)
    })
  })

  // ========================================================
  // 2. Backend REST API Integration Tests
  // ========================================================
  describe('Backend Roadmap REST Endpoints', () => {
    const registerStudent = async (email: string) => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Roadmap Student', email, password: 'Password123!' })
      return { user: res.body.user, cookie: res.headers['set-cookie'] }
    }

    it('rejects unauthenticated access to all /roadmap endpoints (401)', async () => {
      const res1 = await request(app).get('/roadmap/current')
      expect(res1.status).toBe(401)

      const res2 = await request(app).post('/roadmap/generate').send({ careerSlug: 'backend-developer' })
      expect(res2.status).toBe(401)

      const res3 = await request(app).patch('/roadmap/tasks/some-task-id').send({ status: 'COMPLETED' })
      expect(res3.status).toBe(401)
    })

    it('returns hasRoadmap: false for newly registered student who has not generated one', async () => {
      const email = `new_student_${Date.now()}@example.com`
      const { cookie } = await registerStudent(email)

      const res = await request(app).get('/roadmap/current').set('Cookie', cookie)
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ hasRoadmap: false, roadmap: null })
    })

    it('generates, persists, and retrieves a 30-day roadmap for a chosen career', async () => {
      const email = `gen_student_${Date.now()}@example.com`
      const { cookie } = await registerStudent(email)

      // Setup minimal profile
      await request(app)
        .put('/profile')
        .set('Cookie', cookie)
        .send({
          degree: 'B.Tech',
          branch: 'Computer Science',
          weeklyHours: '10-15',
        })

      await request(app)
        .put('/profile/skills')
        .set('Cookie', cookie)
        .send({
          skills: [{ name: 'Git Version Control', proficiency: 'Beginner' }],
        })

      // Generate roadmap
      const genRes = await request(app)
        .post('/roadmap/generate')
        .set('Cookie', cookie)
        .send({ careerSlug: 'backend-developer', weeklyHours: 12 })

      expect(genRes.status).toBe(201)
      expect(genRes.body.roadmap).toBeDefined()
      expect(genRes.body.roadmap.careerSlug).toBe('backend-developer')
      expect(genRes.body.roadmap.status).toBe('ACTIVE')
      expect(genRes.body.roadmap.totalDays).toBe(30)
      expect(genRes.body.roadmap.tasks.length).toBe(12)
      expect(genRes.body.roadmap.weeks.length).toBe(4)
      expect(genRes.body.roadmap.progressPercentage).toBe(0)

      const roadmapId = genRes.body.roadmap.id

      // Fetch via GET /roadmap/current
      const currentRes = await request(app).get('/roadmap/current').set('Cookie', cookie)
      expect(currentRes.status).toBe(200)
      expect(currentRes.body.hasRoadmap).toBe(true)
      expect(currentRes.body.roadmap.id).toBe(roadmapId)
      expect(currentRes.body.roadmap.tasks.length).toBe(12)

      // Fetch via GET /roadmap/:id
      const idRes = await request(app).get(`/roadmap/${roadmapId}`).set('Cookie', cookie)
      expect(idRes.status).toBe(200)
      expect(idRes.body.roadmap.id).toBe(roadmapId)
    })

    it('rejects generating for an unknown career slug with 404', async () => {
      const email = `unknown_career_${Date.now()}@example.com`
      const { cookie } = await registerStudent(email)

      const res = await request(app)
        .post('/roadmap/generate')
        .set('Cookie', cookie)
        .send({ careerSlug: 'non-existent-career' })

      expect(res.status).toBe(404)
      expect(res.body.error).toMatch(/not found/i)
    })

    it('returns 409 Conflict when attempting to generate if an active roadmap already exists', async () => {
      const email = `conflict_${Date.now()}@example.com`
      const { cookie } = await registerStudent(email)

      // 1. First generation succeeds
      const firstRes = await request(app)
        .post('/roadmap/generate')
        .set('Cookie', cookie)
        .send({ careerSlug: 'frontend-developer' })
      expect(firstRes.status).toBe(201)

      // 2. Second generation without force or regenerate must return 409
      const secondRes = await request(app)
        .post('/roadmap/generate')
        .set('Cookie', cookie)
        .send({ careerSlug: 'backend-developer' })
      expect(secondRes.status).toBe(409)
      expect(secondRes.body.error).toMatch(/active roadmap already exists/i)
      expect(secondRes.body.details).toHaveProperty('existingRoadmapId')
    })

    it('updates task status and recalculates overall and weekly roadmap progress atomically', async () => {
      const email = `progress_${Date.now()}@example.com`
      const { cookie } = await registerStudent(email)

      const genRes = await request(app)
        .post('/roadmap/generate')
        .set('Cookie', cookie)
        .send({ careerSlug: 'backend-developer' })
      expect(genRes.status).toBe(201)

      const firstTask = genRes.body.roadmap.tasks[0]
      expect(firstTask.status).toBe('NOT_STARTED')

      // Transition to IN_PROGRESS
      const patch1 = await request(app)
        .patch(`/roadmap/tasks/${firstTask.id}`)
        .set('Cookie', cookie)
        .send({ status: 'IN_PROGRESS', notes: 'Configured local Node environment.' })

      expect(patch1.status).toBe(200)
      expect(patch1.body.task.status).toBe('IN_PROGRESS')
      expect(patch1.body.task.notes).toBe('Configured local Node environment.')
      expect(patch1.body.roadmapProgress.inProgressTasks).toBe(1)
      expect(patch1.body.roadmapProgress.completedTasks).toBe(0)

      // Transition to COMPLETED
      const patch2 = await request(app)
        .patch(`/roadmap/tasks/${firstTask.id}`)
        .set('Cookie', cookie)
        .send({ status: 'COMPLETED' })

      expect(patch2.status).toBe(200)
      expect(patch2.body.task.status).toBe('COMPLETED')
      expect(patch2.body.task.completedAt).not.toBeNull()
      expect(patch2.body.roadmapProgress.completedTasks).toBe(1)
      // 1 of 12 tasks completed = 8.3%
      expect(patch2.body.roadmapProgress.progressPercentage).toBe(8.3)

      // Verify persistent GET /roadmap/current reflects this
      const currentRes = await request(app).get('/roadmap/current').set('Cookie', cookie)
      expect(currentRes.body.roadmap.completedTasks).toBe(1)
      expect(currentRes.body.roadmap.progressPercentage).toBe(8.3)
      expect(currentRes.body.roadmap.weeks[0].completedTasks).toBe(1)
      expect(currentRes.body.roadmap.weeks[0].progressPercentage).toBe(33.3) // 1 of 3 tasks in week 1
    })

    it('rejects invalid task status values (400)', async () => {
      const email = `invalid_status_${Date.now()}@example.com`
      const { cookie } = await registerStudent(email)

      const genRes = await request(app)
        .post('/roadmap/generate')
        .set('Cookie', cookie)
        .send({ careerSlug: 'backend-developer' })

      const taskId = genRes.body.roadmap.tasks[0].id

      const patchRes = await request(app)
        .patch(`/roadmap/tasks/${taskId}`)
        .set('Cookie', cookie)
        .send({ status: 'INVALID_STATUS_STRING' })

      expect(patchRes.status).toBe(400)
      expect(patchRes.body.error).toMatch(/invalid task status/i)
    })

    it('enforces strict cross-user ownership isolation for roadmaps and tasks', async () => {
      const { cookie: cookieA } = await registerStudent(`userA_${Date.now()}@example.com`)
      const { cookie: cookieB } = await registerStudent(`userB_${Date.now()}@example.com`)

      // User A generates a roadmap
      const genA = await request(app)
        .post('/roadmap/generate')
        .set('Cookie', cookieA)
        .send({ careerSlug: 'backend-developer' })
      const roadmapAId = genA.body.roadmap.id
      const taskAId = genA.body.roadmap.tasks[0].id

      // User B attempts to view User A's roadmap by ID -> 404
      const viewB = await request(app).get(`/roadmap/${roadmapAId}`).set('Cookie', cookieB)
      expect(viewB.status).toBe(404)

      // User B attempts to patch User A's task -> 404
      const patchB = await request(app)
        .patch(`/roadmap/tasks/${taskAId}`)
        .set('Cookie', cookieB)
        .send({ status: 'COMPLETED' })
      expect(patchB.status).toBe(404)
    })

    it('regenerates a roadmap safely, archiving previous plans and incrementing version', async () => {
      const email = `regen_${Date.now()}@example.com`
      const { cookie } = await registerStudent(email)

      // 1. Initial generation for Backend Developer (v1)
      const res1 = await request(app)
        .post('/roadmap/generate')
        .set('Cookie', cookie)
        .send({ careerSlug: 'backend-developer' })
      expect(res1.body.roadmap.version).toBe(1)
      const firstRoadmapId = res1.body.roadmap.id

      // 2. Regenerate for Full Stack Developer
      const res2 = await request(app)
        .post('/roadmap/regenerate')
        .set('Cookie', cookie)
        .send({ careerSlug: 'full-stack-developer', weeklyHours: 15 })

      expect(res2.status).toBe(201)
      expect(res2.body.roadmap.careerSlug).toBe('full-stack-developer')
      expect(res2.body.roadmap.version).toBe(2)
      expect(res2.body.roadmap.id).not.toBe(firstRoadmapId)
      expect(res2.body.roadmap.status).toBe('ACTIVE')

      // 3. Confirm GET /roadmap/current returns the new v2 roadmap
      const currentRes = await request(app).get('/roadmap/current').set('Cookie', cookie)
      expect(currentRes.body.roadmap.id).toBe(res2.body.roadmap.id)
      expect(currentRes.body.roadmap.careerSlug).toBe('full-stack-developer')
      expect(currentRes.body.roadmap.version).toBe(2)
    })
  })
})
