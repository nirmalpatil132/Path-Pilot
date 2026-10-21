import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import AppCheckpoint from '../pages/app/AppCheckpoint'
import CareerDetail from '../pages/careers/CareerDetail'
import { AuthContext, type AuthContextType } from '../context/authContextDef'
import {
  api,
  type CareerFitResult,
  type CareerFitOverviewResponse,
  type CareerFitDetailResponse,
  type CareerDetail as CareerDetailType,
  type StudentProfile,
} from '../lib/api'

// Mock sample career fit result
const mockSampleFit: CareerFitResult = {
  careerId: 'c1',
  slug: 'backend-developer',
  title: 'Backend Developer',
  category: 'Engineering',
  fitScore: 82,
  scoreDisplay: 82,
  fitLevel: 'Strong Match',
  status: 'SUFFICIENT_EVIDENCE',
  policyVersion: '1.0.0',
  configuredWeights: { skills: 0.5, projects: 0.25, interests: 0.15, academics: 0.1 },
  effectiveWeights: { skills: 0.5, projects: 0.25, interests: 0.15, academics: 0.1 },
  availableDimensions: ['skills', 'projects', 'interests', 'academics'],
  excludedDimensions: [],
  dimensionScores: {
    skills: {
      score: 85,
      rawScore: 85,
      configuredWeight: 0.5,
      effectiveWeight: 0.5,
      isAvailable: true,
      explanation: 'Matched 4 of 5 core competencies.',
      evidence: ['RESTful API Design', 'Relational Databases & SQL'],
    },
    projects: {
      score: 80,
      rawScore: 80,
      configuredWeight: 0.25,
      effectiveWeight: 0.25,
      isAvailable: true,
      explanation: 'Direct internship and project experience.',
      evidence: ['Backend Intern (INTERNSHIP)'],
    },
    interests: {
      score: 100,
      rawScore: 100,
      configuredWeight: 0.15,
      effectiveWeight: 0.15,
      isAvailable: true,
      explanation: 'Direct interest in Engineering domain.',
      evidence: ['software_development'],
    },
    academics: {
      score: 100,
      rawScore: 100,
      configuredWeight: 0.1,
      effectiveWeight: 0.1,
      isAvailable: true,
      explanation: 'B.Tech in Computer Science.',
      evidence: ['B.Tech - Computer Science and Engineering'],
    },
  },
  strengths: ['Strong core skill foundation: matched 4 of 5 required skills.'],
  growthAreas: ['1 core competency not yet listed on your profile.'],
  dataLimitations: [],
  matchedSkills: ['RESTful API Design', 'Relational Databases & SQL', 'Node.js'],
  missingCoreCount: 1,
  coreCoveragePercentage: 80,
  skillGapAnalysis: {
    careerSlug: 'backend-developer',
    careerTitle: 'Backend Developer',
    totalCoreSkills: 5,
    matchedCoreSkills: ['RESTful API Design', 'Relational Databases & SQL'],
    missingCoreSkills: ['Authentication & Security'],
    coreCoveragePercentage: 80,
    totalSupportingSkills: 4,
    matchedSupportingSkills: ['Docker & Containerization'],
    missingSupportingSkills: ['Caching (Redis)', 'Message Queues'],
    allMatchedSkills: ['RESTful API Design', 'Relational Databases & SQL', 'Docker & Containerization'],
    matchedSkills: ['RESTful API Design', 'Relational Databases & SQL', 'Docker & Containerization'],
    criticalMissingCount: 1,
    recommendedNextCount: 1,
    optionalAdvantageCount: 1,
    gaps: [
      {
        id: 'gap-auth',
        name: 'Authentication & Security',
        category: 'CRITICAL_MISSING',
        categoryLabel: 'Critical Missing',
        description: 'Session cookies, JWTs, and RBAC.',
        classificationRule: 'Required core competency not currently recorded on your student profile.',
        targetCareerSlug: 'backend-developer',
      },
      {
        id: 'gap-redis',
        name: 'Caching (Redis)',
        category: 'RECOMMENDED_NEXT',
        categoryLabel: 'Recommended Next',
        description: 'In-memory caching strategies and session stores.',
        classificationRule: 'Supporting skill that provides a significant hiring advantage.',
        targetCareerSlug: 'backend-developer',
      },
      {
        id: 'gap-queues',
        name: 'Message Queues',
        category: 'OPTIONAL_ADVANTAGE',
        categoryLabel: 'Optional Advantage',
        description: 'Asynchronous event streaming and message brokers.',
        classificationRule: 'Complementary elective skill from career catalog.',
        targetCareerSlug: 'backend-developer',
      },
    ],
  },
}

const mockOverviewResponse: CareerFitOverviewResponse = {
  status: 'SUFFICIENT_EVIDENCE',
  policyVersion: '1.0.0',
  profileSummary: {
    hasProfile: true,
    isOnboardingCompleted: true,
    skillsCount: 4,
    experiencesCount: 1,
    interestsCount: 2,
  },
  results: [mockSampleFit],
  fits: [mockSampleFit],
}

const mockCompletedProfile: StudentProfile = {
  id: 'p1',
  userId: 'u1',
  isOnboardingCompleted: true,
  currentStep: 8,
  degree: 'B.Tech',
  branch: 'Computer Science and Engineering',
  currentYear: '3rd Year',
  college: 'National Institute of Technology',
  interests: ['software_development'],
  primaryGoal: 'software_engineering',
  secondaryGoals: [],
  skills: [
    { name: 'RESTful API Design', proficiency: 'Advanced' },
    { name: 'Relational Databases & SQL', proficiency: 'Advanced' },
  ],
  experiences: [
    { title: 'Backend Intern', type: 'INTERNSHIP', description: 'Built Node APIs' },
  ],
}

const mockCareerDetail: CareerDetailType = {
  id: 'c1',
  slug: 'backend-developer',
  title: 'Backend Developer',
  category: 'Engineering',
  summary: 'Design the APIs, data models and systems behind an app.',
  description: 'Backend Developers engineer server-side systems, databases, and APIs.',
  responsibilities: ['Build APIs', 'Manage databases'],
  coreSkills: [{ name: 'RESTful API Design' }, { name: 'Authentication & Security' }],
  supportingSkills: [{ name: 'Caching (Redis)' }],
  commonJobTitles: ['Backend Engineer'],
  exampleProjects: [],
  prerequisites: [],
  relatedCareers: [],
  growthPaths: [],
  interviewAreas: [],
}

const authContextValue: AuthContextType = {
  user: { id: 'u1', name: 'Nirmal Patil', email: 'nirmal@test.edu' },
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
}

describe('Frontend Phase 06: Career Fit & Skill-Gap Engine Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // ==========================================
  // 1. Dashboard Overview Tests
  // ==========================================
  describe('Student Dashboard (/app) Career Fit Overview', () => {
    it('renders career fit overview with score, level badge, and dimension breakdown', async () => {
      vi.spyOn(api, 'getProfile').mockResolvedValue({ profile: mockCompletedProfile })
      vi.spyOn(api, 'getCareerFitOverview').mockResolvedValue(mockOverviewResponse)

      render(
        <AuthContext.Provider value={authContextValue}>
          <MemoryRouter initialEntries={['/app']}>
            <AppCheckpoint />
          </MemoryRouter>
        </AuthContext.Provider>,
      )

      // Wait for profile and fit overview to load
      await waitFor(() => {
        expect(screen.getByText(/Explainable Career Fit Analysis/i)).toBeDefined()
      })

      // Top career match card
      expect(screen.getByText('Backend Developer')).toBeDefined()
      expect(screen.getByText('82%')).toBeDefined()
      expect(screen.getByText('Strong Match')).toBeDefined()
      expect(screen.getByText('Strongest Current Match')).toBeDefined()

      // Dimension breakdown pills
      expect(screen.getByText('85/100')).toBeDefined() // Skills
      expect(screen.getByText('80/100')).toBeDefined() // Projects
      expect(screen.getAllByText('100/100').length).toBe(2) // Interests & Academics
    })

    it('renders insufficient evidence banner when profile lacks minimum data', async () => {
      vi.spyOn(api, 'getProfile').mockResolvedValue({
        profile: { ...mockCompletedProfile, skills: [], experiences: [] },
      })
      vi.spyOn(api, 'getCareerFitOverview').mockResolvedValue({
        status: 'INSUFFICIENT_DATA',
        policyVersion: '1.0.0',
        profileSummary: {
          hasProfile: true,
          isOnboardingCompleted: true,
          skillsCount: 0,
          experiencesCount: 0,
          interestsCount: 1,
        },
        results: [
          {
            ...mockSampleFit,
            status: 'INSUFFICIENT_DATA',
            scoreDisplay: null,
            fitLevel: 'Insufficient Data',
          },
        ],
        fits: [],
      })

      render(
        <AuthContext.Provider value={authContextValue}>
          <MemoryRouter initialEntries={['/app']}>
            <AppCheckpoint />
          </MemoryRouter>
        </AuthContext.Provider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('insufficient-evidence-banner')).toBeDefined()
        expect(screen.getByText(/Insufficient Profile Evidence for Scoring/i)).toBeDefined()
      })
    })

    it('handles refresh button click by refetching fit analysis', async () => {
      vi.spyOn(api, 'getProfile').mockResolvedValue({ profile: mockCompletedProfile })
      const fitSpy = vi.spyOn(api, 'getCareerFitOverview').mockResolvedValue(mockOverviewResponse)

      render(
        <AuthContext.Provider value={authContextValue}>
          <MemoryRouter initialEntries={['/app']}>
            <AppCheckpoint />
          </MemoryRouter>
        </AuthContext.Provider>,
      )

      await waitFor(() => {
        expect(screen.getByText('↻ Refresh Analysis')).toBeDefined()
      })

      const refreshBtn = screen.getByText('↻ Refresh Analysis')
      fireEvent.click(refreshBtn)

      expect(fitSpy).toHaveBeenCalledTimes(2)
    })
  })

  // ==========================================
  // 2. Career Detail Deep Dive Tests
  // ==========================================
  describe('Career Detail (/careers/:slug) Fit & Skill Gap Deep Dive', () => {
    it('shows unauthenticated CTA when user is not logged in', async () => {
      vi.spyOn(api, 'getCareerBySlug').mockResolvedValue({ career: mockCareerDetail })

      const unauthContext: AuthContextType = {
        ...authContextValue,
        user: null,
        isAuthenticated: false,
      }

      render(
        <AuthContext.Provider value={unauthContext}>
          <MemoryRouter initialEntries={['/careers/backend-developer']}>
            <Routes>
              <Route path="/careers/:slug" element={<CareerDetail />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>,
      )

      await waitFor(() => {
        expect(screen.getByText(/Want to see your fit score for Backend Developer\?/i)).toBeDefined()
      })
    })

    it('renders personalized fit breakdown and 3-category skill gaps for authenticated student', async () => {
      vi.spyOn(api, 'getCareerBySlug').mockResolvedValue({ career: mockCareerDetail })
      const detailResponse: CareerFitDetailResponse = {
        careerNotFound: false,
        hasProfile: true,
        career: mockCareerDetail,
        fit: mockSampleFit,
        skillGaps: mockSampleFit.skillGapAnalysis,
      }
      vi.spyOn(api, 'getCareerFitForSlug').mockResolvedValue(detailResponse)

      render(
        <AuthContext.Provider value={authContextValue}>
          <MemoryRouter initialEntries={['/careers/backend-developer']}>
            <Routes>
              <Route path="/careers/:slug" element={<CareerDetail />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('career-fit-deepdive-card')).toBeDefined()
      })

      // Verify fit score
      expect(screen.getByText('Your Alignment with Backend Developer')).toBeDefined()
      expect(screen.getByText('82%')).toBeDefined()

      // Verify the 3 founder-approved skill-gap categories
      expect(screen.getByTestId('critical-missing-group')).toBeDefined()
      expect(screen.getByTestId('recommended-next-group')).toBeDefined()
      expect(screen.getByTestId('optional-advantage-group')).toBeDefined()

      // Verify skills categorized properly
      expect(screen.getByTestId('skill-gap-item-Authentication & Security')).toBeDefined()
      expect(screen.getByTestId('skill-gap-item-Caching (Redis)')).toBeDefined()
      expect(screen.getByTestId('skill-gap-item-Message Queues')).toBeDefined()

      // Verify core coverage percentage
      expect(screen.getByText('80%')).toBeDefined()
    })
  })
})
