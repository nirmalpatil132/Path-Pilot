import { CAREER_CATALOG_DATA } from '../../data/careerCatalogData.js'
import { isSkillMatch } from '../careerFit/skillNormalizer.js'

export interface CatalogProjectTemplate {
  templateId: string
  title: string
  description: string
  skills: string[]
  careerSlug: string
  careerTitle: string
  careerCategory: string
}

export interface ProjectRecommendation {
  templateId: string
  title: string
  description: string
  skills: string[]
  careerSlug: string
  careerTitle: string
  careerCategory: string
  priority: 'HIGH' | 'RECOMMENDED' | 'ELECTIVE'
  matchScore: number
  reasons: string[]
  matchedCriticalSkills: string[]
  matchedRecommendedSkills: string[]
  matchedOptionalSkills: string[]
  allMatchedSkills: string[]
  isAlreadyStarted: boolean
  existingProjectStatus?: string | null
}

export interface ProjectRecommendationInput {
  targetCareerSlug?: string | null
  studentSkills?: Array<{ name: string; proficiency?: string }>
  skillGaps?: Array<{ name: string; category: string }>
  existingProjects?: Array<{ templateId?: string | null; title: string; status: string }>
}

/**
 * Extracts all project templates from the canonical Phase 5 Career Catalog.
 * Generates stable deterministic templateIds: `${career.slug}-${index + 1}`.
 */
export function getAllProjectTemplates(): CatalogProjectTemplate[] {
  const templates: CatalogProjectTemplate[] = []

  for (const career of CAREER_CATALOG_DATA) {
    career.exampleProjects.forEach((proj, idx) => {
      templates.push({
        templateId: `${career.slug}-${idx + 1}`,
        title: proj.title,
        description: proj.description,
        skills: proj.skills || [],
        careerSlug: career.slug,
        careerTitle: career.title,
        careerCategory: career.category,
      })
    })
  }

  return templates
}

/**
 * Deterministic, explainable recommendation engine.
 * Ranks project templates based on alignment with the student's target career,
 * critical missing skills, recommended next skills, and current progress.
 */
export function recommendProjects(input: ProjectRecommendationInput): ProjectRecommendation[] {
  const allTemplates = getAllProjectTemplates()
  const targetSlug = input.targetCareerSlug?.toLowerCase() || null
  const skillGaps = input.skillGaps || []
  const existingProjects = input.existingProjects || []

  // Extract skills partitioned by gap severity
  const criticalGaps = skillGaps
    .filter((g) => g.category === 'CRITICAL_MISSING')
    .map((g) => g.name)

  const recommendedGaps = skillGaps
    .filter((g) => g.category === 'RECOMMENDED_NEXT')
    .map((g) => g.name)

  const optionalGaps = skillGaps
    .filter((g) => g.category === 'OPTIONAL_ADVANTAGE')
    .map((g) => g.name)

  // Map existing projects for status detection
  const existingTemplateMap = new Map<string, string>()
  const existingTitleMap = new Map<string, string>()
  for (const p of existingProjects) {
    if (p.templateId) {
      existingTemplateMap.set(p.templateId.toLowerCase(), p.status)
    }
    existingTitleMap.set(p.title.trim().toLowerCase(), p.status)
  }

  const recommendations: ProjectRecommendation[] = allTemplates.map((template) => {
    const isTargetCareer = targetSlug ? template.careerSlug.toLowerCase() === targetSlug : false
    const existingStatus =
      existingTemplateMap.get(template.templateId.toLowerCase()) ||
      existingTitleMap.get(template.title.trim().toLowerCase()) ||
      null
    const isAlreadyStarted = existingStatus !== null

    const matchedCritical: string[] = []
    const matchedRecommended: string[] = []
    const matchedOptional: string[] = []
    const allMatched: string[] = []

    // Match template skills against student skill gaps
    for (const skill of template.skills) {
      let matchedInAny = false

      for (const crit of criticalGaps) {
        if (isSkillMatch(skill, crit)) {
          if (!matchedCritical.includes(skill)) matchedCritical.push(skill)
          matchedInAny = true
          break
        }
      }

      if (!matchedInAny) {
        for (const rec of recommendedGaps) {
          if (isSkillMatch(skill, rec)) {
            if (!matchedRecommended.includes(skill)) matchedRecommended.push(skill)
            matchedInAny = true
            break
          }
        }
      }

      if (!matchedInAny) {
        for (const opt of optionalGaps) {
          if (isSkillMatch(skill, opt)) {
            if (!matchedOptional.includes(skill)) matchedOptional.push(skill)
            matchedInAny = true
            break
          }
        }
      }

      if (matchedInAny && !allMatched.includes(skill)) {
        allMatched.push(skill)
      }
    }

    // Scoring formula
    // Critical missing match: 30 pts each
    // Recommended next match: 15 pts each
    // Optional advantage match: 5 pts each
    // Target career alignment: 40 pts
    let score = 0
    score += matchedCritical.length * 30
    score += matchedRecommended.length * 15
    score += matchedOptional.length * 5
    if (isTargetCareer) {
      score += 40
    }

    // Construct human-readable reasons
    const reasons: string[] = []

    if (isTargetCareer) {
      reasons.push(`Core portfolio project for ${template.careerTitle}`)
    }

    if (matchedCritical.length > 0) {
      reasons.push(
        `Exercises ${matchedCritical.length} Critical Missing skill${
          matchedCritical.length > 1 ? 's' : ''
        }: ${matchedCritical.join(', ')}`,
      )
    }

    if (matchedRecommended.length > 0) {
      reasons.push(
        `Reinforces ${matchedRecommended.length} Recommended Next skill${
          matchedRecommended.length > 1 ? 's' : ''
        }: ${matchedRecommended.join(', ')}`,
      )
    }

    if (matchedOptional.length > 0 && matchedCritical.length === 0 && matchedRecommended.length === 0) {
      reasons.push(`Offers Optional Advantage in: ${matchedOptional.join(', ')}`)
    }

    if (reasons.length === 0) {
      reasons.push(`Builds foundational hands-on competencies in ${template.skills.slice(0, 2).join(', ')}`)
    }

    // Determine priority tier
    let priority: 'HIGH' | 'RECOMMENDED' | 'ELECTIVE' = 'ELECTIVE'
    if (matchedCritical.length > 0 || (isTargetCareer && (matchedRecommended.length > 0 || template.skills.length > 0))) {
      priority = matchedCritical.length > 0 ? 'HIGH' : 'RECOMMENDED'
    } else if (matchedRecommended.length > 0 || isTargetCareer) {
      priority = 'RECOMMENDED'
    }

    return {
      templateId: template.templateId,
      title: template.title,
      description: template.description,
      skills: template.skills,
      careerSlug: template.careerSlug,
      careerTitle: template.careerTitle,
      careerCategory: template.careerCategory,
      priority,
      matchScore: score,
      reasons,
      matchedCriticalSkills: matchedCritical,
      matchedRecommendedSkills: matchedRecommended,
      matchedOptionalSkills: matchedOptional,
      allMatchedSkills: allMatched,
      isAlreadyStarted,
      existingProjectStatus: existingStatus,
    }
  })

  // Deterministic sorting:
  // 1. Unstarted before already started
  // 2. Score descending
  // 3. Priority tier (HIGH > RECOMMENDED > ELECTIVE)
  // 4. Target career match first
  // 5. Alphabetical by title for ties
  const priorityOrder = { HIGH: 3, RECOMMENDED: 2, ELECTIVE: 1 }

  return recommendations.sort((a, b) => {
    if (a.isAlreadyStarted !== b.isAlreadyStarted) {
      return a.isAlreadyStarted ? 1 : -1
    }
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore
    }
    if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    return a.title.localeCompare(b.title)
  })
}
