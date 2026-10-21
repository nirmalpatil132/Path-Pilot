import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js'
import { careerSlugParamSchema } from '../validators/careerValidators.js'
import * as careerFitService from '../services/careerFitService.js'

/**
 * GET /careers/fit
 * Retrieves the authenticated student's personalized career fit analysis across all careers.
 */
export async function getCareerFitOverviewHandler(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({ error: 'Unauthenticated session' })
  }

  const result = await careerFitService.getStudentCareerFitOverview(userId)
  return res.status(200).json(result)
}

/**
 * GET /careers/:slug/fit
 * Retrieves detailed career-fit scoring breakdown and 3-tier skill gaps for a specific career.
 */
export async function getCareerFitDetailHandler(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({ error: 'Unauthenticated session' })
  }

  const paramResult = careerSlugParamSchema.safeParse(req.params)
  if (!paramResult.success) {
    return res.status(400).json({
      error: 'Invalid career slug',
      details: paramResult.error.flatten().fieldErrors,
    })
  }

  const { slug } = paramResult.data
  const result = await careerFitService.getStudentCareerFitDetail(userId, slug)

  if (result.careerNotFound) {
    return res.status(404).json({ error: 'Career not found' })
  }

  return res.status(200).json(result)
}
