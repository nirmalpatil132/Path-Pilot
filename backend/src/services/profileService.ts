import { prisma } from '../lib/prisma.js'
import type {
  UpdateProfileInput,
  SkillItemInput,
  ExperienceItemInput,
} from '../validators/profileValidators.js'

export class ProfileError extends Error {
  statusCode: number
  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'ProfileError'
    this.statusCode = statusCode
  }
}

export interface FormattedProfile {
  id: string
  userId: string
  isOnboardingCompleted: boolean
  currentStep: number
  completedAt: Date | null
  degree: string | null
  branch: string | null
  currentYear: string | null
  university: string | null
  college: string | null
  cgpa: number | null
  academicContext: string | null
  interests: string[]
  primaryGoal: string | null
  secondaryGoals: string[]
  preferredLocation: string | null
  workMode: string | null
  weeklyHours: string | null
  targetTimeline: string | null
  financialContext: string | null
  skills: Array<{ id: string; name: string; proficiency: string }>
  experiences: Array<{
    id: string
    type: string
    title: string
    organization: string | null
    description: string | null
    startDate: string | null
    endDate: string | null
    link: string | null
  }>
  createdAt: Date
  updatedAt: Date
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatProfileRecord(record: any): FormattedProfile {
  let parsedInterests: string[] = []
  if (record.interests) {
    try {
      parsedInterests = JSON.parse(record.interests)
    } catch {
      parsedInterests = []
    }
  }

  let parsedSecondaryGoals: string[] = []
  if (record.secondaryGoals) {
    try {
      parsedSecondaryGoals = JSON.parse(record.secondaryGoals)
    } catch {
      parsedSecondaryGoals = []
    }
  }

  return {
    id: record.id,
    userId: record.userId,
    isOnboardingCompleted: record.isOnboardingCompleted,
    currentStep: record.currentStep,
    completedAt: record.completedAt,
    degree: record.degree,
    branch: record.branch,
    currentYear: record.currentYear,
    university: record.university,
    college: record.college,
    cgpa: record.cgpa,
    academicContext: record.academicContext,
    interests: parsedInterests,
    primaryGoal: record.primaryGoal,
    secondaryGoals: parsedSecondaryGoals,
    preferredLocation: record.preferredLocation,
    workMode: record.workMode,
    weeklyHours: record.weeklyHours,
    targetTimeline: record.targetTimeline,
    financialContext: record.financialContext,
    skills: (record.skills || []).map((s: { id: string; name: string; proficiency: string }) => ({
      id: s.id,
      name: s.name,
      proficiency: s.proficiency,
    })),
    experiences: (record.experiences || []).map(
      (e: {
        id: string
        type: string
        title: string
        organization: string | null
        description: string | null
        startDate: string | null
        endDate: string | null
        link: string | null
      }) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        organization: e.organization,
        description: e.description,
        startDate: e.startDate,
        endDate: e.endDate,
        link: e.link,
      }),
    ),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export async function getProfileByUserId(userId: string): Promise<FormattedProfile | null> {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      skills: {
        orderBy: { createdAt: 'asc' },
      },
      experiences: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!profile) return null
  return formatProfileRecord(profile)
}

export async function updateProfileByUserId(
  userId: string,
  input: UpdateProfileInput,
): Promise<FormattedProfile> {
  // Serialize array fields if provided
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataToUpdate: any = {}

  if (input.currentStep !== undefined) dataToUpdate.currentStep = input.currentStep
  if (input.degree !== undefined) dataToUpdate.degree = input.degree
  if (input.branch !== undefined) dataToUpdate.branch = input.branch
  if (input.currentYear !== undefined) dataToUpdate.currentYear = input.currentYear
  if (input.university !== undefined) dataToUpdate.university = input.university
  if (input.college !== undefined) dataToUpdate.college = input.college
  if (input.cgpa !== undefined) dataToUpdate.cgpa = input.cgpa
  if (input.academicContext !== undefined) dataToUpdate.academicContext = input.academicContext

  if (input.interests !== undefined) {
    dataToUpdate.interests = input.interests ? JSON.stringify(input.interests) : null
  }
  if (input.primaryGoal !== undefined) dataToUpdate.primaryGoal = input.primaryGoal
  if (input.secondaryGoals !== undefined) {
    dataToUpdate.secondaryGoals = input.secondaryGoals
      ? JSON.stringify(input.secondaryGoals)
      : null
  }

  if (input.preferredLocation !== undefined)
    dataToUpdate.preferredLocation = input.preferredLocation
  if (input.workMode !== undefined) dataToUpdate.workMode = input.workMode
  if (input.weeklyHours !== undefined) dataToUpdate.weeklyHours = input.weeklyHours
  if (input.targetTimeline !== undefined) dataToUpdate.targetTimeline = input.targetTimeline
  if (input.financialContext !== undefined)
    dataToUpdate.financialContext = input.financialContext

  const profile = await prisma.studentProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...dataToUpdate,
    },
    update: dataToUpdate,
    include: {
      skills: { orderBy: { createdAt: 'asc' } },
      experiences: { orderBy: { createdAt: 'asc' } },
    },
  })

  return formatProfileRecord(profile)
}

export async function updateProfileSkills(
  userId: string,
  skillsInput: SkillItemInput[],
): Promise<Array<{ id: string; name: string; proficiency: string }>> {
  // Ensure profile exists
  let profile = await prisma.studentProfile.findUnique({
    where: { userId },
  })

  if (!profile) {
    profile = await prisma.studentProfile.create({
      data: { userId },
    })
  }

  // Deduplicate and normalize skills
  const seen = new Set<string>()
  const cleanSkills: Array<{ name: string; proficiency: string }> = []

  for (const s of skillsInput) {
    const trimmed = s.name.trim()
    const lower = trimmed.toLowerCase()
    if (!lower || seen.has(lower)) continue
    seen.add(lower)
    cleanSkills.push({
      name: trimmed,
      proficiency: s.proficiency || 'Intermediate',
    })
  }

  // Transactionally replace skills for this profile
  await prisma.$transaction(async (tx) => {
    await tx.profileSkill.deleteMany({
      where: { profileId: profile.id },
    })

    if (cleanSkills.length > 0) {
      await tx.profileSkill.createMany({
        data: cleanSkills.map((s) => ({
          profileId: profile.id,
          name: s.name,
          proficiency: s.proficiency,
        })),
      })
    }
  })

  const updatedSkills = await prisma.profileSkill.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: 'asc' },
  })

  return updatedSkills.map((s) => ({
    id: s.id,
    name: s.name,
    proficiency: s.proficiency,
  }))
}

export async function updateProfileExperiences(
  userId: string,
  experiencesInput: ExperienceItemInput[],
): Promise<FormattedProfile['experiences']> {
  // Ensure profile exists
  let profile = await prisma.studentProfile.findUnique({
    where: { userId },
  })

  if (!profile) {
    profile = await prisma.studentProfile.create({
      data: { userId },
    })
  }

  // Transactionally replace experiences for this profile
  await prisma.$transaction(async (tx) => {
    await tx.profileExperience.deleteMany({
      where: { profileId: profile.id },
    })

    if (experiencesInput.length > 0) {
      await tx.profileExperience.createMany({
        data: experiencesInput.map((exp) => ({
          profileId: profile.id,
          type: exp.type,
          title: exp.title.trim(),
          organization: exp.organization?.trim() || null,
          description: exp.description?.trim() || null,
          startDate: exp.startDate?.trim() || null,
          endDate: exp.endDate?.trim() || null,
          link: exp.link?.trim() || null,
        })),
      })
    }
  })

  const updatedExperiences = await prisma.profileExperience.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: 'asc' },
  })

  return updatedExperiences.map((e) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    organization: e.organization,
    description: e.description,
    startDate: e.startDate,
    endDate: e.endDate,
    link: e.link,
  }))
}

export async function completeStudentOnboarding(userId: string): Promise<FormattedProfile> {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      skills: true,
      experiences: true,
    },
  })

  if (!profile) {
    throw new ProfileError('Profile not found. Please complete education information first.', 400)
  }

  // Validate core education requirements
  const missingFields: string[] = []
  if (!profile.degree || !profile.degree.trim()) missingFields.push('degree')
  if (!profile.branch || !profile.branch.trim()) missingFields.push('branch')
  if (!profile.currentYear || !profile.currentYear.trim()) missingFields.push('currentYear')
  if (
    (!profile.college || !profile.college.trim()) &&
    (!profile.university || !profile.university.trim())
  ) {
    missingFields.push('college or university')
  }

  if (missingFields.length > 0) {
    throw new ProfileError(
      `Please complete required education fields before finishing onboarding: ${missingFields.join(', ')}`,
      400,
    )
  }

  const updated = await prisma.studentProfile.update({
    where: { id: profile.id },
    data: {
      isOnboardingCompleted: true,
      currentStep: 8,
      completedAt: new Date(),
    },
    include: {
      skills: { orderBy: { createdAt: 'asc' } },
      experiences: { orderBy: { createdAt: 'asc' } },
    },
  })

  return formatProfileRecord(updated)
}
