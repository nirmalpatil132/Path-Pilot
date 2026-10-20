import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, CardContent, CardHeader, Input } from '@/components/ui'
import { useAuth } from '@/context'
import { ApiError } from '@/lib/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const errors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await login({ email: email.trim(), password })

      // Navigate to intended destination or default to /app
      const rawFrom = (location.state as { from?: string } | null)?.from
      const safeDestination =
        rawFrom && rawFrom.startsWith('/') && !rawFrom.startsWith('//') ? rawFrom : '/app'

      navigate(safeDestination, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link
            to="/"
            className="inline-block text-h2 font-bold tracking-tight text-text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            PathPilot
          </Link>
          <h1 className="mt-3 text-h2 text-text-primary">Welcome back</h1>
          <p className="mt-2 text-body-sm text-text-secondary">
            Sign in to continue planning your career direction and tracking your progress.
          </p>
        </div>

        <Card className="mt-8 shadow-md">
          <CardHeader>
            <h2 className="text-h3 text-text-primary">Sign in with credentials</h2>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="mb-5">
                <Alert variant="danger" title="Sign in failed">
                  {errorMessage}
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <Input
                label="Email address"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
                }}
                error={fieldErrors.email}
                placeholder="you@college.edu"
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (fieldErrors.password)
                      setFieldErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  error={fieldErrors.password}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-[34px] text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                    {showPassword ? (
                      <path
                        d="M3 3l14 14M8.5 8.5a3 3 0 0 0 4.24 4.24M10 5.5c4.5 0 8 4.5 8 4.5a15.8 15.8 0 0 1-3.23 3.56M6.16 6.16A16.03 16.03 0 0 0 2 10s3.5 4.5 8 4.5c1.47 0 2.8-.43 3.96-1.16"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : (
                      <path
                        d="M10 5.5C5.5 5.5 2 10 2 10s3.5 4.5 8 4.5 8-4.5 8-4.5-3.5-4.5-8-4.5ZM10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>
                </button>
              </div>

              <div className="pt-2">
                <Button type="submit" size="md" isLoading={isSubmitting} className="w-full">
                  Sign in
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-body-sm text-text-secondary">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Create an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
