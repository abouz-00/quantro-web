"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface LogEntry {
  food: string;
  amount: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  micros: string;
}

const COLORS = ["#BA4CF0", "#00C49F", "#FFBB28", "#FF8042"];

export default function DashboardPage() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [food, setFood] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("food-log");
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("food-log", JSON.stringify(entries));
  }, [entries]);

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

  const chartData = [
    { name: "Protein", value: totals.protein },
    { name: "Carbs", value: totals.carbs },
    { name: "Fat", value: totals.fat },
  ];

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
        (acc: any, n: any) => {
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
        food,
        amount,
        category: "usda",
        calories: nutrients.calories,
        protein: nutrients.protein,
        carbs: nutrients.carbs,
        fat: nutrients.fat,
        micros: "",
      };

      setEntries((prev) => [...prev, newEntry]);
      setFood("");
      setAmount("");
    } catch (err) {
      console.error(err);
      alert("Error retrieving food data.");
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Log Your Food</h1>

      <div className="flex gap-4">
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
        <Button onClick={handleAdd}>Add</Button>
      </div>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Entries Logged</h2>
        <ul className="space-y-1">
          {entries.map((entry, i) => (
            <li key={i} className="text-sm">
              {entry.food} - {entry.amount} ({entry.calories} kcal, P: {entry.protein}g, C: {entry.carbs}g, F: {entry.fat}g)
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
