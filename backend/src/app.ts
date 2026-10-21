import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Request, type Response, type NextFunction } from 'express'
import { config } from './config/env.js'
import { getMe } from './controllers/authController.js'
import { requireAuth } from './middleware/authMiddleware.js'
import { authRouter } from './routes/authRoutes.js'
import { careerRouter } from './routes/careerRoutes.js'
import { profileRouter } from './routes/profileRoutes.js'
import { roadmapRouter } from './routes/roadmapRoutes.js'

export const app = express()

// Security & Parsing
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
)
app.use(cookieParser())
app.use(express.json())

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Auth routes (/auth/register, /auth/login, /auth/logout, /auth/me)
app.use('/auth', authRouter)

// Profile routes (/profile, /profile/skills, /profile/experience, /profile/onboarding/complete)
app.use('/profile', profileRouter)

// Career catalog routes (/careers, /careers/:slug)
app.use('/careers', careerRouter)

// Roadmap routes (/roadmap/generate, /roadmap/current, /roadmap/regenerate, /roadmap/tasks/:taskId)
app.use('/roadmap', roadmapRouter)

// Direct /me route support matching root specification
app.get('/me', requireAuth, getMe)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Never leak error stacks or internal details in production
  const isDev = config.nodeEnv !== 'production'
  const message = isDev ? err.message : 'Internal server error'
  res.status(500).json({
    error: message,
    ...(isDev && err.stack ? { stack: err.stack } : {}),
  })
})
