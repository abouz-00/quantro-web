"use client";

import { useEffect, useState } from "react";

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

export default function DashboardPage() {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("food-log");
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  }, []);

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
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="mb-2">Entries Logged: {entries.length}</p>
      <p>Calories: {totals.calories} kcal</p>
      <p>Protein: {totals.protein}g</p>
      <p>Carbs: {totals.carbs}g</p>
      <p>Fat: {totals.fat}g</p>
    </main>
  );
}
