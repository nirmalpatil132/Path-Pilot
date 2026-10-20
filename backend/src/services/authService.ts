import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'

const BCRYPT_SALT_ROUNDS = 12
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface PublicUser {
  id: string
  name: string
  email: string
  createdAt: Date
}

export class AuthError extends Error {
  statusCode: number
  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AuthError'
  }
}

export async function registerUser(input: {
  name: string
  email: string
  password: string
}): Promise<{ user: PublicUser; sessionToken: string }> {
  const normalizedEmail = input.email.trim().toLowerCase()
  const trimmedName = input.name.trim()

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (existingUser) {
    throw new AuthError('An account with this email already exists', 409)
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })

  const sessionToken = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  await prisma.session.create({
    data: {
      token: sessionToken,
      userId: user.id,
      expiresAt,
    },
  })

  return { user, sessionToken }
}

export async function loginUser(input: {
  email: string
  password: string
}): Promise<{ user: PublicUser; sessionToken: string }> {
  const normalizedEmail = input.email.trim().toLowerCase()

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (!user) {
    // Generic error to prevent email enumeration
    throw new AuthError('Invalid email or password', 401)
  }

  const passwordValid = await bcrypt.compare(input.password, user.passwordHash)

  if (!passwordValid) {
    throw new AuthError('Invalid email or password', 401)
  }

  const sessionToken = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  await prisma.session.create({
    data: {
      token: sessionToken,
      userId: user.id,
      expiresAt,
    },
  })

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    sessionToken,
  }
}

export async function logoutUser(sessionToken: string): Promise<void> {
  if (!sessionToken) return
  await prisma.session.deleteMany({
    where: { token: sessionToken },
  })
}

export async function getUserFromSession(sessionToken: string): Promise<PublicUser | null> {
  if (!sessionToken) return null

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
    },
  })

  if (!session) return null

  if (session.expiresAt.getTime() <= Date.now()) {
    // Session expired: clean it up
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
    return null
  }

  return session.user
}
