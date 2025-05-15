"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { FaTrash } from "react-icons/fa"; // Import a trash icon from react-icons

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

export default function LogPage() {
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState("100g");
  const [foodData, setFoodData] = useState<FoodEntry[]>([]);
  const [totals, setTotals] = useState<Nutrients>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query) return;
      const apiKey = process.env.NEXT_PUBLIC_USDA_API_KEY;
      const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${query}&pageSize=10&api_key=${apiKey}`);
      const data = await res.json();
      setSuggestions(data.foods?.map((f: USDAFood) => f.description) || []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const fetchUSDAFood = async () => {
    if (!query) return;
    const apiKey = process.env.NEXT_PUBLIC_USDA_API_KEY;
    const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${query}&api_key=${apiKey}`);
    const data = await res.json();
    const first = data.foods?.[0];
    if (first) {
      const nutrients = first.foodNutrients.reduce((acc: Nutrients, n: { nutrientName: string; value: number }) => {
        if (n.nutrientName === "Energy") acc.calories = n.value;
        if (n.nutrientName === "Protein") acc.protein = n.value;
        if (n.nutrientName === "Carbohydrate, by difference") acc.carbs = n.value;
        if (n.nutrientName === "Total lipid (fat)") acc.fat = n.value;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

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

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Log Your Food</h1>
      <p className="text-muted-foreground mb-4">Search from USDA, track your macros.</p>
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
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 100g" />
        <Button onClick={fetchUSDAFood}>Add</Button>
      </div>
      <div className="bg-violet-600 text-white p-4 rounded-md mb-4">
        <h2 className="text-xl font-semibold">Today&apos;s Totals</h2>
        <p>Calories: {totals.calories} kcal</p>
        <p>Protein: {totals.protein}g</p>
        <p>Carbs: {totals.carbs}g</p>
        <p>Fat: {totals.fat}g</p>
      </div>
      {foodData.length > 0 && (
        <>
          <h2 className="text-lg font-medium mb-2">Entries</h2>
          <ul className="mb-4">
            {foodData.map((item) => (
              <li key={item.id} className="flex justify-between items-center mb-2">
                <span>
                  {item.description} - {item.amount} ({item.calories} kcal, P: {item.protein}g, C: {item.carbs}g, F: {item.fat}g)
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
    </main>
  );
}
