import type { NextFunction, Request, Response } from 'express'
import { ZodError, type ZodSchema } from 'zod'

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        }))
        res.status(400).json({
          error: 'Validation failed',
          details: issues,
        })
        return
      }
      next(err)
    }
  }
}
