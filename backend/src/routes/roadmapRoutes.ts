import { Router } from 'express'
import {
  generateRoadmapHandler,
  getCurrentRoadmapHandler,
  getRoadmapByIdHandler,
  updateTaskStatusHandler,
  regenerateRoadmapHandler,
} from '../controllers/roadmapController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

export const roadmapRouter = Router()

// All roadmap operations require an authenticated session
roadmapRouter.use(requireAuth)

roadmapRouter.post('/generate', generateRoadmapHandler)
roadmapRouter.get('/current', getCurrentRoadmapHandler)
roadmapRouter.post('/regenerate', regenerateRoadmapHandler)
roadmapRouter.patch('/tasks/:taskId', updateTaskStatusHandler)
roadmapRouter.get('/:id', getRoadmapByIdHandler)
