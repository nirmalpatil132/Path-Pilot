import { z } from 'zod'

export const listCareersQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, 'Search query must be under 100 characters')
    .optional(),
  category: z
    .string()
    .trim()
    .max(50, 'Category must be under 50 characters')
    .optional(),
})

export const careerSlugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Career slug is required')
    .regex(/^[a-z0-9-]+$/, 'Invalid career slug format'),
})
