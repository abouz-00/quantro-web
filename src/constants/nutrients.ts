// src/constants/nutrients.ts
export const MICRONUTRIENT_DAILY_VALUES = {
  // B Vitamins
  vitaminB1: { value: 1.2, unit: 'mg' },
  vitaminB2: { value: 1.3, unit: 'mg' },
  vitaminB3: { value: 16, unit: 'mg' },
  vitaminB5: { value: 5, unit: 'mg' },
  vitaminB6: { value: 1.7, unit: 'mg' },
  vitaminB12: { value: 2.4, unit: 'μg' },
  biotin: { value: 30, unit: 'μg' },
  folate: { value: 400, unit: 'μg' },

  // Fat-Soluble Vitamins
  vitaminA: { value: 900, unit: 'μg' },
  vitaminC: { value: 90, unit: 'mg' },
  vitaminD: { value: 20, unit: 'μg' },
  vitaminK: { value: 120, unit: 'μg' },

  // Minerals
  calcium: { value: 1000, unit: 'mg' },
  copper: { value: 0.9, unit: 'mg' },
  iron: { value: 8, unit: 'mg' },
  magnesium: { value: 400, unit: 'mg' },
  manganese: { value: 2.3, unit: 'mg' },
  phosphorus: { value: 700, unit: 'mg' },
  potassium: { value: 3500, unit: 'mg' },
  selenium: { value: 55, unit: 'μg' },
  sodium: { value: 2300, unit: 'mg' },
  zinc: { value: 11, unit: 'mg' },

  // Essential Fatty Acids
  omega3: { value: 1.6, unit: 'g' },

  // Macronutrients (for completeness)
  fiber: { value: 25, unit: 'g' },
} as const;

export type MicronutrientKey = keyof typeof MICRONUTRIENT_DAILY_VALUES;
