"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

interface LogEntry {
  food: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function LogPage() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [food, setFood] = useState("");
  const [amount, setAmount] = useState("");
  const [date] = useState(new Date());

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
      const res = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(food)}&api_key=${process.env.NEXT_PUBLIC_USDA_API_KEY}`
      );
      const data = await res.json();
      const item = data.foods?.[0];
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
    } catch (err) {
      console.error(err);
      alert("Failed to fetch food data.");
    }
  };

  const handleDelete = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Log Your Food</h1>
        <p className="text-sm text-gray-500 mt-1">{format(date, "MMMM d, yyyy")}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Food"
          value={food}
          onChange={(e) => setFood(e.target.value)}
        />
        <Input
          placeholder="Amount (e.g. 1 cup)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button onClick={handleAdd}>Add Food</Button>
      </div>

      <div className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 p-4 shadow">
        <h2 className="text-white text-xl font-semibold mb-3">Food Log</h2>
        {entries.map((entry, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 mb-3 flex justify-between items-start">
            <div>
              <p className="font-medium text-indigo-800">{entry.food}</p>
              <p className="text-sm text-gray-600">{entry.amount} • {entry.calories.toFixed(2)} kcal</p>
              <p className="text-xs text-gray-500">
                Carbs: {entry.carbs.toFixed(2)}g&nbsp;&nbsp;
                Protein: {entry.protein.toFixed(2)}g&nbsp;&nbsp;
                Fat: {entry.fat.toFixed(2)}g
              </p>
            </div>
            <button
              onClick={() => handleDelete(i)}
              className="text-red-500 hover:text-red-700"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
