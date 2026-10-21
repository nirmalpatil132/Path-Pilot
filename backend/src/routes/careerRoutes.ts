import { Router } from 'express'
import {
  listCareersHandler,
  getCareerBySlugHandler,
} from '../controllers/careerController.js'
import {
  getCareerFitOverviewHandler,
  getCareerFitDetailHandler,
} from '../controllers/careerFitController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

export const careerRouter = Router()

// Public reference endpoints
careerRouter.get('/', listCareersHandler)

// Authenticated career fit endpoints (must precede /:slug to prevent slug collision)
careerRouter.get('/fit', requireAuth, getCareerFitOverviewHandler)

// Career detail and detailed fit analysis
careerRouter.get('/:slug/fit', requireAuth, getCareerFitDetailHandler)
careerRouter.get('/:slug', getCareerBySlugHandler)
