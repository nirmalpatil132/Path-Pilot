import { describe, expect, it, vi, beforeEach } from 'vitest'
import { api, ApiError } from '../lib/api'

describe('PathPilot Frontend Authentication Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('api.register', () => {
    it('sends POST /auth/register with credentials: include and json body', async () => {
      const mockUser = {
        id: 'user_123',
        name: 'Rahul Sharma',
        email: 'rahul@college.edu',
      }

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ user: mockUser }),
      }))

      const res = await api.register({
        name: 'Rahul Sharma',
        email: 'rahul@college.edu',
        password: 'password123',
      })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/auth/register',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            name: 'Rahul Sharma',
            email: 'rahul@college.edu',
            password: 'password123',
          }),
        }),
      )
      expect(res.user.email).toBe('rahul@college.edu')
    })

    it('throws ApiError with message and validation details on 400', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'Validation failed',
          details: [{ field: 'email', message: 'Invalid email' }],
        }),
      })

      await expect(
        api.register({
          name: '',
          email: 'invalid',
          password: '123',
        }),
      ).rejects.toThrow('Validation failed')
    })
  })

  describe('api.login', () => {
    it('sends POST /auth/login with credentials: include', async () => {
      const mockUser = { id: 'u_1', name: 'Test', email: 'test@example.com' }

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ user: mockUser }),
      })

      const res = await api.login({ email: 'test@example.com', password: 'password' })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/auth/login',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        }),
      )
      expect(res.user.id).toBe('u_1')
    })

    it('throws ApiError with 401 on invalid credentials', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Invalid email or password' }),
      })

      try {
        await api.login({ email: 'wrong@example.com', password: 'bad' })
        expect.unreachable('Should have thrown')
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError)
        expect((err as ApiError).statusCode).toBe(401)
        expect((err as ApiError).message).toBe('Invalid email or password')
      }
    })
  })

  describe('api.logout', () => {
    it('sends POST /auth/logout with credentials: include', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ message: 'Logged out successfully' }),
      })

      const res = await api.logout()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/auth/logout',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        }),
      )
      expect(res.message).toBe('Logged out successfully')
    })
  })

  describe('api.getMe', () => {
    it('sends GET /auth/me with credentials: include', async () => {
      const mockUser = { id: 'u_me', name: 'Current User', email: 'current@test.com' }

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ user: mockUser }),
      })

      const res = await api.getMe()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/auth/me',
        expect.objectContaining({
          credentials: 'include',
        }),
      )
      expect(res.user.email).toBe('current@test.com')
    })

    it('throws ApiError with 401 when unauthenticated', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Unauthenticated' }),
      })

      try {
        await api.getMe()
        expect.unreachable('Should have thrown')
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError)
        expect((err as ApiError).statusCode).toBe(401)
      }
    })

    it('handles network failure gracefully', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      try {
        await api.getMe()
        expect.unreachable('Should have thrown')
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError)
        expect((err as ApiError).statusCode).toBe(0)
        expect((err as ApiError).message).toMatch(/unable to connect/i)
      }
    })
  })
})
