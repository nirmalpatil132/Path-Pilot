import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import * as projectController from '../controllers/projectController.js'

export const projectRouter = Router()

// All project workspace routes require valid authenticated session
projectRouter.use(requireAuth)

// Static routes before parameterized routes
projectRouter.get('/', projectController.getProjects)
projectRouter.get('/recommendations', projectController.getProjectRecommendations)
projectRouter.get('/templates', projectController.getProjectTemplates)
projectRouter.get('/metrics', projectController.getProjectSummaryMetrics)
projectRouter.post('/', projectController.createProject)

// Parameterized project routes
projectRouter.get('/:id', projectController.getProjectById)
projectRouter.patch('/:id', projectController.updateProject)
projectRouter.delete('/:id', projectController.deleteProject)

// Deliverable / Evidence routes
projectRouter.post('/:id/evidence', projectController.addDeliverable)
projectRouter.patch('/:id/evidence/:evidenceId', projectController.updateDeliverable)
projectRouter.delete('/:id/evidence/:evidenceId', projectController.deleteDeliverable)
