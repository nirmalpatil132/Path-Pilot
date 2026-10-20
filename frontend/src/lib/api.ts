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
}
