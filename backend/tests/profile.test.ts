import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app.js'

describe('PathPilot Profile & Onboarding API', () => {
  const registerUser = async (email: string, name = 'Test Student') => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name, email, password: 'Password123!' })
    const cookie = res.headers['set-cookie']
    return { user: res.body.user, cookie }
  }

  describe('Unauthenticated access protection', () => {
    it('rejects GET /profile without session cookie', async () => {
      const res = await request(app).get('/profile')
      expect(res.status).toBe(401)
      expect(res.body.error).toMatch(/unauthenticated/i)
    })

    it('rejects PUT /profile without session cookie', async () => {
      const res = await request(app)
        .put('/profile')
        .send({ degree: 'B.Tech' })
      expect(res.status).toBe(401)
    })

    it('rejects PUT /profile/skills without session cookie', async () => {
      const res = await request(app)
        .put('/profile/skills')
        .send({ skills: [{ name: 'Python' }] })
      expect(res.status).toBe(401)
    })

    it('rejects PUT /profile/experience without session cookie', async () => {
      const res = await request(app)
        .put('/profile/experience')
        .send({ experiences: [{ title: 'App' }] })
      expect(res.status).toBe(401)
    })

    it('rejects PUT /profile/onboarding/complete without session cookie', async () => {
      const res = await request(app).put('/profile/onboarding/complete')
      expect(res.status).toBe(401)
    })
  })

  describe('Profile lifecycle & partial updates', () => {
    it('returns null profile before student enters onboarding data', async () => {
      const timestamp = Date.now()
      const { cookie } = await registerUser(`student_${timestamp}@college.edu`)

      const res = await request(app)
        .get('/profile')
        .set('Cookie', cookie)

      expect(res.status).toBe(200)
      expect(res.body.profile).toBeNull()
    })

    it('creates profile and saves partial education info', async () => {
      const timestamp = Date.now()
      const { cookie, user } = await registerUser(`student_edu_${timestamp}@college.edu`)

      const updateRes = await request(app)
        .put('/profile')
        .set('Cookie', cookie)
        .send({
          currentStep: 2,
          degree: 'B.Tech Computer Science',
          branch: 'CSE',
          currentYear: '3rd Year',
          university: 'Pune University',
          college: 'COEP Tech',
          cgpa: 8.5,
          academicContext: 'Specialized in systems and algorithms',
        })

      expect(updateRes.status).toBe(200)
      expect(updateRes.body.profile).toBeDefined()
      expect(updateRes.body.profile.userId).toBe(user.id)
      expect(updateRes.body.profile.degree).toBe('B.Tech Computer Science')
      expect(updateRes.body.profile.cgpa).toBe(8.5)
      expect(updateRes.body.profile.isOnboardingCompleted).toBe(false)
      expect(updateRes.body.profile.currentStep).toBe(2)

      // Retrieve via GET /profile
      const getRes = await request(app)
        .get('/profile')
        .set('Cookie', cookie)

      expect(getRes.status).toBe(200)
      expect(getRes.body.profile.college).toBe('COEP Tech')
      expect(getRes.body.profile.academicContext).toBe('Specialized in systems and algorithms')
    })

    it('preserves existing fields during partial updates', async () => {
      const timestamp = Date.now()
      const { cookie } = await registerUser(`student_partial_${timestamp}@college.edu`)

      // Step 2: Education
      await request(app)
        .put('/profile')
        .set('Cookie', cookie)
        .send({
          degree: 'B.E.',
          branch: 'IT',
          currentYear: '4th Year',
          college: 'MIT Pune',
        })

      // Step 5: Interests update without resubmitting education fields
      const partialRes = await request(app)
        .put('/profile')
        .set('Cookie', cookie)
        .send({
          currentStep: 5,
          interests: ['software_development', 'ai_ml', 'cloud'],
        })

      expect(partialRes.status).toBe(200)
      expect(partialRes.body.profile.interests).toEqual(['software_development', 'ai_ml', 'cloud'])
      // Education fields must still be intact
      expect(partialRes.body.profile.degree).toBe('B.E.')
      expect(partialRes.body.profile.branch).toBe('IT')
      expect(partialRes.body.profile.currentStep).toBe(5)

      // Step 6: Goals update
      const goalsRes = await request(app)
        .put('/profile')
        .set('Cookie', cookie)
        .send({
          primaryGoal: 'job',
          secondaryGoals: ['startup', 'higher_studies'],
        })

      expect(goalsRes.status).toBe(200)
      expect(goalsRes.body.profile.primaryGoal).toBe('job')
      expect(goalsRes.body.profile.secondaryGoals).toEqual(['startup', 'higher_studies'])
      expect(goalsRes.body.profile.degree).toBe('B.E.')
    })

    it('rejects invalid inputs on profile update', async () => {
      const timestamp = Date.now()
      const { cookie } = await registerUser(`student_invalid_${timestamp}@college.edu`)

      // CGPA out of bounds (> 10)
      const res = await request(app)
        .put('/profile')
        .set('Cookie', cookie)
        .send({ cgpa: 15.0 })

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/validation failed/i)
    })
  })

  describe('Skills management', () => {
    it('replaces skills, normalizes names, and rejects duplicates', async () => {
      const timestamp = Date.now()
      const { cookie } = await registerUser(`student_skills_${timestamp}@college.edu`)

      const skillsData = [
        { name: 'Python', proficiency: 'Advanced' },
        { name: 'python', proficiency: 'Beginner' }, // duplicate (case-insensitive)
        { name: '  JavaScript  ', proficiency: 'Intermediate' },
        { name: 'SQL', proficiency: 'Intermediate' },
      ]

      const res = await request(app)
        .put('/profile/skills')
        .set('Cookie', cookie)
        .send({ skills: skillsData })

      expect(res.status).toBe(200)
      expect(res.body.skills).toHaveLength(3) // Python, JavaScript, SQL
      expect(res.body.skills.map((s: { name: string }) => s.name)).toEqual(
        expect.arrayContaining(['Python', 'JavaScript', 'SQL']),
      )

      // Confirm in GET /profile
      const profileRes = await request(app)
        .get('/profile')
        .set('Cookie', cookie)
      expect(profileRes.body.profile.skills).toHaveLength(3)
    })

    it('rejects empty skill names', async () => {
      const timestamp = Date.now()
      const { cookie } = await registerUser(`student_skillempty_${timestamp}@college.edu`)

      const res = await request(app)
        .put('/profile/skills')
        .set('Cookie', cookie)
        .send({ skills: [{ name: '   ', proficiency: 'Beginner' }] })

      expect(res.status).toBe(400)
    })
  })

  describe('Experience management', () => {
    it('adds, edits, and replaces experience entries', async () => {
      const timestamp = Date.now()
      const { cookie } = await registerUser(`student_exp_${timestamp}@college.edu`)

      const initialExperiences = [
        {
          type: 'internship',
          title: 'Frontend Intern',
          organization: 'Acme Corp',
          description: 'Built React components',
          startDate: 'June 2025',
          endDate: 'August 2025',
        },
        {
          type: 'project',
          title: 'PathPilot App',
          description: 'Career discovery platform',
          link: 'https://github.com/pathpilot',
        },
      ]

      const res = await request(app)
        .put('/profile/experience')
        .set('Cookie', cookie)
        .send({ experiences: initialExperiences })

      expect(res.status).toBe(200)
      expect(res.body.experiences).toHaveLength(2)
      expect(res.body.experiences[0].title).toBe('Frontend Intern')
      expect(res.body.experiences[1].link).toBe('https://github.com/pathpilot')

      // Now clear experiences (empty list allows skipping)
      const clearRes = await request(app)
        .put('/profile/experience')
        .set('Cookie', cookie)
        .send({ experiences: [] })

      expect(clearRes.status).toBe(200)
      expect(clearRes.body.experiences).toHaveLength(0)
    })

    it('rejects experience entries with invalid types or empty titles', async () => {
      const timestamp = Date.now()
      const { cookie } = await registerUser(`student_badexp_${timestamp}@college.edu`)

      const res = await request(app)
        .put('/profile/experience')
        .set('Cookie', cookie)
        .send({
          experiences: [
            {
              type: 'invalid_type',
              title: 'Some Work',
            },
          ],
        })

      expect(res.status).toBe(400)
    })
  })

  describe('Onboarding completion validation', () => {
    it('rejects completion when required education fields are missing', async () => {
      const timestamp = Date.now()
      const { cookie } = await registerUser(`student_incomplete_${timestamp}@college.edu`)

      // Only provide degree, missing branch, year, college
      await request(app)
        .put('/profile')
        .set('Cookie', cookie)
        .send({ degree: 'B.Tech' })

      const completeRes = await request(app)
        .put('/profile/onboarding/complete')
        .set('Cookie', cookie)

      expect(completeRes.status).toBe(400)
      expect(completeRes.body.error).toMatch(/required education fields/i)
    })

    it('successfully completes onboarding when required fields are present', async () => {
      const timestamp = Date.now()
      const { cookie } = await registerUser(`student_full_${timestamp}@college.edu`)

      // Submit full valid profile
      await request(app)
        .put('/profile')
        .set('Cookie', cookie)
        .send({
          degree: 'B.Tech',
          branch: 'Computer Science and Engineering',
          currentYear: '3rd Year',
          college: 'VJTI Mumbai',
          university: 'Mumbai University',
          cgpa: 9.1,
          interests: ['software_development', 'ai_ml'],
          primaryGoal: 'job',
        })

      await request(app)
        .put('/profile/skills')
        .set('Cookie', cookie)
        .send({
          skills: [
            { name: 'Python', proficiency: 'Advanced' },
            { name: 'TypeScript', proficiency: 'Intermediate' },
          ],
        })

      const completeRes = await request(app)
        .put('/profile/onboarding/complete')
        .set('Cookie', cookie)

      expect(completeRes.status).toBe(200)
      expect(completeRes.body.profile.isOnboardingCompleted).toBe(true)
      expect(completeRes.body.profile.completedAt).toBeDefined()
      expect(completeRes.body.profile.currentStep).toBe(8)

      // Subsequent GET /profile reflects completion
      const getRes = await request(app)
        .get('/profile')
        .set('Cookie', cookie)

      expect(getRes.body.profile.isOnboardingCompleted).toBe(true)
      expect(getRes.body.profile.skills).toHaveLength(2)
    })
  })

  describe('User authorization and isolation', () => {
    it('guarantees user A cannot read or mutate user B profile', async () => {
      const timestamp = Date.now()
      const { cookie: cookieA } = await registerUser(`userA_${timestamp}@college.edu`, 'User A')
      const { cookie: cookieB } = await registerUser(`userB_${timestamp}@college.edu`, 'User B')

      // User A populates profile
      await request(app)
        .put('/profile')
        .set('Cookie', cookieA)
        .send({
          degree: 'B.Tech',
          branch: 'Mechanical',
          college: 'College A',
          currentYear: '2nd Year',
        })

      // User B checks their profile: must be null, not User A
      const bRes = await request(app)
        .get('/profile')
        .set('Cookie', cookieB)

      expect(bRes.status).toBe(200)
      expect(bRes.body.profile).toBeNull()

      // User B creates their own profile
      await request(app)
        .put('/profile')
        .set('Cookie', cookieB)
        .send({
          degree: 'BCA',
          branch: 'Computers',
          college: 'College B',
          currentYear: '1st Year',
        })

      // Verify User A still has College A
      const aRes = await request(app)
        .get('/profile')
        .set('Cookie', cookieA)

      expect(aRes.body.profile.college).toBe('College A')

      // Verify User B has College B
      const bRes2 = await request(app)
        .get('/profile')
        .set('Cookie', cookieB)

      expect(bRes2.body.profile.college).toBe('College B')
    })
  })
})
