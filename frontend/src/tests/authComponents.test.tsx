import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Signup'
import AppCheckpoint from '../pages/app/AppCheckpoint'
import { AuthContext, type AuthContextType } from '../context/authContextDef'

function renderWithAuth(
  ui: React.ReactElement,
  authOverrides: Partial<AuthContextType> = {},
) {
  const defaultAuth: AuthContextType = {
    user: null,
    isLoading: false,
    error: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn().mockResolvedValue(null),
    ...authOverrides,
  }

  return render(
    <AuthContext.Provider value={defaultAuth}>
      <MemoryRouter>{ui}</MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('Frontend Auth Components & Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Login Component', () => {
    it('renders email, password inputs, submit button, and signup link', () => {
      renderWithAuth(<Login />)

      expect(screen.getByLabelText(/email address/i)).toBeDefined()
      expect(screen.getByLabelText(/^password/i)).toBeDefined()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined()
      expect(screen.getByText(/create an account/i)).toBeDefined()
    })

    it('displays client-side validation errors when submitting empty form', async () => {
      renderWithAuth(<Login />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(submitButton)

      expect(screen.getByText('Email is required')).toBeDefined()
      expect(screen.getByText('Password is required')).toBeDefined()
    })

    it('toggles password visibility when toggle button is clicked', () => {
      renderWithAuth(<Login />)

      const passwordInput = screen.getByLabelText(/^password/i) as HTMLInputElement
      expect(passwordInput.type).toBe('password')

      const toggleButton = screen.getByLabelText(/show password/i)
      fireEvent.click(toggleButton)

      expect(passwordInput.type).toBe('text')

      const hideButton = screen.getByLabelText(/hide password/i)
      fireEvent.click(hideButton)

      expect(passwordInput.type).toBe('password')
    })
  })

  describe('Signup Component', () => {
    it('renders all registration fields and requirements', () => {
      renderWithAuth(<Signup />)

      expect(screen.getByLabelText(/full name/i)).toBeDefined()
      expect(screen.getByLabelText(/email address/i)).toBeDefined()
      expect(screen.getByLabelText(/^password/i)).toBeDefined()
      expect(screen.getByLabelText(/confirm password/i)).toBeDefined()
      expect(screen.getByRole('button', { name: /create account/i })).toBeDefined()
      expect(screen.getByText(/must contain at least 8 characters/i)).toBeDefined()
    })

    it('displays validation errors on empty submission', () => {
      renderWithAuth(<Signup />)

      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      expect(screen.getByText('Full name is required')).toBeDefined()
      expect(screen.getByText('Email is required')).toBeDefined()
      expect(screen.getByText('Password is required')).toBeDefined()
      expect(screen.getByText('Confirm your password')).toBeDefined()
    })

    it('validates password mismatch and min length', () => {
      renderWithAuth(<Signup />)

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Rahul' } })
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'rahul@test.com' },
      })
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'short' } })
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'different' },
      })

      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      expect(screen.getByText('Password must be at least 8 characters long')).toBeDefined()
    })

    it('validates matching passwords', () => {
      renderWithAuth(<Signup />)

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Rahul' } })
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'rahul@test.com' },
      })
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'longenough123' } })
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'differentpassword' },
      })

      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      expect(screen.getByText('Passwords do not match')).toBeDefined()
    })
  })

  describe('AppCheckpoint Component', () => {
    it('renders authenticated checkpoint with user profile and sign out action', async () => {
      const mockLogout = vi.fn().mockResolvedValue(undefined)
      const mockUser = {
        id: 'cuid_test_123',
        name: 'Pooja Verma',
        email: 'pooja@college.edu',
      }

      renderWithAuth(<AppCheckpoint />, {
        user: mockUser,
        logout: mockLogout,
      })

      expect(screen.getByText(/welcome, pooja verma!/i)).toBeDefined()
      expect(screen.getByText('cuid_test_123')).toBeDefined()
      expect(screen.getAllByText('pooja@college.edu').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Authenticated')).toBeDefined()

      const signOutButtons = screen.getAllByRole('button', { name: /sign out/i })
      expect(signOutButtons.length).toBeGreaterThanOrEqual(1)

      fireEvent.click(signOutButtons[0])
      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1)
      })
    })
  })
})
