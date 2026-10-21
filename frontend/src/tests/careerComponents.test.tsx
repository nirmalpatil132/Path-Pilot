import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import CareerExplorer from '../pages/careers/CareerExplorer'
import CareerDetail from '../pages/careers/CareerDetail'
import { AuthContext, type AuthContextType } from '../context/authContextDef'
import { api, type CareerSummary, type CareerDetail as CareerDetailType } from '../lib/api'

// Sample mock data matching backend schema contracts
const mockCareerSummaries: CareerSummary[] = [
  {
    id: 'c1',
    slug: 'backend-developer',
    title: 'Backend Developer',
    category: 'Engineering',
    summary: 'Design the APIs, data models and systems behind an app.',
    description: 'Backend Developers engineer server-side logic and databases.',
    coreSkills: ['APIs', 'Databases', 'SQL', 'Git'],
    supportingSkills: ['Docker', 'Testing', 'Redis'],
    commonJobTitles: ['Junior Backend Developer', 'API Engineer'],
    exampleProjectsCount: 2,
  },
  {
    id: 'c2',
    slug: 'data-analyst',
    title: 'Data Analyst',
    category: 'Data',
    summary: 'Turn raw data into decisions stakeholders can act on.',
    description: 'Data Analysts write SQL queries and build dashboards.',
    coreSkills: ['Advanced SQL', 'Tableau', 'Excel'],
    supportingSkills: ['Python (Pandas)', 'Statistics'],
    commonJobTitles: ['Junior Data Analyst', 'BI Analyst'],
    exampleProjectsCount: 2,
  },
  {
    id: 'c3',
    slug: 'ui-ux-designer',
    title: 'UI/UX Designer',
    category: 'Design',
    summary: 'Design experiences that are usable, clear and trustworthy.',
    description: 'UI/UX Designers conduct research and craft Figma wireframes.',
    coreSkills: ['Figma', 'Wireframing', 'User Research'],
    supportingSkills: ['Design Systems', 'WCAG Accessibility'],
    commonJobTitles: ['Junior UI Designer', 'Product Designer'],
    exampleProjectsCount: 1,
  },
]

const mockBackendDetail: CareerDetailType = {
  id: 'c1',
  slug: 'backend-developer',
  title: 'Backend Developer',
  category: 'Engineering',
  summary: 'Design the APIs, data models and systems behind an app.',
  description: 'Backend Developers engineer server-side systems, databases, and APIs.',
  responsibilities: [
    'Design and maintain REST APIs',
    'Optimize relational database schemas',
    'Implement secure user authentication',
  ],
  coreSkills: [
    { name: 'APIs', description: 'RESTful API contracts and HTTP standards' },
    { name: 'Databases', description: 'Relational database modeling and queries' },
  ],
  supportingSkills: [
    { name: 'Docker', description: 'Containerizing backend services' },
    { name: 'Testing', description: 'Automated integration tests' },
  ],
  commonJobTitles: ['Junior Backend Developer', 'API Engineer'],
  exampleProjects: [
    {
      title: 'Authenticated Task Management API',
      description: 'A REST API with session cookies, rate limiting, and unit tests.',
      skills: ['APIs', 'Databases', 'Testing'],
    },
  ],
  prerequisites: ['Basic programming', 'Relational database concepts'],
  relatedCareers: [
    {
      slug: 'full-stack-developer',
      title: 'Full Stack Developer',
      category: 'Engineering',
      summary: 'Work across the entire stack from UI to database.',
    },
  ],
  growthPaths: ['Senior Backend Engineer', 'Solutions Architect'],
  interviewAreas: ['Database indexing and normalization', 'REST API error conventions'],
}

function renderWithRouter(ui: React.ReactElement, initialPath = '/') {
  const defaultAuth: AuthContextType = {
    user: null,
    isLoading: false,
    error: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn().mockResolvedValue(null),
  }

  return render(
    <AuthContext.Provider value={defaultAuth}>
      <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('Career Explorer & Career Detail Frontend Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CareerExplorer Page', () => {
    it('renders heading, description, search input, and loads career cards', async () => {
      vi.spyOn(api, 'getCareers').mockResolvedValue({
        careers: mockCareerSummaries,
        categories: ['Engineering', 'Data', 'Design'],
        total: 3,
      })

      renderWithRouter(<CareerExplorer />)

      // Header verification
      expect(screen.getByRole('heading', { level: 1, name: /career explorer/i })).toBeDefined()
      expect(screen.getByPlaceholderText(/search by title, skill/i)).toBeDefined()

      // Cards should load
      await waitFor(() => {
        expect(screen.getByText('Backend Developer')).toBeDefined()
        expect(screen.getByText('Data Analyst')).toBeDefined()
        expect(screen.getByText('UI/UX Designer')).toBeDefined()
      })

      // Check results counter
      expect(screen.getByText(/showing/i).textContent).toContain('Showing 3 career paths')
    })

    it('filters careers when a category button is clicked', async () => {
      vi.spyOn(api, 'getCareers').mockImplementation(async (params) => {
        let filtered = mockCareerSummaries
        if (params?.category && params.category !== 'All') {
          filtered = filtered.filter((c) => c.category === params.category)
        }
        return {
          careers: filtered,
          categories: ['Engineering', 'Data', 'Design'],
          total: filtered.length,
        }
      })

      renderWithRouter(<CareerExplorer />)

      await waitFor(() => {
        expect(screen.getByText('Backend Developer')).toBeDefined()
      })

      // Click "Data" category filter
      const dataCategoryBtn = screen.getByRole('button', { name: /^data$/i })
      fireEvent.click(dataCategoryBtn)

      await waitFor(() => {
        expect(screen.getByText('Data Analyst')).toBeDefined()
        expect(screen.queryByText('Backend Developer')).toBeNull()
        expect(screen.queryByText('UI/UX Designer')).toBeNull()
      })
    })

    it('filters careers when typing in search input', async () => {
      vi.spyOn(api, 'getCareers').mockImplementation(async (params) => {
        let filtered = mockCareerSummaries
        if (params?.search) {
          filtered = filtered.filter((c) =>
            c.title.toLowerCase().includes(params.search!.toLowerCase()),
          )
        }
        return {
          careers: filtered,
          categories: ['Engineering', 'Data', 'Design'],
          total: filtered.length,
        }
      })

      renderWithRouter(<CareerExplorer />)

      await waitFor(() => {
        expect(screen.getByText('Backend Developer')).toBeDefined()
      })

      const searchInput = screen.getByPlaceholderText(/search by title, skill/i)
      fireEvent.change(searchInput, { target: { value: 'Designer' } })

      await waitFor(
        () => {
          expect(screen.getByText('UI/UX Designer')).toBeDefined()
          expect(screen.queryByText('Backend Developer')).toBeNull()
          expect(screen.queryByText('Data Analyst')).toBeNull()
        },
        { timeout: 1500 },
      )
    })

    it('shows empty state when no careers match search and allows resetting filters', async () => {
      vi.spyOn(api, 'getCareers').mockResolvedValue({
        careers: [],
        categories: ['Engineering', 'Data', 'Design'],
        total: 0,
      })

      renderWithRouter(<CareerExplorer />)

      await waitFor(() => {
        expect(screen.getByText(/no career paths found/i)).toBeDefined()
      })

      const resetBtn = screen.getByRole('button', { name: /reset filters/i })
      expect(resetBtn).toBeDefined()
    })

    it('displays error state if catalog fetch fails', async () => {
      vi.spyOn(api, 'getCareers').mockRejectedValue(new Error('Network error loading catalog'))

      renderWithRouter(<CareerExplorer />)

      await waitFor(() => {
        expect(screen.getByText(/failed to load careers/i)).toBeDefined()
        expect(screen.getByText(/network error loading catalog/i)).toBeDefined()
      })
    })

    it('career cards contain links to career details', async () => {
      vi.spyOn(api, 'getCareers').mockResolvedValue({
        careers: mockCareerSummaries,
        categories: ['Engineering', 'Data', 'Design'],
        total: 3,
      })

      renderWithRouter(<CareerExplorer />)

      await waitFor(() => {
        const detailLinks = screen.getAllByRole('link', { name: /view career details →/i })
        expect(detailLinks.length).toBe(3)
        expect(detailLinks[0].getAttribute('href')).toBe('/careers/backend-developer')
      })
    })
  })

  describe('CareerDetail Page', () => {
    it('renders complete structured details for a valid career slug', async () => {
      vi.spyOn(api, 'getCareerBySlug').mockResolvedValue({
        career: mockBackendDetail,
      })

      renderWithRouter(
        <Routes>
          <Route path="/careers/:slug" element={<CareerDetail />} />
        </Routes>,
        '/careers/backend-developer',
      )

      // Title & Summary
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Backend Developer' })).toBeDefined()
      })
      expect(screen.getByText(mockBackendDetail.summary)).toBeDefined()

      // Responsibilities
      expect(screen.getByText('Design and maintain REST APIs')).toBeDefined()
      expect(screen.getByText('Optimize relational database schemas')).toBeDefined()

      // Core skills (check multiple matches gracefully)
      expect(screen.getAllByText('APIs').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('RESTful API contracts and HTTP standards')).toBeDefined()

      // Common titles
      expect(screen.getByText('Junior Backend Developer')).toBeDefined()
      expect(screen.getByText('API Engineer')).toBeDefined()

      // Example projects
      expect(screen.getByText('Authenticated Task Management API')).toBeDefined()

      // Related careers
      expect(screen.getByText('Full Stack Developer')).toBeDefined()
      expect(screen.getByRole('link', { name: /explore full stack developer →/i }).getAttribute('href')).toBe(
        '/careers/full-stack-developer',
      )

      // Back navigation link
      expect(screen.getByRole('link', { name: /← back to career explorer/i }).getAttribute('href')).toBe(
        '/careers',
      )
    })

    it('renders 404 Career Not Found state when slug does not exist', async () => {
      const err = new Error('Career not found') as Error & { statusCode?: number }
      err.statusCode = 404
      vi.spyOn(api, 'getCareerBySlug').mockRejectedValue(err)

      renderWithRouter(
        <Routes>
          <Route path="/careers/:slug" element={<CareerDetail />} />
        </Routes>,
        '/careers/unknown-slug',
      )

      await waitFor(() => {
        expect(screen.getByText(/career path not found/i)).toBeDefined()
      })
      expect(screen.getByRole('button', { name: /return to career explorer/i })).toBeDefined()
    })
  })
})
