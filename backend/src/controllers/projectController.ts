import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js'
import * as projectService from '../services/projectService.js'
import {
  validateCreateProject,
  validateUpdateProject,
  validateCreateDeliverable,
  validateUpdateDeliverable,
} from '../validators/projectValidators.js'

export async function getProjects(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const statusFilter = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : undefined

    const projects = await projectService.getStudentProjects(userId, statusFilter)
    return res.status(200).json({ projects })
  } catch (error) {
    console.error('Error in getProjects:', error)
    return res.status(500).json({ error: 'Failed to retrieve projects' })
  }
}

export async function getProjectRecommendations(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const explicitCareerSlug = typeof req.query.career === 'string' ? req.query.career.trim() : undefined

    const recommendations = await projectService.getProjectRecommendations(userId, explicitCareerSlug)
    return res.status(200).json(recommendations)
  } catch (error) {
    console.error('Error in getProjectRecommendations:', error)
    return res.status(500).json({ error: 'Failed to calculate project recommendations' })
  }
}

export function getProjectTemplates(req: AuthenticatedRequest, res: Response) {
  try {
    const careerSlug = typeof req.query.career === 'string' ? req.query.career.trim() : undefined
    const templates = projectService.getProjectTemplates(careerSlug)
    return res.status(200).json({ templates })
  } catch (error) {
    console.error('Error in getProjectTemplates:', error)
    return res.status(500).json({ error: 'Failed to retrieve catalog project templates' })
  }
}

export async function getProjectSummaryMetrics(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const metrics = await projectService.getProjectSummaryMetrics(userId)
    return res.status(200).json({ metrics })
  } catch (error) {
    console.error('Error in getProjectSummaryMetrics:', error)
    return res.status(500).json({ error: 'Failed to retrieve project summary metrics' })
  }
}

export async function getProjectById(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const id = req.params.id as string

    const result = await projectService.getProjectById(userId, id)

    if (result.notFound) {
      return res.status(404).json({ error: 'Project not found' })
    }

    if (result.forbidden) {
      return res.status(403).json({ error: 'Unauthorized to view this project' })
    }

    return res.status(200).json({ project: result.project })
  } catch (error) {
    console.error('Error in getProjectById:', error)
    return res.status(500).json({ error: 'Failed to retrieve project' })
  }
}

export async function createProject(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const validation = validateCreateProject(req.body)

    if (!validation.valid || !validation.data) {
      return res.status(400).json({ error: validation.error })
    }

    const project = await projectService.createProject(userId, validation.data)
    return res.status(201).json({
      message: 'Project created successfully',
      project,
    })
  } catch (error) {
    console.error('Error in createProject:', error)
    return res.status(500).json({ error: 'Failed to create project' })
  }
}

export async function updateProject(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const id = req.params.id as string

    const validation = validateUpdateProject(req.body)
    if (!validation.valid || !validation.data) {
      return res.status(400).json({ error: validation.error })
    }

    const result = await projectService.updateProject(userId, id, validation.data)

    if (result.notFound) {
      return res.status(404).json({ error: 'Project not found' })
    }

    if (result.forbidden) {
      return res.status(403).json({ error: 'Unauthorized to update this project' })
    }

    return res.status(200).json({
      message: 'Project updated successfully',
      project: result.project,
    })
  } catch (error) {
    console.error('Error in updateProject:', error)
    return res.status(500).json({ error: 'Failed to update project' })
  }
}

export async function deleteProject(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const id = req.params.id as string

    const result = await projectService.deleteProject(userId, id)

    if (result.notFound) {
      return res.status(404).json({ error: 'Project not found' })
    }

    if (result.forbidden) {
      return res.status(403).json({ error: 'Unauthorized to delete this project' })
    }

    return res.status(200).json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error in deleteProject:', error)
    return res.status(500).json({ error: 'Failed to delete project' })
  }
}

export async function addDeliverable(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const projectId = req.params.id as string

    const validation = validateCreateDeliverable(req.body)
    if (!validation.valid || !validation.data) {
      return res.status(400).json({ error: validation.error })
    }

    const result = await projectService.addProjectDeliverable(userId, projectId, validation.data)

    if (result.notFound) {
      return res.status(404).json({ error: 'Project not found' })
    }

    if (result.forbidden) {
      return res.status(403).json({ error: 'Unauthorized to add deliverable to this project' })
    }

    if (result.invalidRoadmapTask) {
      return res.status(400).json({ error: 'Invalid or unauthorized roadmap task association' })
    }

    return res.status(201).json({
      message: 'Deliverable added successfully',
      deliverable: result.deliverable,
    })
  } catch (error) {
    console.error('Error in addDeliverable:', error)
    return res.status(500).json({ error: 'Failed to add deliverable' })
  }
}

export async function updateDeliverable(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const projectId = req.params.id as string
    const evidenceId = req.params.evidenceId as string

    const validation = validateUpdateDeliverable(req.body)
    if (!validation.valid || !validation.data) {
      return res.status(400).json({ error: validation.error })
    }

    const result = await projectService.updateProjectDeliverable(
      userId,
      projectId,
      evidenceId,
      validation.data,
    )

    if (result.notFound) {
      return res.status(404).json({ error: 'Deliverable not found' })
    }

    if (result.forbidden) {
      return res.status(403).json({ error: 'Unauthorized to update this deliverable' })
    }

    if (result.invalidRoadmapTask) {
      return res.status(400).json({ error: 'Invalid or unauthorized roadmap task association' })
    }

    return res.status(200).json({
      message: 'Deliverable updated successfully',
      deliverable: result.deliverable,
    })
  } catch (error) {
    console.error('Error in updateDeliverable:', error)
    return res.status(500).json({ error: 'Failed to update deliverable' })
  }
}

export async function deleteDeliverable(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const projectId = req.params.id as string
    const evidenceId = req.params.evidenceId as string

    const result = await projectService.deleteProjectDeliverable(userId, projectId, evidenceId)

    if (result.notFound) {
      return res.status(404).json({ error: 'Deliverable not found' })
    }

    if (result.forbidden) {
      return res.status(403).json({ error: 'Unauthorized to delete this deliverable' })
    }

    return res.status(200).json({ message: 'Deliverable deleted successfully' })
  } catch (error) {
    console.error('Error in deleteDeliverable:', error)
    return res.status(500).json({ error: 'Failed to delete deliverable' })
  }
}
