import { FoodEntry, Nutrients } from '../types/food';

/**
 * Calculates totals for a collection of food entries
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
    date: apiData.date || new Date().toISOString().split('T')[0], // Default to today if no date
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
  };
};
