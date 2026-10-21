import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../src/app.js'
import { seedCareerCatalog } from '../src/db/seedCareers.js'
import {
  DEFAULT_SCORING_POLICY,
  DEFAULT_SCORING_WEIGHTS,
  SCORING_POLICY_VERSION,
  calculateEffectiveWeights,
  evaluateEvidenceSufficiency,
  validateScoringWeights,
  type DimensionAvailability,
} from '../src/services/careerFit/scoringPolicy.js'
import {
  EXPLICIT_SKILL_ALIASES,
  getCanonicalSkill,
  isSkillMatch,
  normalizeSkill,
} from '../src/services/careerFit/skillNormalizer.js'
import { analyzeSkillGaps } from '../src/services/careerFit/skillGapService.js'
import {
  calculateCareerFit,
  rankCareerFits,
  type CareerFitInputCareer,
  type CareerFitInputProfile,
} from '../src/services/careerFit/careerFitEngine.js'

describe('PathPilot Phase 06: Explainable Career Fit & Skill-Gap Engine', () => {
  beforeAll(async () => {
    await seedCareerCatalog()
  })

  // ==========================================
  // 1. Scoring Policy & Weight Validation
  // ==========================================
  describe('Scoring Policy & Weights', () => {
    it('has default weights summing to exactly 1.0 (100%)', () => {
      const sum =
        DEFAULT_SCORING_WEIGHTS.skills +
        DEFAULT_SCORING_WEIGHTS.projects +
        DEFAULT_SCORING_WEIGHTS.interests +
        DEFAULT_SCORING_WEIGHTS.academics
      expect(sum).toBeCloseTo(1.0, 5)
      expect(DEFAULT_SCORING_WEIGHTS.skills).toBe(0.5)
      expect(DEFAULT_SCORING_WEIGHTS.projects).toBe(0.25)
      expect(DEFAULT_SCORING_WEIGHTS.interests).toBe(0.15)
      expect(DEFAULT_SCORING_WEIGHTS.academics).toBe(0.1)
      expect(SCORING_POLICY_VERSION).toBe('1.0.0')
    })

    it('validates configured weights correctly when valid', () => {
      const valid = validateScoringWeights({
        skills: 0.4,
        projects: 0.3,
        interests: 0.2,
        academics: 0.1,
      })
      expect(valid.isValid).toBe(true)
    })

    it('rejects weights that do not sum to 100%', () => {
      const invalid = validateScoringWeights({
        skills: 0.5,
        projects: 0.25,
        interests: 0.15,
        academics: 0.05,
      })
      expect(invalid.isValid).toBe(false)
      expect(invalid.error).toMatch(/must sum to exactly 1\.0/i)
    })

    it('rejects negative weights', () => {
      const invalid = validateScoringWeights({
        skills: 1.1,
        projects: -0.1,
        interests: 0,
        academics: 0,
      })
      expect(invalid.isValid).toBe(false)
      expect(invalid.error).toMatch(/non-negative/i)
    })

    it('normalizes effective weights when dimensions are missing without penalizing with zero', () => {
      // Missing projects (0.25) and academics (0.10)
      // Available weights: skills (0.50) + interests (0.15) = 0.65
      // Normalized: skills = 0.50 / 0.65 = 0.7692, interests = 0.15 / 0.65 = 0.2308
      const availabilities: DimensionAvailability[] = [
        { dimension: 'skills', isAvailable: true },
        { dimension: 'projects', isAvailable: false, exclusionReason: 'No projects' },
        { dimension: 'interests', isAvailable: true },
        { dimension: 'academics', isAvailable: false, exclusionReason: 'No academics' },
      ]

      const result = calculateEffectiveWeights(DEFAULT_SCORING_WEIGHTS, availabilities)
      const sum = result.effectiveWeights.skills + result.effectiveWeights.interests
      expect(sum).toBeCloseTo(1.0, 4)
      expect(result.effectiveWeights.projects).toBe(0)
      expect(result.effectiveWeights.academics).toBe(0)
      expect(result.effectiveWeights.skills).toBeCloseTo(0.5 / 0.65, 4)
      expect(result.effectiveWeights.interests).toBeCloseTo(0.15 / 0.65, 4)
      expect(result.availableDimensions).toEqual(['skills', 'interests'])
      expect(result.excludedDimensions.length).toBe(2)
    })

    it('evaluates minimum evidence requirement', () => {
      // Condition 1: Skills present -> sufficient
      expect(
        evaluateEvidenceSufficiency([
          { dimension: 'skills', isAvailable: true },
          { dimension: 'projects', isAvailable: false },
          { dimension: 'interests', isAvailable: false },
          { dimension: 'academics', isAvailable: false },
        ]).status,
      ).toBe('SUFFICIENT_EVIDENCE')

      // Condition 2: No skills, but at least 2 other dimensions present -> sufficient
      expect(
        evaluateEvidenceSufficiency([
          { dimension: 'skills', isAvailable: false },
          { dimension: 'projects', isAvailable: true },
          { dimension: 'interests', isAvailable: true },
          { dimension: 'academics', isAvailable: false },
        ]).status,
      ).toBe('SUFFICIENT_EVIDENCE')

      // Condition 3: No skills, only 1 other dimension -> insufficient
      expect(
        evaluateEvidenceSufficiency([
          { dimension: 'skills', isAvailable: false },
          { dimension: 'projects', isAvailable: true },
          { dimension: 'interests', isAvailable: false },
          { dimension: 'academics', isAvailable: false },
        ]).status,
      ).toBe('INSUFFICIENT_DATA')

      // Condition 4: Empty profile -> insufficient
      expect(
        evaluateEvidenceSufficiency([
          { dimension: 'skills', isAvailable: false },
          { dimension: 'projects', isAvailable: false },
          { dimension: 'interests', isAvailable: false },
          { dimension: 'academics', isAvailable: false },
        ]).status,
      ).toBe('INSUFFICIENT_DATA')
    })
  })

  // ==========================================
  // 2. Skill Normalizer & Canonical Aliases
  // ==========================================
  describe('Skill Normalization and Canonical Aliases', () => {
    it('normalizes whitespace, casing, and punctuation', () => {
      expect(normalizeSkill('  React.js  ')).toBe('react js')
      expect(normalizeSkill('Node.JS')).toBe('node js')
      expect(normalizeSkill('c++')).toBe('c++')
      expect(normalizeSkill('C#')).toBe('c#')
    })

    it('resolves explicit aliases accurately', () => {
      expect(getCanonicalSkill('js')).toBe('javascript')
      expect(getCanonicalSkill('ts')).toBe('typescript')
      expect(getCanonicalSkill('py')).toBe('python')
      expect(getCanonicalSkill('k8s')).toBe('kubernetes')
      expect(getCanonicalSkill('postgres')).toBe('postgresql')
      expect(getCanonicalSkill('a11y')).toBe('web accessibility')
    })

    it('identifies equivalent skills with aliases and exact matches', () => {
      expect(isSkillMatch('js', 'JavaScript')).toBe(true)
      expect(isSkillMatch('React', 'Frontend Frameworks (React/Vue)')).toBe(true)
      expect(isSkillMatch('Docker', 'Docker & Containerization')).toBe(true)
      expect(isSkillMatch('Java', 'JavaScript')).toBe(false)
    })
  })

  // ==========================================
  // 3. Skill-Gap Service & Categorization
  // ==========================================
  describe('Skill-Gap Service', () => {
    const mockCareer = {
      slug: 'backend-developer',
      title: 'Backend Developer',
      skills: [
        { id: '1', name: 'RESTful API Design', type: 'core' as const, importance: 'HIGH' as const },
        { id: '2', name: 'Relational Databases & SQL', type: 'core' as const, importance: 'HIGH' as const },
        { id: '3', name: 'Node.js / Express / Python', type: 'core' as const, importance: 'HIGH' as const },
        { id: '4', name: 'Docker & Containerization', type: 'supporting' as const, importance: 'MEDIUM' as const },
        { id: '5', name: 'Caching (Redis)', type: 'supporting' as const, importance: 'MEDIUM' as const },
        { id: '6', name: 'Message Queues', type: 'supporting' as const, importance: 'LOW' as const },
      ],
    }

    it('classifies missing required core skills as CRITICAL_MISSING', () => {
      const studentSkills = [{ name: 'RESTful API Design' }]
      const analysis = analyzeSkillGaps(mockCareer, studentSkills)

      const critical = analysis.gaps.filter((g) => g.category === 'CRITICAL_MISSING')
      expect(critical.length).toBe(2)
      expect(critical.map((g) => g.name)).toContain('Relational Databases & SQL')
      expect(critical.map((g) => g.name)).toContain('Node.js / Express / Python')
      expect(critical[0].categoryLabel).toBe('Critical Missing')
    })

    it('classifies missing supporting skills as RECOMMENDED_NEXT and optional as OPTIONAL_ADVANTAGE', () => {
      const studentSkills = [
        { name: 'RESTful API Design' },
        { name: 'Relational Databases & SQL' },
        { name: 'Node.js / Express / Python' },
      ]
      const analysis = analyzeSkillGaps(mockCareer, studentSkills)

      const recommended = analysis.gaps.filter((g) => g.category === 'RECOMMENDED_NEXT')
      const optional = analysis.gaps.filter((g) => g.category === 'OPTIONAL_ADVANTAGE')

      // Docker & Redis are MEDIUM -> RECOMMENDED_NEXT
      expect(recommended.map((g) => g.name)).toContain('Docker & Containerization')
      expect(recommended.map((g) => g.name)).toContain('Caching (Redis)')
      expect(recommended[0].categoryLabel).toBe('Recommended Next')

      // Message Queues is LOW -> OPTIONAL_ADVANTAGE
      expect(optional.map((g) => g.name)).toContain('Message Queues')
      expect(optional[0].categoryLabel).toBe('Optional Advantage')
    })

    it('excludes possessed skills from the gap list', () => {
      const studentSkills = [
        { name: 'RESTful API Design' },
        { name: 'Relational Databases & SQL' },
        { name: 'Node.js / Express / Python' },
        { name: 'Docker & Containerization' },
        { name: 'Caching (Redis)' },
        { name: 'Message Queues' },
      ]
      const analysis = analyzeSkillGaps(mockCareer, studentSkills)

      expect(analysis.gaps.length).toBe(0)
      expect(analysis.allMatchedSkills.length).toBe(6)
      expect(analysis.coreCoveragePercentage).toBe(100)
    })

    it('deduplicates duplicate student skills', () => {
      const studentSkills = [
        { name: 'RESTful API Design' },
        { name: 'restful api design' },
        { name: 'Relational Databases & SQL' },
        { name: 'SQL' },
      ]
      const analysis = analyzeSkillGaps(mockCareer, studentSkills)

      expect(analysis.matchedSkills.length).toBe(2)
      expect(analysis.coreCoveragePercentage).toBe(67)
    })

    it('orders gaps deterministically: Critical Missing -> Recommended Next -> Optional Advantage -> Alphabetical', () => {
      const studentSkills: Array<{ name: string }> = []
      const analysis = analyzeSkillGaps(mockCareer, studentSkills)

      expect(analysis.gaps.length).toBe(6)
      // Check priority categories order
      const categories = analysis.gaps.map((g) => g.category)
      expect(categories[0]).toBe('CRITICAL_MISSING')
      expect(categories[1]).toBe('CRITICAL_MISSING')
      expect(categories[2]).toBe('CRITICAL_MISSING')
      expect(categories[3]).toBe('RECOMMENDED_NEXT')
      expect(categories[4]).toBe('RECOMMENDED_NEXT')
      expect(categories[5]).toBe('OPTIONAL_ADVANTAGE')

      // Alphabetical within CRITICAL_MISSING: Node.js / Express / Python, Relational Databases & SQL, RESTful API Design
      const criticalNames = analysis.gaps
        .filter((g) => g.category === 'CRITICAL_MISSING')
        .map((g) => g.name)
      expect(criticalNames).toEqual([
        'Node.js / Express / Python',
        'Relational Databases & SQL',
        'RESTful API Design',
      ])
    })

    it('handles empty student skills honestly without inventing proficiency', () => {
      const analysis = analyzeSkillGaps(mockCareer, [])
      expect(analysis.matchedSkills.length).toBe(0)
      expect(analysis.coreCoveragePercentage).toBe(0)
      expect(analysis.gaps.length).toBe(6)
    })
  })

  // ==========================================
  // 4. Pure Scoring Domain Engine Unit Tests
  // ==========================================
  describe('CareerFitEngine - Scoring Domain Unit Tests', () => {
    const sampleCareer: CareerFitInputCareer = {
      id: 'career-backend-dev',
      slug: 'backend-developer',
      title: 'Backend Developer',
      category: 'Engineering',
      skills: [
        { id: '1', name: 'RESTful API Design', type: 'core' },
        { id: '2', name: 'Relational Databases & SQL', type: 'core' },
        { id: '3', name: 'Node.js / Express / Python', type: 'core' },
        { id: '4', name: 'Authentication & Security', type: 'core' },
        { id: '5', name: 'Docker & Containerization', type: 'supporting' },
        { id: '6', name: 'Caching (Redis)', type: 'supporting' },
      ],
      responsibilities: ['Build REST APIs', 'Manage databases'],
      commonJobTitles: ['Backend Engineer'],
    }

    it('returns INSUFFICIENT_DATA status when student profile has no usable evidence', () => {
      const emptyProfile: CareerFitInputProfile = {
        skills: [],
        experiences: [],
        interests: [],
      }

      const result = calculateCareerFit(sampleCareer, emptyProfile, DEFAULT_SCORING_POLICY)
      expect(result.status).toBe('INSUFFICIENT_DATA')
      expect(result.scoreDisplay).toBeNull()
      expect(result.availableDimensions.length).toBe(0)
      expect(result.excludedDimensions.length).toBe(4)
      expect(result.dataLimitations.length).toBeGreaterThan(0)
    })

    it('computes accurate score when all 4 dimensions are fully satisfied', () => {
      const perfectProfile: CareerFitInputProfile = {
        skills: [
          { name: 'RESTful API Design', proficiency: 'Advanced' },
          { name: 'Relational Databases & SQL', proficiency: 'Advanced' },
          { name: 'Node.js / Express / Python', proficiency: 'Advanced' },
          { name: 'Authentication & Security', proficiency: 'Advanced' },
          { name: 'Docker & Containerization', proficiency: 'Advanced' },
          { name: 'Caching (Redis)', proficiency: 'Advanced' },
        ],
        experiences: [
          {
            title: 'Backend Intern',
            type: 'INTERNSHIP',
            description: 'Built REST APIs and managed PostgreSQL with Node.js',
          },
          {
            title: 'E-commerce API',
            type: 'PROJECT',
            description: 'Scalable backend microservices architecture',
          },
        ],
        interests: ['software_development', 'systems_core'],
        degree: 'B.Tech',
        branch: 'Computer Science and Engineering',
        currentYear: '4th Year',
      }

      const result = calculateCareerFit(sampleCareer, perfectProfile, DEFAULT_SCORING_POLICY)
      expect(result.status).toBe('SUFFICIENT_EVIDENCE')
      expect(result.scoreDisplay).not.toBeNull()
      expect(result.scoreDisplay!).toBeGreaterThanOrEqual(90)
      expect(result.dimensionScores.skills.score).toBe(100)
      expect(result.dimensionScores.projects.score).toBe(100)
      expect(result.dimensionScores.interests.score).toBe(100)
      expect(result.dimensionScores.academics.score).toBe(100)
      expect(result.strengths.length).toBeGreaterThan(0)
    })

    it('excludes missing dimensions and normalizes remaining effective weights without penalty', () => {
      const skillsOnlyProfile: CareerFitInputProfile = {
        skills: [
          { name: 'RESTful API Design', proficiency: 'Advanced' },
          { name: 'Relational Databases & SQL', proficiency: 'Advanced' },
          { name: 'Node.js / Express / Python', proficiency: 'Advanced' },
          { name: 'Authentication & Security', proficiency: 'Advanced' },
        ],
        experiences: [],
        interests: [],
      }

      const result = calculateCareerFit(sampleCareer, skillsOnlyProfile, DEFAULT_SCORING_POLICY)
      expect(result.status).toBe('SUFFICIENT_EVIDENCE')
      expect(result.availableDimensions).toEqual(['skills'])
      expect(result.excludedDimensions.map((d) => d.dimension)).toEqual([
        'projects',
        'interests',
        'academics',
      ])

      // Effective weight for skills must be normalized to 1.0 (100%)
      expect(result.effectiveWeights.skills).toBe(1.0)
      expect(result.effectiveWeights.projects).toBe(0)
      expect(result.effectiveWeights.interests).toBe(0)
      expect(result.effectiveWeights.academics).toBe(0)

      // Score should equal the skills dimension score
      expect(result.fitScore).toBe(result.dimensionScores.skills.score)
      expect(result.dimensionScores.projects.isAvailable).toBe(false)
      expect(result.dimensionScores.interests.isAvailable).toBe(false)
      expect(result.dimensionScores.academics.isAvailable).toBe(false)
    })

    it('academic context is not used as a gate or disqualifier', () => {
      const mechanicalProfile: CareerFitInputProfile = {
        skills: [
          { name: 'RESTful API Design', proficiency: 'Intermediate' },
          { name: 'Relational Databases & SQL', proficiency: 'Intermediate' },
        ],
        experiences: [
          {
            title: 'Robotics API',
            type: 'PROJECT',
            description: 'Built controller web services',
          },
        ],
        interests: ['software_development'],
        degree: 'B.Tech',
        branch: 'Mechanical Engineering',
        currentYear: '3rd Year',
      }

      const result = calculateCareerFit(sampleCareer, mechanicalProfile, DEFAULT_SCORING_POLICY)
      expect(result.status).toBe('SUFFICIENT_EVIDENCE')
      expect(result.scoreDisplay).toBeGreaterThan(40)
      // Mechanical Engineering is still recognized as general STEM context (70 pts)
      expect(result.dimensionScores.academics.score).toBe(70)
      expect(result.dimensionScores.academics.explanation).toContain('Mechanical Engineering')
    })

    it('missing CGPA does not produce any penalty', () => {
      const profileWithNoCgpa: CareerFitInputProfile = {
        skills: [{ name: 'RESTful API Design' }],
        degree: 'B.E.',
        branch: 'Electronics and Communication Engineering',
      }

      const result = calculateCareerFit(sampleCareer, profileWithNoCgpa, DEFAULT_SCORING_POLICY)
      expect(result.dimensionScores.academics.score).toBe(85)
      expect(result.dimensionScores.academics.explanation).not.toMatch(/penalty/i)
    })

    it('ranking is deterministic with title tie-breaker', () => {
      const careerA: CareerFitInputCareer = {
        id: 'career-1',
        slug: 'alpha-career',
        title: 'Alpha Career',
        category: 'Engineering',
        skills: [{ id: 's1', name: 'Python', type: 'core' }],
      }
      const careerB: CareerFitInputCareer = {
        id: 'career-2',
        slug: 'beta-career',
        title: 'Beta Career',
        category: 'Engineering',
        skills: [{ id: 's2', name: 'Python', type: 'core' }],
      }

      const profile: CareerFitInputProfile = {
        skills: [{ name: 'Python' }],
      }

      const resA = calculateCareerFit(careerA, profile, DEFAULT_SCORING_POLICY)
      const resB = calculateCareerFit(careerB, profile, DEFAULT_SCORING_POLICY)

      expect(resA.fitScore).toBe(resB.fitScore)

      // Beta Career placed first in input; rankCareerFits must place Alpha first alphabetically by title
      const ranked = rankCareerFits([resB, resA])
      expect(ranked[0].title).toBe('Alpha Career')
      expect(ranked[1].title).toBe('Beta Career')
    })
  })

  // ==========================================
  // 5. Backend REST API Endpoints & Auth
  // ==========================================
  describe('Backend Career Fit REST Endpoints', () => {
    const registerStudent = async (email: string) => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Fit Student', email, password: 'Password123!' })
      return { user: res.body.user, cookie: res.headers['set-cookie'] }
    }

    it('rejects unauthenticated access to GET /careers/fit (401)', async () => {
      const res = await request(app).get('/careers/fit')
      expect(res.status).toBe(401)
      expect(res.body.error).toMatch(/unauthenticated/i)
    })

    it('rejects unauthenticated access to GET /careers/:slug/fit (401)', async () => {
      const res = await request(app).get('/careers/backend-developer/fit')
      expect(res.status).toBe(401)
      expect(res.body.error).toMatch(/unauthenticated/i)
    })

    it('returns empty/no-profile response for newly registered user without profile', async () => {
      const email = `newbie_${Date.now()}@example.com`
      const { cookie } = await registerStudent(email)

      const res = await request(app).get('/careers/fit').set('Cookie', cookie)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('status', 'INSUFFICIENT_DATA')
      expect(res.body.profileSummary).toHaveProperty('hasProfile', false)
      expect(res.body.results.length).toBe(10)
      expect(res.body.results[0].status).toBe('INSUFFICIENT_DATA')
      expect(res.body.results[0].scoreDisplay).toBeNull()
    })

    it('returns ranked career fits for authenticated user with completed profile', async () => {
      const email = `dev_${Date.now()}@example.com`
      const { cookie } = await registerStudent(email)

      await request(app)
        .put('/profile')
        .set('Cookie', cookie)
        .send({
          degree: 'B.Tech',
          branch: 'Computer Science and Engineering',
          currentYear: '3rd Year',
          interests: ['software_development', 'systems_core'],
          primaryGoal: 'Become a Backend Developer',
        })

      await request(app)
        .put('/profile/skills')
        .set('Cookie', cookie)
        .send({
          skills: [
            { name: 'RESTful API Design', proficiency: 'Advanced' },
            { name: 'Relational Databases & SQL', proficiency: 'Advanced' },
            { name: 'Node.js / Express / Python', proficiency: 'Advanced' },
            { name: 'Authentication & Security', proficiency: 'Advanced' },
            { name: 'Docker & Containerization', proficiency: 'Intermediate' },
            { name: 'Caching (Redis)', proficiency: 'Intermediate' },
          ],
        })

      await request(app)
        .put('/profile/experience')
        .set('Cookie', cookie)
        .send({
          experiences: [
            {
              title: 'Backend Intern',
              type: 'INTERNSHIP',
              description: 'Created microservices with Node.js and PostgreSQL',
            },
          ],
        })

      await request(app).put('/profile/onboarding/complete').set('Cookie', cookie)

      const res = await request(app).get('/careers/fit').set('Cookie', cookie)

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('SUFFICIENT_EVIDENCE')
      expect(res.body.results.length).toBe(10)
      expect(res.body.policyVersion).toBe('1.0.0')

      const topMatch = res.body.results[0]
      expect(topMatch.status).toBe('SUFFICIENT_EVIDENCE')
      expect(topMatch.scoreDisplay).toBeGreaterThanOrEqual(70)
      expect(topMatch.slug).toBe('backend-developer')
      expect(topMatch.matchedSkills).toContain('RESTful API Design')
      expect(topMatch.matchedSkills).toContain('Relational Databases & SQL')
    })

    it('returns detailed career fit and skill gaps for single slug GET /careers/:slug/fit', async () => {
      const email = `deep_${Date.now()}@example.com`
      const { cookie } = await registerStudent(email)

      await request(app)
        .put('/profile')
        .set('Cookie', cookie)
        .send({
          degree: 'B.E.',
          branch: 'Information Technology',
          currentYear: '2nd Year',
          interests: ['software_development'],
        })

      await request(app)
        .put('/profile/skills')
        .set('Cookie', cookie)
        .send({
          skills: [
            { name: 'HTML5 & Semantic Markup', proficiency: 'Intermediate' },
            { name: 'Modern CSS & Responsive Design', proficiency: 'Advanced' },
          ],
        })

      await request(app).put('/profile/onboarding/complete').set('Cookie', cookie)

      const res = await request(app).get('/careers/frontend-developer/fit').set('Cookie', cookie)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('career')
      expect(res.body).toHaveProperty('fit')
      expect(res.body).toHaveProperty('skillGaps')
      expect(res.body).toHaveProperty('profileSummary')

      expect(res.body.career.slug).toBe('frontend-developer')
      expect(res.body.fit.status).toBe('SUFFICIENT_EVIDENCE')
      expect(res.body.fit.matchedSkills).toContain('HTML5 & Semantic Markup')

      expect(res.body.skillGaps).toHaveProperty('gaps')
      expect(res.body.skillGaps).toHaveProperty('criticalMissingCount')
      expect(res.body.skillGaps).toHaveProperty('recommendedNextCount')
      expect(res.body.skillGaps).toHaveProperty('optionalAdvantageCount')
    })

    it('returns 404 for unknown career slug GET /careers/:unknown/fit', async () => {
      const email = `anon_${Date.now()}@example.com`
      const { cookie } = await registerStudent(email)

      const res = await request(app)
        .get('/careers/non-existent-career-slug-xyz/fit')
        .set('Cookie', cookie)

      expect(res.status).toBe(404)
      expect(res.body.error).toMatch(/not found/i)
    })

    it('isolates students - Student A results do not leak to Student B', async () => {
      const userA = await registerStudent(`userA_${Date.now()}@test.com`)
      const userB = await registerStudent(`userB_${Date.now()}@test.com`)

      // User A: Data Scientist profile
      await request(app)
        .put('/profile')
        .set('Cookie', userA.cookie)
        .send({ degree: 'M.S.', branch: 'Data Science', currentYear: '1st Year', interests: ['ai_ml'] })
      await request(app)
        .put('/profile/skills')
        .set('Cookie', userA.cookie)
        .send({
          skills: [
            { name: 'Python & Data Analysis (Pandas/NumPy)' },
            { name: 'Machine Learning Fundamentals' },
            { name: 'SQL & Data Extraction' },
          ],
        })
      await request(app).put('/profile/onboarding/complete').set('Cookie', userA.cookie)

      // User B: Security Analyst profile
      await request(app)
        .put('/profile')
        .set('Cookie', userB.cookie)
        .send({ degree: 'B.Tech', branch: 'Cyber Security', currentYear: '4th Year', interests: ['cybersecurity'] })
      await request(app)
        .put('/profile/skills')
        .set('Cookie', userB.cookie)
        .send({
          skills: [
            { name: 'Network Protocols & Security', proficiency: 'Advanced' },
            { name: 'Threat Detection & SIEM', proficiency: 'Advanced' },
            { name: 'Vulnerability Assessment', proficiency: 'Advanced' },
            { name: 'Security Fundamentals & CIA Triad', proficiency: 'Advanced' },
          ],
        })
      await request(app).put('/profile/onboarding/complete').set('Cookie', userB.cookie)

      const fitResA = await request(app).get('/careers/fit').set('Cookie', userA.cookie)
      const fitResB = await request(app).get('/careers/fit').set('Cookie', userB.cookie)

      expect(fitResA.body.results[0].category).toBe('Data')
      expect(fitResB.body.results[0].category).toBe('Security')
    })
  })
})
