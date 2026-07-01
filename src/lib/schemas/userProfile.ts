import { z } from 'zod'

export const updateUserProfileSchema = z.object({
  dailyCalorieGoal: z.number().int().min(0).max(20_000).optional(),
  dailyProteinGoal: z.number().finite().min(0).max(2_000).optional(),
  dailyCarbGoal: z.number().finite().min(0).max(2_000).optional(),
  dailyFatGoal: z.number().finite().min(0).max(2_000).optional(),
  weightUnit: z.enum(['lbs', 'kg']).optional(),
  heightUnit: z.enum(['ft', 'cm']).optional(),
})
