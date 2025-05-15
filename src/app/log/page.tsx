"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { FaTrash } from "react-icons/fa";

interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodEntry extends Nutrients {
  id: string;
  description: string;
  amount: string;
}

interface USDAFood {
  description: string;
}

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
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span>
          {current.toFixed(1)} / {goal.toFixed(1)} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className={`${color} h-4 rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default function LogPage() {
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState("100g");
  const [foodData, setFoodData] = useState<FoodEntry[]>([]);
  const [totals, setTotals] = useState<Nutrients>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // State for custom macronutrient target inputs and saved targets.
  const [targetInput, setTargetInput] = useState<Nutrients>({
    calories: 2740,
    protein: 150,
    carbs: 300,
    fat: 70,
  });
  const [customGoals, setCustomGoals] = useState<Nutrients>(targetInput);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query) return;
      const apiKey = process.env.NEXT_PUBLIC_USDA_API_KEY;
      const res = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${query}&pageSize=10&api_key=${apiKey}`
      );
      const data = await res.json();
      setSuggestions(data.foods?.map((f: USDAFood) => f.description) || []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const fetchUSDAFood = async () => {
    if (!query) return;
    const apiKey = process.env.NEXT_PUBLIC_USDA_API_KEY;
    const res = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${query}&api_key=${apiKey}`
    );
    const data = await res.json();
    const first = data.foods?.[0];
    if (first) {
      const nutrients = first.foodNutrients.reduce(
        (acc: Nutrients, n: { nutrientName: string; value: number }) => {
          if (n.nutrientName === "Energy") acc.calories = n.value;
          if (n.nutrientName === "Protein") acc.protein = n.value;
          if (n.nutrientName === "Carbohydrate, by difference") acc.carbs = n.value;
          if (n.nutrientName === "Total lipid (fat)") acc.fat = n.value;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      const entry: FoodEntry = {
        id: uuidv4(),
        description: first.description,
        amount,
        ...nutrients,
      };

      setFoodData([...foodData, entry]);
      setTotals({
        calories: totals.calories + nutrients.calories,
        protein: totals.protein + nutrients.protein,
        carbs: totals.carbs + nutrients.carbs,
        fat: totals.fat + nutrients.fat,
      });
    }
  };

  const removeFoodEntry = (id: string) => {
    const updatedFoodData = foodData.filter((item) => item.id !== id);
    const removedEntry = foodData.find((item) => item.id === id);

    if (removedEntry) {
      setTotals({
        calories: totals.calories - removedEntry.calories,
        protein: totals.protein - removedEntry.protein,
        carbs: totals.carbs - removedEntry.carbs,
        fat: totals.fat - removedEntry.fat,
      });
    }

    setFoodData(updatedFoodData);
  };

  const handleInputChange = (field: keyof Nutrients, value: number) => {
    setTargetInput({ ...targetInput, [field]: value });
  };

  const handleSaveTargets = () => {
    setCustomGoals(targetInput);
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Log Your Food</h1>
      <p className="text-muted-foreground mb-4">
        Search from USDA, track your macros.
      </p>
      <div className="flex gap-2 mb-6">
        <input
          list="food-suggestions"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search food..."
          className="border p-2 rounded w-full"
        />
        <datalist id="food-suggestions">
          {suggestions.map((s, i) => (
            <option key={i} value={s} />
          ))}
        </datalist>
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 100g"
        />
        <Button onClick={fetchUSDAFood}>Add</Button>
      </div>

      {/* Entries Section moved directly below the search input */}
      {foodData.length > 0 && (
        <>
          <h2 className="text-lg font-medium mb-2">Entries</h2>
          <ul className="mb-4">
            {foodData.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center mb-2"
              >
                <span>
                  {item.description} - {item.amount} (
                  {item.calories.toFixed(1)} kcal, P:{" "}
                  {item.protein.toFixed(1)}g, C: {item.carbs.toFixed(1)}g, F:{" "}
                  {item.fat.toFixed(1)}g)
                </span>
                <button
                  onClick={() => removeFoodEntry(item.id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Remove entry"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Progress Bars Section */}
      <div className="mb-6">
        <ProgressBar
          label="Calories"
          current={totals.calories}
          goal={customGoals.calories}
          unit="kcal"
          color="bg-gray-500"
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
          color="bg-blue-500"
        />
        <ProgressBar
          label="Fat"
          current={totals.fat}
          goal={customGoals.fat}
          unit="g"
          color="bg-red-500"
        />
      </div>

      {/* Custom Targets Section positioned at the bottom */}
      <div className="bg-gray-100 p-4 rounded-md mb-4">
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
      </div>
    </main>
  );
}
