"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";

interface LogEntry {
  id: string;
  food: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodItem {
  fdcId: number;
  description: string;
  foodNutrients: { nutrientName: string; value: number }[];
}

export default function LogPage() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [food, setFood] = useState("");
  const [amount, setAmount] = useState("");
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [selectedFoodData, setSelectedFoodData] = useState<FoodItem | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("food-log");
    if (stored) setEntries(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("food-log", JSON.stringify(entries));
  }, [entries]);

  const handleAdd = async () => {
    if (!food || !amount) return;

    try {
      const item = selectedFoodData ?? (await (async (): Promise<FoodItem> => {
        const res = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(food)}&pageSize=1&api_key=${process.env.NEXT_PUBLIC_USDA_API_KEY}`
        );
        const data = await res.json();
        return data.foods?.[0];
      })());

      if (!item) {
        alert("Food not found.");
        return;
      }

      const nutrients = item.foodNutrients.reduce(
        (acc: { calories: number; protein: number; carbs: number; fat: number }, n: { nutrientName: string; value: number }) => {
          const name = n.nutrientName.toLowerCase();
          const val = n.value;

          if (name.includes("energy") && name.includes("kcal")) acc.calories = val;
          else if (name.includes("protein")) acc.protein = val;
          else if (name.includes("carbohydrate")) acc.carbs = val;
          else if (name.includes("total lipid") || name.includes("fat")) acc.fat = val;

          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      const newEntry: LogEntry = {
        id: crypto.randomUUID(),
        food: item.description,
        amount,
        calories: nutrients.calories,
        protein: nutrients.protein,
        carbs: nutrients.carbs,
        fat: nutrients.fat,
      };

      setEntries((prev) => [...prev, newEntry]);
      setFood("");
      setAmount("");
      setSelectedFoodData(null);
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch food data.");
    }
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const totals = entries.reduce(
    (acc, entry) => {
      acc.calories += entry.calories;
      acc.protein += entry.protein;
      acc.carbs += entry.carbs;
      acc.fat += entry.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Log Your Food</h1>
        <p className="text-gray-500">Search from USDA, track your macros.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-start">
        <div className="relative flex-1">
          <Input
            placeholder="Search food"
            value={food}
            onChange={async (e) => {
              const q = e.target.value;
              setFood(q);
              setSelectedFoodData(null);
              if (q.length > 2) {
                try {
                  const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(q)}&pageSize=5&api_key=${process.env.NEXT_PUBLIC_USDA_API_KEY}`);
                  const data = await res.json();
                  setSuggestions(data.foods || []);
                  setShowSuggestions(true);
                } catch {
                  setSuggestions([]);
                  setShowSuggestions(false);
                }
              } else {
                setSuggestions([]);
                setShowSuggestions(false);
              }
            }}
            className="w-full"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-50 bg-white border border-gray-200 w-full max-h-48 overflow-y-auto mt-1 rounded-md shadow text-sm">
              {suggestions.map((item) => (
                <li
                  key={item.fdcId}
                  className="px-3 py-2 hover:bg-indigo-100 cursor-pointer"
                  onClick={() => {
                    setFood(item.description);
                    setSelectedFoodData(item);
                    setShowSuggestions(false);
                  }}
                >
                  {item.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Input
          placeholder="Amount (e.g. 1 cup)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-36"
        />

        <Button onClick={handleAdd}>Add</Button>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-start">
            <div>
              <p className="font-medium text-indigo-800">{entry.food}</p>
              <p className="text-sm text-gray-600">{entry.amount} • {entry.calories.toFixed(0)} kcal</p>
              <p className="text-xs text-gray-500">
                Carbs: {entry.carbs.toFixed(0)}g &nbsp; Protein: {entry.protein.toFixed(0)}g &nbsp; Fat: {entry.fat.toFixed(0)}g
              </p>
            </div>
            <button
              onClick={() => handleDelete(entry.id)}
              className="text-red-500 hover:text-red-700"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-indigo-600 text-white p-4 rounded shadow">
        <h2 className="font-bold text-lg mb-2">Today’s Totals</h2>
        <p>Calories: {totals.calories.toFixed(0)} kcal</p>
        <p>Protein: {totals.protein.toFixed(0)}g</p>
        <p>Carbs: {totals.carbs.toFixed(0)}g</p>
        <p>Fat: {totals.fat.toFixed(0)}g</p>
      </div>
    </main>
  );
}
