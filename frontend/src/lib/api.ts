const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export interface User {
  id: string
  name: string
  email: string
  createdAt?: string
}

export interface AuthResponse {
  user: User
}

export interface ApiValidationError {
  field: string
  message: string
}

export class ApiError extends Error {
  statusCode: number
  details?: ApiValidationError[]

  constructor(message: string, statusCode = 400, details?: ApiValidationError[]) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Send and receive HttpOnly session cookies
    })

    if (response.status === 204) {
      return {} as T
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const message = data.error || response.statusText || 'Request failed'
      throw new ApiError(message, response.status, data.details)
    }

    return data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    // Network error or unexpected exception
    throw new ApiError('Unable to connect to PathPilot server. Please check your connection.', 0)
  }
}

export interface ProfileSkill {
  id?: string
  name: string
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced'
}

export type ExperienceType =
  | 'internship'
  | 'project'
  | 'freelance'
  | 'competition'
  | 'certification'
  | 'open_source'
  | 'other'

export interface ProfileExperience {
  id?: string
  type: ExperienceType
  title: string
  organization?: string | null
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  link?: string | null
}

export interface StudentProfile {
  id?: string
  userId?: string
  isOnboardingCompleted: boolean
  currentStep: number
  completedAt?: string | null
  degree?: string | null
  branch?: string | null
  currentYear?: string | null
  university?: string | null
  college?: string | null
  cgpa?: number | null
  academicContext?: string | null
  interests: string[]
  primaryGoal?: string | null
  secondaryGoals: string[]
  preferredLocation?: string | null
  workMode?: string | null
  weeklyHours?: string | null
  targetTimeline?: string | null
  financialContext?: string | null
  skills: ProfileSkill[]
  experiences: ProfileExperience[]
  createdAt?: string
  updatedAt?: string
}

export interface ProfileResponse {
  profile: StudentProfile | null
}

export interface CareerSummary {
  id: string
  slug: string
  title: string
  category: string
  summary: string
  description: string
  coreSkills: string[]
  supportingSkills: string[]
  commonJobTitles: string[]
  exampleProjectsCount: number
}

export type CareerListItem = CareerSummary

export interface CareerSkillItem {
  name: string
  description?: string | null
}

export interface ExampleProject {
  title: string
  description: string
  skills?: string[]
}

export interface RelatedCareerPreview {
  slug: string
  title: string
  category: string
  summary: string
}

export interface CareerDetail {
  id: string
  slug: string
  title: string
  category: string
  summary: string
  description: string
  responsibilities: string[]
  coreSkills: CareerSkillItem[]
  supportingSkills: CareerSkillItem[]
  commonJobTitles: string[]
  exampleProjects: ExampleProject[]
  prerequisites: string[]
  relatedCareers: RelatedCareerPreview[]
  growthPaths: string[]
  interviewAreas: string[]
}

export interface CareersResponse {
  careers: CareerSummary[]
  categories: string[]
  total: number
}

export interface CareerDetailResponse {
  career: CareerDetail
}

export interface DimensionScoreDetail {
  score: number
  rawScore: number
  configuredWeight: number
  effectiveWeight: number
  isAvailable: boolean
  explanation: string
  evidence: string[]
}

export type SkillGapCategory = 'CRITICAL_MISSING' | 'RECOMMENDED_NEXT' | 'OPTIONAL_ADVANTAGE'

export interface SkillGapItem {
  id: string
  name: string
  category: SkillGapCategory
  categoryLabel: 'Critical Missing' | 'Recommended Next' | 'Optional Advantage'
  description?: string | null
  classificationRule: string
  targetCareerSlug: string
}

export interface SkillGapAnalysis {
  careerSlug: string
  careerTitle: string
  totalCoreSkills: number
  matchedCoreSkills: string[]
  missingCoreSkills: string[]
  coreCoveragePercentage: number
  totalSupportingSkills: number
  matchedSupportingSkills: string[]
  missingSupportingSkills: string[]
  allMatchedSkills: string[]
  matchedSkills: string[]
  criticalMissingCount: number
  recommendedNextCount: number
  optionalAdvantageCount: number
  gaps: SkillGapItem[]
}

export interface CareerFitResult {
  careerId: string
  slug: string
  title: string
  category: string
  fitScore: number
  scoreDisplay: number | null
  fitLevel: 'Strong Match' | 'Moderate Match' | 'Developing Fit' | 'Insufficient Data'
  status: 'SUFFICIENT_EVIDENCE' | 'INSUFFICIENT_DATA'
  statusReason?: string
  policyVersion: string
  configuredWeights: {
    skills: number
    projects: number
    interests: number
    academics: number
  }
  effectiveWeights: Record<string, number>
  availableDimensions: string[]
  excludedDimensions: Array<{ dimension: string; reason: string }>
  dimensionScores: {
    skills: DimensionScoreDetail
    projects: DimensionScoreDetail
    interests: DimensionScoreDetail
    academics: DimensionScoreDetail
  }
  strengths: string[]
  growthAreas: string[]
  dataLimitations: string[]
  matchedSkills: string[]
  missingCoreCount: number
  coreCoveragePercentage: number
  skillGapAnalysis: SkillGapAnalysis
}

export interface CareerFitOverviewResponse {
  status: 'SUFFICIENT_EVIDENCE' | 'INSUFFICIENT_DATA'
  policyVersion: string
  profileSummary: {
    hasProfile: boolean
    isOnboardingCompleted: boolean
    skillsCount: number
    experiencesCount: number
    interestsCount: number
  }
  results: CareerFitResult[]
  fits: CareerFitResult[]
  message?: string
}

export interface CareerFitDetailResponse {
  careerNotFound: boolean
  hasProfile: boolean
  career?: CareerDetail
  fit: CareerFitResult | null
  skillGaps?: SkillGapAnalysis | null
  profileSummary?: {
    hasProfile: boolean
    isOnboardingCompleted: boolean
    skillsCount: number
    experiencesCount: number
    interestsCount: number
  }
  message?: string
}

export const api = {
  register: (data: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => request<AuthResponse>('/auth/me'),

  getProfile: () => request<ProfileResponse>('/profile'),

  updateProfile: (data: Partial<StudentProfile>) =>
    request<{ profile: StudentProfile }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateSkills: (skills: ProfileSkill[]) =>
    request<{ skills: ProfileSkill[] }>('/profile/skills', {
      method: 'PUT',
      body: JSON.stringify({ skills }),
    }),

  updateExperiences: (experiences: ProfileExperience[]) =>
    request<{ experiences: ProfileExperience[] }>('/profile/experience', {
      method: 'PUT',
      body: JSON.stringify({ experiences }),
    }),

  completeOnboarding: () =>
    request<{ message: string; profile: StudentProfile }>('/profile/onboarding/complete', {
      method: 'PUT',
    }),

  getCareers: (params?: { search?: string; category?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.search && params.search.trim() !== '') {
      searchParams.set('search', params.search.trim())
    }
    if (params?.category && params.category !== 'All' && params.category.trim() !== '') {
      searchParams.set('category', params.category.trim())
    }
    const queryString = searchParams.toString()
    return request<CareersResponse>(`/careers${queryString ? `?${queryString}` : ''}`)
  },

  getCareerBySlug: (slug: string) =>
    request<CareerDetailResponse>(`/careers/${encodeURIComponent(slug)}`),

  getCareerFitOverview: () =>
    request<CareerFitOverviewResponse>('/careers/fit'),

  getCareerFitForSlug: (slug: string) =>
    request<CareerFitDetailResponse>(`/careers/${encodeURIComponent(slug)}/fit`),

  // Phase 7: Personalized Learning Roadmap API
  generateRoadmap: (data: { careerSlug: string; weeklyHours?: number; force?: boolean }) =>
    request<{ message: string; roadmap: Roadmap }>('/roadmap/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentRoadmap: () =>
    request<CurrentRoadmapResponse>('/roadmap/current'),

  getRoadmapById: (id: string) =>
    request<{ roadmap: Roadmap }>(`/roadmap/${encodeURIComponent(id)}`),

  updateTaskStatus: (
    taskId: string,
    data: { status?: RoadmapTaskStatus; notes?: string },
  ) =>
    request<{
      message: string
      task: RoadmapTask
      roadmapProgress: {
        totalTasks: number
        completedTasks: number
        inProgressTasks: number
        blockedTasks: number
        progressPercentage: number
      }
    }>(`/roadmap/tasks/${encodeURIComponent(taskId)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  regenerateRoadmap: (data: {
    careerSlug: string
    weeklyHours?: number
    preserveCompletedTasks?: boolean
  }) =>
    request<{ message: string; roadmap: Roadmap }>('/roadmap/regenerate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Phase 08: Project-Based Learning & Portfolio Evidence
  getProjects: (status?: string) =>
    request<{ projects: Project[] }>(
      status && status !== 'ALL' ? `/projects?status=${encodeURIComponent(status)}` : '/projects',
    ),

  getProjectRecommendations: (career?: string) =>
    request<ProjectRecommendationsResponse>(
      career ? `/projects/recommendations?career=${encodeURIComponent(career)}` : '/projects/recommendations',
    ),

  getProjectTemplates: (career?: string) =>
    request<{ templates: CatalogProjectTemplate[] }>(
      career ? `/projects/templates?career=${encodeURIComponent(career)}` : '/projects/templates',
    ),

  getProjectMetrics: () =>
    request<{ metrics: ProjectSummaryMetrics }>('/projects/metrics'),

  getProjectById: (id: string) =>
    request<{ project: Project }>(`/projects/${encodeURIComponent(id)}`),

  createProject: (data: CreateProjectPayload) =>
    request<{ message: string; project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProject: (id: string, data: UpdateProjectPayload) =>
    request<{ message: string; project: Project }>(`/projects/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteProject: (id: string) =>
    request<{ message: string }>(`/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  addDeliverable: (projectId: string, data: CreateDeliverablePayload) =>
    request<{ message: string; deliverable: ProjectDeliverable }>(
      `/projects/${encodeURIComponent(projectId)}/evidence`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    ),

  updateDeliverable: (projectId: string, evidenceId: string, data: UpdateDeliverablePayload) =>
    request<{ message: string; deliverable: ProjectDeliverable }>(
      `/projects/${encodeURIComponent(projectId)}/evidence/${encodeURIComponent(evidenceId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    ),

  deleteDeliverable: (projectId: string, evidenceId: string) =>
    request<{ message: string }>(
      `/projects/${encodeURIComponent(projectId)}/evidence/${encodeURIComponent(evidenceId)}`,
      {
        method: 'DELETE',
      },
    ),
}

export type RoadmapTaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'

export interface RoadmapTask {
  id: string
  roadmapId: string
  weekNumber: number
  dayNumber: number
  dayRange: string
  orderIndex: number
  title: string
  description: string
  estimatedMinutes: number
  skillName: string
  skillCategory: 'CRITICAL_MISSING' | 'RECOMMENDED_NEXT' | 'OPTIONAL_ADVANTAGE' | 'PROJECT'
  prerequisites: string[]
  completionCriteria: string
  expectedOutput: string
  status: RoadmapTaskStatus
  notes?: string | null
  completedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface RoadmapWeek {
  weekNumber: number
  title: string
  objective: string
  milestoneOutcome: string
  dayRange: string
  tasks: RoadmapTask[]
  totalTasks: number
  completedTasks: number
  progressPercentage: number
  totalMinutes: number
}

export interface Roadmap {
  id: string
  userId: string
  careerId: string
  careerSlug: string
  careerTitle: string
  careerCategory?: string | null
  careerSummary?: string | null
  version: number
  status: 'ACTIVE' | 'ARCHIVED'
  weeklyHoursAssumed: number
  totalDays: number
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  blockedTasks: number
  progressPercentage: number
  skillGapsAddressed: string[]
  assumptions: string[]
  deferredSkills: string[]
  createdAt: string
  updatedAt: string
  weeks: RoadmapWeek[]
  tasks: RoadmapTask[]
}

export interface CurrentRoadmapResponse {
  hasRoadmap: boolean
  roadmap: Roadmap | null
}

// ==========================================
// Phase 08: Project & Deliverable Types
// ==========================================

export type ProjectStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED'

export type DeliverableType =
  | 'FEATURE_MODULE'
  | 'CODE_REPOSITORY'
  | 'DEPLOYED_DEMO'
  | 'TEST_SUITE'
  | 'DESIGN_PROTOTYPE'
  | 'TECHNICAL_DOCS'
  | 'IMPLEMENTATION_NOTE'

export type DeliverableStatus = 'PLANNED' | 'SUBMITTED'

export interface ProjectDeliverable {
  id: string
  projectId: string
  title: string
  description: string
  type: DeliverableType
  status: DeliverableStatus
  url: string | null
  roadmapTaskId: string | null
  roadmapTaskTitle?: string | null
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  userId: string
  title: string
  description: string
  source: 'TEMPLATE' | 'CUSTOM'
  templateId: string | null
  careerId: string | null
  careerSlug: string | null
  careerTitle: string | null
  skills: string[]
  status: ProjectStatus
  startDate: string | null
  completionDate: string | null
  repositoryUrl: string | null
  liveDemoUrl: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  deliverablesCount: number
  deliverables?: ProjectDeliverable[]
}

export interface CatalogProjectTemplate {
  templateId: string
  title: string
  description: string
  skills: string[]
  careerSlug: string
  careerTitle: string
  careerCategory: string
}

export interface ProjectRecommendation {
  templateId: string
  title: string
  description: string
  skills: string[]
  careerSlug: string
  careerTitle: string
  careerCategory: string
  priority: 'HIGH' | 'RECOMMENDED' | 'ELECTIVE'
  matchScore: number
  reasons: string[]
  matchedCriticalSkills: string[]
  matchedRecommendedSkills: string[]
  matchedOptionalSkills: string[]
  allMatchedSkills: string[]
  isAlreadyStarted: boolean
  existingProjectStatus?: string | null
}

export interface ProjectRecommendationsResponse {
  targetCareerSlug: string | null
  totalRecommendations: number
  recommendations: ProjectRecommendation[]
}

export interface ProjectSummaryMetrics {
  totalProjects: number
  activeProjects: number
  plannedProjects: number
  completedProjects: number
  archivedProjects: number
  totalDeliverables: number
}

export interface CreateProjectPayload {
  title: string
  description?: string
  source?: 'TEMPLATE' | 'CUSTOM'
  templateId?: string | null
  careerSlug?: string | null
  careerTitle?: string | null
  skills?: string[]
  status?: ProjectStatus
  startDate?: string | null
  completionDate?: string | null
  repositoryUrl?: string | null
  liveDemoUrl?: string | null
  notes?: string | null
}

export interface UpdateProjectPayload {
  title?: string
  description?: string
  skills?: string[]
  status?: ProjectStatus
  startDate?: string | null
  completionDate?: string | null
  repositoryUrl?: string | null
  liveDemoUrl?: string | null
  notes?: string | null
}

export interface CreateDeliverablePayload {
  title: string
  description?: string
  type?: DeliverableType
  status?: DeliverableStatus
  url?: string | null
  roadmapTaskId?: string | null
}

export interface UpdateDeliverablePayload {
  title?: string
  description?: string
  type?: DeliverableType
  status?: DeliverableStatus
  url?: string | null
}
