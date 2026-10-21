import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import RoadmapPage from '../pages/roadmap/RoadmapPage'
import AppCheckpoint from '../pages/app/AppCheckpoint'
import CareerDetail from '../pages/careers/CareerDetail'
import { AuthContext, type AuthContextType } from '../context/authContextDef'
import {
  api,
  type Roadmap,
  type CareerListItem,
  type StudentProfile,
} from '../lib/api'

// Mock mockRoadmap
const mockRoadmap: Roadmap = {
  id: 'rm-1',
  userId: 'user-1',
  careerId: 'c1',
  careerSlug: 'backend-developer',
  careerTitle: 'Backend Developer',
  careerCategory: 'Engineering',
  careerSummary: 'Architect, build, and optimize scalable server-side systems.',
  version: 1,
  status: 'ACTIVE',
  weeklyHoursAssumed: 12,
  totalDays: 30,
  totalTasks: 12,
  completedTasks: 1,
  inProgressTasks: 1,
  blockedTasks: 0,
  progressPercentage: 8.3,
  skillGapsAddressed: ['RESTful API Design', 'Relational Databases & SQL'],
  assumptions: [
    'Paced for 12 hours per week commitment.',
    'Prioritizes core missing competencies before secondary skills.',
  ],
  deferredSkills: ['Caching (Redis)'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tasks: [
    {
      id: 'task-1',
      roadmapId: 'rm-1',
      weekNumber: 1,
      dayNumber: 2,
      dayRange: 'Days 1–2',
      orderIndex: 1,
      title: 'Environment Setup & RESTful API Fundamentals',
      description: 'Configure local Node.js environment and review API conventions.',
      estimatedMinutes: 120,
      skillName: 'RESTful API Design',
      skillCategory: 'CRITICAL_MISSING',
      prerequisites: [],
      completionCriteria: 'Working local environment and hello world endpoint.',
      expectedOutput: 'Local repository with baseline express server.',
      status: 'COMPLETED',
      notes: 'Configured local environment on port 5000.',
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      roadmapId: 'rm-1',
      weekNumber: 1,
      dayNumber: 5,
      dayRange: 'Days 3–5',
      orderIndex: 2,
      title: 'Core Architectural Patterns in REST APIs',
      description: 'Implement CRUD controllers and route handlers.',
      estimatedMinutes: 120,
      skillName: 'RESTful API Design',
      skillCategory: 'CRITICAL_MISSING',
      prerequisites: ['Environment Setup'],
      completionCriteria: 'Passing unit tests for CRUD endpoints.',
      expectedOutput: 'Clean controllers with route handlers.',
      status: 'IN_PROGRESS',
      notes: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      roadmapId: 'rm-1',
      weekNumber: 1,
      dayNumber: 7,
      dayRange: 'Days 6–7',
      orderIndex: 3,
      title: 'Week 1 Proof-of-Concept & Self-Review',
      description: 'Integrate Week 1 concepts into working mini module.',
      estimatedMinutes: 120,
      skillName: 'RESTful API Design',
      skillCategory: 'CRITICAL_MISSING',
      prerequisites: [],
      completionCriteria: 'Working proof of concept.',
      expectedOutput: 'Functional mini project repository.',
      status: 'NOT_STARTED',
      notes: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  weeks: [
    {
      weekNumber: 1,
      title: 'Week 1: Technical Foundations',
      objective: 'Establish core technical foundations and build initial proof of concept.',
      milestoneOutcome: 'Working local development environment and passing code exercises.',
      dayRange: 'Days 1–7',
      totalTasks: 3,
      completedTasks: 1,
      progressPercentage: 33.3,
      totalMinutes: 360,
      tasks: [], // will be populated
    },
    {
      weekNumber: 2,
      title: 'Week 2: Practice & Integration',
      objective: 'Apply intermediate patterns and integrate database.',
      milestoneOutcome: 'Functional database integration.',
      dayRange: 'Days 8–14',
      totalTasks: 3,
      completedTasks: 0,
      progressPercentage: 0,
      totalMinutes: 360,
      tasks: [],
    },
    {
      weekNumber: 3,
      title: 'Week 3: Practical Project Implementation',
      objective: 'Synthesize skills into a portfolio project.',
      milestoneOutcome: 'Fully working end-to-end API project.',
      dayRange: 'Days 15–21',
      totalTasks: 3,
      completedTasks: 0,
      progressPercentage: 0,
      totalMinutes: 360,
      tasks: [],
    },
    {
      weekNumber: 4,
      title: 'Week 4: Deployment & Portfolio Consolidation',
      objective: 'Deploy project and document technical decisions.',
      milestoneOutcome: 'Public deployment URL and documentation.',
      dayRange: 'Days 22–30',
      totalTasks: 3,
      completedTasks: 0,
      progressPercentage: 0,
      totalMinutes: 360,
      tasks: [],
    },
  ],
}

mockRoadmap.weeks[0].tasks = mockRoadmap.tasks

const mockCareers: CareerListItem[] = [
  {
    id: 'c1',
    slug: 'backend-developer',
    title: 'Backend Developer',
    category: 'Engineering',
    summary: 'Architect, build, and optimize scalable server-side systems.',
    description: 'Backend description',
    coreSkills: ['RESTful API Design', 'Relational Databases & SQL'],
    supportingSkills: ['Docker & Containerization'],
    commonJobTitles: ['Backend Engineer'],
    exampleProjectsCount: 2,
  },
  {
    id: 'c2',
    slug: 'frontend-developer',
    title: 'Frontend Developer',
    category: 'Engineering',
    summary: 'Build responsive and accessible web applications.',
    description: 'Frontend description',
    coreSkills: ['React', 'TypeScript'],
    supportingSkills: ['Tailwind CSS'],
    commonJobTitles: ['Frontend Developer'],
    exampleProjectsCount: 2,
  },
]

const mockAuthContext: AuthContextType = {
  user: { id: 'u1', name: 'Roadmap Tester', email: 'tester@example.com' },
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  clearError: vi.fn(),
}

describe('Frontend Phase 07: Personalized Learning Roadmap Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty roadmap state when student has no active roadmap', async () => {
    vi.spyOn(api, 'getCurrentRoadmap').mockResolvedValue({
      hasRoadmap: false,
      roadmap: null,
    })
    vi.spyOn(api, 'getCareers').mockResolvedValue({
      careers: mockCareers,
      categories: ['Engineering'],
      total: 2,
    })

    render(
      <MemoryRouter initialEntries={['/roadmap']}>
        <Routes>
          <Route path="/roadmap" element={<RoadmapPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Create Your Personalized 30-Day Learning Roadmap/i)).toBeDefined()
    expect(screen.getByText(/Select Target Career Path/i)).toBeDefined()
    expect(screen.getByText(/Weekly Study Time Budget/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /Generate 30-Day Roadmap/i })).toBeDefined()
  })

  it('renders active 30-day roadmap with progress metrics, weekly sections, and task cards', async () => {
    vi.spyOn(api, 'getCurrentRoadmap').mockResolvedValue({
      hasRoadmap: true,
      roadmap: mockRoadmap,
    })
    vi.spyOn(api, 'getCareers').mockResolvedValue({
      careers: mockCareers,
      categories: ['Engineering'],
      total: 2,
    })

    render(
      <MemoryRouter initialEntries={['/roadmap']}>
        <Routes>
          <Route path="/roadmap" element={<RoadmapPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Backend Developer')).toBeDefined()
    expect(screen.getByText('Version 1')).toBeDefined()
    expect(screen.getByText('8.3%')).toBeDefined()
    expect(screen.getByText(/Environment Setup & RESTful API Fundamentals/i)).toBeDefined()
    expect(screen.getByText('✓ Completed')).toBeDefined()
    expect(screen.getByText('⏳ In Progress')).toBeDefined()
  })

  it('allows starting or completing a task, updating progress', async () => {
    vi.spyOn(api, 'getCurrentRoadmap').mockResolvedValue({
      hasRoadmap: true,
      roadmap: mockRoadmap,
    })
    vi.spyOn(api, 'getCareers').mockResolvedValue({
      careers: mockCareers,
      categories: ['Engineering'],
      total: 2,
    })

    const updateSpy = vi.spyOn(api, 'updateTaskStatus').mockResolvedValue({
      message: 'Task updated successfully',
      task: {
        ...mockRoadmap.tasks[1],
        status: 'COMPLETED',
      },
      roadmapProgress: {
        totalTasks: 12,
        completedTasks: 2,
        inProgressTasks: 0,
        blockedTasks: 0,
        progressPercentage: 16.7,
      },
    })

    render(
      <MemoryRouter initialEntries={['/roadmap']}>
        <Routes>
          <Route path="/roadmap" element={<RoadmapPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Core Architectural Patterns in REST APIs')).toBeDefined()

    // Find the Complete button for the in-progress task
    const completeButtons = screen.getAllByRole('button', { name: /✓ Complete/i })
    fireEvent.click(completeButtons[0])

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        'task-2',
        expect.objectContaining({ status: 'COMPLETED' }),
      )
    })
  })

  it('renders active roadmap widget in student dashboard (/app)', async () => {
    vi.spyOn(api, 'getProfile').mockResolvedValue({
      profile: {
        isOnboardingCompleted: true,
        currentStep: 8,
        degree: 'B.Tech',
        branch: 'Computer Science',
        interests: ['software_development'],
        secondaryGoals: [],
        skills: [],
        experiences: [],
      } as StudentProfile,
    })
    vi.spyOn(api, 'getCareerFitOverview').mockResolvedValue({
      status: 'SUFFICIENT_EVIDENCE',
      policyVersion: '1.0.0',
      profileSummary: {
        hasProfile: true,
        isOnboardingCompleted: true,
        skillsCount: 2,
        experiencesCount: 1,
        interestsCount: 1,
      },
      results: [],
      fits: [],
    })
    vi.spyOn(api, 'getCurrentRoadmap').mockResolvedValue({
      hasRoadmap: true,
      roadmap: mockRoadmap,
    })

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/app']}>
          <AppCheckpoint />
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(await screen.findByText('Active 30-Day Roadmap')).toBeDefined()
    expect(screen.getByText('Continue Learning Roadmap →')).toBeDefined()
  })

  it('renders roadmap generation CTA in career detail page (/careers/:slug)', async () => {
    vi.spyOn(api, 'getCareerBySlug').mockResolvedValue({
      career: {
        id: 'c1',
        slug: 'backend-developer',
        title: 'Backend Developer',
        category: 'Engineering',
        summary: 'Architect server systems.',
        description: 'Detailed description.',
        responsibilities: ['Build APIs'],
        coreSkills: [{ name: 'RESTful API Design' }],
        supportingSkills: [],
        commonJobTitles: [],
        exampleProjects: [],
        prerequisites: [],
        relatedCareers: [],
        growthPaths: [],
        interviewAreas: [],
      },
    })
    vi.spyOn(api, 'getCareerFitForSlug').mockResolvedValue({
      careerNotFound: false,
      hasProfile: true,
      career: undefined,
      fit: {
        careerId: 'c1',
        slug: 'backend-developer',
        title: 'Backend Developer',
        category: 'Engineering',
        fitScore: 80,
        scoreDisplay: 80,
        fitLevel: 'Strong Match',
        status: 'SUFFICIENT_EVIDENCE',
        policyVersion: '1.0.0',
        configuredWeights: { skills: 0.5, projects: 0.25, interests: 0.15, academics: 0.1 },
        effectiveWeights: { skills: 0.5, projects: 0.25, interests: 0.15, academics: 0.1 },
        availableDimensions: ['skills', 'projects', 'interests', 'academics'],
        excludedDimensions: [],
        dimensionScores: {
          skills: { score: 80, rawScore: 80, configuredWeight: 0.5, effectiveWeight: 0.5, isAvailable: true, evidence: [] },
          projects: { score: 80, rawScore: 80, configuredWeight: 0.25, effectiveWeight: 0.25, isAvailable: true, evidence: [] },
          interests: { score: 80, rawScore: 80, configuredWeight: 0.15, effectiveWeight: 0.15, isAvailable: true, evidence: [] },
          academics: { score: 80, rawScore: 80, configuredWeight: 0.1, effectiveWeight: 0.1, isAvailable: true, evidence: [] },
        },
        strengths: [],
        growthAreas: [],
        dataLimitations: [],
        matchedSkills: [],
        missingCoreCount: 1,
        coreCoveragePercentage: 50,
        skillGapAnalysis: {
          careerSlug: 'backend-developer',
          careerTitle: 'Backend Developer',
          totalCoreSkills: 2,
          matchedCoreSkills: ['RESTful API Design'],
          missingCoreSkills: ['Relational Databases & SQL'],
          coreCoveragePercentage: 50,
          totalSupportingSkills: 0,
          matchedSupportingSkills: [],
          missingSupportingSkills: [],
          allMatchedSkills: ['RESTful API Design'],
          matchedSkills: ['RESTful API Design'],
          criticalMissingCount: 1,
          recommendedNextCount: 0,
          optionalAdvantageCount: 0,
          gaps: [
            {
              id: 'gap-1',
              name: 'Relational Databases & SQL',
              category: 'CRITICAL_MISSING',
              categoryLabel: 'Critical Missing',
              classificationRule: 'Required core competency',
              targetCareerSlug: 'backend-developer',
            },
          ],
        },
      },
    })

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/careers/backend-developer']}>
          <Routes>
            <Route path="/careers/:slug" element={<CareerDetail />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(await screen.findByText(/Ready to bridge your skill gaps for Backend Developer\?/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /Generate 30-Day Roadmap →/i })).toBeDefined()
  })
})
