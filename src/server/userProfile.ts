import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/api/errors'
import type { updateUserProfileSchema } from '@/lib/schemas/userProfile'
import type { z } from 'zod'

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>

const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
  createdAt: true,
  dailyCalorieGoal: true,
  dailyProteinGoal: true,
  dailyCarbGoal: true,
  dailyFatGoal: true,
  weightUnit: true,
  heightUnit: true,
  goalsUpdatedAt: true,
  firstLoggedAt: true,
} as const

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PROFILE_SELECT,
  })

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  return user
}

export async function updateUserProfile(userId: string, input: UpdateUserProfileInput) {
  const isGoalUpdate =
    input.dailyCalorieGoal !== undefined ||
    input.dailyProteinGoal !== undefined ||
    input.dailyCarbGoal !== undefined ||
    input.dailyFatGoal !== undefined

  return prisma.user.update({
    where: { id: userId },
    data: {
      dailyCalorieGoal: input.dailyCalorieGoal,
      dailyProteinGoal: input.dailyProteinGoal,
      dailyCarbGoal: input.dailyCarbGoal,
      dailyFatGoal: input.dailyFatGoal,
      weightUnit: input.weightUnit,
      heightUnit: input.heightUnit,
      ...(isGoalUpdate && { goalsUpdatedAt: new Date() }),
    },
    select: PROFILE_SELECT,
  })
}
