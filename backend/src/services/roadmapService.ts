import { prisma } from '../lib/prisma.js'
import { analyzeSkillGaps } from './careerFit/skillGapService.js'
import {
  generate30DayRoadmap,
  type CareerInput,
  type StudentProfileInput,
} from './roadmap/roadmapGenerator.js'

function safeJsonParse<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback
  try {
    return JSON.parse(val) as T
  } catch {
    return fallback
  }
}

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'

export const VALID_TASK_STATUSES: TaskStatus[] = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'BLOCKED',
]

export interface RoadmapServiceError {
  code: 'NOT_FOUND' | 'CONFLICT' | 'INSUFFICIENT_DATA' | 'UNAUTHORIZED' | 'INVALID_INPUT'
  message: string
  details?: unknown
}

export interface RoadmapOperationResult {
  error?: RoadmapServiceError
  roadmap?: any
}

export interface TaskUpdateResult {
  error?: RoadmapServiceError
  task?: any
  roadmapProgress?: {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    blockedTasks: number
    progressPercentage: number
  }
}

/**
 * Service orchestrating roadmap generation, persistence, updates, and progress calculations.
 */
export async function generateRoadmapForStudent(
  userId: string,
  careerSlug: string,
  requestedWeeklyHours?: number | null,
  force = false,
): Promise<RoadmapOperationResult> {
  // 1. Fetch student profile with skills and experiences
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
    return {
      error: {
        code: 'NOT_FOUND' as const,
        message: `Career with slug "${careerSlug}" not found in catalog.`,
      },
    }
  }

  // 3. Check for existing active roadmap
  const existingActive = await prisma.roadmap.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { tasks: true },
  })

  if (existingActive && !force) {
    return {
      error: {
        code: 'CONFLICT' as const,
        message: `An active roadmap already exists for "${existingActive.careerTitle}". Please view your active roadmap or explicitly confirm regeneration.`,
        details: {
          existingRoadmapId: existingActive.id,
          careerTitle: existingActive.careerTitle,
          careerSlug: existingActive.careerSlug,
          version: existingActive.version,
          progressPercentage: existingActive.progressPercentage,
        },
      },
    }
  }

  // 4. Build inputs for skill gaps and generator
  const formattedCareer: CareerInput = {
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
    exampleProjects: safeJsonParse<Array<{ title: string; description: string; skills?: string[] }>>(
      careerRecord.exampleProjects,
      [],
    ),
    prerequisites: safeJsonParse<string[]>(careerRecord.prerequisites, []),
  }

  const studentSkills = profileRecord?.skills.map((s) => ({
    name: s.name,
    proficiency: s.proficiency,
  })) || []

  const studentProfileInput: StudentProfileInput = {
    skills: studentSkills,
    experiences: profileRecord?.experiences.map((e) => ({
      type: e.type,
      title: e.title,
      description: e.description,
    })) || [],
    primaryGoal: profileRecord?.primaryGoal || null,
    weeklyHours: profileRecord?.weeklyHours || null,
  }

  // 5. Run Skill Gap Analysis & Roadmap Generator
  const skillGaps = analyzeSkillGaps(
    {
      slug: formattedCareer.slug,
      title: formattedCareer.title,
      skills: formattedCareer.skills,
      prerequisites: formattedCareer.prerequisites,
    },
    studentSkills,
  )

  const plan = generate30DayRoadmap(
    formattedCareer,
    studentProfileInput,
    skillGaps,
    requestedWeeklyHours,
  )

  // 6. Find highest past version
  const lastRoadmap = await prisma.roadmap.findFirst({
    where: { userId },
    orderBy: { version: 'desc' },
    select: { version: true },
  })
  const nextVersion = (lastRoadmap?.version || 0) + 1

  // 7. Atomic transaction: archive older active roadmaps and insert new roadmap + tasks
  const createdRoadmap = await prisma.$transaction(async (tx) => {
    if (existingActive) {
      await tx.roadmap.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: { status: 'ARCHIVED' },
      })
    }

    const roadmap = await tx.roadmap.create({
      data: {
        userId,
        careerId: careerRecord.id,
        careerSlug: careerRecord.slug,
        careerTitle: careerRecord.title,
        version: nextVersion,
        status: 'ACTIVE',
        weeklyHoursAssumed: plan.weeklyHoursAssumed,
        totalDays: 30,
        totalTasks: plan.allTasks.length,
        completedTasks: 0,
        inProgressTasks: 0,
        blockedTasks: 0,
        progressPercentage: 0.0,
        skillGapsAddressed: JSON.stringify(plan.skillsAddressed),
        assumptions: JSON.stringify(plan.assumptions),
        deferredSkills: JSON.stringify(plan.deferredSkills),
        tasks: {
          create: plan.allTasks.map((t) => ({
            weekNumber: t.weekNumber,
            dayNumber: t.dayNumber,
            dayRange: t.dayRange,
            orderIndex: t.orderIndex,
            title: t.title,
            description: t.description,
            estimatedMinutes: t.estimatedMinutes,
            skillName: t.skillName,
            skillCategory: t.skillCategory,
            prerequisites: t.prerequisites ? JSON.stringify(t.prerequisites) : null,
            completionCriteria: t.completionCriteria,
            expectedOutput: t.expectedOutput,
            status: 'NOT_STARTED',
          })),
        },
      },
      include: {
        tasks: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    return roadmap
  })

  return {
    roadmap: formatRoadmapResponse(createdRoadmap),
  }
}

/**
 * Retrieves the currently active roadmap for a user.
 */
export async function getStudentActiveRoadmap(userId: string) {
  const roadmap = await prisma.roadmap.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: {
      tasks: {
        orderBy: { orderIndex: 'asc' },
      },
      career: {
        select: {
          category: true,
          summary: true,
        },
      },
    },
  })

  if (!roadmap) {
    return {
      hasRoadmap: false as const,
      roadmap: null,
    }
  }

  return {
    hasRoadmap: true as const,
    roadmap: formatRoadmapResponse(roadmap),
  }
}

/**
 * Retrieves a specific roadmap by ID ensuring student ownership.
 */
export async function getRoadmapByIdForStudent(userId: string, roadmapId: string) {
  const roadmap = await prisma.roadmap.findFirst({
    where: { id: roadmapId, userId },
    include: {
      tasks: {
        orderBy: { orderIndex: 'asc' },
      },
      career: {
        select: {
          category: true,
          summary: true,
        },
      },
    },
  })

  if (!roadmap) {
    return null
  }

  return formatRoadmapResponse(roadmap)
}

/**
 * Updates a task status and completion notes with atomic progress recalculation.
 */
export async function updateRoadmapTaskStatus(
  userId: string,
  taskId: string,
  updates: { status?: string; notes?: string },
): Promise<TaskUpdateResult> {
  // 1. Verify task exists and belongs to a roadmap owned by userId
  const task = await prisma.roadmapTask.findUnique({
    where: { id: taskId },
    include: {
      roadmap: true,
    },
  })

  if (!task || task.roadmap.userId !== userId) {
    return {
      error: {
        code: 'NOT_FOUND' as const,
        message: 'Task not found or access denied.',
      },
    }
  }

  if (updates.status && !VALID_TASK_STATUSES.includes(updates.status as TaskStatus)) {
    return {
      error: {
        code: 'INVALID_INPUT' as const,
        message: `Invalid task status "${updates.status}". Valid values: ${VALID_TASK_STATUSES.join(', ')}`,
      },
    }
  }

  const nextStatus = (updates.status as TaskStatus) || task.status
  const isNowCompleted = nextStatus === 'COMPLETED'
  const wasCompleted = task.status === 'COMPLETED'

  let completedAt = task.completedAt
  if (isNowCompleted && !wasCompleted) {
    completedAt = new Date()
  } else if (!isNowCompleted && wasCompleted) {
    completedAt = null
  }

  // 2. Perform atomic update of task and roadmap metrics
  const result = await prisma.$transaction(async (tx) => {
    const updatedTask = await tx.roadmapTask.update({
      where: { id: taskId },
      data: {
        status: nextStatus,
        notes: updates.notes !== undefined ? updates.notes : task.notes,
        completedAt,
      },
    })

    // Fetch all tasks for this roadmap to accurately calculate counts & progress
    const allTasks = await tx.roadmapTask.findMany({
      where: { roadmapId: task.roadmapId },
    })

    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter((t) => t.status === 'COMPLETED').length
    const inProgressTasks = allTasks.filter((t) => t.status === 'IN_PROGRESS').length
    const blockedTasks = allTasks.filter((t) => t.status === 'BLOCKED').length
    const progressPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0.0

    const updatedRoadmap = await tx.roadmap.update({
      where: { id: task.roadmapId },
      data: {
        completedTasks,
        inProgressTasks,
        blockedTasks,
        progressPercentage,
      },
    })

    return {
      task: updatedTask,
      roadmapProgress: {
        totalTasks: updatedRoadmap.totalTasks,
        completedTasks: updatedRoadmap.completedTasks,
        inProgressTasks: updatedRoadmap.inProgressTasks,
        blockedTasks: updatedRoadmap.blockedTasks,
        progressPercentage: updatedRoadmap.progressPercentage,
      },
    }
  })

  return {
    task: formatTaskResponse(result.task),
    roadmapProgress: result.roadmapProgress,
  }
}

/**
 * Regenerates a roadmap for a career, archiving previous plans.
 */
export async function regenerateRoadmapForStudent(
  userId: string,
  careerSlug: string,
  requestedWeeklyHours?: number | null,
  preserveCompletedTasks = false,
): Promise<RoadmapOperationResult> {
  // If preserveCompletedTasks is requested, inspect completed skills from existing active plan
  let completedSkillNames: string[] = []
  if (preserveCompletedTasks) {
    const existing = await prisma.roadmap.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: {
        tasks: {
          where: { status: 'COMPLETED' },
        },
      },
    })
    if (existing) {
      completedSkillNames = existing.tasks.map((t) => t.skillName.toLowerCase())
    }
  }

  // Generate new roadmap with force=true
  const genResult = await generateRoadmapForStudent(userId, careerSlug, requestedWeeklyHours, true)

  if (genResult.error || !genResult.roadmap) {
    return genResult
  }

  // If preserving completions, mark matching tasks as completed
  if (preserveCompletedTasks && completedSkillNames.length > 0) {
    const newRoadmapId = genResult.roadmap.id
    const newTasks = await prisma.roadmapTask.findMany({
      where: { roadmapId: newRoadmapId },
    })

    for (const t of newTasks) {
      if (completedSkillNames.includes(t.skillName.toLowerCase())) {
        await updateRoadmapTaskStatus(userId, t.id, {
          status: 'COMPLETED',
          notes: 'Marked completed based on previous roadmap progress.',
        })
      }
    }

    const refreshed = await getRoadmapByIdForStudent(userId, newRoadmapId)
    return { roadmap: refreshed }
  }

  return genResult
}

// Helper formatting functions
function formatTaskResponse(task: any) {
  return {
    id: task.id,
    roadmapId: task.roadmapId,
    weekNumber: task.weekNumber,
    dayNumber: task.dayNumber,
    dayRange: task.dayRange,
    orderIndex: task.orderIndex,
    title: task.title,
    description: task.description,
    estimatedMinutes: task.estimatedMinutes,
    skillName: task.skillName,
    skillCategory: task.skillCategory,
    prerequisites: safeJsonParse<string[]>(task.prerequisites, []),
    completionCriteria: task.completionCriteria,
    expectedOutput: task.expectedOutput,
    status: task.status,
    notes: task.notes || null,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}

function formatRoadmapResponse(roadmap: any) {
  const tasks = (roadmap.tasks || []).map(formatTaskResponse)

  // Group into weeks
  const weeks = [1, 2, 3, 4].map((wNum) => {
    const weekTasks = tasks.filter((t: any) => t.weekNumber === wNum)
    const weekTotal = weekTasks.length
    const weekCompleted = weekTasks.filter((t: any) => t.status === 'COMPLETED').length
    const weekProgress = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 1000) / 10 : 0.0

    const titles: Record<number, string> = {
      1: 'Week 1: Technical Foundations',
      2: 'Week 2: Practice & Integration',
      3: 'Week 3: Practical Project Implementation',
      4: 'Week 4: Deployment & Portfolio Consolidation',
    }

    const objectives: Record<number, string> = {
      1: 'Establish core technical foundations and build initial functional proof-of-concept.',
      2: 'Apply intermediate patterns, integrate essential data/APIs, and handle edge cases.',
      3: 'Synthesize skills into a cohesive, realistic portfolio project matching hiring standards.',
      4: 'Deploy the project, document technical decisions, and assemble verifiable portfolio evidence.',
    }

    const dayRanges: Record<number, string> = {
      1: 'Days 1–7',
      2: 'Days 8–14',
      3: 'Days 15–21',
      4: 'Days 22–30',
    }

    return {
      weekNumber: wNum,
      title: titles[wNum] || `Week ${wNum}`,
      objective: objectives[wNum] || '',
      dayRange: dayRanges[wNum] || '',
      tasks: weekTasks,
      totalTasks: weekTotal,
      completedTasks: weekCompleted,
      progressPercentage: weekProgress,
      totalMinutes: weekTasks.reduce((sum: number, t: any) => sum + t.estimatedMinutes, 0),
    }
  })

  return {
    id: roadmap.id,
    userId: roadmap.userId,
    careerId: roadmap.careerId,
    careerSlug: roadmap.careerSlug,
    careerTitle: roadmap.careerTitle,
    careerCategory: roadmap.career?.category || null,
    careerSummary: roadmap.career?.summary || null,
    version: roadmap.version,
    status: roadmap.status,
    weeklyHoursAssumed: roadmap.weeklyHoursAssumed,
    totalDays: roadmap.totalDays,
    totalTasks: roadmap.totalTasks,
    completedTasks: roadmap.completedTasks,
    inProgressTasks: roadmap.inProgressTasks,
    blockedTasks: roadmap.blockedTasks,
    progressPercentage: roadmap.progressPercentage,
    skillGapsAddressed: safeJsonParse<string[]>(roadmap.skillGapsAddressed, []),
    assumptions: safeJsonParse<string[]>(roadmap.assumptions, []),
    deferredSkills: safeJsonParse<string[]>(roadmap.deferredSkills, []),
    createdAt: roadmap.createdAt.toISOString(),
    updatedAt: roadmap.updatedAt.toISOString(),
    weeks,
    tasks,
  }
}
