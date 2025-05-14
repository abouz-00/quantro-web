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

  const handleAdd = () => {
    if (!food || !amount) return;

    // Dummy values for now; replace with USDA API results
    const newEntry: LogEntry = {
      food,
      amount,
      category: "manual",
      calories: 100,
      protein: 10,
      carbs: 15,
      fat: 5,
      micros: "",
    };

    setEntries((prev) => [...prev, newEntry]);
    setFood("");
    setAmount("");
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
