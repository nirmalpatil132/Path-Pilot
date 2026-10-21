import { prisma } from '../lib/prisma.js'
import {
  calculateCareerFit,
  rankCareerFits,
  type CareerFitResult,
} from './careerFit/careerFitEngine.js'
import { SCORING_POLICY_VERSION, DEFAULT_SCORING_POLICY } from './careerFit/scoringPolicy.js'

function safeJsonParse<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback
  try {
    return JSON.parse(val) as T
  } catch {
    return fallback
  }
}

/**
 * Service orchestrating career-fit evaluation for the authenticated student.
 */
export async function getStudentCareerFitOverview(userId: string) {
  // 1. Fetch student profile with skills and experiences
  const profileRecord = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      skills: true,
      experiences: true,
    },
  })

  // 2. Fetch all careers from catalog
  const careerRecords = await prisma.career.findMany({
    include: {
      skills: true,
    },
    orderBy: {
      title: 'asc',
    },
  })

  if (!profileRecord) {
    const emptyProfileSnapshot = {
      degree: null,
      branch: null,
      currentYear: null,
      university: null,
      college: null,
      cgpa: null,
      interests: [],
      primaryGoal: null,
      secondaryGoals: [],
      skills: [],
      experiences: [],
    }

    const unrankedResults = careerRecords.map((c) => {
      const formattedCareer = {
        id: c.id,
        slug: c.slug,
        title: c.title,
        category: c.category,
        skills: c.skills.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          description: s.description,
        })),
        responsibilities: safeJsonParse<string[]>(c.responsibilities, []),
        commonJobTitles: safeJsonParse<string[]>(c.commonJobTitles, []),
        exampleProjects: safeJsonParse<Array<{ title: string; description: string; skills?: string[] }>>(
          c.exampleProjects,
          [],
        ),
        prerequisites: safeJsonParse<string[]>(c.prerequisites, []),
      }
      return calculateCareerFit(formattedCareer, emptyProfileSnapshot, DEFAULT_SCORING_POLICY)
    })

    return {
      status: 'INSUFFICIENT_DATA' as const,
      policyVersion: SCORING_POLICY_VERSION,
      message: 'No student profile found. Please complete profile setup or onboarding first.',
      profileSummary: {
        hasProfile: false,
        isOnboardingCompleted: false,
        skillsCount: 0,
        experiencesCount: 0,
        interestsCount: 0,
      },
      results: unrankedResults,
      fits: unrankedResults,
    }
  }

  const interests = safeJsonParse<string[]>(profileRecord.interests, [])
  const secondaryGoals = safeJsonParse<string[]>(profileRecord.secondaryGoals, [])

  const profileSnapshot = {
    degree: profileRecord.degree,
    branch: profileRecord.branch,
    currentYear: profileRecord.currentYear,
    university: profileRecord.university,
    college: profileRecord.college,
    cgpa: profileRecord.cgpa,
    interests,
    primaryGoal: profileRecord.primaryGoal,
    secondaryGoals,
    skills: profileRecord.skills.map((s) => ({
      name: s.name,
      proficiency: s.proficiency,
    })),
    experiences: profileRecord.experiences.map((e) => ({
      type: e.type,
      title: e.title,
      description: e.description,
    })),
  }

  const rawResults: CareerFitResult[] = []

  for (const c of careerRecords) {
    const formattedCareer = {
      id: c.id,
      slug: c.slug,
      title: c.title,
      category: c.category,
      skills: c.skills.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        description: s.description,
      })),
      responsibilities: safeJsonParse<string[]>(c.responsibilities, []),
      commonJobTitles: safeJsonParse<string[]>(c.commonJobTitles, []),
      exampleProjects: safeJsonParse<Array<{ title: string; description: string; skills?: string[] }>>(
        c.exampleProjects,
        [],
      ),
      prerequisites: safeJsonParse<string[]>(c.prerequisites, []),
    }

    const fit = calculateCareerFit(formattedCareer, profileSnapshot, DEFAULT_SCORING_POLICY)
    rawResults.push(fit)
  }

  const rankedResults = rankCareerFits(rawResults)
  const overallStatus =
    rankedResults.length > 0 && rankedResults[0].status === 'SUFFICIENT_EVIDENCE'
      ? ('SUFFICIENT_EVIDENCE' as const)
      : ('INSUFFICIENT_DATA' as const)

  return {
    status: overallStatus,
    policyVersion: SCORING_POLICY_VERSION,
    profileSummary: {
      hasProfile: true,
      isOnboardingCompleted: profileRecord.isOnboardingCompleted,
      skillsCount: profileRecord.skills.length,
      experiencesCount: profileRecord.experiences.length,
      interestsCount: interests.length,
    },
    results: rankedResults,
    fits: rankedResults,
  }
}

/**
 * Service retrieving deep-dive fit analysis and skill gaps for a single career.
 */
export async function getStudentCareerFitDetail(userId: string, careerSlug: string) {
  // 1. Fetch student profile
  const profileRecord = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      skills: true,
      experiences: true,
    },
  })

  // 2. Fetch career by slug
  const careerRecord = await prisma.career.findUnique({
    where: { slug: careerSlug },
    include: {
      skills: true,
    },
  })

  if (!careerRecord) {
    return { careerNotFound: true as const }
  }

  const formattedCareer = {
    id: careerRecord.id,
    slug: careerRecord.slug,
    title: careerRecord.title,
    category: careerRecord.category,
    skills: careerRecord.skills.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      description: s.description,
    })),
    responsibilities: safeJsonParse<string[]>(careerRecord.responsibilities, []),
    commonJobTitles: safeJsonParse<string[]>(careerRecord.commonJobTitles, []),
    exampleProjects: safeJsonParse<Array<{ title: string; description: string; skills?: string[] }>>(
      careerRecord.exampleProjects,
      [],
    ),
    prerequisites: safeJsonParse<string[]>(careerRecord.prerequisites, []),
  }

  if (!profileRecord) {
    return {
      careerNotFound: false as const,
      hasProfile: false,
      fit: null,
      message: 'Student profile not yet created.',
    }
  }

  const interests = safeJsonParse<string[]>(profileRecord.interests, [])
  const profileSnapshot = {
    degree: profileRecord.degree,
    branch: profileRecord.branch,
    currentYear: profileRecord.currentYear,
    university: profileRecord.university,
    college: profileRecord.college,
    cgpa: profileRecord.cgpa,
    interests,
    primaryGoal: profileRecord.primaryGoal,
    secondaryGoals: safeJsonParse<string[]>(profileRecord.secondaryGoals, []),
    skills: profileRecord.skills.map((s) => ({
      name: s.name,
      proficiency: s.proficiency,
    })),
    experiences: profileRecord.experiences.map((e) => ({
      type: e.type,
      title: e.title,
      description: e.description,
    })),
  }

  const fitResult = calculateCareerFit(formattedCareer, profileSnapshot, DEFAULT_SCORING_POLICY)

  return {
    careerNotFound: false as const,
    hasProfile: true,
    career: formattedCareer,
    fit: fitResult,
    skillGaps: fitResult.skillGapAnalysis,
    profileSummary: {
      hasProfile: true,
      isOnboardingCompleted: profileRecord.isOnboardingCompleted,
      skillsCount: profileRecord.skills.length,
      experiencesCount: profileRecord.experiences.length,
      interestsCount: interests.length,
    },
  }
}
