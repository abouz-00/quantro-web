"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { FaTrash } from "react-icons/fa";
import { HiPlus } from "react-icons/hi";

// Types for nutrients, food entry, and USDA food suggestion (extended)
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
  date: string; // Add this
}

interface USDAFood {
  description: string;
  foodCategory?: string;
  foodNutrients: { nutrientName: string; value: number }[];
  servingSize?: number;
  servingSizeUnit?: string;
}

// ProgressBar component displays a horizontal bar with formatted values
interface ProgressBarProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}

function ProgressBar({ label, current, goal, unit, color }: ProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>
          {Number(current.toFixed(1))} / {Number(goal.toFixed(1))} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

// FoodSearchModal: a centered modal for searching/selecting food.
interface FoodSearchModalProps {
  onClose: () => void;
  onAddFood: (entry: FoodEntry) => void;
}

function FoodSearchModal({ onClose, onAddFood }: FoodSearchModalProps) {
  const [localQuery, setLocalQuery] = useState("");
  const [suggestions, setSuggestions] = useState<USDAFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<USDAFood | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState("Serving");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError('Failed to fetch foods. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [localQuery]);

  const handleSelectFood = (food: USDAFood) => {
    setSelectedFood(food);
    setQuantity(food.servingSize || 100);
    setUnit(food.servingSizeUnit || "Serving");
  };

  const handleAddFood = () => {
    if (!selectedFood) return;
    
    const UNIT_CONVERSIONS = {
      Ounces: 28.3495,
      Cup: 236.588,
      Tablespoon: 14.7868,
      Teaspoon: 4.92892,
      Milliliter: 1,
      Grams: 1,
    } as const;

    // Convert quantity to grams based on unit selection
    let amountInGrams = quantity;
    if (unit in UNIT_CONVERSIONS) {
      amountInGrams = quantity * UNIT_CONVERSIONS[unit as keyof typeof UNIT_CONVERSIONS];
    } else if (unit === "Serving" && selectedFood.servingSize) {
      amountInGrams = quantity * selectedFood.servingSize;
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
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    // Calculate adjusted values based on amount in grams
    const entry: FoodEntry = {
      id: uuidv4(),
      description: selectedFood.description,
      amount: quantity + "",
      unit,
      calories: (baseNutrients.calories * amountInGrams) / 100,
      protein: (baseNutrients.protein * amountInGrams) / 100,
      carbs: (baseNutrients.carbs * amountInGrams) / 100,
      fat: (baseNutrients.fat * amountInGrams) / 100,
      fiber: baseNutrients.fiber ? (baseNutrients.fiber * amountInGrams) / 100 : undefined,
      date: new Date().toISOString(),
    };

    onAddFood(entry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dimmed gray backdrop instead of black */}
      <div className="absolute inset-0 bg-gray-500/70" onClick={onClose}></div>
      {/* Larger modal with max-width and height */}
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
              {suggestions.length === 0 && !isLoading && !error && (
                <div className="text-center py-8 text-gray-500">
                  No foods found. Try a different search term.
                </div>
              )}

              {error && (
                <div className="text-center py-8 text-red-500">
                  {error}
                </div>
              )}
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
              <label className="block text-sm font-medium">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
                : `Base unit = 100`}
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

export default function LogPage() {
  const [foodData, setFoodData] = useState<FoodEntry[]>([]);
  const [totals, setTotals] = useState<Nutrients>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [targetInput, setTargetInput] = useState<Nutrients>({
    calories: 2740,
    protein: 150,
    carbs: 300,
    fat: 70,
  });
  const [customGoals, setCustomGoals] = useState<Nutrients>(targetInput);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const savedFoodData = localStorage.getItem('foodData');
    const savedTotals = localStorage.getItem('totals');
    const savedGoals = localStorage.getItem('customGoals');
    
    if (savedFoodData) setFoodData(JSON.parse(savedFoodData));
    if (savedTotals) setTotals(JSON.parse(savedTotals));
    if (savedGoals) setCustomGoals(JSON.parse(savedGoals));
  }, []);

  useEffect(() => {
    localStorage.setItem('foodData', JSON.stringify(foodData));
    localStorage.setItem('totals', JSON.stringify(totals));
    localStorage.setItem('customGoals', JSON.stringify(customGoals));
  }, [foodData, totals, customGoals]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addFoodEntry = (entry: FoodEntry) => {
    setFoodData(prev => [...prev, entry]);
    setTotals(prev => ({
      calories: prev.calories + entry.calories,
      protein: prev.protein + entry.protein,
      carbs: prev.carbs + entry.carbs,
      fat: prev.fat + entry.fat,
    }));
  };

  const removeFoodEntry = (id: string) => {
    const removedEntry = foodData.find(item => item.id === id);
    if (removedEntry) {
      setTotals(prev => ({
        calories: prev.calories - removedEntry.calories,
        protein: prev.protein - removedEntry.protein,
        carbs: prev.carbs - removedEntry.carbs,
        fat: prev.fat - removedEntry.fat,
      }));
    }
    setFoodData(prev => prev.filter(item => item.id !== id));
  };

  const handleInputChange = (field: keyof Nutrients, value: number) => {
    setTargetInput({ ...targetInput, [field]: value });
  };

  const handleSaveTargets = () => {
    setCustomGoals(targetInput);
  };

  const groupedEntries = foodData.reduce((acc, entry) => {
    const date = new Date(entry.date).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6"> {/* Increased max-width */}
      <header>
        <h1 className="text-3xl font-bold mb-2">Log Your Food</h1>
        <p className="text-muted-foreground mb-4">
          Search from USDA, track your macros.
        </p>
      </header>

      <div className="mb-6">
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-[#6E44FF] hover:bg-[#6E44FF]/90 text-white px-8 py-3 text-lg flex items-center gap-2 w-full justify-center rounded-lg"
        >
          Add Food
          <HiPlus className="w-5 h-5" />
        </Button>
        <Button 
          onClick={() => {
            if (confirm('Are you sure you want to clear all entries?')) {
              setFoodData([]);
              setTotals({
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
              });
            }
          }}
          className="bg-red-500 hover:bg-red-600 text-white ml-2"
        >
          Clear All
        </Button>
      </div>

      {/* Food Log Table Section */}
      {foodData.length > 0 && (
        <section className="bg-gradient-to-r from-[#6E44FF] to-[#F3439B] rounded-lg p-4 text-white shadow-lg mb-6">
          <h2 className="text-lg font-medium mb-3">Food Log</h2>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="text-left border-b border-white/20">
                  <th className="pb-2 font-medium">Food</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium text-right">Calories</th>
                  <th className="pb-2 font-medium text-right">Protein</th>
                  <th className="pb-2 font-medium text-right">Carbs</th>
                  <th className="pb-2 font-medium text-right">Fat</th>
                  <th className="pb-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedEntries).map(([date, entries]) => (
                  <React.Fragment key={date}>
                    <tr>
                      <td colSpan={7} className="py-2 font-bold">{date}</td>
                    </tr>
                    {entries.map(item => (
                      <tr key={item.id} className="border-b border-white/10 last:border-0">
                        <td className="py-2">{item.description}</td>
                        <td className="py-2">{item.amount} {item.unit}</td>
                        <td className="py-2 text-right">{Number(item.calories.toFixed(1))}</td>
                        <td className="py-2 text-right">{Number(item.protein.toFixed(1))}g</td>
                        <td className="py-2 text-right">{Number(item.carbs.toFixed(1))}g</td>
                        <td className="py-2 text-right">{Number(item.fat.toFixed(1))}g</td>
                        <td className="py-2 pl-4">
                          <button
                            onClick={() => removeFoodEntry(item.id)}
                            className="text-white hover:text-[#EF7A85]"
                            aria-label="Remove entry"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Grid container for Energy Summary and Custom Targets */}
      <div className="grid grid-cols-2 gap-6">
        {/* Energy Summary Section */}
        <section className="bg-gradient-to-r from-[#6E44FF] to-[#F3439B] rounded-lg p-4 text-white shadow-lg">
          <h2 className="text-lg font-medium mb-2">Energy Summary</h2>
          <ProgressBar
            label="Calories"
            current={totals.calories}
            goal={customGoals.calories}
            unit="kcal"
            color="bg-[#6E44FF]"
          />
          <ProgressBar
            label="Protein"
            current={totals.protein}
            goal={customGoals.protein}
            unit="g"
            color="bg-[#7EE081]"
          />
          <ProgressBar
            label="Carbs"
            current={totals.carbs}
            goal={customGoals.carbs}
            unit="g"
            color="bg-[#F0E15B]"
          />
          <ProgressBar
            label="Fat"
            current={totals.fat}
            goal={customGoals.fat}
            unit="g"
            color="bg-[#E55640]"
          />
        </section>

        {/* Set Custom Targets Section */}
        <section className="bg-gray-100 p-4 rounded-lg shadow-lg"> {/* Added shadow-lg and rounded-lg for consistency */}
          <h2 className="text-lg font-medium mb-2">Set Custom Targets</h2>
          <div className="grid grid-cols-1 gap-4"> {/* Changed to single column */}
            <div>
              <label className="block text-sm font-medium">Calories</label>
              <input
                type="number"
                value={targetInput.calories}
                onChange={(e) => handleInputChange("calories", Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Protein</label>
              <input
                type="number"
                value={targetInput.protein}
                onChange={(e) => handleInputChange("protein", Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Carbs</label>
              <input
                type="number"
                value={targetInput.carbs}
                onChange={(e) => handleInputChange("carbs", Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Fat</label>
              <input
                type="number"
                value={targetInput.fat}
                onChange={(e) => handleInputChange("fat", Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <Button onClick={handleSaveTargets} className="w-full bg-[#6E44FF] hover:bg-[#6E44FF]/90 text-white">
              Save Targets
            </Button>
          </div>
        </section>
      </div>

      {isModalOpen && (
        <FoodSearchModal
          onClose={() => setIsModalOpen(false)}
          onAddFood={addFoodEntry}
        />
      )}
    </main>
  );
}
