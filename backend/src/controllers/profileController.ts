import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js'
import {
  ProfileError,
  getProfileByUserId,
  updateProfileByUserId,
  updateProfileSkills,
  updateProfileExperiences,
  completeStudentOnboarding,
} from '../services/profileService.js'
import {
  updateProfileSchema,
  updateSkillsSchema,
  updateExperiencesSchema,
} from '../validators/profileValidators.js'

export async function getProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id
    const profile = await getProfileByUserId(userId)
    res.status(200).json({ profile })
  } catch (err) {
    next(err)
  }
}

export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id
    const parseResult = updateProfileSchema.safeParse(req.body)

    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      })
      return
    }

    const updatedProfile = await updateProfileByUserId(userId, parseResult.data)
    res.status(200).json({ profile: updatedProfile })
  } catch (err) {
    if (err instanceof ProfileError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }
    next(err)
  }
}

export async function updateSkills(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id
    const parseResult = updateSkillsSchema.safeParse(req.body)

    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      })
      return
    }

    const skills = await updateProfileSkills(userId, parseResult.data.skills)
    res.status(200).json({ skills })
  } catch (err) {
    if (err instanceof ProfileError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }
    next(err)
  }
}

export async function updateExperience(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id
    const parseResult = updateExperiencesSchema.safeParse(req.body)

    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      })
      return
    }

    const experiences = await updateProfileExperiences(userId, parseResult.data.experiences)
    res.status(200).json({ experiences })
  } catch (err) {
    if (err instanceof ProfileError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }
    next(err)
  }
}

export async function completeOnboarding(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id
    const profile = await completeStudentOnboarding(userId)
    res.status(200).json({
      message: 'Onboarding completed successfully',
      profile,
    })
  } catch (err) {
    if (err instanceof ProfileError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }
    next(err)
  }
}
