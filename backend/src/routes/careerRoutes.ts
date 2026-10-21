import { Router } from 'express'
import {
  listCareersHandler,
  getCareerBySlugHandler,
} from '../controllers/careerController.js'

export const careerRouter = Router()

careerRouter.get('/', listCareersHandler)
careerRouter.get('/:slug', getCareerBySlugHandler)
