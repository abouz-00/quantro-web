import { FoodEntry, MacroNutrients as Nutrients, AllNutrients } from '../types/foodEntry';

/**
 * Calculates totals for a collection of food entries (macronutrients only)
 */
export const calculateTotals = (entries: FoodEntry[]): Nutrients => {
  const result = entries.reduce((acc, entry) => ({
    calories: acc.calories + (entry.calories || 0),
    protein: acc.protein + (entry.protein || 0),
    carbs: acc.carbs + (entry.carbs || 0),
    fat: acc.fat + (entry.fat || 0),
  }), {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  // Round to one decimal place
  return {
    calories: Math.round(result.calories * 10) / 10,
    protein: Math.round(result.protein * 10) / 10,
    carbs: Math.round(result.carbs * 10) / 10,
    fat: Math.round(result.fat * 10) / 10,
  };
};

/**
 * Calculates totals for all nutrients (macro + micro) for a collection of food entries
 */
export const calculateAllNutrientTotals = (entries: FoodEntry[]): AllNutrients => {
  const result = entries.reduce((acc, entry) => ({
    // Macronutrients
    calories: acc.calories + (entry.calories || 0),
    protein: acc.protein + (entry.protein || 0),
    carbs: acc.carbs + (entry.carbs || 0),
    fat: acc.fat + (entry.fat || 0),
    fiber: acc.fiber + (entry.fiber || 0),
    
    // Micronutrients - B Vitamins
    vitaminB1: acc.vitaminB1 + (entry.vitaminB1 || 0),
    vitaminB2: acc.vitaminB2 + (entry.vitaminB2 || 0),
    vitaminB3: acc.vitaminB3 + (entry.vitaminB3 || 0),
    vitaminB5: acc.vitaminB5 + (entry.vitaminB5 || 0),
    vitaminB6: acc.vitaminB6 + (entry.vitaminB6 || 0),
    vitaminB12: acc.vitaminB12 + (entry.vitaminB12 || 0),
    biotin: acc.biotin + (entry.biotin || 0),
    folate: acc.folate + (entry.folate || 0),
    
    // Fat-Soluble Vitamins
    vitaminA: acc.vitaminA + (entry.vitaminA || 0),
    vitaminC: acc.vitaminC + (entry.vitaminC || 0),
    vitaminD: acc.vitaminD + (entry.vitaminD || 0),
    vitaminK: acc.vitaminK + (entry.vitaminK || 0),
    
    // Minerals
    calcium: acc.calcium + (entry.calcium || 0),
    copper: acc.copper + (entry.copper || 0),
    iron: acc.iron + (entry.iron || 0),
    magnesium: acc.magnesium + (entry.magnesium || 0),
    manganese: acc.manganese + (entry.manganese || 0),
    phosphorus: acc.phosphorus + (entry.phosphorus || 0),
    potassium: acc.potassium + (entry.potassium || 0),
    selenium: acc.selenium + (entry.selenium || 0),
    sodium: acc.sodium + (entry.sodium || 0),
    zinc: acc.zinc + (entry.zinc || 0),
    
    // Essential Fatty Acids
    omega3: acc.omega3 + (entry.omega3 || 0),
  }), {
    // Initialize with zeros
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
    vitaminB1: 0, vitaminB2: 0, vitaminB3: 0, vitaminB5: 0, vitaminB6: 0, vitaminB12: 0,
    biotin: 0, folate: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminK: 0,
    calcium: 0, copper: 0, iron: 0, magnesium: 0, manganese: 0, phosphorus: 0,
    potassium: 0, selenium: 0, sodium: 0, zinc: 0, omega3: 0,
  });

  // Round all values to appropriate decimal places
  const roundedResult: AllNutrients = {} as AllNutrients;
  
  for (const [key, value] of Object.entries(result)) {
    // Round to 1 decimal place for most nutrients, but use 2 for very small amounts (μg nutrients)
    const decimalPlaces = ['vitaminB12', 'biotin', 'folate', 'vitaminA', 'vitaminD', 'vitaminK', 'selenium'].includes(key) ? 2 : 1;
    (roundedResult as unknown as Record<string, number>)[key] = Math.round(value * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
  }
  
  return roundedResult;
};

/**
 * Transforms API data to frontend FoodEntry format
 */
interface ApiData {
  id: string;
  foodName: string;
  brand?: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  createdAt?: string;
  date?: string;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack" | "other";
}

export const transformApiDataToFoodEntry = (apiData: ApiData): FoodEntry => {
  return {
    id: apiData.id,
    description: apiData.foodName + (apiData.brand ? ` (${apiData.brand})` : ''),
    amount: apiData.quantity.toString(),
    unit: apiData.unit,
    date: apiData.date ? new Date(apiData.date).toISOString() : new Date().toISOString(), // Keep full DateTime
    mealType: apiData.mealType || "other",
    calories: apiData.calories,
    protein: apiData.protein,
    carbs: apiData.carbs,
    fat: apiData.fat,
    fiber: apiData.fiber || 0,
  };
};

/**
 * Transforms FoodEntry to API format for saving
 */
export const transformFoodEntryToApiData = (entry: FoodEntry) => {
  return {
    foodName: entry.description.split(' (')[0], // Extract food name before brand
    brand: entry.description.includes(' (') ? entry.description.split(' (')[1].replace(')', '') : null,
    quantity: parseFloat(entry.amount),
    unit: entry.unit,
    mealType: entry.mealType,
    calories: entry.calories,
    protein: entry.protein,
    carbs: entry.carbs,
    fat: entry.fat,
    fiber: entry.fiber || 0,
    sodium: entry.sodium || 0,
    date: entry.date, // Include the date from the entry
  };
};
