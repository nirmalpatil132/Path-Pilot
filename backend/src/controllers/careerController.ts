import type { Request, Response } from 'express'
import {
  listCareersQuerySchema,
  careerSlugParamSchema,
} from '../validators/careerValidators.js'
import * as careerService from '../services/careerService.js'

/**
 * GET /careers
 * Retrieves available careers with optional search and category filters.
 * Publicly accessible reference endpoint.
 */
export async function listCareersHandler(req: Request, res: Response) {
  const queryResult = listCareersQuerySchema.safeParse(req.query)
  if (!queryResult.success) {
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: queryResult.error.flatten().fieldErrors,
    })
  }

  const { search, category } = queryResult.data
  const result = await careerService.listCareers({ search, category })
  return res.status(200).json(result)
}

/**
 * GET /careers/:slug
 * Retrieves complete career details by stable identifier/slug.
 * Publicly accessible reference endpoint.
 */
export async function getCareerBySlugHandler(req: Request, res: Response) {
  const paramResult = careerSlugParamSchema.safeParse(req.params)
  if (!paramResult.success) {
    return res.status(400).json({
      error: 'Invalid career slug',
      details: paramResult.error.flatten().fieldErrors,
    })
  }

  const { slug } = paramResult.data
  const career = await careerService.getCareerBySlug(slug)

  if (!career) {
    return res.status(404).json({
      error: 'Career not found',
    })
  }

  return res.status(200).json({ career })
}
