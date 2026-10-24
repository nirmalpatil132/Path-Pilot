import { prisma } from '../lib/prisma.js'
import {
  getAllProjectTemplates,
  recommendProjects,
  type CatalogProjectTemplate,
} from './project/projectRecommendationEngine.js'
import { analyzeSkillGaps } from './careerFit/skillGapService.js'
import type {
  CreateProjectBody,
  UpdateProjectBody,
  CreateDeliverableBody,
  UpdateDeliverableBody,
} from '../validators/projectValidators.js'

function safeJsonParse<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback
  try {
    return JSON.parse(val) as T
  } catch {
    return fallback
  }
}

export interface FormattedProject {
  id: string
  userId: string
  title: string
  description: string
  source: string
  templateId: string | null
  careerId: string | null
  careerSlug: string | null
  careerTitle: string | null
  skills: string[]
  status: string
  startDate: string | null
  completionDate: string | null
  repositoryUrl: string | null
  liveDemoUrl: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  deliverablesCount: number
  deliverables?: FormattedDeliverable[]
}

export interface FormattedDeliverable {
  id: string
  projectId: string
  title: string
  description: string
  type: string
  status: string
  url: string | null
  roadmapTaskId: string | null
  roadmapTaskTitle?: string | null
  createdAt: string
  updatedAt: string
}

export async function getStudentProjects(userId: string, statusFilter?: string): Promise<FormattedProject[]> {
  const whereClause: { userId: string; status?: string } = { userId }
  if (statusFilter && statusFilter !== 'ALL') {
    whereClause.status = statusFilter
  }

  const projects = await prisma.project.findMany({
    where: whereClause,
    include: {
      deliverables: {
        select: { id: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return projects.map((p) => ({
    id: p.id,
    userId: p.userId,
    title: p.title,
    description: p.description,
    source: p.source,
    templateId: p.templateId,
    careerId: p.careerId,
    careerSlug: p.careerSlug,
    careerTitle: p.careerTitle,
    skills: safeJsonParse<string[]>(p.skills, []),
    status: p.status,
    startDate: p.startDate,
    completionDate: p.completionDate,
    repositoryUrl: p.repositoryUrl,
    liveDemoUrl: p.liveDemoUrl,
    notes: p.notes,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    deliverablesCount: p.deliverables.length,
  }))
}

export async function getProjectById(
  userId: string,
  projectId: string,
): Promise<{ notFound?: boolean; forbidden?: boolean; project?: FormattedProject }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      deliverables: {
        include: {
          roadmapTask: {
            select: { id: true, title: true, weekNumber: true, dayRange: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!project) {
    return { notFound: true }
  }

  if (project.userId !== userId) {
    return { forbidden: true }
  }

  const formattedDeliverables: FormattedDeliverable[] = project.deliverables.map((d) => ({
    id: d.id,
    projectId: d.projectId,
    title: d.title,
    description: d.description,
    type: d.type,
    status: d.status,
    url: d.url,
    roadmapTaskId: d.roadmapTaskId,
    roadmapTaskTitle: d.roadmapTask?.title || null,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }))

  return {
    project: {
      id: project.id,
      userId: project.userId,
      title: project.title,
      description: project.description,
      source: project.source,
      templateId: project.templateId,
      careerId: project.careerId,
      careerSlug: project.careerSlug,
      careerTitle: project.careerTitle,
      skills: safeJsonParse<string[]>(project.skills, []),
      status: project.status,
      startDate: project.startDate,
      completionDate: project.completionDate,
      repositoryUrl: project.repositoryUrl,
      liveDemoUrl: project.liveDemoUrl,
      notes: project.notes,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      deliverablesCount: project.deliverables.length,
      deliverables: formattedDeliverables,
    },
  }
}

export async function getProjectRecommendations(userId: string, explicitCareerSlug?: string) {
  // 1. Fetch student's profile (with skills)
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { skills: true },
  })

  // 2. Fetch student's active roadmap (if any)
  const activeRoadmap = await prisma.roadmap.findFirst({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  })

  // 3. Determine target career slug
  const targetCareerSlug = explicitCareerSlug || activeRoadmap?.careerSlug || null

  // 4. Calculate skill gaps if target career is available
  let skillGaps: Array<{ name: string; category: string }> = []
  if (targetCareerSlug) {
    const career = await prisma.career.findUnique({
      where: { slug: targetCareerSlug },
      include: { skills: true },
    })

    if (career) {
      const studentSkills = (profile?.skills || []).map((s) => ({
        name: s.name,
        proficiency: s.proficiency,
      }))

      const gapAnalysis = analyzeSkillGaps(
        {
          slug: career.slug,
          title: career.title,
          skills: career.skills.map((cs) => ({
            id: cs.id,
            name: cs.name,
            type: cs.type,
          })),
        },
        studentSkills,
      )

      skillGaps = gapAnalysis.gaps.map((g) => ({
        name: g.name,
        category: g.category,
      }))
    }
  }

  // 5. Fetch existing student projects to detect already-started projects
  const existingProjects = await prisma.project.findMany({
    where: { userId },
    select: { templateId: true, title: true, status: true },
  })

  // 6. Generate recommendations
  const recommendations = recommendProjects({
    targetCareerSlug,
    studentSkills: (profile?.skills || []).map((s) => ({ name: s.name, proficiency: s.proficiency })),
    skillGaps,
    existingProjects,
  })

  return {
    targetCareerSlug,
    totalRecommendations: recommendations.length,
    recommendations,
  }
}

export function getProjectTemplates(careerSlug?: string): CatalogProjectTemplate[] {
  const all = getAllProjectTemplates()
  if (!careerSlug) return all
  return all.filter((t) => t.careerSlug.toLowerCase() === careerSlug.toLowerCase())
}

export async function createProject(userId: string, body: CreateProjectBody): Promise<FormattedProject> {
  let careerId = body.careerId || null
  let careerSlug = body.careerSlug || null
  let careerTitle = body.careerTitle || null
  let skills = body.skills || []
  let description = body.description || ''

  // If created from a catalog template, prefill metadata if missing
  if (body.source === 'TEMPLATE' && body.templateId) {
    const allTemplates = getAllProjectTemplates()
    const template = allTemplates.find((t) => t.templateId.toLowerCase() === body.templateId?.toLowerCase())
    if (template) {
      if (!description) description = template.description
      if (skills.length === 0) skills = template.skills
      if (!careerSlug) careerSlug = template.careerSlug
      if (!careerTitle) careerTitle = template.careerTitle
    }
  }

  // Resolve careerId if careerSlug is present but careerId is not
  if (careerSlug && !careerId) {
    const careerRecord = await prisma.career.findUnique({
      where: { slug: careerSlug },
      select: { id: true, title: true },
    })
    if (careerRecord) {
      careerId = careerRecord.id
      careerTitle = careerRecord.title
    }
  }

  const created = await prisma.project.create({
    data: {
      userId,
      title: body.title,
      description,
      source: body.source || 'CUSTOM',
      templateId: body.templateId || null,
      careerId,
      careerSlug,
      careerTitle,
      skills: JSON.stringify(skills),
      status: body.status || 'PLANNED',
      startDate: body.startDate || (body.status === 'IN_PROGRESS' ? new Date().toISOString().split('T')[0] : null),
      completionDate: body.completionDate || (body.status === 'COMPLETED' ? new Date().toISOString().split('T')[0] : null),
      repositoryUrl: body.repositoryUrl || null,
      liveDemoUrl: body.liveDemoUrl || null,
      notes: body.notes || null,
    },
  })

  return {
    id: created.id,
    userId: created.userId,
    title: created.title,
    description: created.description,
    source: created.source,
    templateId: created.templateId,
    careerId: created.careerId,
    careerSlug: created.careerSlug,
    careerTitle: created.careerTitle,
    skills: safeJsonParse<string[]>(created.skills, []),
    status: created.status,
    startDate: created.startDate,
    completionDate: created.completionDate,
    repositoryUrl: created.repositoryUrl,
    liveDemoUrl: created.liveDemoUrl,
    notes: created.notes,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
    deliverablesCount: 0,
  }
}

export async function updateProject(
  userId: string,
  projectId: string,
  body: UpdateProjectBody,
): Promise<{ notFound?: boolean; forbidden?: boolean; project?: FormattedProject }> {
  const existing = await prisma.project.findUnique({
    where: { id: projectId },
    include: { deliverables: { select: { id: true } } },
  })

  if (!existing) {
    return { notFound: true }
  }

  if (existing.userId !== userId) {
    return { forbidden: true }
  }

  const dataToUpdate: Record<string, unknown> = {}

  if (body.title !== undefined) dataToUpdate.title = body.title
  if (body.description !== undefined) dataToUpdate.description = body.description
  if (body.skills !== undefined) dataToUpdate.skills = JSON.stringify(body.skills)
  if (body.status !== undefined) {
    dataToUpdate.status = body.status
    // If completing project without explicit completionDate, default to today
    if (body.status === 'COMPLETED' && !existing.completionDate && !body.completionDate) {
      dataToUpdate.completionDate = new Date().toISOString().split('T')[0]
    }
    // If moving to IN_PROGRESS without startDate, default to today
    if (body.status === 'IN_PROGRESS' && !existing.startDate && !body.startDate) {
      dataToUpdate.startDate = new Date().toISOString().split('T')[0]
    }
  }
  if (body.startDate !== undefined) dataToUpdate.startDate = body.startDate
  if (body.completionDate !== undefined) dataToUpdate.completionDate = body.completionDate
  if (body.repositoryUrl !== undefined) dataToUpdate.repositoryUrl = body.repositoryUrl
  if (body.liveDemoUrl !== undefined) dataToUpdate.liveDemoUrl = body.liveDemoUrl
  if (body.notes !== undefined) dataToUpdate.notes = body.notes

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: dataToUpdate,
  })

  return {
    project: {
      id: updated.id,
      userId: updated.userId,
      title: updated.title,
      description: updated.description,
      source: updated.source,
      templateId: updated.templateId,
      careerId: updated.careerId,
      careerSlug: updated.careerSlug,
      careerTitle: updated.careerTitle,
      skills: safeJsonParse<string[]>(updated.skills, []),
      status: updated.status,
      startDate: updated.startDate,
      completionDate: updated.completionDate,
      repositoryUrl: updated.repositoryUrl,
      liveDemoUrl: updated.liveDemoUrl,
      notes: updated.notes,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      deliverablesCount: existing.deliverables.length,
    },
  }
}

export async function deleteProject(
  userId: string,
  projectId: string,
): Promise<{ notFound?: boolean; forbidden?: boolean; success?: boolean }> {
  const existing = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!existing) {
    return { notFound: true }
  }

  if (existing.userId !== userId) {
    return { forbidden: true }
  }

  await prisma.project.delete({
    where: { id: projectId },
  })

  return { success: true }
}

export async function addProjectDeliverable(
  userId: string,
  projectId: string,
  body: CreateDeliverableBody,
): Promise<{
  notFound?: boolean
  forbidden?: boolean
  invalidRoadmapTask?: boolean
  deliverable?: FormattedDeliverable
}> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    return { notFound: true }
  }

  if (project.userId !== userId) {
    return { forbidden: true }
  }

  // If a roadmap task is linked, verify ownership
  if (body.roadmapTaskId) {
    const task = await prisma.roadmapTask.findUnique({
      where: { id: body.roadmapTaskId },
      include: { roadmap: { select: { userId: true } } },
    })

    if (!task || task.roadmap.userId !== userId) {
      return { invalidRoadmapTask: true }
    }
  }

  const deliverable = await prisma.projectDeliverable.create({
    data: {
      projectId,
      title: body.title,
      description: body.description || '',
      type: body.type || 'FEATURE_MODULE',
      status: body.status || 'SUBMITTED',
      url: body.url || null,
      roadmapTaskId: body.roadmapTaskId || null,
    },
    include: {
      roadmapTask: {
        select: { title: true },
      },
    },
  })

  return {
    deliverable: {
      id: deliverable.id,
      projectId: deliverable.projectId,
      title: deliverable.title,
      description: deliverable.description,
      type: deliverable.type,
      status: deliverable.status,
      url: deliverable.url,
      roadmapTaskId: deliverable.roadmapTaskId,
      roadmapTaskTitle: deliverable.roadmapTask?.title || null,
      createdAt: deliverable.createdAt.toISOString(),
      updatedAt: deliverable.updatedAt.toISOString(),
    },
  }
}

export async function updateProjectDeliverable(
  userId: string,
  projectId: string,
  deliverableId: string,
  body: UpdateDeliverableBody,
): Promise<{
  notFound?: boolean
  forbidden?: boolean
  invalidRoadmapTask?: boolean
  deliverable?: FormattedDeliverable
}> {
  const deliverable = await prisma.projectDeliverable.findUnique({
    where: { id: deliverableId },
    include: { project: true, roadmapTask: { select: { title: true } } },
  })

  if (!deliverable || deliverable.projectId !== projectId) {
    return { notFound: true }
  }

  if (deliverable.project.userId !== userId) {
    return { forbidden: true }
  }

  if (body.roadmapTaskId) {
    const task = await prisma.roadmapTask.findUnique({
      where: { id: body.roadmapTaskId },
      include: { roadmap: { select: { userId: true } } },
    })

    if (!task || task.roadmap.userId !== userId) {
      return { invalidRoadmapTask: true }
    }
  }

  const updateData: Record<string, unknown> = {}
  if (body.title !== undefined) updateData.title = body.title
  if (body.description !== undefined) updateData.description = body.description
  if (body.type !== undefined) updateData.type = body.type
  if (body.status !== undefined) updateData.status = body.status
  if (body.url !== undefined) updateData.url = body.url
  if (body.roadmapTaskId !== undefined) updateData.roadmapTaskId = body.roadmapTaskId

  const updated = await prisma.projectDeliverable.update({
    where: { id: deliverableId },
    data: updateData,
    include: { roadmapTask: { select: { title: true } } },
  })

  return {
    deliverable: {
      id: updated.id,
      projectId: updated.projectId,
      title: updated.title,
      description: updated.description,
      type: updated.type,
      status: updated.status,
      url: updated.url,
      roadmapTaskId: updated.roadmapTaskId,
      roadmapTaskTitle: updated.roadmapTask?.title || null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  }
}

export async function deleteProjectDeliverable(
  userId: string,
  projectId: string,
  deliverableId: string,
): Promise<{ notFound?: boolean; forbidden?: boolean; success?: boolean }> {
  const deliverable = await prisma.projectDeliverable.findUnique({
    where: { id: deliverableId },
    include: { project: true },
  })

  if (!deliverable || deliverable.projectId !== projectId) {
    return { notFound: true }
  }

  if (deliverable.project.userId !== userId) {
    return { forbidden: true }
  }

  await prisma.projectDeliverable.delete({
    where: { id: deliverableId },
  })

  return { success: true }
}

export async function getProjectSummaryMetrics(userId: string) {
  const projects = await prisma.project.findMany({
    where: { userId },
    select: { id: true, status: true, title: true, updatedAt: true },
  })

  const totalDeliverables = await prisma.projectDeliverable.count({
    where: {
      project: { userId },
    },
  })

  const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS').length
  const plannedProjects = projects.filter((p) => p.status === 'PLANNED').length
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length
  const archivedProjects = projects.filter((p) => p.status === 'ARCHIVED').length

  return {
    totalProjects: projects.length,
    activeProjects,
    plannedProjects,
    completedProjects,
    archivedProjects,
    totalDeliverables,
  }
}
