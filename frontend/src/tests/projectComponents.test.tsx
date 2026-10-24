import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ProjectsPage from '../pages/projects/ProjectsPage'
import ProjectDetailPage from '../pages/projects/ProjectDetailPage'
import AppCheckpoint from '../pages/app/AppCheckpoint'
import { AuthContext, type AuthContextType } from '../context/authContextDef'
import {
  api,
  type Project,
  type ProjectRecommendation,
  type StudentProfile,
} from '../lib/api'

const mockAuthContext: AuthContextType = {
  user: { id: 'user-1', name: 'Project Student', email: 'student@example.com' },
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  clearError: vi.fn(),
}

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    userId: 'user-1',
    title: 'Distributed Log Aggregator',
    description: 'A microservice log pipeline using Node.js and SQLite.',
    source: 'CUSTOM',
    templateId: null,
    careerId: 'c1',
    careerSlug: 'backend-developer',
    careerTitle: 'Backend Developer',
    skills: ['RESTful API Design', 'Node.js', 'SQL'],
    status: 'IN_PROGRESS',
    startDate: '2026-10-24',
    completionDate: null,
    repositoryUrl: 'https://github.com/student/log-aggregator',
    liveDemoUrl: null,
    notes: 'Testing high-volume JSON streams.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deliverablesCount: 1,
    deliverables: [
      {
        id: 'del-1',
        projectId: 'proj-1',
        title: 'Core Ingestion API Module',
        description: 'POST /logs route with batched transactions.',
        type: 'FEATURE_MODULE',
        status: 'SUBMITTED',
        url: 'https://github.com/student/log-aggregator/pull/1',
        roadmapTaskId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'proj-2',
    userId: 'user-1',
    title: 'Accessible Component Library',
    description: 'WCAG 2.1 AA compliant design system primitives.',
    source: 'TEMPLATE',
    templateId: 'frontend-developer-1',
    careerId: 'c2',
    careerSlug: 'frontend-developer',
    careerTitle: 'Frontend Developer',
    skills: ['React', 'TypeScript', 'Web Accessibility (a11y)'],
    status: 'COMPLETED',
    startDate: '2026-10-01',
    completionDate: '2026-10-15',
    repositoryUrl: 'https://github.com/student/accessible-ui',
    liveDemoUrl: 'https://accessible-ui.vercel.app',
    notes: 'Fully keyboard accessible with zero axe errors.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deliverablesCount: 2,
    deliverables: [],
  },
]

const mockRecommendations: ProjectRecommendation[] = [
  {
    templateId: 'backend-developer-1',
    title: 'High-Concurrency URL Shortener Service',
    description: 'Production-grade URL redirection service with Redis caching.',
    skills: ['RESTful API Design', 'Relational Databases & SQL', 'Caching (Redis)'],
    careerSlug: 'backend-developer',
    careerTitle: 'Backend Developer',
    careerCategory: 'Engineering',
    priority: 'HIGH',
    matchScore: 100,
    reasons: [
      'Core portfolio project for Backend Developer',
      'Exercises 2 Critical Missing skills: RESTful API Design, Relational Databases & SQL',
    ],
    matchedCriticalSkills: ['RESTful API Design', 'Relational Databases & SQL'],
    matchedRecommendedSkills: ['Caching (Redis)'],
    matchedOptionalSkills: [],
    allMatchedSkills: ['RESTful API Design', 'Relational Databases & SQL', 'Caching (Redis)'],
    isAlreadyStarted: false,
  },
]

describe('Frontend Phase 08: Project-Based Learning & Portfolio Evidence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders project workspace list and recommended projects', async () => {
    vi.spyOn(api, 'getProjects').mockResolvedValue({ projects: mockProjects })
    vi.spyOn(api, 'getProjectRecommendations').mockResolvedValue({
      targetCareerSlug: 'backend-developer',
      totalRecommendations: 1,
      recommendations: mockRecommendations,
    })
    vi.spyOn(api, 'getCareers').mockResolvedValue({
      careers: [],
      categories: ['Engineering'],
      total: 0,
    })

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/projects']}>
          <Routes>
            <Route path="/projects" element={<ProjectsPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    // Header and title
    expect(await screen.findByText('Project Workspace & Portfolio Evidence')).toBeDefined()
    expect(screen.getByText('Distributed Log Aggregator')).toBeDefined()
    expect(screen.getByText('Accessible Component Library')).toBeDefined()

    // Recommended section
    expect(screen.getByText('Curated Project Recommendations')).toBeDefined()
    expect(screen.getByText('High-Concurrency URL Shortener Service')).toBeDefined()
    expect(screen.getByText(/Core portfolio project for Backend Developer/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /Start This Project →/i })).toBeDefined()
  })

  it('filters projects by status tab (In Progress / Completed)', async () => {
    vi.spyOn(api, 'getProjects').mockResolvedValue({ projects: mockProjects })
    vi.spyOn(api, 'getProjectRecommendations').mockResolvedValue({
      targetCareerSlug: null,
      totalRecommendations: 0,
      recommendations: [],
    })
    vi.spyOn(api, 'getCareers').mockResolvedValue({ careers: [], categories: [], total: 0 })

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/projects']}>
          <Routes>
            <Route path="/projects" element={<ProjectsPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(await screen.findByText('Distributed Log Aggregator')).toBeDefined()

    // Click on Completed tab
    const completedTab = screen.getByRole('button', { name: /Completed \(1\)/i })
    fireEvent.click(completedTab)

    // Distributed Log Aggregator is IN_PROGRESS, so it should disappear from the list
    expect(screen.queryByText('Distributed Log Aggregator')).toBeNull()
    expect(screen.getByText('Accessible Component Library')).toBeDefined()
  })

  it('opens custom project modal and creates a project', async () => {
    vi.spyOn(api, 'getProjects').mockResolvedValue({ projects: [] })
    vi.spyOn(api, 'getProjectRecommendations').mockResolvedValue({
      targetCareerSlug: null,
      totalRecommendations: 0,
      recommendations: [],
    })
    vi.spyOn(api, 'getCareers').mockResolvedValue({ careers: [], categories: [], total: 0 })

    const createSpy = vi.spyOn(api, 'createProject').mockResolvedValue({
      message: 'Project created successfully',
      project: mockProjects[0],
    })

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/projects']}>
          <Routes>
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<div data-testid="detail-page" />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(await screen.findByText('Project Workspace & Portfolio Evidence')).toBeDefined()

    // Click "+ Create Custom Project"
    const createBtn = screen.getByRole('button', { name: /\+ Create Custom Project/i })
    fireEvent.click(createBtn)

    // Modal opens
    expect(screen.getByRole('heading', { name: 'Create Custom Project' })).toBeDefined()

    // Fill title
    const titleInput = screen.getByPlaceholderText('e.g. Distributed Task Queue')
    fireEvent.change(titleInput, { target: { value: 'Distributed Log Aggregator' } })

    // Submit form
    const submitBtn = screen.getByRole('button', { name: 'Create Project' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Distributed Log Aggregator' }),
      )
    })
  })

  it('renders project detail view with deliverables and educational verification notice', async () => {
    vi.spyOn(api, 'getProjectById').mockResolvedValue({ project: mockProjects[0] })
    vi.spyOn(api, 'getCurrentRoadmap').mockResolvedValue({ hasRoadmap: false, roadmap: null })

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/projects/proj-1']}>
          <Routes>
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    // Project title, overview, skills
    expect(await screen.findByText('Distributed Log Aggregator')).toBeDefined()
    expect(screen.getByText(/A microservice log pipeline using Node.js and SQLite/i)).toBeDefined()
    expect(screen.getByText('RESTful API Design')).toBeDefined()

    // Deliverable & verification disclaimer
    expect(screen.getByText(/Deliverables & Practical Evidence/i)).toBeDefined()
    expect(screen.getByText(/Deliverable records are student-submitted practical evidence/i)).toBeDefined()
    expect(screen.getByText('Core Ingestion API Module')).toBeDefined()
    expect(screen.getByText('✓ Student-submitted')).toBeDefined()
  })

  it('adds a new deliverable/evidence item to the project', async () => {
    vi.spyOn(api, 'getProjectById').mockResolvedValue({ project: mockProjects[0] })
    vi.spyOn(api, 'getCurrentRoadmap').mockResolvedValue({ hasRoadmap: false, roadmap: null })

    const addDelSpy = vi.spyOn(api, 'addDeliverable').mockResolvedValue({
      message: 'Deliverable added successfully',
      deliverable: {
        id: 'del-2',
        projectId: 'proj-1',
        title: 'Benchmark Load Test Results',
        description: 'Verified 5,000 req/sec under siege.',
        type: 'TEST_SUITE',
        status: 'SUBMITTED',
        url: 'https://github.com/student/log-aggregator/wiki/benchmarks',
        roadmapTaskId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/projects/proj-1']}>
          <Routes>
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(await screen.findByText('Distributed Log Aggregator')).toBeDefined()

    // Click "+ Add Evidence / Deliverable"
    const addBtn = screen.getByRole('button', { name: /\+ Add Evidence \/ Deliverable/i })
    fireEvent.click(addBtn)

    // Modal opens
    expect(screen.getByRole('heading', { name: 'Add Deliverable / Evidence' })).toBeDefined()

    // Fill title
    const titleInput = screen.getByPlaceholderText(/e\.g\. Ingestion Pipeline Pull Request #4/i)
    fireEvent.change(titleInput, { target: { value: 'Benchmark Load Test Results' } })

    // Fill URL
    const urlInput = screen.getByPlaceholderText(/https:\/\/github\.com\/\.\.\. or https:\/\/\.\.\./i)
    fireEvent.change(urlInput, { target: { value: 'https://github.com/student/log-aggregator/wiki/benchmarks' } })

    // Submit
    const submitBtn = screen.getByRole('button', { name: 'Add Deliverable' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(addDelSpy).toHaveBeenCalledWith(
        'proj-1',
        expect.objectContaining({
          title: 'Benchmark Load Test Results',
          url: 'https://github.com/student/log-aggregator/wiki/benchmarks',
        }),
      )
    })
  })

  it('renders project workspace summary widget in student dashboard (/app)', async () => {
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
    vi.spyOn(api, 'getCurrentRoadmap').mockResolvedValue({ hasRoadmap: false, roadmap: null })
    vi.spyOn(api, 'getProjectMetrics').mockResolvedValue({
      metrics: {
        totalProjects: 3,
        activeProjects: 2,
        plannedProjects: 0,
        completedProjects: 1,
        archivedProjects: 0,
        totalDeliverables: 5,
      },
    })

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/app']}>
          <AppCheckpoint />
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(await screen.findByText('Project-Based Learning & Evidence')).toBeDefined()
    expect(screen.getByText('Open Project Workspace →')).toBeDefined()
    expect(screen.getByText('Total Projects')).toBeDefined()
    expect(screen.getByText('Deliverables Added')).toBeDefined()
    expect(screen.getByText('5')).toBeDefined()
  })
})
