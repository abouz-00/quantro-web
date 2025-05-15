"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { FaTrash } from "react-icons/fa";

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
}

interface USDAFood {
  description: string;
  foodCategory?: string;
  foodNutrients: { nutrientName: string; value: number }[];
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
          {current.toFixed(1)} / {goal.toFixed(1)} {unit}
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

// FoodSearchModal: a popout modal for searching and selecting food.
interface FoodSearchModalProps {
  onClose: () => void;
  onAddFood: (entry: FoodEntry) => void;
}

function FoodSearchModal({ onClose, onAddFood }: FoodSearchModalProps) {
  const [localQuery, setLocalQuery] = useState("");
  const [suggestions, setSuggestions] = useState<USDAFood[]>([]);
  // When a food card is clicked, we switch to detail view.
  const [selectedFood, setSelectedFood] = useState<USDAFood | null>(null);
  // Inputs for detail view
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState("Serving");

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!localQuery) {
        setSuggestions([]);
        return;
      }
      const apiKey = process.env.NEXT_PUBLIC_USDA_API_KEY;
      const res = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${localQuery}&pageSize=10&api_key=${apiKey}`
      );
      const data = await res.json();
      setSuggestions(data.foods || []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [localQuery]);

  // When a food is clicked in the search list, update selectedFood.
  const handleSelectFood = (food: USDAFood) => {
    setSelectedFood(food);
    // Reset quantity/unit if needed
    setQuantity(100);
    setUnit("Serving");
  };

  // When adding food, transform USDAFood into a FoodEntry.
  const handleAddFood = () => {
    if (!selectedFood) return;
    // Extract macro values from foodNutrients
    const nutrients = selectedFood.foodNutrients.reduce(
      (acc: Nutrients, n: { nutrientName: string; value: number }) => {
        if (n.nutrientName === "Energy") acc.calories = n.value;
        if (n.nutrientName === "Protein") acc.protein = n.value;
        if (n.nutrientName === "Carbohydrate, by difference")
          acc.carbs = n.value;
        if (n.nutrientName === "Total lipid (fat)") acc.fat = n.value;
        if (n.nutrientName === "Fiber, total dietary") acc.fiber = n.value;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
    // For simplicity, assume the displayed macros scale with quantity in a 1:1 ratio.
    const entry: FoodEntry = {
      id: uuidv4(),
      description: selectedFood.description,
      amount: quantity + "",
      unit: unit,
      calories: nutrients.calories * (quantity / 100),
      protein: nutrients.protein * (quantity / 100),
      carbs: nutrients.carbs * (quantity / 100),
      fat: nutrients.fat * (quantity / 100),
      fiber: nutrients.fiber,
    };
    onAddFood(entry);
    onClose();
  };

  return (
    // Slide-in modal from the bottom
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 transform transition-transform duration-300 animate-slideInUp">
        {!selectedFood ? (
          // Search view with suggestions
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Food Search</h2>
              <button onClick={onClose} className="text-gray-500">
                Close
              </button>
            </div>
            <Input
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search food..."
              className="mb-4"
            />
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {suggestions.map((food, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectFood(food)}
                  className="p-3 border rounded-lg shadow-sm cursor-pointer hover:bg-gray-50"
                >
                  <div className="font-bold">{food.description}</div>
                  {food.foodCategory && (
                    <div className="text-xs text-gray-500 mb-2">{food.foodCategory}</div>
                  )}
                  {/* Macro badge row */}
                  <div className="flex space-x-2">
                    <span className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-1">
                      {food.foodNutrients.find((n) => n.nutrientName === "Energy")?.value || 0} kcal
                    </span>
                    <span className="text-xs bg-green-200 text-green-800 rounded-full px-2 py-1">
                      {food.foodNutrients.find((n) => n.nutrientName === "Protein")?.value || 0} P
                    </span>
                    <span className="text-xs bg-blue-200 text-blue-800 rounded-full px-2 py-1">
                      {food.foodNutrients.find((n) => n.nutrientName === "Carbohydrate, by difference")?.value || 0} C
                    </span>
                    <span className="text-xs bg-red-200 text-red-800 rounded-full px-2 py-1">
                      {food.foodNutrients.find((n) => n.nutrientName === "Total lipid (fat)")?.value || 0} F
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Nutrition Facts / Detail view
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
              <div>Calories: {selectedFood.foodNutrients.find((n) => n.nutrientName === "Energy")?.value || 0}</div>
              <div>Protein: {selectedFood.foodNutrients.find((n) => n.nutrientName === "Protein")?.value || 0} g</div>
              <div>Carbs: {selectedFood.foodNutrients.find((n) => n.nutrientName === "Carbohydrate, by difference")?.value || 0} g</div>
              <div>Fat: {selectedFood.foodNutrients.find((n) => n.nutrientName === "Total lipid (fat)")?.value || 0} g</div>
              <div>Fiber: {selectedFood.foodNutrients.find((n) => n.nutrientName === "Fiber, total dietary")?.value || 0} g</div>
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
                ].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              1 {unit.toLowerCase()} = {quantity} {unit === "Serving" ? "g" : unit.toLowerCase()}
            </div>
            <Button onClick={handleAddFood} className="bg-green-500 hover:bg-green-600 text-white">
              Add to Log
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// Main LogPage component with gradient section cards and progress bars
export default function LogPage() {
  //const [query, setQuery] = useState("");
  //const [amount, setAmount] = useState("100g");
  const [foodData, setFoodData] = useState<FoodEntry[]>([]);
  const [totals, setTotals] = useState<Nutrients>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  // Custom targets states (for demonstration, full precision is stored but only 1 decimal is displayed)
  const [targetInput, setTargetInput] = useState<Nutrients>({
    calories: 2740,
    protein: 150,
    carbs: 300,
    fat: 70,
  });
  const [customGoals, setCustomGoals] = useState<Nutrients>(targetInput);
  // Manage modal open state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addFoodEntry = (entry: FoodEntry) => {
    setFoodData((prev) => [...prev, entry]);
    setTotals((prev) => ({
      calories: prev.calories + entry.calories,
      protein: prev.protein + entry.protein,
      carbs: prev.carbs + entry.carbs,
      fat: prev.fat + entry.fat,
    }));
  };

  const removeFoodEntry = (id: string) => {
    const removedEntry = foodData.find((item) => item.id === id);
    if (removedEntry) {
      setTotals((prev) => ({
        calories: prev.calories - removedEntry.calories,
        protein: prev.protein - removedEntry.protein,
        carbs: prev.carbs - removedEntry.carbs,
        fat: prev.fat - removedEntry.fat,
      }));
    }
    setFoodData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleInputChange = (field: keyof Nutrients, value: number) => {
    setTargetInput({ ...targetInput, [field]: value });
  };

  const handleSaveTargets = () => {
    setCustomGoals(targetInput);
  };

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-2">Log Your Food</h1>
        <p className="text-muted-foreground mb-4">
          Search from USDA, track your macros.
        </p>
      </header>

      <div className="flex gap-2 mb-6">
        <input
          placeholder="Search food..."
          readOnly
          onClick={() => setIsModalOpen(true)}
          className="border p-2 rounded w-full cursor-pointer"
        />
        <Button onClick={() => setIsModalOpen(true)}>Add Food</Button>
      </div>

      {/* Entries Section moved directly below search input */}
      {foodData.length > 0 && (
        <section className="bg-gradient-to-r from-blue-400 to-pink-400 rounded-lg p-4 text-white shadow-lg mb-6">
          <h2 className="text-lg font-medium mb-2">Food Log</h2>
          <ul className="space-y-2">
            {foodData.map((item) => (
              <li key={item.id} className="flex justify-between items-center">
                <span>
                  {item.description} - {item.amount} {item.unit} ({" "}
                  {item.calories.toFixed(1)} kcal, P: {item.protein.toFixed(1)}g, C:{" "}
                  {item.carbs.toFixed(1)}g, F: {item.fat.toFixed(1)}g )
                </span>
                <button
                  onClick={() => removeFoodEntry(item.id)}
                  className="text-red-200 hover:text-red-400"
                  aria-label="Remove entry"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Energy Summary Section with progress bars */}
      <section className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg p-4 text-white shadow-lg">
        <h2 className="text-lg font-medium mb-2">Energy Summary</h2>
        <ProgressBar
          label="Calories"
          current={totals.calories}
          goal={customGoals.calories}
          unit="kcal"
          color="bg-blue-500"
        />
        <ProgressBar
          label="Protein"
          current={totals.protein}
          goal={customGoals.protein}
          unit="g"
          color="bg-green-500"
        />
        <ProgressBar
          label="Carbs"
          current={totals.carbs}
          goal={customGoals.carbs}
          unit="g"
          color="bg-yellow-500"
        />
        <ProgressBar
          label="Fat"
          current={totals.fat}
          goal={customGoals.fat}
          unit="g"
          color="bg-red-500"
        />
      </section>

      {/* Set Custom Targets Section placed at the bottom */}
      <section className="bg-gray-100 p-4 rounded-md mb-4">
        <h2 className="text-xl font-semibold mb-2">Set Custom Targets</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Calories</label>
            <input
              type="number"
              value={targetInput.calories}
              onChange={(e) =>
                handleInputChange("calories", Number(e.target.value))
              }
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Protein</label>
            <input
              type="number"
              value={targetInput.protein}
              onChange={(e) =>
                handleInputChange("protein", Number(e.target.value))
              }
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Carbs</label>
            <input
              type="number"
              value={targetInput.carbs}
              onChange={(e) =>
                handleInputChange("carbs", Number(e.target.value))
              }
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Fat</label>
            <input
              type="number"
              value={targetInput.fat}
              onChange={(e) =>
                handleInputChange("fat", Number(e.target.value))
              }
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>
        <Button onClick={handleSaveTargets} className="mt-4">
          Save Targets
        </Button>
      </section>

      {isModalOpen && (
        <FoodSearchModal
          onClose={() => setIsModalOpen(false)}
          onAddFood={addFoodEntry}
        />
      )}
    </main>
  );
}
