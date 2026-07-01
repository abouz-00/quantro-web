import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/api/errors'
import type { createFoodLogSchema, updateFoodLogSchema } from '@/lib/schemas/foodLog'
import type { z } from 'zod'

/**
 * Server-side data/business layer for food logs. Route handlers
 * (`src/app/api/food-logs/**`) stay thin HTTP adapters — parsing the
 * request, calling into here, and shaping the response — while ownership
 * checks, date-range math, and Prisma access live in one testable place
 * instead of being duplicated inline across GET/POST/PUT/DELETE handlers.
 */

export type CreateFoodLogInput = z.infer<typeof createFoodLogSchema>
export type UpdateFoodLogInput = z.infer<typeof updateFoodLogSchema>

function dayRange(date: Date): { gte: Date; lte: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
  return { gte: start, lte: end }
}

export async function getFoodLogsForUser(userId: string, dateParam: string | null) {
  const whereClause: { userId: string; date?: { gte: Date; lte: Date } } = { userId }

  if (dateParam) {
    // Parse YYYY-MM-DD as local date components to avoid a UTC-shift giving
    // the wrong local day for timezones west of UTC.
    const [year, month, day] = dateParam.split('-').map(Number)
    whereClause.date = dayRange(new Date(year, month - 1, day))
  }

  return prisma.foodLog.findMany({
    where: whereClause,
    orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
  })
}

export async function createFoodLogForUser(userId: string, input: CreateFoodLogInput) {
  const targetDate = input.date ? new Date(input.date) : new Date()
  const queryDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())

  const lastEntryInMeal = await prisma.foodLog.findFirst({
    where: {
      userId,
      mealType: input.mealType,
      date: dayRange(queryDate),
    },
    orderBy: { orderIndex: 'desc' },
  })

  const nextOrderIndex =
    lastEntryInMeal && lastEntryInMeal.orderIndex !== null ? lastEntryInMeal.orderIndex + 1 : 0

  const foodLog = await prisma.foodLog.create({
    data: {
      userId,
      foodName: input.foodName,
      brand: input.brand,
      quantity: input.quantity,
      unit: input.unit,
      mealType: input.mealType,
      calories: input.calories,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
      fiber: input.fiber || 0,
      sodium: input.sodium || 0,
      date: targetDate,
      orderIndex: nextOrderIndex,
      vitaminB1: input.vitaminB1 || null,
      vitaminB2: input.vitaminB2 || null,
      vitaminB3: input.vitaminB3 || null,
      vitaminB5: input.vitaminB5 || null,
      vitaminB6: input.vitaminB6 || null,
      vitaminB12: input.vitaminB12 || null,
      biotin: input.biotin || null,
      folate: input.folate || null,
      vitaminA: input.vitaminA || null,
      vitaminC: input.vitaminC || null,
      vitaminD: input.vitaminD || null,
      vitaminK: input.vitaminK || null,
      calcium: input.calcium || null,
      copper: input.copper || null,
      iron: input.iron || null,
      magnesium: input.magnesium || null,
      manganese: input.manganese || null,
      phosphorus: input.phosphorus || null,
      potassium: input.potassium || null,
      selenium: input.selenium || null,
      zinc: input.zinc || null,
      omega3: input.omega3 || null,
    },
  })

  // Best-effort — a failure here shouldn't fail the food log creation itself.
  try {
    await prisma.user.updateMany({
      where: { id: userId, firstLoggedAt: null },
      data: { firstLoggedAt: new Date() },
    })
  } catch (error) {
    console.error('Failed to set firstLoggedAt:', error)
  }

  return foodLog
}

export async function updateFoodLogForUser(userId: string, input: UpdateFoodLogInput) {
  const { id, ...fields } = input

  const existing = await prisma.foodLog.findFirst({ where: { id, userId } })
  if (!existing) {
    throw new ApiError(404, 'Food log not found')
  }

  const data: Record<string, unknown> = { updatedAt: new Date() }
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) data[key] = value
  }

  return prisma.foodLog.update({ where: { id }, data })
}

export async function deleteFoodLogForUser(userId: string, id: string) {
  const existing = await prisma.foodLog.findFirst({ where: { id, userId } })
  if (!existing) {
    throw new ApiError(404, 'Food log not found')
  }

  await prisma.foodLog.delete({ where: { id } })
}

export async function reorderFoodLogsForUser(userId: string, entryIds: string[]) {
  const existingEntries = await prisma.foodLog.findMany({
    where: { id: { in: entryIds }, userId },
  })

  if (existingEntries.length !== entryIds.length) {
    throw new ApiError(404, 'Some entries not found or unauthorized')
  }

  await Promise.all(
    entryIds.map((id, index) => prisma.foodLog.update({ where: { id }, data: { orderIndex: index } }))
  )
}
