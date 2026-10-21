import { z } from 'zod'

export const ExperienceTypeEnum = z.enum([
  'internship',
  'project',
  'freelance',
  'competition',
  'certification',
  'open_source',
  'other',
])

export const SkillProficiencyEnum = z.enum(['Beginner', 'Intermediate', 'Advanced'])

export const updateProfileSchema = z.object({
  currentStep: z.number().int().min(1).max(8).optional(),
  degree: z.string().trim().max(100).optional().nullable(),
  branch: z.string().trim().max(100).optional().nullable(),
  currentYear: z.string().trim().max(50).optional().nullable(),
  university: z.string().trim().max(150).optional().nullable(),
  college: z.string().trim().max(150).optional().nullable(),
  cgpa: z
    .union([z.number().min(0).max(10), z.string().transform((v) => (v === '' ? null : Number(v)))])
    .optional()
    .nullable(),
  academicContext: z.string().trim().max(1000).optional().nullable(),
  interests: z.array(z.string().trim().max(80)).max(30).optional().nullable(),
  primaryGoal: z.string().trim().max(80).optional().nullable(),
  secondaryGoals: z.array(z.string().trim().max(80)).max(20).optional().nullable(),
  preferredLocation: z.string().trim().max(120).optional().nullable(),
  workMode: z.string().trim().max(60).optional().nullable(),
  weeklyHours: z.string().trim().max(60).optional().nullable(),
  targetTimeline: z.string().trim().max(60).optional().nullable(),
  financialContext: z.string().trim().max(600).optional().nullable(),
})

export const skillItemSchema = z.object({
  name: z.string().trim().min(1, 'Skill name cannot be empty').max(80),
  proficiency: SkillProficiencyEnum.default('Intermediate'),
})

export const updateSkillsSchema = z.object({
  skills: z.array(skillItemSchema).max(50),
})

export const experienceItemSchema = z.object({
  id: z.string().optional(),
  type: ExperienceTypeEnum.default('project'),
  title: z.string().trim().min(1, 'Title cannot be empty').max(150),
  organization: z.string().trim().max(150).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  startDate: z.string().trim().max(60).optional().nullable(),
  endDate: z.string().trim().max(60).optional().nullable(),
  link: z.string().trim().max(500).optional().nullable(),
})

export const updateExperiencesSchema = z.object({
  experiences: z.array(experienceItemSchema).max(30),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type SkillItemInput = z.infer<typeof skillItemSchema>
export type ExperienceItemInput = z.infer<typeof experienceItemSchema>
