import type { NextFunction, Request, Response } from 'express'
import { getUserFromSession, type PublicUser } from '../services/authService.js'

export interface AuthenticatedRequest extends Request {
  user?: PublicUser
  sessionToken?: string
}

export function extractSessionToken(req: Request): string | null {
  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies.pp_session) {
    return req.cookies.pp_session
  }

  // 2. Fallback to Bearer token in Authorization header
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim()
  }

  return null
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractSessionToken(req)

  if (!token) {
    res.status(401).json({ error: 'Unauthenticated' })
    return
  }

  const user = await getUserFromSession(token)

  if (!user) {
    // Clear invalid or expired cookie
    res.clearCookie('pp_session', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
    res.status(401).json({ error: 'Session expired or invalid' })
    return
  }

  req.user = user
  req.sessionToken = token
  next()
}
