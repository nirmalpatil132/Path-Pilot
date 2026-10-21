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
}
