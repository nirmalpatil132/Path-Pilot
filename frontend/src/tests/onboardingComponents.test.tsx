import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { Step1Welcome } from '../pages/onboarding/Step1Welcome'
import { Step2Education } from '../pages/onboarding/Step2Education'
import { Step3Skills } from '../pages/onboarding/Step3Skills'
import { Step4Experience } from '../pages/onboarding/Step4Experience'
import { Step5Interests } from '../pages/onboarding/Step5Interests'
import { Step6Goals } from '../pages/onboarding/Step6Goals'
import { Step7Constraints } from '../pages/onboarding/Step7Constraints'
import { Step8Review } from '../pages/onboarding/Step8Review'
import OnboardingWizard from '../pages/onboarding/OnboardingWizard'
import AppCheckpoint from '../pages/app/AppCheckpoint'
import { AuthContext, type AuthContextType } from '../context/authContextDef'
import { api, type StudentProfile } from '../lib/api'

function renderWithAuth(
  ui: React.ReactElement,
  authOverrides: Partial<AuthContextType> = {},
) {
  const defaultAuth: AuthContextType = {
    user: { id: 'test_u1', name: 'Rohan Sharma', email: 'rohan@college.edu' },
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

describe('Frontend Onboarding Components & Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Step 1: Welcome', () => {
    it('renders welcome message, overview steps, and start button', () => {
      const onStart = vi.fn()
      render(<Step1Welcome onStart={onStart} />)

      expect(screen.getByText(/Welcome to PathPilot!/i)).toBeDefined()
      expect(screen.getByText(/What we will cover/i)).toBeDefined()
      expect(screen.getByRole('heading', { name: 'Education' })).toBeDefined()
      expect(screen.getByRole('heading', { name: 'Skills' })).toBeDefined()

      const startBtn = screen.getByRole('button', { name: /Start Onboarding/i })
      fireEvent.click(startBtn)
      expect(onStart).toHaveBeenCalledTimes(1)
    })
  })

  describe('Step 2: Education', () => {
    it('validates required fields on submission', async () => {
      const onSave = vi.fn()
      render(
        <Step2Education
          initialData={{}}
          onSaveAndContinue={onSave}
          onBack={vi.fn()}
          isSaving={false}
        />,
      )

      const continueBtn = screen.getByRole('button', { name: /Continue to Skills/i })
      fireEvent.click(continueBtn)

      expect(screen.getByText(/Please select or specify your degree program/i)).toBeDefined()
      expect(screen.getByText(/Please select or specify your branch/i)).toBeDefined()
      expect(screen.getByText(/Please select your current academic year/i)).toBeDefined()
      expect(screen.getByText(/Please enter your college or university name/i)).toBeDefined()
      expect(onSave).not.toHaveBeenCalled()
    })

    it('submits valid education data', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined)
      render(
        <Step2Education
          initialData={{}}
          onSaveAndContinue={onSave}
          onBack={vi.fn()}
          isSaving={false}
        />,
      )

      fireEvent.change(screen.getByLabelText(/Degree \/ Program/i), {
        target: { value: 'B.Tech - Bachelor of Technology' },
      })
      fireEvent.change(screen.getByLabelText(/Branch \/ Specialization/i), {
        target: { value: 'Computer Science and Engineering (CSE)' },
      })
      fireEvent.change(screen.getByLabelText(/Current Year \/ Semester/i), {
        target: { value: '3rd Year (Semester 5–6)' },
      })
      fireEvent.change(screen.getByLabelText(/College \/ Institute/i), {
        target: { value: 'COEP Pune' },
      })
      fireEvent.change(screen.getByLabelText(/CGPA \/ Grade/i), {
        target: { value: '8.75' },
      })

      const continueBtn = screen.getByRole('button', { name: /Continue to Skills/i })
      fireEvent.click(continueBtn)

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith({
          degree: 'B.Tech - Bachelor of Technology',
          branch: 'Computer Science and Engineering (CSE)',
          currentYear: '3rd Year (Semester 5–6)',
          college: 'COEP Pune',
          university: null,
          cgpa: 8.75,
          academicContext: null,
        })
      })
    })
  })

  describe('Step 3: Skills', () => {
    it('allows toggling predefined skills, adding custom skills, and removing skills', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined)
      render(
        <Step3Skills
          initialSkills={[]}
          onSaveAndContinue={onSave}
          onBack={vi.fn()}
          isSaving={false}
        />,
      )

      // Toggle predefined Python
      const pythonBtn = screen.getByText('Python')
      fireEvent.click(pythonBtn)

      expect(screen.getByText(/Selected Skills \(1\)/i)).toBeDefined()

      // Add a custom skill
      const customInput = screen.getByPlaceholderText(/FastAPI/i)
      fireEvent.change(customInput, { target: { value: 'FastAPI' } })
      const addBtn = screen.getByRole('button', { name: /Add Skill/i })
      fireEvent.click(addBtn)

      expect(screen.getByText(/Selected Skills \(2\)/i)).toBeDefined()
      expect(screen.getByText('FastAPI')).toBeDefined()

      // Submit
      const continueBtn = screen.getByRole('button', { name: /Continue to Experience/i })
      fireEvent.click(continueBtn)

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ name: 'Python' }),
            expect.objectContaining({ name: 'FastAPI' }),
          ]),
        )
      })
    })
  })

  describe('Step 4: Experience', () => {
    it('allows skipping when no entries are added', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined)
      render(
        <Step4Experience
          initialExperiences={[]}
          onSaveAndContinue={onSave}
          onBack={vi.fn()}
          isSaving={false}
        />,
      )

      const skipBtn = screen.getByRole('button', { name: /Skip this step/i })
      fireEvent.click(skipBtn)

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith([])
      })
    })

    it('allows adding a project and submitting', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined)
      render(
        <Step4Experience
          initialExperiences={[]}
          onSaveAndContinue={onSave}
          onBack={vi.fn()}
          isSaving={false}
        />,
      )

      // Open add form
      const addExpBtn = screen.getByRole('button', { name: /\+ Add Experience or Project/i })
      fireEvent.click(addExpBtn)

      fireEvent.change(screen.getByLabelText(/Title \/ Project Name/i), {
        target: { value: 'PathPilot App' },
      })
      fireEvent.change(screen.getByLabelText(/Organization/i), {
        target: { value: 'Self-Directed' },
      })

      const saveEntryBtn = screen.getByRole('button', { name: /Save Entry/i })
      fireEvent.click(saveEntryBtn)

      expect(screen.getByText('PathPilot App')).toBeDefined()

      const continueBtn = screen.getByRole('button', { name: /Continue to Interests/i })
      fireEvent.click(continueBtn)

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ title: 'PathPilot App', organization: 'Self-Directed' }),
          ]),
        )
      })
    })
  })

  describe('Step 5: Interests', () => {
    it('toggles multiple interest domains', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined)
      render(
        <Step5Interests
          initialInterests={[]}
          onSaveAndContinue={onSave}
          onBack={vi.fn()}
          isSaving={false}
        />,
      )

      const softwareCard = screen.getByRole('button', { name: /Software Development/i })
      fireEvent.click(softwareCard)

      const aiCard = screen.getByRole('button', { name: /AI & Machine Learning/i })
      fireEvent.click(aiCard)

      const continueBtn = screen.getByRole('button', { name: /Continue to Goals/i })
      fireEvent.click(continueBtn)

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(['software_development', 'ai_ml'])
      })
    })
  })

  describe('Step 6: Goals', () => {
    it('selects primary goal and secondary backup goals', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined)
      render(
        <Step6Goals
          initialPrimaryGoal="job"
          initialSecondaryGoals={[]}
          onSaveAndContinue={onSave}
          onBack={vi.fn()}
          isSaving={false}
        />,
      )

      // Change primary to startup
      const startupButtons = screen.getAllByRole('button', { name: /Founding or Joining a Startup/i })
      fireEvent.click(startupButtons[0])

      // Add secondary goal
      const higherStudiesSecondary = screen.getByRole('button', {
        name: /\+ Higher Studies/i,
      })
      fireEvent.click(higherStudiesSecondary)

      const continueBtn = screen.getByRole('button', { name: /Continue to Preferences/i })
      fireEvent.click(continueBtn)

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith({
          primaryGoal: 'startup',
          secondaryGoals: ['higher_studies'],
        })
      })
    })
  })

  describe('Step 7: Constraints', () => {
    it('allows skipping optional constraints', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined)
      render(
        <Step7Constraints
          initialData={{}}
          onSaveAndContinue={onSave}
          onBack={vi.fn()}
          isSaving={false}
        />,
      )

      const skipBtn = screen.getByRole('button', { name: /Skip this step/i })
      fireEvent.click(skipBtn)

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            preferredLocation: null,
            workMode: 'flexible',
          }),
        )
      })
    })
  })

  describe('Step 8: Review & Complete', () => {
    it('renders profile summary and triggers jump to step when clicking Edit', () => {
      const onJump = vi.fn()
      const onComplete = vi.fn()

      const mockProfile: Partial<StudentProfile> = {
        degree: 'B.Tech',
        branch: 'CSE',
        college: 'PICT',
        currentYear: '3rd Year',
        primaryGoal: 'job',
        skills: [{ name: 'Python', proficiency: 'Advanced' }],
        experiences: [{ type: 'project', title: 'Task Manager' }],
      }

      render(
        <Step8Review
          profile={mockProfile}
          onComplete={onComplete}
          onJumpToStep={onJump}
          onBack={vi.fn()}
          isSubmitting={false}
          error={null}
        />,
      )

      expect(screen.getByText(/Review Your Profile/i)).toBeDefined()
      expect(screen.getByText(/B.Tech • CSE/i)).toBeDefined()
      expect(screen.getByText('Python')).toBeDefined()
      expect(screen.getByText('Task Manager')).toBeDefined()

      // Click Edit on skills
      const editButtons = screen.getAllByRole('button', { name: /Edit/i })
      fireEvent.click(editButtons[1]) // Skills is 2nd section
      expect(onJump).toHaveBeenCalledWith(3)

      // Submit
      const completeBtn = screen.getByRole('button', { name: /Save & Complete Profile/i })
      fireEvent.click(completeBtn)
      expect(onComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe('OnboardingWizard Master Flow', () => {
    it('loads existing profile on mount and restores saved step', async () => {
      const mockProfile: StudentProfile = {
        id: 'prof_1',
        isOnboardingCompleted: false,
        currentStep: 2,
        degree: 'B.E.',
        branch: 'IT',
        currentYear: '2nd Year',
        college: 'VJTI',
        university: 'Mumbai University',
        interests: [],
        secondaryGoals: [],
        skills: [],
        experiences: [],
      }

      vi.spyOn(api, 'getProfile').mockResolvedValue({ profile: mockProfile })

      renderWithAuth(<OnboardingWizard />)

      await waitFor(() => {
        expect(screen.getByText('Step 2 of 8: Education')).toBeDefined()
        const collegeInput = screen.getByLabelText(/College \/ Institute/i) as HTMLInputElement
        expect(collegeInput.value).toBe('VJTI')
      })
    })
  })

  describe('AppCheckpoint routing & overview', () => {
    it('shows pending onboarding banner when profile is incomplete', async () => {
      vi.spyOn(api, 'getProfile').mockResolvedValue({
        profile: {
          isOnboardingCompleted: false,
          currentStep: 3,
          interests: [],
          secondaryGoals: [],
          skills: [],
          experiences: [],
        },
      })

      renderWithAuth(<AppCheckpoint />)

      await waitFor(() => {
        expect(screen.getByText(/Finish Setting Up Your Profile/i)).toBeDefined()
        expect(screen.getByRole('button', { name: /Resume Step 3/i })).toBeDefined()
      })
    })

    it('shows complete profile overview when onboarding is finished', async () => {
      vi.spyOn(api, 'getProfile').mockResolvedValue({
        profile: {
          isOnboardingCompleted: true,
          currentStep: 8,
          degree: 'B.Tech',
          branch: 'CSE',
          currentYear: '4th Year',
          college: 'IIT Bombay',
          cgpa: 9.2,
          primaryGoal: 'job',
          interests: ['software_development'],
          secondaryGoals: [],
          skills: [{ name: 'Python', proficiency: 'Advanced' }],
          experiences: [{ type: 'internship', title: 'SDE Intern' }],
        },
      })

      renderWithAuth(<AppCheckpoint />)

      await waitFor(() => {
        expect(screen.getByText(/Student Onboarding Completed/i)).toBeDefined()
        expect(screen.getByText(/B.Tech • CSE/i)).toBeDefined()
        expect(screen.getByText(/IIT Bombay/i)).toBeDefined()
        expect(screen.getByText(/Next: Student Dashboard \(Phase 5\)/i)).toBeDefined()
      })
    })
  })
})
