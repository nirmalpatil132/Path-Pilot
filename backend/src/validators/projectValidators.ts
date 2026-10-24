export const VALID_PROJECT_STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'] as const
export type ProjectStatus = (typeof VALID_PROJECT_STATUSES)[number]

export const VALID_DELIVERABLE_TYPES = [
  'FEATURE_MODULE',
  'CODE_REPOSITORY',
  'DEPLOYED_DEMO',
  'TEST_SUITE',
  'DESIGN_PROTOTYPE',
  'TECHNICAL_DOCS',
  'IMPLEMENTATION_NOTE',
] as const
export type DeliverableType = (typeof VALID_DELIVERABLE_TYPES)[number]

export const VALID_DELIVERABLE_STATUSES = ['PLANNED', 'SUBMITTED'] as const
export type DeliverableStatus = (typeof VALID_DELIVERABLE_STATUSES)[number]

/**
 * Validates that a string is a valid HTTP or HTTPS URL.
 * Rejects unsafe protocols (javascript:, data:, file:, ftp:, etc.) and malformed URLs.
 * Returns true if empty/null/undefined (optional field), or if valid HTTP/HTTPS.
 */
export function isValidHttpUrl(val?: string | null): boolean {
  if (!val || typeof val !== 'string' || val.trim() === '') return true
  const trimmed = val.trim()
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export interface CreateProjectBody {
  title: string
  description?: string
  source?: 'TEMPLATE' | 'CUSTOM'
  templateId?: string | null
  careerId?: string | null
  careerSlug?: string | null
  careerTitle?: string | null
  skills?: string[]
  status?: ProjectStatus
  startDate?: string | null
  completionDate?: string | null
  repositoryUrl?: string | null
  liveDemoUrl?: string | null
  notes?: string | null
}

export function validateCreateProject(body: unknown): { valid: boolean; error?: string; data?: CreateProjectBody } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' }
  }

  const b = body as Record<string, unknown>

  if (!b.title || typeof b.title !== 'string' || b.title.trim().length === 0) {
    return { valid: false, error: 'Project title is required and cannot be empty' }
  }

  if (b.title.trim().length > 200) {
    return { valid: false, error: 'Project title cannot exceed 200 characters' }
  }

  const description = typeof b.description === 'string' ? b.description.trim() : ''
  if (description.length > 5000) {
    return { valid: false, error: 'Project description cannot exceed 5000 characters' }
  }

  let status: ProjectStatus = 'PLANNED'
  if (b.status) {
    if (typeof b.status !== 'string' || !VALID_PROJECT_STATUSES.includes(b.status as ProjectStatus)) {
      return { valid: false, error: `Invalid project status. Must be one of: ${VALID_PROJECT_STATUSES.join(', ')}` }
    }
    status = b.status as ProjectStatus
  }

  let source: 'TEMPLATE' | 'CUSTOM' = 'CUSTOM'
  if (b.source) {
    if (b.source !== 'TEMPLATE' && b.source !== 'CUSTOM') {
      return { valid: false, error: 'Source must be either TEMPLATE or CUSTOM' }
    }
    source = b.source
  }

  if (b.repositoryUrl && !isValidHttpUrl(b.repositoryUrl as string)) {
    return { valid: false, error: 'Repository URL must be a valid HTTP or HTTPS URL' }
  }

  if (b.liveDemoUrl && !isValidHttpUrl(b.liveDemoUrl as string)) {
    return { valid: false, error: 'Live Demo URL must be a valid HTTP or HTTPS URL' }
  }

  let skills: string[] = []
  if (b.skills) {
    if (!Array.isArray(b.skills)) {
      return { valid: false, error: 'Skills must be an array of strings' }
    }
    skills = b.skills
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .map((s) => s.trim())
  }

  return {
    valid: true,
    data: {
      title: b.title.trim(),
      description,
      source,
      templateId: typeof b.templateId === 'string' ? b.templateId.trim() : null,
      careerId: typeof b.careerId === 'string' ? b.careerId.trim() : null,
      careerSlug: typeof b.careerSlug === 'string' ? b.careerSlug.trim() : null,
      careerTitle: typeof b.careerTitle === 'string' ? b.careerTitle.trim() : null,
      skills,
      status,
      startDate: typeof b.startDate === 'string' ? b.startDate.trim() : null,
      completionDate: typeof b.completionDate === 'string' ? b.completionDate.trim() : null,
      repositoryUrl: typeof b.repositoryUrl === 'string' && b.repositoryUrl.trim() ? b.repositoryUrl.trim() : null,
      liveDemoUrl: typeof b.liveDemoUrl === 'string' && b.liveDemoUrl.trim() ? b.liveDemoUrl.trim() : null,
      notes: typeof b.notes === 'string' ? b.notes.trim() : null,
    },
  }
}

export interface UpdateProjectBody {
  title?: string
  description?: string
  skills?: string[]
  status?: ProjectStatus
  startDate?: string | null
  completionDate?: string | null
  repositoryUrl?: string | null
  liveDemoUrl?: string | null
  notes?: string | null
}

export function validateUpdateProject(body: unknown): { valid: boolean; error?: string; data?: UpdateProjectBody } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' }
  }

  const b = body as Record<string, unknown>
  const data: UpdateProjectBody = {}

  if (b.title !== undefined) {
    if (typeof b.title !== 'string' || b.title.trim().length === 0) {
      return { valid: false, error: 'Project title cannot be empty' }
    }
    if (b.title.trim().length > 200) {
      return { valid: false, error: 'Project title cannot exceed 200 characters' }
    }
    data.title = b.title.trim()
  }

  if (b.description !== undefined) {
    if (typeof b.description !== 'string') {
      return { valid: false, error: 'Description must be a string' }
    }
    if (b.description.trim().length > 5000) {
      return { valid: false, error: 'Project description cannot exceed 5000 characters' }
    }
    data.description = b.description.trim()
  }

  if (b.status !== undefined) {
    if (typeof b.status !== 'string' || !VALID_PROJECT_STATUSES.includes(b.status as ProjectStatus)) {
      return { valid: false, error: `Invalid project status. Must be one of: ${VALID_PROJECT_STATUSES.join(', ')}` }
    }
    data.status = b.status as ProjectStatus
  }

  if (b.repositoryUrl !== undefined) {
    if (b.repositoryUrl && !isValidHttpUrl(b.repositoryUrl as string)) {
      return { valid: false, error: 'Repository URL must be a valid HTTP or HTTPS URL' }
    }
    data.repositoryUrl = typeof b.repositoryUrl === 'string' && b.repositoryUrl.trim() ? b.repositoryUrl.trim() : null
  }

  if (b.liveDemoUrl !== undefined) {
    if (b.liveDemoUrl && !isValidHttpUrl(b.liveDemoUrl as string)) {
      return { valid: false, error: 'Live Demo URL must be a valid HTTP or HTTPS URL' }
    }
    data.liveDemoUrl = typeof b.liveDemoUrl === 'string' && b.liveDemoUrl.trim() ? b.liveDemoUrl.trim() : null
  }

  if (b.skills !== undefined) {
    if (!Array.isArray(b.skills)) {
      return { valid: false, error: 'Skills must be an array of strings' }
    }
    data.skills = b.skills
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .map((s) => s.trim())
  }

  if (b.startDate !== undefined) {
    data.startDate = typeof b.startDate === 'string' ? b.startDate.trim() : null
  }

  if (b.completionDate !== undefined) {
    data.completionDate = typeof b.completionDate === 'string' ? b.completionDate.trim() : null
  }

  if (b.notes !== undefined) {
    data.notes = typeof b.notes === 'string' ? b.notes.trim() : null
  }

  return { valid: true, data }
}

export interface CreateDeliverableBody {
  title: string
  description?: string
  type?: DeliverableType
  status?: DeliverableStatus
  url?: string | null
  roadmapTaskId?: string | null
}

export function validateCreateDeliverable(body: unknown): { valid: boolean; error?: string; data?: CreateDeliverableBody } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' }
  }

  const b = body as Record<string, unknown>

  if (!b.title || typeof b.title !== 'string' || b.title.trim().length === 0) {
    return { valid: false, error: 'Deliverable title is required and cannot be empty' }
  }

  if (b.title.trim().length > 200) {
    return { valid: false, error: 'Deliverable title cannot exceed 200 characters' }
  }

  const description = typeof b.description === 'string' ? b.description.trim() : ''
  if (description.length > 5000) {
    return { valid: false, error: 'Deliverable description cannot exceed 5000 characters' }
  }

  let type: DeliverableType = 'FEATURE_MODULE'
  if (b.type) {
    if (typeof b.type !== 'string' || !VALID_DELIVERABLE_TYPES.includes(b.type as DeliverableType)) {
      return { valid: false, error: `Invalid deliverable type. Must be one of: ${VALID_DELIVERABLE_TYPES.join(', ')}` }
    }
    type = b.type as DeliverableType
  }

  let status: DeliverableStatus = 'SUBMITTED'
  if (b.status) {
    if (typeof b.status !== 'string' || !VALID_DELIVERABLE_STATUSES.includes(b.status as DeliverableStatus)) {
      return { valid: false, error: `Invalid deliverable status. Must be one of: ${VALID_DELIVERABLE_STATUSES.join(', ')}` }
    }
    status = b.status as DeliverableStatus
  }

  if (b.url && !isValidHttpUrl(b.url as string)) {
    return { valid: false, error: 'Deliverable URL must be a valid HTTP or HTTPS URL' }
  }

  return {
    valid: true,
    data: {
      title: b.title.trim(),
      description,
      type,
      status,
      url: typeof b.url === 'string' && b.url.trim() ? b.url.trim() : null,
      roadmapTaskId: typeof b.roadmapTaskId === 'string' && b.roadmapTaskId.trim() ? b.roadmapTaskId.trim() : null,
    },
  }
}

export interface UpdateDeliverableBody {
  title?: string
  description?: string
  type?: DeliverableType
  status?: DeliverableStatus
  url?: string | null
  roadmapTaskId?: string | null
}

export function validateUpdateDeliverable(body: unknown): { valid: boolean; error?: string; data?: UpdateDeliverableBody } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' }
  }

  const b = body as Record<string, unknown>
  const data: UpdateDeliverableBody = {}

  if (b.title !== undefined) {
    if (typeof b.title !== 'string' || b.title.trim().length === 0) {
      return { valid: false, error: 'Deliverable title cannot be empty' }
    }
    if (b.title.trim().length > 200) {
      return { valid: false, error: 'Deliverable title cannot exceed 200 characters' }
    }
    data.title = b.title.trim()
  }

  if (b.description !== undefined) {
    if (typeof b.description !== 'string') {
      return { valid: false, error: 'Description must be a string' }
    }
    if (b.description.trim().length > 5000) {
      return { valid: false, error: 'Deliverable description cannot exceed 5000 characters' }
    }
    data.description = b.description.trim()
  }

  if (b.type !== undefined) {
    if (typeof b.type !== 'string' || !VALID_DELIVERABLE_TYPES.includes(b.type as DeliverableType)) {
      return { valid: false, error: `Invalid deliverable type. Must be one of: ${VALID_DELIVERABLE_TYPES.join(', ')}` }
    }
    data.type = b.type as DeliverableType
  }

  if (b.status !== undefined) {
    if (typeof b.status !== 'string' || !VALID_DELIVERABLE_STATUSES.includes(b.status as DeliverableStatus)) {
      return { valid: false, error: `Invalid deliverable status. Must be one of: ${VALID_DELIVERABLE_STATUSES.join(', ')}` }
    }
    data.status = b.status as DeliverableStatus
  }

  if (b.url !== undefined) {
    if (b.url && !isValidHttpUrl(b.url as string)) {
      return { valid: false, error: 'Deliverable URL must be a valid HTTP or HTTPS URL' }
    }
    data.url = typeof b.url === 'string' && b.url.trim() ? b.url.trim() : null
  }

  if (b.roadmapTaskId !== undefined) {
    data.roadmapTaskId = typeof b.roadmapTaskId === 'string' && b.roadmapTaskId.trim() ? b.roadmapTaskId.trim() : null
  }

  return { valid: true, data }
}
