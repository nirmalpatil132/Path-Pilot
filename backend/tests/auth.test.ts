import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import bcrypt from 'bcryptjs'
import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

describe('PathPilot Authentication API', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.session.deleteMany({})
    await prisma.user.deleteMany({})
  })

  afterAll(async () => {
    await prisma.session.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.$disconnect()
  })

  describe('POST /auth/register', () => {
    it('successfully registers a new user with valid data and sets session cookie', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Rahul Sharma',
          email: 'rahul@college.edu',
          password: 'securePassword123!',
        })

      expect(res.status).toBe(201)
      expect(res.body.user).toBeDefined()
      expect(res.body.user.name).toBe('Rahul Sharma')
      expect(res.body.user.email).toBe('rahul@college.edu')
      expect(res.body.user.id).toBeDefined()
      // Password or hash must NEVER be returned in response
      expect(res.body.user.password).toBeUndefined()
      expect(res.body.user.passwordHash).toBeUndefined()

      // Session cookie must be set
      const cookies = res.headers['set-cookie']
      expect(cookies).toBeDefined()
      expect(cookies[0]).toMatch(/pp_session=/)
      expect(cookies[0]).toMatch(/HttpOnly/i)

      // Verify user in database
      const dbUser = await prisma.user.findUnique({
        where: { email: 'rahul@college.edu' },
      })
      expect(dbUser).not.toBeNull()
      // Password must be hashed in database
      expect(dbUser?.passwordHash).not.toBe('securePassword123!')
      const isHashValid = await bcrypt.compare('securePassword123!', dbUser!.passwordHash)
      expect(isHashValid).toBe(true)
    })

    it('rejects invalid registration data with detailed validation errors', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'A', // too short (< 2)
          email: 'not-an-email',
          password: 'short', // too short (< 8)
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Validation failed')
      expect(res.body.details).toBeDefined()
      expect(res.body.details.length).toBeGreaterThanOrEqual(3)
    })

    it('rejects duplicate email registration safely with 409 conflict', async () => {
      // First registration
      await request(app)
        .post('/auth/register')
        .send({
          name: 'First User',
          email: 'duplicate@test.com',
          password: 'password123',
        })

      // Duplicate registration with different casing/whitespace
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Second User',
          email: ' DUPLICATE@test.com ',
          password: 'password456',
        })

      expect(res.status).toBe(409)
      expect(res.body.error).toMatch(/already exists/i)
    })
  })

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await request(app)
        .post('/auth/register')
        .send({
          name: 'Test Student',
          email: 'student@test.com',
          password: 'validPassword123',
        })
    })

    it('successfully logs in with valid credentials and sets session cookie', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'student@test.com',
          password: 'validPassword123',
        })

      expect(res.status).toBe(200)
      expect(res.body.user).toBeDefined()
      expect(res.body.user.email).toBe('student@test.com')
      expect(res.body.user.passwordHash).toBeUndefined()

      const cookies = res.headers['set-cookie']
      expect(cookies).toBeDefined()
      expect(cookies[0]).toMatch(/pp_session=/)
      expect(cookies[0]).toMatch(/HttpOnly/i)
    })

    it('rejects invalid credentials with generic 401 error to prevent enumeration', async () => {
      // Wrong password
      const res1 = await request(app)
        .post('/auth/login')
        .send({
          email: 'student@test.com',
          password: 'wrongPassword',
        })

      expect(res1.status).toBe(401)
      expect(res1.body.error).toBe('Invalid email or password')

      // Non-existent user
      const res2 = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'anyPassword',
        })

      expect(res2.status).toBe(401)
      expect(res2.body.error).toBe('Invalid email or password')
    })
  })

  describe('GET /me and GET /auth/me', () => {
    it('returns current user profile when authenticated via session cookie', async () => {
      // Register
      const registerRes = await request(app)
        .post('/auth/register')
        .send({
          name: 'Aarti Patel',
          email: 'aarti@college.edu',
          password: 'password1234',
        })

      const cookie = registerRes.headers['set-cookie']

      // Query /me
      const meRes = await request(app).get('/me').set('Cookie', cookie)

      expect(meRes.status).toBe(200)
      expect(meRes.body.user).toBeDefined()
      expect(meRes.body.user.name).toBe('Aarti Patel')
      expect(meRes.body.user.email).toBe('aarti@college.edu')
      expect(meRes.body.user.passwordHash).toBeUndefined()

      // Also query /auth/me alias
      const authMeRes = await request(app).get('/auth/me').set('Cookie', cookie)
      expect(authMeRes.status).toBe(200)
      expect(authMeRes.body.user.email).toBe('aarti@college.edu')
    })

    it('rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/me')
      expect(res.status).toBe(401)
      expect(res.body.error).toBe('Unauthenticated')
    })

    it('rejects invalid session cookie with 401', async () => {
      const res = await request(app)
        .get('/me')
        .set('Cookie', ['pp_session=invalid-token-12345'])
      expect(res.status).toBe(401)
      expect(res.body.error).toMatch(/invalid/i)
    })
  })

  describe('POST /auth/logout', () => {
    it('invalidates the session in the database and clears the session cookie', async () => {
      // 1. Register user
      const registerRes = await request(app)
        .post('/auth/register')
        .send({
          name: 'Logout Test',
          email: 'logout@test.com',
          password: 'password123',
        })

      const cookie = registerRes.headers['set-cookie']

      // Verify authenticated
      const beforeLogout = await request(app).get('/me').set('Cookie', cookie)
      expect(beforeLogout.status).toBe(200)

      // 2. Logout
      const logoutRes = await request(app).post('/auth/logout').set('Cookie', cookie)
      expect(logoutRes.status).toBe(200)
      expect(logoutRes.body.message).toMatch(/logged out/i)

      // Cookie should be cleared (expired in past)
      const clearedCookies = logoutRes.headers['set-cookie']
      expect(clearedCookies).toBeDefined()
      expect(clearedCookies[0]).toMatch(/pp_session=;/)

      // 3. Attempting to use the old session cookie must now fail with 401
      const afterLogout = await request(app).get('/me').set('Cookie', cookie)
      expect(afterLogout.status).toBe(401)
    })
  })

  describe('Session isolation between different users', () => {
    it('keeps sessions completely separate for different users', async () => {
      // User 1
      const res1 = await request(app)
        .post('/auth/register')
        .send({
          name: 'User One',
          email: 'user1@test.com',
          password: 'password123',
        })
      const cookie1 = res1.headers['set-cookie']

      // User 2
      const res2 = await request(app)
        .post('/auth/register')
        .send({
          name: 'User Two',
          email: 'user2@test.com',
          password: 'password123',
        })
      const cookie2 = res2.headers['set-cookie']

      // Verify User 1 gets User 1's profile
      const me1 = await request(app).get('/me').set('Cookie', cookie1)
      expect(me1.body.user.email).toBe('user1@test.com')

      // Verify User 2 gets User 2's profile
      const me2 = await request(app).get('/me').set('Cookie', cookie2)
      expect(me2.body.user.email).toBe('user2@test.com')
    })
  })
})
