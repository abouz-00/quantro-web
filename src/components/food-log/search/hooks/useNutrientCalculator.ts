import { v4 as uuidv4 } from "uuid";
import { FoodEntry } from "../../../../types/foodEntry";
import { UNIT_CONVERSIONS, roundNutrients, getFallbackNutrients } from "../utils/nutritionUtils";

interface USDAFood {
  description: string;
  foodCategory?: string;
  foodNutrients: { nutrientName: string; value: number }[];
  servingSize?: number;
  servingSizeUnit?: string;
  isFavorite?: boolean;
  uniqueId?: string;
}

export const useNutrientCalculator = () => {
  const findNutrient = (foodNutrients: { nutrientName: string; value: number }[], name: string): number => {
    const nutrient = foodNutrients.find(n => 
      n.nutrientName.toLowerCase().includes(name.toLowerCase())
    );
    return nutrient ? nutrient.value : 0;
  };

  const calculateNutrients = (selectedFood: USDAFood, quantity: string, unit: string) => {
    // Get nutrient values from USDA data
    const nutrients = {
      calories: findNutrient(selectedFood.foodNutrients, "energy"),
      protein: findNutrient(selectedFood.foodNutrients, "protein"),
      carbs: findNutrient(selectedFood.foodNutrients, "carbohydrate"),
      fat: findNutrient(selectedFood.foodNutrients, "total lipid (fat)"),
      fiber: findNutrient(selectedFood.foodNutrients, "fiber"),
      
      // B Vitamins
      vitaminB1: findNutrient(selectedFood.foodNutrients, "thiamine"),
      vitaminB2: findNutrient(selectedFood.foodNutrients, "riboflavin"),
      vitaminB3: findNutrient(selectedFood.foodNutrients, "niacin"),
      vitaminB5: findNutrient(selectedFood.foodNutrients, "pantothenic acid"),
      vitaminB6: findNutrient(selectedFood.foodNutrients, "vitamin b-6"),
      vitaminB12: findNutrient(selectedFood.foodNutrients, "vitamin b-12"),
      biotin: findNutrient(selectedFood.foodNutrients, "biotin"),
      folate: findNutrient(selectedFood.foodNutrients, "folate"),
      
      // Fat-Soluble Vitamins
      vitaminA: findNutrient(selectedFood.foodNutrients, "vitamin a, rae"),
      vitaminC: findNutrient(selectedFood.foodNutrients, "vitamin c, total ascorbic acid"),
      vitaminD: findNutrient(selectedFood.foodNutrients, "vitamin d (d2 + d3)"),
      vitaminK: findNutrient(selectedFood.foodNutrients, "vitamin k (phylloquinone)"),
      
      // Minerals
      calcium: findNutrient(selectedFood.foodNutrients, "calcium"),
      copper: findNutrient(selectedFood.foodNutrients, "copper"),
      iron: findNutrient(selectedFood.foodNutrients, "iron"),
      magnesium: findNutrient(selectedFood.foodNutrients, "magnesium"),
      manganese: findNutrient(selectedFood.foodNutrients, "manganese"),
      phosphorus: findNutrient(selectedFood.foodNutrients, "phosphorus"),
      potassium: findNutrient(selectedFood.foodNutrients, "potassium"),
      selenium: findNutrient(selectedFood.foodNutrients, "selenium"),
      sodium: findNutrient(selectedFood.foodNutrients, "sodium"),
      zinc: findNutrient(selectedFood.foodNutrients, "zinc"),
      
      // Essential Fatty Acids
      omega3: findNutrient(selectedFood.foodNutrients, "epa") + 
              findNutrient(selectedFood.foodNutrients, "dha") + 
              findNutrient(selectedFood.foodNutrients, "ala"),
    };

    // Apply fallback nutrients if needed
    const fallbackNutrients = getFallbackNutrients(selectedFood.description);
    if (fallbackNutrients && nutrients.calories <= 0) {
      Object.assign(nutrients, fallbackNutrients);
    }

    // Calculate serving adjustment with unit conversion
    let servingSizeInGrams = parseFloat(quantity) || 0;
    
    if (unit !== "Grams") {
      const conversionFactor = UNIT_CONVERSIONS[unit as keyof typeof UNIT_CONVERSIONS] || 1;
      servingSizeInGrams = servingSizeInGrams * conversionFactor;
    }
    
    const servingMultiplier = servingSizeInGrams / 100; // Base is 100g
    
    // Apply serving multiplier to all nutrients
    const adjustedNutrients: Record<string, number> = {};
    Object.entries(nutrients).forEach(([key, value]) => {
      adjustedNutrients[key] = (value || 0) * servingMultiplier;
    });

    return roundNutrients(adjustedNutrients);
  };

  const createFoodEntry = (
    selectedFood: USDAFood, 
    quantity: string, 
    unit: string, 
    selectedDate: Date
  ): FoodEntry => {
    const nutrients = calculateNutrients(selectedFood, quantity, unit);
    
    return {
      id: uuidv4(),
      description: selectedFood.description,
      amount: quantity,
      unit: unit,
      date: selectedDate.toISOString(),
      mealType: "other",
      ...nutrients,
    } as FoodEntry;
  };

  return { createFoodEntry };
};
