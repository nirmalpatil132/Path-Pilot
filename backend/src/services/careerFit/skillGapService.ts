import { isSkillMatch } from './skillNormalizer.js'

export type SkillGapCategory = 'CRITICAL_MISSING' | 'RECOMMENDED_NEXT' | 'OPTIONAL_ADVANTAGE'

export interface SkillGapItem {
  id: string
  name: string
  category: SkillGapCategory
  categoryLabel: 'Critical Missing' | 'Recommended Next' | 'Optional Advantage'
  description?: string | null
  classificationRule: string
  targetCareerSlug: string
}

export interface SkillGapAnalysisResult {
  careerSlug: string
  careerTitle: string
  totalCoreSkills: number
  matchedCoreSkills: string[]
  missingCoreSkills: string[]
  coreCoveragePercentage: number
  totalSupportingSkills: number
  matchedSupportingSkills: string[]
  missingSupportingSkills: string[]
  allMatchedSkills: string[]
  matchedSkills: string[]
  criticalMissingCount: number
  recommendedNextCount: number
  optionalAdvantageCount: number
  gaps: SkillGapItem[]
}

export interface CareerSkillInput {
  id: string
  name: string
  type: string // "core" | "supporting"
  importance?: 'HIGH' | 'MEDIUM' | 'LOW'
  description?: string | null
}

export interface StudentSkillInput {
  name: string
  proficiency?: string
}

/**
 * Analyzes the gap between a student's recorded skills and a target career's requirements.
 * Classifies missing skills into:
 * 1. CRITICAL_MISSING: Core mandatory skills for the career
 * 2. RECOMMENDED_NEXT: High-impact supporting skills
 * 3. OPTIONAL_ADVANTAGE: Useful complementary tools and skills
 */
export function analyzeSkillGaps(
  career: {
    slug: string
    title: string
    skills: CareerSkillInput[]
    prerequisites?: string[]
  },
  studentSkills: StudentSkillInput[],
): SkillGapAnalysisResult {
  const matchedCoreSkills: string[] = []
  const missingCoreSkills: string[] = []
  const matchedSupportingSkills: string[] = []
  const missingSupportingSkills: string[] = []
  const allMatchedSkills: string[] = []

  const gaps: SkillGapItem[] = []

  const coreSkills = career.skills.filter((s) => s.type === 'core')
  const supportingSkills = career.skills.filter((s) => s.type === 'supporting')

  // 1. Evaluate Core Skills
  for (const cSkill of coreSkills) {
    const isMatched = studentSkills.some((s) => isSkillMatch(s.name, cSkill.name))
    if (isMatched) {
      matchedCoreSkills.push(cSkill.name)
      if (!allMatchedSkills.includes(cSkill.name)) allMatchedSkills.push(cSkill.name)
    } else {
      missingCoreSkills.push(cSkill.name)
      gaps.push({
        id: `gap-${cSkill.id}`,
        name: cSkill.name,
        category: 'CRITICAL_MISSING',
        categoryLabel: 'Critical Missing',
        description: cSkill.description || 'Core requirement for this career path.',
        classificationRule: 'Required core competency not currently recorded on your student profile.',
        targetCareerSlug: career.slug,
      })
    }
  }

  // 2. Evaluate Supporting Skills
  for (const sSkill of supportingSkills) {
    const isMatched = studentSkills.some((s) => isSkillMatch(s.name, sSkill.name))
    if (isMatched) {
      matchedSupportingSkills.push(sSkill.name)
      if (!allMatchedSkills.includes(sSkill.name)) allMatchedSkills.push(sSkill.name)
    } else {
      missingSupportingSkills.push(sSkill.name)
      const isOptional = sSkill.importance === 'LOW'
      gaps.push({
        id: `gap-${sSkill.id}`,
        name: sSkill.name,
        category: isOptional ? 'OPTIONAL_ADVANTAGE' : 'RECOMMENDED_NEXT',
        categoryLabel: isOptional ? 'Optional Advantage' : 'Recommended Next',
        description:
          sSkill.description ||
          (isOptional
            ? 'Helpful complementary skill that provides an edge.'
            : 'Recommended supporting skill that strengthens your candidate profile.'),
        classificationRule: isOptional
          ? 'Complementary elective skill from career catalog.'
          : 'Supporting skill that provides a significant hiring advantage.',
        targetCareerSlug: career.slug,
      })
    }
  }

  // 3. Evaluate Foundational / Optional Advantage Skills from Prerequisites if any
  if (career.prerequisites && career.prerequisites.length > 0) {
    for (let i = 0; i < career.prerequisites.length; i++) {
      const prereq = career.prerequisites[i]
      const isMatched = studentSkills.some((s) => isSkillMatch(s.name, prereq))
      if (!isMatched && !gaps.some((g) => g.name.toLowerCase() === prereq.toLowerCase())) {
        gaps.push({
          id: `gap-prereq-${career.slug}-${i}`,
          name: prereq,
          category: 'OPTIONAL_ADVANTAGE',
          categoryLabel: 'Optional Advantage',
          description: 'Foundational prerequisite that accelerates domain mastery.',
          classificationRule: 'Complementary foundation from the career catalog.',
          targetCareerSlug: career.slug,
        })
      }
    }
  }

  // Deterministic sorting:
  // 1. CRITICAL_MISSING (0)
  // 2. RECOMMENDED_NEXT (1)
  // 3. OPTIONAL_ADVANTAGE (2)
  // 4. Alphabetical by name
  const categoryOrder: Record<SkillGapCategory, number> = {
    CRITICAL_MISSING: 0,
    RECOMMENDED_NEXT: 1,
    OPTIONAL_ADVANTAGE: 2,
  }

  gaps.sort((a, b) => {
    const orderA = categoryOrder[a.category]
    const orderB = categoryOrder[b.category]
    if (orderA !== orderB) return orderA - orderB
    return a.name.localeCompare(b.name)
  })

  const coreCoveragePercentage =
    coreSkills.length > 0 ? Math.round((matchedCoreSkills.length / coreSkills.length) * 100) : 100

  const criticalMissingCount = gaps.filter((g) => g.category === 'CRITICAL_MISSING').length
  const recommendedNextCount = gaps.filter((g) => g.category === 'RECOMMENDED_NEXT').length
  const optionalAdvantageCount = gaps.filter((g) => g.category === 'OPTIONAL_ADVANTAGE').length

  return {
    careerSlug: career.slug,
    careerTitle: career.title,
    totalCoreSkills: coreSkills.length,
    matchedCoreSkills,
    missingCoreSkills,
    coreCoveragePercentage,
    totalSupportingSkills: supportingSkills.length,
    matchedSupportingSkills,
    missingSupportingSkills,
    allMatchedSkills,
    matchedSkills: allMatchedSkills,
    criticalMissingCount,
    recommendedNextCount,
    optionalAdvantageCount,
    gaps,
  }
}
