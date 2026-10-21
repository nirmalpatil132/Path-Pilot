import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Button, ProgressBar } from '@/components/ui'
import { useAuth } from '@/context'
import {
  api,
  ApiError,
  type ProfileExperience,
  type ProfileSkill,
  type StudentProfile,
} from '@/lib/api'
import { Step1Welcome } from './Step1Welcome'
import { Step2Education } from './Step2Education'
import { Step3Skills } from './Step3Skills'
import { Step4Experience } from './Step4Experience'
import { Step5Interests } from './Step5Interests'
import { Step6Goals } from './Step6Goals'
import { Step7Constraints } from './Step7Constraints'
import { Step8Review } from './Step8Review'

export default function OnboardingWizard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)

  const [currentStep, setCurrentStep] = useState<number>(1)
  const [profileData, setProfileData] = useState<Partial<StudentProfile>>({
    skills: [],
    experiences: [],
    interests: [],
    secondaryGoals: [],
  })

  // Load existing profile on mount
  useEffect(() => {
    let isMounted = true

    async function loadInitialProfile() {
      try {
        const res = await api.getProfile()
        if (isMounted && res.profile) {
          setProfileData(res.profile)

          // If query param ?step=X is provided, honor it
          const stepParam = searchParams.get('step')
          if (stepParam) {
            const parsed = parseInt(stepParam, 10)
            if (!isNaN(parsed) && parsed >= 1 && parsed <= 8) {
              setCurrentStep(parsed)
              return
            }
          }

          // Otherwise restore to their saved progress step or 1
          if (res.profile.currentStep && res.profile.currentStep >= 1 && res.profile.currentStep <= 8) {
            setCurrentStep(res.profile.currentStep)
          }
        }
      } catch (err) {
        if (isMounted) {
          setGeneralError(
            err instanceof ApiError
              ? err.message
              : 'Failed to load existing profile progress. You can start fresh.',
          )
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadInitialProfile()
    return () => {
      isMounted = false
    }
  }, [searchParams])

  // Save partial profile fields and advance step
  const handleSaveStep = async (
    updates: Partial<StudentProfile>,
    targetStep: number,
  ) => {
    setIsSaving(true)
    setSaveStatus('Saving progress...')
    setGeneralError(null)

    try {
      const merged = { ...profileData, ...updates, currentStep: targetStep }
      setProfileData(merged)

      const res = await api.updateProfile({
        ...updates,
        currentStep: targetStep,
      })

      if (res.profile) {
        setProfileData((prev) => ({
          ...prev,
          ...res.profile,
          skills: prev.skills || [],
          experiences: prev.experiences || [],
        }))
      }

      setSaveStatus('All changes saved')
      setCurrentStep(targetStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setGeneralError(
        err instanceof ApiError ? err.message : 'Failed to save progress. Please try again.',
      )
      setSaveStatus(null)
    } finally {
      setIsSaving(false)
    }
  }

  // Save skills and advance step
  const handleSaveSkills = async (skills: ProfileSkill[]) => {
    setIsSaving(true)
    setSaveStatus('Saving skills...')
    setGeneralError(null)

    try {
      setProfileData((prev) => ({ ...prev, skills, currentStep: 4 }))
      const res = await api.updateSkills(skills)
      if (res.skills) {
        setProfileData((prev) => ({ ...prev, skills: res.skills }))
      }
      await api.updateProfile({ currentStep: 4 })

      setSaveStatus('Skills saved')
      setCurrentStep(4)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setGeneralError(
        err instanceof ApiError ? err.message : 'Failed to save skills. Please try again.',
      )
      setSaveStatus(null)
    } finally {
      setIsSaving(false)
    }
  }

  // Save experiences and advance step
  const handleSaveExperiences = async (experiences: ProfileExperience[]) => {
    setIsSaving(true)
    setSaveStatus('Saving experience...')
    setGeneralError(null)

    try {
      setProfileData((prev) => ({ ...prev, experiences, currentStep: 5 }))
      const res = await api.updateExperiences(experiences)
      if (res.experiences) {
        setProfileData((prev) => ({ ...prev, experiences: res.experiences }))
      }
      await api.updateProfile({ currentStep: 5 })

      setSaveStatus('Experience saved')
      setCurrentStep(5)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setGeneralError(
        err instanceof ApiError ? err.message : 'Failed to save experience. Please try again.',
      )
      setSaveStatus(null)
    } finally {
      setIsSaving(false)
    }
  }

  // Final completion action
  const handleCompleteOnboarding = async () => {
    setIsSaving(true)
    setGeneralError(null)

    try {
      const res = await api.completeOnboarding()
      setProfileData(res.profile)
      navigate('/app', { replace: true })
    } catch (err) {
      setGeneralError(
        err instanceof ApiError ? err.message : 'Failed to complete onboarding. Please try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-body-sm text-text-secondary">Loading onboarding profile...</p>
        </div>
      </div>
    )
  }

  const stepTitles = [
    'Welcome',
    'Education',
    'Skills',
    'Experience',
    'Interests',
    'Goals',
    'Constraints',
    'Review',
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-h3 font-bold text-text-primary transition-opacity hover:opacity-90"
            >
              PathPilot
            </Link>
            <span className="hidden text-caption text-text-muted sm:inline-block">
              / Student Onboarding
            </span>
          </div>

          <div className="flex items-center gap-4">
            {saveStatus && (
              <span className="hidden text-caption font-medium text-text-secondary md:inline-block">
                {saveStatus}
              </span>
            )}
            <span className="hidden text-body-sm text-text-secondary sm:inline-block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="mx-auto max-w-5xl px-4 pb-3 sm:px-6">
          <div className="flex items-center justify-between text-caption text-text-secondary mb-1.5">
            <span className="font-semibold text-text-primary">
              {`Step ${currentStep} of 8: ${stepTitles[currentStep - 1]}`}
            </span>
            <span>{Math.round((currentStep / 8) * 100)}% Completed</span>
          </div>
          <ProgressBar value={currentStep} max={8} />
        </div>
      </header>

      {/* Main Form Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
        {generalError && currentStep !== 8 && (
          <div className="mb-6">
            <Alert variant="danger" title="Error">
              {generalError}
            </Alert>
          </div>
        )}

        {currentStep === 1 && (
          <Step1Welcome onStart={() => setCurrentStep(2)} />
        )}

        {currentStep === 2 && (
          <Step2Education
            key={profileData.id || 'step-2'}
            initialData={profileData}
            onSaveAndContinue={(edu) => handleSaveStep(edu, 3)}
            onBack={() => setCurrentStep(1)}
            isSaving={isSaving}
          />
        )}

        {currentStep === 3 && (
          <Step3Skills
            initialSkills={profileData.skills || []}
            onSaveAndContinue={handleSaveSkills}
            onBack={() => setCurrentStep(2)}
            isSaving={isSaving}
          />
        )}

        {currentStep === 4 && (
          <Step4Experience
            initialExperiences={profileData.experiences || []}
            onSaveAndContinue={handleSaveExperiences}
            onBack={() => setCurrentStep(3)}
            isSaving={isSaving}
          />
        )}

        {currentStep === 5 && (
          <Step5Interests
            initialInterests={profileData.interests || []}
            onSaveAndContinue={(interests) => handleSaveStep({ interests }, 6)}
            onBack={() => setCurrentStep(4)}
            isSaving={isSaving}
          />
        )}

        {currentStep === 6 && (
          <Step6Goals
            initialPrimaryGoal={profileData.primaryGoal || null}
            initialSecondaryGoals={profileData.secondaryGoals || []}
            onSaveAndContinue={(goals) => handleSaveStep(goals, 7)}
            onBack={() => setCurrentStep(5)}
            isSaving={isSaving}
          />
        )}

        {currentStep === 7 && (
          <Step7Constraints
            initialData={profileData}
            onSaveAndContinue={(constraints) => handleSaveStep(constraints, 8)}
            onBack={() => setCurrentStep(6)}
            isSaving={isSaving}
          />
        )}

        {currentStep === 8 && (
          <Step8Review
            profile={profileData}
            onComplete={handleCompleteOnboarding}
            onJumpToStep={(step) => setCurrentStep(step)}
            onBack={() => setCurrentStep(7)}
            isSubmitting={isSaving}
            error={generalError}
          />
        )}
      </main>
    </div>
  )
}
