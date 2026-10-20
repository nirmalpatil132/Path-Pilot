import type { Request, Response, NextFunction } from 'express'
import {
  AuthError,
  loginUser,
  logoutUser,
  registerUser,
} from '../services/authService.js'
import {
  extractSessionToken,
  type AuthenticatedRequest,
} from '../middleware/authMiddleware.js'

const COOKIE_NAME = 'pp_session'

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body
    const { user, sessionToken } = await registerUser({ name, email, password })

    res.cookie(COOKIE_NAME, sessionToken, getCookieOptions())
    res.status(201).json({ user })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body
    const { user, sessionToken } = await loginUser({ email, password })

    res.cookie(COOKIE_NAME, sessionToken, getCookieOptions())
    res.status(200).json({ user })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }
    next(err)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractSessionToken(req)
    if (token) {
      await logoutUser(token)
    }

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    res.status(200).json({ message: 'Logged out successfully' })
  } catch (err) {
    next(err)
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  res.status(200).json({ user: req.user })
}
