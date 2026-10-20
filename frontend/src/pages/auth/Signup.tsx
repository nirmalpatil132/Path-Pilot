import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, CardContent, CardHeader, Input } from '@/components/ui'
import { useAuth } from '@/context'
import { ApiError } from '@/lib/api'

export default function Signup() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const validate = () => {
    const errors: {
      name?: string
      email?: string
      password?: string
      confirmPassword?: string
    } = {}

    if (!name.trim()) {
      errors.name = 'Full name is required'
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }

    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your password'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
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
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      })

      navigate('/app', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details && err.details.length > 0) {
          const newErrors: Record<string, string> = {}
          err.details.forEach((d) => {
            newErrors[d.field] = d.message
          })
          setFieldErrors((prev) => ({ ...prev, ...newErrors }))
        }
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Unable to register at this time. Please try again.')
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
          <h1 className="mt-3 text-h2 text-text-primary">Create your account</h1>
          <p className="mt-2 text-body-sm text-text-secondary">
            Join PathPilot to understand where you are, explore where you can go, and know what to
            do next.
          </p>
        </div>

        <Card className="mt-8 shadow-md">
          <CardHeader>
            <h2 className="text-h3 text-text-primary">Get started in seconds</h2>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="mb-5">
                <Alert variant="danger" title="Registration error">
                  {errorMessage}
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <Input
                label="Full name"
                type="text"
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }))
                }}
                error={fieldErrors.name}
                placeholder="Rahul Sharma"
              />

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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (fieldErrors.password)
                      setFieldErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  error={fieldErrors.password}
                  placeholder="At least 8 characters"
                  helperText="Must contain at least 8 characters"
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

              <Input
                label="Confirm password"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (fieldErrors.confirmPassword)
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                }}
                error={fieldErrors.confirmPassword}
                placeholder="Repeat your password"
              />

              <div className="pt-2">
                <Button type="submit" size="md" isLoading={isSubmitting} className="w-full">
                  Create account
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-body-sm text-text-secondary">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
