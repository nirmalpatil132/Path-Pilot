import { Router } from 'express'
import { z } from 'zod'
import { getMe, login, logout, register } from '../controllers/authController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import { validateBody } from '../middleware/validate.js'

export const authRouter = Router()

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be under 128 characters'),
})

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

authRouter.post('/register', authLimiter, validateBody(registerSchema), register)
authRouter.post('/login', authLimiter, validateBody(loginSchema), login)
authRouter.post('/logout', logout)
authRouter.get('/me', requireAuth, getMe)
