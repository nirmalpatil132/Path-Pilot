import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import {
  getProfile,
  updateProfile,
  updateSkills,
  updateExperience,
  completeOnboarding,
} from '../controllers/profileController.js'

export const profileRouter = Router()

// All profile routes require an authenticated student session
profileRouter.use(requireAuth)

profileRouter.get('/', getProfile)
profileRouter.put('/', updateProfile)
profileRouter.put('/skills', updateSkills)
profileRouter.put('/experience', updateExperience)
profileRouter.put('/onboarding/complete', completeOnboarding)
