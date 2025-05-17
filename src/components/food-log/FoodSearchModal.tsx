"use client";

import { useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { HiPlus } from "react-icons/hi";

interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface FoodEntry extends Nutrients {
  id: string;
  description: string;
  amount: string;
  unit: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
}

interface USDAFood {
  description: string;
  foodCategory?: string;
  foodNutrients: { nutrientName: string; value: number }[];
  servingSize?: number;
  servingSizeUnit?: string;
}

interface FoodSearchModalProps {
  onClose: () => void;
  onAddFood: (entry: FoodEntry) => void;
  selectedDate: Date;
  recentFoods: USDAFood[];
}

export default function FoodSearchModal({ onClose, onAddFood, selectedDate, recentFoods }: FoodSearchModalProps) {
  const [localQuery, setLocalQuery] = useState("");
  const [suggestions, setSuggestions] = useState<USDAFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<USDAFood | null>(null);
  const [quantity, setQuantity] = useState<string>("100");
  const [unit, setUnit] = useState("Serving");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const UNIT_CONVERSIONS = {
    Ounces: 28.3495,
    Cup: 236.588,
    Tablespoon: 14.7868,
    Teaspoon: 4.92892,
    Milliliter: 1,
    Grams: 1,
  } as const;

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!localQuery) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_USDA_API_KEY;
        const res = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?query=${localQuery}&pageSize=10&api_key=${apiKey}`
        );
        const data = await res.json();
        setSuggestions(data.foods || []);
      } catch (error) {
        console.error('Failed to fetch foods:', error);
        setError('Failed to fetch food data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [localQuery]);

  const handleSelectFood = (food: USDAFood) => {
    setSelectedFood(food);
    setQuantity("100");
    setUnit(food.servingSizeUnit || "Serving");
  };

  const handleAddFood = () => {
    if (!selectedFood) return;
    
    // Convert quantity to grams based on unit selection
    let amountInGrams = Number(quantity) || 0;
    if (unit in UNIT_CONVERSIONS) {
      amountInGrams = (Number(quantity) || 0) * UNIT_CONVERSIONS[unit as keyof typeof UNIT_CONVERSIONS];
    } else if (unit === "Serving" && selectedFood.servingSize) {
      amountInGrams = (Number(quantity) || 0) * selectedFood.servingSize;
    }

    // Get base values per 100g
    const baseNutrients = selectedFood.foodNutrients.reduce(
      (acc: Nutrients, n: { nutrientName: string; value: number }) => {
        if (n.nutrientName === "Energy") acc.calories = n.value;
        if (n.nutrientName === "Protein") acc.protein = n.value;
        if (n.nutrientName === "Carbohydrate, by difference") acc.carbs = n.value;
        if (n.nutrientName === "Total lipid (fat)") acc.fat = n.value;
        if (n.nutrientName === "Fiber, total dietary") acc.fiber = n.value;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Calculate adjusted values based on amount in grams
    const entry: FoodEntry = {
      id: uuidv4(),
      description: selectedFood.description,
      amount: quantity,
      unit,
      calories: (baseNutrients.calories * amountInGrams) / 100,
      protein: (baseNutrients.protein * amountInGrams) / 100,
      carbs: (baseNutrients.carbs * amountInGrams) / 100,
      fat: (baseNutrients.fat * amountInGrams) / 100,
      fiber: baseNutrients.fiber ? (baseNutrients.fiber * amountInGrams) / 100 : undefined,
      date: selectedDate.toISOString(),
      mealType
    };

    onAddFood(entry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-500/70" onClick={onClose}></div>
      <div
        className="bg-white rounded-lg p-8 shadow-xl z-10 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto
                   transform transition-all duration-300 ease-out animate-modalIn"
      >
        {!selectedFood ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Food Search</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                Close
              </button>
            </div>

            {recentFoods.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Recent Foods</h3>
                <div className="flex flex-wrap gap-2">
                  {recentFoods.map((food, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectFood(food)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      {food.description}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Input
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search food..."
              className="mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
              }}
            />

            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2">Searching...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-500">
                {error}
              </div>
            )}

            {!isLoading && !error && suggestions.length === 0 && localQuery && (
              <div className="text-center py-8 text-gray-500">
                No foods found. Try a different search term.
              </div>
            )}

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {suggestions.map((food, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectFood(food)}
                  className="p-3 border rounded-lg shadow-sm cursor-pointer hover:bg-gray-50"
                >
                  <div className="font-bold">{food.description}</div>
                  {food.foodCategory && (
                    <div className="text-xs text-gray-500 mb-2">{food.foodCategory}</div>
                  )}
                  <div className="flex space-x-2 mt-2">
                    <span className="text-xs bg-[#6E44FF] text-white rounded-full px-2 py-1">
                      {Number((food.foodNutrients.find(n => n.nutrientName === "Energy")?.value || 0).toFixed(1))} cal
                    </span>
                    <span className="text-xs bg-[#7EE081] text-white rounded-full px-2 py-1">
                      P: {Number((food.foodNutrients.find(n => n.nutrientName === "Protein")?.value || 0).toFixed(1))}g
                    </span>
                    <span className="text-xs bg-[#F0E15B] text-black rounded-full px-2 py-1">
                      C: {Number((food.foodNutrients.find(n => n.nutrientName === "Carbohydrate, by difference")?.value || 0).toFixed(1))}g
                    </span>
                    <span className="text-xs bg-[#E55640] text-white rounded-full px-2 py-1">
                      F: {Number((food.foodNutrients.find(n => n.nutrientName === "Total lipid (fat)")?.value || 0).toFixed(1))}g
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nutrition Facts</h2>
              <button onClick={() => setSelectedFood(null)} className="text-gray-500 hover:text-gray-700">
                Back
              </button>
            </div>
            <div className="mb-2">
              <div className="font-bold">{selectedFood.description}</div>
              {selectedFood.foodCategory && (
                <div className="text-xs text-gray-500">{selectedFood.foodCategory}</div>
              )}
            </div>
            <div className="space-y-1 mb-4 text-sm">
              <div>
                Calories: {Number((selectedFood.foodNutrients.find(n => n.nutrientName === "Energy")?.value || 0).toFixed(1))}
              </div>
              <div>
                Protein: {Number((selectedFood.foodNutrients.find(n => n.nutrientName === "Protein")?.value || 0).toFixed(1))} g
              </div>
              <div>
                Carbs: {Number((selectedFood.foodNutrients.find(n => n.nutrientName === "Carbohydrate, by difference")?.value || 0).toFixed(1))} g
              </div>
              <div>
                Fat: {Number((selectedFood.foodNutrients.find(n => n.nutrientName === "Total lipid (fat)")?.value || 0).toFixed(1))} g
              </div>
              <div>
                Fiber: {Number((selectedFood.foodNutrients.find(n => n.nutrientName === "Fiber, total dietary")?.value || 0).toFixed(1))} g
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium">Meal</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as any)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                min="0"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              >
                {[
                  "Serving",
                  "Grams",
                  "Ounces",
                  "Cup",
                  "Tablespoon",
                  "Teaspoon",
                  "Milliliter",
                ].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {selectedFood.servingSize && selectedFood.servingSizeUnit
                ? `1 serving = ${selectedFood.servingSize}${selectedFood.servingSizeUnit.toLowerCase()}`
                : `Base unit = 100g`}
            </div>
            <Button onClick={handleAddFood} className="bg-[#6E44FF] hover:bg-[#6E44FF]/90 text-white">
              Add to Log
            </Button>
          </>
        )}
      </div>
    </div>
  );
}