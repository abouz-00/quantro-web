import { FoodEntry, Nutrients } from '../types/food';

/**
 * Calculates totals for a collection of food entries
 */
export const calculateTotals = (entries: FoodEntry[]): Nutrients => {
  return entries.reduce((acc, entry) => ({
    calories: acc.calories + entry.calories,
    protein: acc.protein + entry.protein,
    carbs: acc.carbs + entry.carbs,
    fat: acc.fat + entry.fat,
  }), {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
};

/**
 * Transforms API data to frontend FoodEntry format
 */
export const transformApiDataToFoodEntry = (apiData: any): FoodEntry => {
  return {
    id: apiData.id,
    description: apiData.foodName + (apiData.brand ? ` (${apiData.brand})` : ''),
    amount: apiData.quantity.toString(),
    unit: apiData.unit,
    date: apiData.date,
    mealType: apiData.mealType,
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
