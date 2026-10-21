import type { CareerSkillInput, SkillGapAnalysisResult } from '../careerFit/skillGapService.js'

export interface GeneratedTask {
  weekNumber: number // 1, 2, 3, 4
  dayNumber: number // 1 to 30
  dayRange: string // e.g. "Days 1–3"
  orderIndex: number
  title: string
  description: string
  estimatedMinutes: number
  skillName: string
  skillCategory: 'CRITICAL_MISSING' | 'RECOMMENDED_NEXT' | 'OPTIONAL_ADVANTAGE' | 'PROJECT'
  prerequisites?: string[]
  completionCriteria: string
  expectedOutput: string
}

export interface GeneratedWeek {
  weekNumber: number
  title: string
  objective: string
  milestoneOutcome: string
  dayRange: string
  totalMinutes: number
  tasks: GeneratedTask[]
}

export interface GeneratedRoadmapPlan {
  careerSlug: string
  careerTitle: string
  totalDays: 30
  weeklyHoursAssumed: number
  weeks: GeneratedWeek[]
  allTasks: GeneratedTask[]
  skillsAddressed: string[]
  deferredSkills: string[]
  assumptions: string[]
}

export interface CareerInput {
  slug: string
  title: string
  category: string
  skills: CareerSkillInput[]
  responsibilities?: string[]
  exampleProjects?: Array<{ title: string; description: string; skills?: string[] }>
  prerequisites?: string[]
}

export interface StudentProfileInput {
  skills: Array<{ name: string; proficiency?: string }>
  experiences?: Array<{ type: string; title: string; description?: string | null }>
  primaryGoal?: string | null
  weeklyHours?: string | null
}

/**
 * Parses weekly hours string (e.g. "10-15", "15-20", "5-10", "20+") into a safe numeric value.
 */
export function parseWeeklyHours(rawHours?: string | number | null, fallback = 10): number {
  if (typeof rawHours === 'number' && rawHours > 0) {
    return Math.min(Math.max(Math.round(rawHours), 5), 40)
  }
  if (!rawHours || typeof rawHours !== 'string') {
    return fallback
  }

  const str = rawHours.trim()
  if (str === '5-10') return 8
  if (str === '10-15') return 12
  if (str === '15-20') return 18
  if (str === '20+') return 20

  const parsed = parseInt(str, 10)
  if (!isNaN(parsed) && parsed >= 5 && parsed <= 40) {
    return parsed
  }

  return fallback
}

/**
 * Pure deterministic roadmap generation engine.
 * Converts student profile + target career + skill gaps into a structured 30-day, 4-week learning plan.
 */
export function generate30DayRoadmap(
  career: CareerInput,
  profile: StudentProfileInput,
  skillGaps: SkillGapAnalysisResult,
  requestedWeeklyHours?: number | null,
): GeneratedRoadmapPlan {
  const weeklyHoursAssumed = parseWeeklyHours(
    requestedWeeklyHours || profile.weeklyHours,
    10,
  )

  const criticalGaps = skillGaps.gaps.filter((g) => g.category === 'CRITICAL_MISSING')
  const recommendedGaps = skillGaps.gaps.filter((g) => g.category === 'RECOMMENDED_NEXT')
  const optionalGaps = skillGaps.gaps.filter((g) => g.category === 'OPTIONAL_ADVANTAGE')

  // Identify prioritized skills for the 30-day scope
  // Week 1-2 will focus on the top 2-3 highest-leverage skills
  const skillsToAddress: Array<{ name: string; category: 'CRITICAL_MISSING' | 'RECOMMENDED_NEXT' | 'OPTIONAL_ADVANTAGE' }> = []

  for (const g of criticalGaps) {
    if (skillsToAddress.length < 3) {
      skillsToAddress.push({ name: g.name, category: 'CRITICAL_MISSING' })
    }
  }

  for (const g of recommendedGaps) {
    if (skillsToAddress.length < 4) {
      skillsToAddress.push({ name: g.name, category: 'RECOMMENDED_NEXT' })
    }
  }

  for (const g of optionalGaps) {
    if (skillsToAddress.length < 4) {
      skillsToAddress.push({ name: g.name, category: 'OPTIONAL_ADVANTAGE' })
    }
  }

  // If student already has high match and few/no gaps, address advanced topics or primary core competencies
  if (skillsToAddress.length === 0) {
    const firstCore = career.skills.find((s) => s.type === 'core')
    const secondCore = career.skills.filter((s) => s.type === 'core')[1] || firstCore
    skillsToAddress.push({
      name: firstCore ? firstCore.name : `${career.title} Core Competency`,
      category: 'RECOMMENDED_NEXT',
    })
    if (secondCore && secondCore.name !== skillsToAddress[0]?.name) {
      skillsToAddress.push({
        name: secondCore.name,
        category: 'RECOMMENDED_NEXT',
      })
    }
  }

  const primarySkill = skillsToAddress[0]?.name || `${career.title} Core Architecture`
  const primaryCategory = skillsToAddress[0]?.category || 'CRITICAL_MISSING'

  const secondarySkill = skillsToAddress[1]?.name || primarySkill
  const secondaryCategory = skillsToAddress[1]?.category || 'RECOMMENDED_NEXT'

  // Extract deferred skills
  const allAddressedSkillNames = new Set(skillsToAddress.map((s) => s.name.toLowerCase()))
  const deferredSkills: string[] = []

  for (const g of skillGaps.gaps) {
    if (!allAddressedSkillNames.has(g.name.toLowerCase())) {
      deferredSkills.push(g.name)
    }
  }

  // Determine practical project from career catalog or category default
  const exampleProject = career.exampleProjects && career.exampleProjects.length > 0
    ? career.exampleProjects[0]
    : {
        title: `${career.title} Portfolio Project`,
        description: `Design, build, and deploy a production-grade application showcasing ${primarySkill} and ${secondarySkill}.`,
      }

  // Task duration budgets based on weekly hours
  // Aim for ~65-75% of weekly hours in planned tasks, leaving the rest for reading/review/flexibility
  const targetTaskMinutesPerWeek = Math.round(weeklyHoursAssumed * 60 * 0.7)
  const taskMinutes = Math.min(Math.max(Math.round(targetTaskMinutesPerWeek / 3), 90), 180)

  // -------------------------------------------------------------
  // WEEK 1: Foundations & Core Concepts (Days 1–7)
  // -------------------------------------------------------------
  const week1Tasks: GeneratedTask[] = [
    {
      weekNumber: 1,
      dayNumber: 2,
      dayRange: 'Days 1–2',
      orderIndex: 1,
      title: `Environment Setup & ${primarySkill} Fundamentals`,
      description: `Configure local development toolchain, dependencies, and verify working setup for ${primarySkill}. Review official documentation and core conventions.`,
      estimatedMinutes: taskMinutes,
      skillName: primarySkill,
      skillCategory: primaryCategory,
      completionCriteria: `Local development environment initialized, necessary SDKs/tools installed, and first 'Hello World' verification script running without errors.`,
      expectedOutput: `Verified local workspace with working configuration files and baseline execution script.`,
    },
    {
      weekNumber: 1,
      dayNumber: 5,
      dayRange: 'Days 3–5',
      orderIndex: 2,
      title: `Core Architectural Patterns in ${primarySkill}`,
      description: `Study and implement the essential patterns, data structures, and core primitives of ${primarySkill} relevant to ${career.title} responsibilities.`,
      estimatedMinutes: taskMinutes,
      skillName: primarySkill,
      skillCategory: primaryCategory,
      prerequisites: [`Environment Setup & ${primarySkill} Fundamentals`],
      completionCriteria: `Complete 3 practical code exercises demonstrating modular structure, idiomatic syntax, and standard conventions.`,
      expectedOutput: `Source code containing standalone implementations of the core architectural patterns.`,
    },
    {
      weekNumber: 1,
      dayNumber: 7,
      dayRange: 'Days 6–7',
      orderIndex: 3,
      title: `Week 1 Proof-of-Concept & Self-Review`,
      description: `Build a focused, mini proof-of-concept module uniting Week 1 concepts. Verify edge cases, document findings, and review key concepts.`,
      estimatedMinutes: taskMinutes,
      skillName: primarySkill,
      skillCategory: primaryCategory,
      prerequisites: [`Core Architectural Patterns in ${primarySkill}`],
      completionCriteria: `Working proof-of-concept module executing cleanly from command line or browser with zero runtime errors.`,
      expectedOutput: `Functional mini-project repository or test suite validating foundational grasp.`,
    },
  ]

  // -------------------------------------------------------------
  // WEEK 2: Skill Practice & Integration (Days 8–14)
  // -------------------------------------------------------------
  const week2Tasks: GeneratedTask[] = [
    {
      weekNumber: 2,
      dayNumber: 9,
      dayRange: 'Days 8–9',
      orderIndex: 4,
      title: `Integration with ${secondarySkill}`,
      description: `Deepen practical capability by integrating ${secondarySkill} alongside ${primarySkill}. Connect data layers, APIs, or data flows as required.`,
      estimatedMinutes: taskMinutes,
      skillName: secondarySkill,
      skillCategory: secondaryCategory,
      completionCriteria: `Implement an end-to-end flow where ${primarySkill} interacts with ${secondarySkill} cleanly with typed schemas or contracts.`,
      expectedOutput: `Working integration script or component passing local validation.`,
    },
    {
      weekNumber: 2,
      dayNumber: 12,
      dayRange: 'Days 10–12',
      orderIndex: 5,
      title: `Error Handling, Edge Cases & Data Validation`,
      description: `Implement defensive programming patterns: validate inputs, handle service/network boundaries, and handle edge cases gracefully.`,
      estimatedMinutes: taskMinutes,
      skillName: secondarySkill,
      skillCategory: secondaryCategory,
      prerequisites: [`Integration with ${secondarySkill}`],
      completionCriteria: `Cover at least 3 distinct error scenarios (invalid inputs, failed dependencies, unexpected state) with clear user-friendly recovery.`,
      expectedOutput: `Documented error-handling middleware or handler functions with validation schema.`,
    },
    {
      weekNumber: 2,
      dayNumber: 14,
      dayRange: 'Days 13–14',
      orderIndex: 6,
      title: `Automated Testing & Midpoint Review`,
      description: `Write automated unit or integration tests verifying the features built across Weeks 1 and 2. Measure test coverage and refactor code.`,
      estimatedMinutes: taskMinutes,
      skillName: primarySkill,
      skillCategory: primaryCategory,
      prerequisites: [`Error Handling, Edge Cases & Data Validation`],
      completionCriteria: `Test suite executes successfully in terminal with all test assertions passing (100% green).`,
      expectedOutput: `Automated test files executable via npm test / test runner with passing output.`,
    },
  ]

  // -------------------------------------------------------------
  // WEEK 3: Practical Project Implementation (Days 15–21)
  // -------------------------------------------------------------
  const week3Tasks: GeneratedTask[] = [
    {
      weekNumber: 3,
      dayNumber: 16,
      dayRange: 'Days 15–16',
      orderIndex: 7,
      title: `Project Architecture: ${exampleProject.title}`,
      description: `Initiate the main portfolio project: "${exampleProject.title}". Define system requirements, directory layout, schema/state models, and component boundaries.`,
      estimatedMinutes: taskMinutes,
      skillName: primarySkill,
      skillCategory: 'PROJECT',
      completionCriteria: `Drafted technical specification, data schema or component hierarchy, and initialized Git repository with clean commit history.`,
      expectedOutput: `README.md containing project architecture diagram/overview and initialized repository skeleton.`,
    },
    {
      weekNumber: 3,
      dayNumber: 19,
      dayRange: 'Days 17–19',
      orderIndex: 8,
      title: `Core Feature Implementation for ${exampleProject.title}`,
      description: `Build the primary functional workflow of ${exampleProject.title} embodying real-world ${career.title} standards and combining ${primarySkill} and ${secondarySkill}.`,
      estimatedMinutes: taskMinutes,
      skillName: primarySkill,
      skillCategory: 'PROJECT',
      prerequisites: [`Project Architecture: ${exampleProject.title}`],
      completionCriteria: `End-to-end user workflow operational from input to persisted result without crashes.`,
      expectedOutput: `Complete source code implementing the central business logic and user interface/API endpoints.`,
    },
    {
      weekNumber: 3,
      dayNumber: 21,
      dayRange: 'Days 20–21',
      orderIndex: 9,
      title: `Feature Polish & Milestone Validation`,
      description: `Polish user experience, refine edge cases, write integration tests, and ensure code cleanliness across the ${exampleProject.title} codebase.`,
      estimatedMinutes: taskMinutes,
      skillName: secondarySkill,
      skillCategory: 'PROJECT',
      prerequisites: [`Core Feature Implementation for ${exampleProject.title}`],
      completionCriteria: `All core features pass end-to-end verification, code passes linter without errors, and no console warnings persist.`,
      expectedOutput: `Polished project codebase ready for deployment preparation.`,
    },
  ]

  // -------------------------------------------------------------
  // WEEK 4: Deployment, Evidence & Portfolio Consolidation (Days 22–30, 9 days)
  // -------------------------------------------------------------
  const week4Tasks: GeneratedTask[] = [
    {
      weekNumber: 4,
      dayNumber: 24,
      dayRange: 'Days 22–24',
      orderIndex: 10,
      title: `Containerization & Cloud Deployment`,
      description: `Package "${exampleProject.title}" for production. Create deployment artifacts (Dockerfile, CI workflow, or cloud hosting config) and deploy to a live environment.`,
      estimatedMinutes: taskMinutes,
      skillName: primarySkill,
      skillCategory: 'PROJECT',
      prerequisites: [`Feature Polish & Milestone Validation`],
      completionCriteria: `Project successfully deployed and reachable via a public URL or fully automated container build.`,
      expectedOutput: `Live accessible deployment URL and deployment configuration files (Dockerfile/CI YAML).`,
    },
    {
      weekNumber: 4,
      dayNumber: 27,
      dayRange: 'Days 25–27',
      orderIndex: 11,
      title: `Technical Documentation & Showcase README`,
      description: `Write a comprehensive, professional GitHub README: project overview, problem statement, architecture diagram, tech stack rationale, setup instructions, and live link.`,
      estimatedMinutes: taskMinutes,
      skillName: secondarySkill,
      skillCategory: 'PROJECT',
      prerequisites: [`Containerization & Cloud Deployment`],
      completionCriteria: `README contains clear setup steps, animated GIF/screenshot or API reference, architectural explanation, and key technical takeaways.`,
      expectedOutput: `Well-structured public GitHub repository with comprehensive documentation.`,
    },
    {
      weekNumber: 4,
      dayNumber: 30,
      dayRange: 'Days 28–30',
      orderIndex: 12,
      title: `Career Readiness Review & Portfolio Artifact Consolidation`,
      description: `Conduct a retrospective against ${career.title} job descriptions: prepare 3 key interview talking points from this project, assess remaining deferred skills, and update student profile.`,
      estimatedMinutes: taskMinutes,
      skillName: primarySkill,
      skillCategory: 'PROJECT',
      prerequisites: [`Technical Documentation & Showcase README`],
      completionCriteria: `Written summary of 3 architectural challenges solved and technical choices made during the 30-day roadmap.`,
      expectedOutput: `Personal interview preparation notes and updated student profile with validated skills.`,
    },
  ]

  const allTasks = [...week1Tasks, ...week2Tasks, ...week3Tasks, ...week4Tasks]

  const weeks: GeneratedWeek[] = [
    {
      weekNumber: 1,
      title: 'Week 1: Technical Foundations',
      objective: `Establish core technical foundations in ${primarySkill} and build an initial working proof-of-concept.`,
      milestoneOutcome: `Working local development environment and passing automated code exercises for ${primarySkill}.`,
      dayRange: 'Days 1–7',
      totalMinutes: week1Tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
      tasks: week1Tasks,
    },
    {
      weekNumber: 2,
      title: 'Week 2: Practice & Integration',
      objective: `Apply intermediate patterns, integrate ${secondarySkill}, and handle real-world error conditions.`,
      milestoneOutcome: `Functional feature integration with robust error handling, data validation, and automated unit tests.`,
      dayRange: 'Days 8–14',
      totalMinutes: week2Tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
      tasks: week2Tasks,
    },
    {
      weekNumber: 3,
      title: 'Week 3: Practical Project Implementation',
      objective: `Synthesize skills into a cohesive portfolio project: "${exampleProject.title}".`,
      milestoneOutcome: `Fully working end-to-end project artifact solving a concrete problem from the ${career.title} domain.`,
      dayRange: 'Days 15–21',
      totalMinutes: week3Tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
      tasks: week3Tasks,
    },
    {
      weekNumber: 4,
      title: 'Week 4: Deployment & Portfolio Consolidation',
      objective: `Deploy the portfolio project, document technical decisions, and prepare interview evidence.`,
      milestoneOutcome: `Public deployment URL, professional GitHub documentation, and concrete interview talking points.`,
      dayRange: 'Days 22–30',
      totalMinutes: week4Tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
      tasks: week4Tasks,
    },
  ]

  const assumptions: string[] = [
    `Paced for ${weeklyHoursAssumed} hours per week commitment with ~30% buffer allocated for debugging, reading, and consolidation.`,
    `Prioritizes high-leverage competencies (${skillsToAddress.map((s) => s.name).join(', ')}) before broader secondary skills.`,
    `A 30-day roadmap is a targeted starting plan designed to build practical momentum, not an exhaustive guarantee of senior hiring readiness.`,
  ]

  if (deferredSkills.length > 0) {
    assumptions.push(
      `${deferredSkills.length} secondary or elective skill(s) deferred to post-30-day continuation to protect depth of learning within the time budget.`,
    )
  }

  return {
    careerSlug: career.slug,
    careerTitle: career.title,
    totalDays: 30,
    weeklyHoursAssumed,
    weeks,
    allTasks,
    skillsAddressed: skillsToAddress.map((s) => s.name),
    deferredSkills,
    assumptions,
  }
}
