import {
  DEFAULT_SCORING_POLICY,
  calculateEffectiveWeights,
  evaluateEvidenceSufficiency,
  type DimensionAvailability,
  type ScoringPolicy,
  type ScoringWeights,
} from './scoringPolicy.js'
import { isSkillMatch } from './skillNormalizer.js'
import { analyzeSkillGaps, type SkillGapAnalysisResult } from './skillGapService.js'

export interface CareerFitInputCareer {
  id: string
  slug: string
  title: string
  category: string
  skills: Array<{ id: string; name: string; type: string; description?: string | null }>
  responsibilities?: string[]
  commonJobTitles?: string[]
  exampleProjects?: Array<{ title: string; description: string; skills?: string[] }>
  prerequisites?: string[]
}

export interface CareerFitInputProfile {
  degree?: string | null
  branch?: string | null
  currentYear?: string | null
  university?: string | null
  college?: string | null
  cgpa?: number | null
  interests?: string[]
  primaryGoal?: string | null
  secondaryGoals?: string[]
  skills?: Array<{ name: string; proficiency?: string }>
  experiences?: Array<{ type: string; title: string; description?: string | null }>
}

export interface DimensionScoreDetail {
  score: number
  rawScore: number
  configuredWeight: number
  effectiveWeight: number
  isAvailable: boolean
  explanation: string
  evidence: string[]
}

export interface CareerFitResult {
  careerId: string
  slug: string
  title: string
  category: string
  fitScore: number
  scoreDisplay: number | null
  fitLevel: 'Strong Match' | 'Moderate Match' | 'Developing Fit' | 'Insufficient Data'
  status: 'SUFFICIENT_EVIDENCE' | 'INSUFFICIENT_DATA'
  statusReason?: string
  policyVersion: string
  configuredWeights: ScoringWeights
  effectiveWeights: Record<string, number>
  availableDimensions: string[]
  excludedDimensions: Array<{ dimension: string; reason: string }>
  dimensionScores: {
    skills: DimensionScoreDetail
    projects: DimensionScoreDetail
    interests: DimensionScoreDetail
    academics: DimensionScoreDetail
  }
  strengths: string[]
  growthAreas: string[]
  dataLimitations: string[]
  matchedSkills: string[]
  missingCoreCount: number
  coreCoveragePercentage: number
  skillGapAnalysis: SkillGapAnalysisResult
}

const PROFICIENCY_MULTIPLIERS: Record<string, number> = {
  advanced: 1.0,
  intermediate: 0.85,
  beginner: 0.65,
}

const CATEGORY_INTEREST_MAPPINGS: Record<string, string[]> = {
  engineering: ['software_development', 'systems_core', 'mobile_dev'],
  data: ['ai_ml', 'data_engineering_analytics'],
  security: ['cybersecurity'],
  infrastructure: ['cloud_devops', 'systems_core'],
  design: ['ui_ux_product_design', 'product_management'],
}

const CROSS_DISCIPLINARY_INTERESTS: Record<string, string[]> = {
  engineering: ['cloud_devops', 'ai_ml'],
  data: ['software_development'],
  security: ['infrastructure', 'cloud_devops', 'systems_core'],
  infrastructure: ['software_development', 'cybersecurity'],
  design: ['software_development', 'entrepreneurship_startups'],
}

/**
 * Pure evaluation function that scores a single career against a student profile.
 * Free of side effects, HTTP calls, and database dependencies.
 */
export function calculateCareerFit(
  career: CareerFitInputCareer,
  profile: CareerFitInputProfile,
  policy: ScoringPolicy = DEFAULT_SCORING_POLICY,
): CareerFitResult {
  const studentSkills = profile.skills || []
  const studentExperiences = profile.experiences || []
  const studentInterests = profile.interests || []
  const hasAcademics = Boolean(profile.degree && profile.branch)

  // 1. Determine dimension availabilities
  const availabilities: DimensionAvailability[] = [
    {
      dimension: 'skills',
      isAvailable: studentSkills.length > 0,
      exclusionReason:
        studentSkills.length === 0 ? 'No skills recorded in your student profile.' : undefined,
    },
    {
      dimension: 'projects',
      isAvailable: studentExperiences.length > 0,
      exclusionReason:
        studentExperiences.length === 0
          ? 'No projects or experience entries recorded in your profile.'
          : undefined,
    },
    {
      dimension: 'interests',
      isAvailable: studentInterests.length > 0,
      exclusionReason:
        studentInterests.length === 0 ? 'No career interest areas selected in profile.' : undefined,
    },
    {
      dimension: 'academics',
      isAvailable: hasAcademics,
      exclusionReason: !hasAcademics
        ? 'Academic degree and branch not specified in profile.'
        : undefined,
    },
  ]

  // 2. Compute effective weights and check minimum evidence rule
  const { effectiveWeights, availableDimensions, excludedDimensions } = calculateEffectiveWeights(
    policy.weights,
    availabilities,
  )

  const sufficiency = evaluateEvidenceSufficiency(availabilities)
  const strengths: string[] = []
  const growthAreas: string[] = []
  const dataLimitations: string[] = excludedDimensions.map(
    (ed) => `${ed.dimension.toUpperCase()}: ${ed.reason}`,
  )

  // 3. Perform Skill-Gap Analysis
  const gapAnalysis = analyzeSkillGaps(career, studentSkills)

  // -------------------------------------------------------------
  // Dimension 1: Skills (0-100)
  // -------------------------------------------------------------
  let skillsScore = 0
  const skillsEvidence: string[] = []

  if (availabilities.find((a) => a.dimension === 'skills')?.isAvailable) {
    const coreSkills = career.skills.filter((s) => s.type === 'core')
    const supportingSkills = career.skills.filter((s) => s.type === 'supporting')

    let corePoints = 0
    for (const cSkill of coreSkills) {
      const match = studentSkills.find((s) => isSkillMatch(s.name, cSkill.name))
      if (match) {
        const mult =
          PROFICIENCY_MULTIPLIERS[(match.proficiency || '').toLowerCase()] ||
          PROFICIENCY_MULTIPLIERS.intermediate
        corePoints += mult
        skillsEvidence.push(`${cSkill.name} (${match.proficiency || 'Demonstrated'})`)
      }
    }

    let supportingPoints = 0
    for (const sSkill of supportingSkills) {
      const match = studentSkills.find((s) => isSkillMatch(s.name, sSkill.name))
      if (match) {
        const mult =
          PROFICIENCY_MULTIPLIERS[(match.proficiency || '').toLowerCase()] ||
          PROFICIENCY_MULTIPLIERS.intermediate
        supportingPoints += mult
        skillsEvidence.push(`${sSkill.name} (${match.proficiency || 'Demonstrated'})`)
      }
    }

    const coreScore = coreSkills.length > 0 ? (corePoints / coreSkills.length) * 100 : 100
    const supportingScore =
      supportingSkills.length > 0 ? (supportingPoints / supportingSkills.length) * 100 : 100

    skillsScore = Math.min(100, Math.max(0, coreScore * 0.7 + supportingScore * 0.3))

    if (gapAnalysis.matchedCoreSkills.length >= 3) {
      strengths.push(
        `Strong core skill foundation: matched ${gapAnalysis.matchedCoreSkills.length} of ${coreSkills.length} required skills.`,
      )
    } else if (gapAnalysis.matchedCoreSkills.length > 0) {
      strengths.push(`Demonstrated ${gapAnalysis.matchedCoreSkills.length} core technical competencies.`)
    }

    if (gapAnalysis.missingCoreSkills.length > 0) {
      growthAreas.push(
        `${gapAnalysis.missingCoreSkills.length} core competencies not yet listed on your profile (e.g. ${gapAnalysis.missingCoreSkills.slice(0, 2).join(', ')}).`,
      )
    }
  }

  // -------------------------------------------------------------
  // Dimension 2: Projects & Experience Evidence (0-100)
  // -------------------------------------------------------------
  let projectsScore = 0
  const projectsEvidence: string[] = []

  if (availabilities.find((a) => a.dimension === 'projects')?.isAvailable) {
    const careerKeywords = new Set<string>()
    careerKeywords.add(career.title.toLowerCase())
    careerKeywords.add(career.category.toLowerCase())

    for (const word of career.title.toLowerCase().split(/\s+/)) {
      if (word.length >= 3) careerKeywords.add(word)
    }

    for (const s of career.skills) {
      careerKeywords.add(s.name.toLowerCase())
      const subTokens = s.name.toLowerCase().split(/[\s/&(),-]+/)
      for (const t of subTokens) {
        if (t.length >= 3 && !['and', 'for', 'the', 'with'].includes(t)) {
          careerKeywords.add(t)
        }
      }
    }

    const keywordList = Array.from(careerKeywords)
    let points = 0

    for (const exp of studentExperiences) {
      const content = `${exp.title || ''} ${exp.description || ''}`.toLowerCase()
      const isRelevant = keywordList.some((kw) => content.includes(kw))
      const typeLower = (exp.type || '').toLowerCase()

      if (isRelevant) {
        if (['internship', 'freelance', 'open_source', 'work'].includes(typeLower)) {
          points += 55
        } else {
          points += 45
        }
        projectsEvidence.push(`${exp.title} (${exp.type})`)
      } else {
        // General project execution credit
        points += 20
      }
    }

    projectsScore = Math.min(100, points)

    if (projectsEvidence.length > 0) {
      strengths.push(`Direct project/internship evidence: ${projectsEvidence[0]}.`)
    } else if (studentExperiences.length > 0) {
      growthAreas.push(
        `Hands-on projects align with general engineering, but no direct ${career.title} project evidence was identified.`,
      )
    }
  }

  // -------------------------------------------------------------
  // Dimension 3: Interests Alignment (0-100)
  // -------------------------------------------------------------
  let interestsScore = 0
  const interestsEvidence: string[] = []

  if (availabilities.find((a) => a.dimension === 'interests')?.isAvailable) {
    const targetCategory = career.category.toLowerCase()
    const directInterests = CATEGORY_INTEREST_MAPPINGS[targetCategory] || []
    const crossInterests = CROSS_DISCIPLINARY_INTERESTS[targetCategory] || []

    const matchedDirect = studentInterests.filter((id) => directInterests.includes(id))
    const matchedCross = studentInterests.filter((id) => crossInterests.includes(id))

    if (matchedDirect.length > 0) {
      interestsScore = 100
      interestsEvidence.push(`Direct interest in ${matchedDirect.join(', ')}`)
      strengths.push(`Strong career interest alignment with ${career.category} domain.`)
    } else if (matchedCross.length > 0) {
      interestsScore = 65
      interestsEvidence.push(`Complementary interest in ${matchedCross.join(', ')}`)
    } else {
      interestsScore = 25
      interestsEvidence.push('No direct category overlap with selected interests')
    }
  }

  // -------------------------------------------------------------
  // Dimension 4: Academic Context (0-100)
  // -------------------------------------------------------------
  let academicsScore = 0
  const academicsEvidence: string[] = []

  if (availabilities.find((a) => a.dimension === 'academics')?.isAvailable) {
    const branchLower = (profile.branch || '').toLowerCase()
    const branchWords = branchLower.split(/[\s,/-]+/)

    const isDirectCS =
      branchLower.includes('computer') ||
      branchLower.includes('information technology') ||
      branchWords.includes('cse') ||
      branchWords.includes('it') ||
      branchLower.includes('data science') ||
      branchLower.includes('artificial intelligence') ||
      branchWords.includes('ai')

    const isAlliedTech =
      branchLower.includes('electronics') ||
      branchLower.includes('electrical') ||
      branchWords.includes('ece') ||
      branchWords.includes('ee') ||
      branchLower.includes('instrumentation')

    if (isDirectCS) {
      academicsScore = 100
      academicsEvidence.push(`${profile.degree} - ${profile.branch} (Direct Technical Focus)`)
    } else if (isAlliedTech) {
      academicsScore = 85
      academicsEvidence.push(`${profile.degree} - ${profile.branch} (Allied Engineering Focus)`)
    } else {
      academicsScore = 70
      academicsEvidence.push(`${profile.degree} - ${profile.branch} (Engineering Foundation)`)
    }

    if (profile.currentYear) {
      academicsEvidence.push(profile.currentYear)
    }
  }

  // -------------------------------------------------------------
  // Final Weighted Combination
  // -------------------------------------------------------------
  const dimDetails = {
    skills: {
      score: Math.round(skillsScore),
      rawScore: skillsScore,
      configuredWeight: policy.weights.skills,
      effectiveWeight: effectiveWeights.skills,
      isAvailable: Boolean(availabilities.find((a) => a.dimension === 'skills')?.isAvailable),
      explanation:
        availabilities.find((a) => a.dimension === 'skills')?.isAvailable
          ? `Evaluated ${gapAnalysis.matchedCoreSkills.length} core and ${gapAnalysis.matchedSupportingSkills.length} supporting skills against career requirements.`
          : 'Excluded: No skills recorded in profile.',
      evidence: skillsEvidence,
    },
    projects: {
      score: Math.round(projectsScore),
      rawScore: projectsScore,
      configuredWeight: policy.weights.projects,
      effectiveWeight: effectiveWeights.projects,
      isAvailable: Boolean(availabilities.find((a) => a.dimension === 'projects')?.isAvailable),
      explanation:
        availabilities.find((a) => a.dimension === 'projects')?.isAvailable
          ? `Evaluated practical evidence across ${studentExperiences.length} profile project/experience entries.`
          : 'Excluded: No projects or experiences recorded in profile.',
      evidence: projectsEvidence,
    },
    interests: {
      score: Math.round(interestsScore),
      rawScore: interestsScore,
      configuredWeight: policy.weights.interests,
      effectiveWeight: effectiveWeights.interests,
      isAvailable: Boolean(availabilities.find((a) => a.dimension === 'interests')?.isAvailable),
      explanation:
        availabilities.find((a) => a.dimension === 'interests')?.isAvailable
          ? `Compared ${studentInterests.length} selected interests with the ${career.category} taxonomy.`
          : 'Excluded: No career interests selected in profile.',
      evidence: interestsEvidence,
    },
    academics: {
      score: Math.round(academicsScore),
      rawScore: academicsScore,
      configuredWeight: policy.weights.academics,
      effectiveWeight: effectiveWeights.academics,
      isAvailable: Boolean(availabilities.find((a) => a.dimension === 'academics')?.isAvailable),
      explanation:
        availabilities.find((a) => a.dimension === 'academics')?.isAvailable
          ? `Evaluated foundational alignment based on ${profile.degree || ''} ${profile.branch || ''}.`
          : 'Excluded: Academic background not specified.',
      evidence: academicsEvidence,
    },
  }

  let finalScore = 0
  let scoreDisplay: number | null = null
  let fitLevel: 'Strong Match' | 'Moderate Match' | 'Developing Fit' | 'Insufficient Data' =
    'Insufficient Data'

  if (sufficiency.status === 'SUFFICIENT_EVIDENCE') {
    finalScore =
      skillsScore * effectiveWeights.skills +
      projectsScore * effectiveWeights.projects +
      interestsScore * effectiveWeights.interests +
      academicsScore * effectiveWeights.academics

    finalScore = Math.min(100, Math.max(0, finalScore))
    scoreDisplay = Math.round(finalScore)

    if (scoreDisplay >= 75) {
      fitLevel = 'Strong Match'
    } else if (scoreDisplay >= 50) {
      fitLevel = 'Moderate Match'
    } else {
      fitLevel = 'Developing Fit'
    }
  }

  return {
    careerId: career.id,
    slug: career.slug,
    title: career.title,
    category: career.category,
    fitScore: finalScore,
    scoreDisplay,
    fitLevel,
    status: sufficiency.status,
    statusReason: sufficiency.reason,
    policyVersion: policy.version,
    configuredWeights: policy.weights,
    effectiveWeights,
    availableDimensions,
    excludedDimensions,
    dimensionScores: dimDetails,
    strengths,
    growthAreas,
    dataLimitations,
    matchedSkills: gapAnalysis.allMatchedSkills,
    missingCoreCount: gapAnalysis.missingCoreSkills.length,
    coreCoveragePercentage: gapAnalysis.coreCoveragePercentage,
    skillGapAnalysis: gapAnalysis,
  }
}

/**
 * Ranks an array of evaluated career-fit results deterministically.
 * Tie-breaker:
 * 1. fitScore (descending)
 * 2. coreCoveragePercentage (descending)
 * 3. career title (alphabetical ascending)
 */
export function rankCareerFits(results: CareerFitResult[]): CareerFitResult[] {
  return [...results].sort((a, b) => {
    // Insufficient data ranked last
    if (a.status !== b.status) {
      return a.status === 'SUFFICIENT_EVIDENCE' ? -1 : 1
    }

    // 1. Primary: Fit score descending
    if (Math.abs(b.fitScore - a.fitScore) > 0.001) {
      return b.fitScore - a.fitScore
    }

    // 2. Secondary: Core coverage percentage descending
    if (b.coreCoveragePercentage !== a.coreCoveragePercentage) {
      return b.coreCoveragePercentage - a.coreCoveragePercentage
    }

    // 3. Tertiary: Alphabetical by title
    return a.title.localeCompare(b.title)
  })
}
