import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js'
import {
  generateRoadmapForStudent,
  getStudentActiveRoadmap,
  getRoadmapByIdForStudent,
  updateRoadmapTaskStatus,
  regenerateRoadmapForStudent,
} from '../services/roadmapService.js'

export async function generateRoadmapHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { careerSlug, weeklyHours, force } = req.body || {}

    if (!careerSlug || typeof careerSlug !== 'string' || careerSlug.trim() === '') {
      return res.status(400).json({ error: 'A valid careerSlug is required to generate a roadmap.' })
    }

    const numericWeeklyHours =
      typeof weeklyHours === 'number'
        ? weeklyHours
        : typeof weeklyHours === 'string'
        ? parseInt(weeklyHours, 10) || undefined
        : undefined

    const result = await generateRoadmapForStudent(
      userId,
      careerSlug.trim(),
      numericWeeklyHours,
      Boolean(force),
    )

    if (result.error) {
      if (result.error.code === 'CONFLICT') {
        return res.status(409).json({
          error: result.error.message,
          details: result.error.details,
        })
      }
      if (result.error.code === 'NOT_FOUND') {
        return res.status(404).json({ error: result.error.message })
      }
      return res.status(400).json({ error: result.error.message })
    }

    return res.status(201).json({
      message: '30-day roadmap generated successfully.',
      roadmap: result.roadmap,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate roadmap'
    return res.status(500).json({ error: message })
  }
}

export async function getCurrentRoadmapHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await getStudentActiveRoadmap(userId)
    return res.status(200).json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch current roadmap'
    return res.status(500).json({ error: message })
  }
}

export async function getRoadmapByIdHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const rawId = req.params.id
    const id = Array.isArray(rawId) ? rawId[0] : rawId
    if (!id) {
      return res.status(400).json({ error: 'Roadmap ID is required' })
    }

    const roadmap = await getRoadmapByIdForStudent(userId, id)
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found or access denied.' })
    }

    return res.status(200).json({ roadmap })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve roadmap'
    return res.status(500).json({ error: message })
  }
}

export async function updateTaskStatusHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const rawTaskId = req.params.taskId
    const taskId = Array.isArray(rawTaskId) ? rawTaskId[0] : rawTaskId
    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' })
    }

    const { status, notes } = req.body || {}

    if (status === undefined && notes === undefined) {
      return res.status(400).json({ error: 'At least one of status or notes must be provided' })
    }

    const result = await updateRoadmapTaskStatus(userId, taskId, { status, notes })

    if (result.error) {
      if (result.error.code === 'NOT_FOUND') {
        return res.status(404).json({ error: result.error.message })
      }
      return res.status(400).json({ error: result.error.message })
    }

    return res.status(200).json({
      message: 'Task updated successfully',
      task: result.task,
      roadmapProgress: result.roadmapProgress,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update task'
    return res.status(500).json({ error: message })
  }
}

export async function regenerateRoadmapHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { careerSlug, weeklyHours, preserveCompletedTasks } = req.body || {}

    if (!careerSlug || typeof careerSlug !== 'string' || careerSlug.trim() === '') {
      return res.status(400).json({ error: 'A valid careerSlug is required to regenerate a roadmap.' })
    }

    const numericWeeklyHours =
      typeof weeklyHours === 'number'
        ? weeklyHours
        : typeof weeklyHours === 'string'
        ? parseInt(weeklyHours, 10) || undefined
        : undefined

    const result = await regenerateRoadmapForStudent(
      userId,
      careerSlug.trim(),
      numericWeeklyHours,
      Boolean(preserveCompletedTasks),
    )

    if (result.error) {
      if (result.error.code === 'NOT_FOUND') {
        return res.status(404).json({ error: result.error.message })
      }
      return res.status(400).json({ error: result.error.message })
    }

    return res.status(201).json({
      message: 'Roadmap regenerated successfully.',
      roadmap: result.roadmap,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to regenerate roadmap'
    return res.status(500).json({ error: message })
  }
}
