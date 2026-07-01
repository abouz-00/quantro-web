import { z } from 'zod'

export const mealTypeEnum = z.enum(['breakfast', 'lunch', 'dinner', 'snack'])

// Generous but bounded — enough headroom for legitimate extreme entries
// (e.g. a whole cake, a day's meal prep) while rejecting garbage/overflow
// values that would otherwise be written straight to the database.
const nutrientAmount = z.number().finite().min(0).max(100_000)
const optionalNutrientAmount = nutrientAmount.nullable().optional()

const micronutrientShape = {
  vitaminB1: optionalNutrientAmount,
  vitaminB2: optionalNutrientAmount,
  vitaminB3: optionalNutrientAmount,
  vitaminB5: optionalNutrientAmount,
  vitaminB6: optionalNutrientAmount,
  vitaminB12: optionalNutrientAmount,
  biotin: optionalNutrientAmount,
  folate: optionalNutrientAmount,
  vitaminA: optionalNutrientAmount,
  vitaminC: optionalNutrientAmount,
  vitaminD: optionalNutrientAmount,
  vitaminK: optionalNutrientAmount,
  calcium: optionalNutrientAmount,
  copper: optionalNutrientAmount,
  iron: optionalNutrientAmount,
  magnesium: optionalNutrientAmount,
  manganese: optionalNutrientAmount,
  phosphorus: optionalNutrientAmount,
  potassium: optionalNutrientAmount,
  selenium: optionalNutrientAmount,
  zinc: optionalNutrientAmount,
  omega3: optionalNutrientAmount,
}

const dateField = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Invalid date' })
  .optional()

export const createFoodLogSchema = z.object({
  foodName: z.string().trim().min(1, 'foodName is required').max(300),
  brand: z.string().trim().max(300).nullable().optional(),
  quantity: z.number().finite().positive().max(100_000),
  unit: z.string().trim().min(1, 'unit is required').max(50),
  mealType: mealTypeEnum,
  calories: nutrientAmount,
  protein: nutrientAmount,
  carbs: nutrientAmount,
  fat: nutrientAmount,
  fiber: optionalNutrientAmount,
  sodium: optionalNutrientAmount,
  date: dateField,
  ...micronutrientShape,
})

export const updateFoodLogSchema = z.object({
  id: z.string().min(1, 'id is required'),
  quantity: z.number().finite().positive().max(100_000).optional(),
  calories: nutrientAmount.optional(),
  protein: nutrientAmount.optional(),
  carbs: nutrientAmount.optional(),
  fat: nutrientAmount.optional(),
  mealType: mealTypeEnum.optional(),
  orderIndex: z.number().int().min(0).max(10_000).optional(),
  ...micronutrientShape,
})

export const reorderFoodLogSchema = z.object({
  entryIds: z.array(z.string().min(1)).min(1).max(500),
})
