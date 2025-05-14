"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function LogPage() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [food, setFood] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Lunch");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!food.trim() || !amount.trim()) return;
    const newEntry = {
      food,
      amount,
      category,
      calories: 250,
      protein: 25,
      carbs: 10,
      fat: 8,
      micros: "Iron: 12%, B12: 30%"
    };
    setEntries((prev) => [...prev, newEntry]);
    setFood("");
    setAmount("");
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Log Your Food</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="food">Food</Label>
          <Input id="food" value={food} onChange={(e) => setFood(e.target.value)} placeholder="e.g. Chicken Breast" />
        </div>
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 200g" />
        </div>
        <div>
          <Label htmlFor="category">Meal Type</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a meal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Breakfast">Breakfast</SelectItem>
              <SelectItem value="Lunch">Lunch</SelectItem>
              <SelectItem value="Dinner">Dinner</SelectItem>
              <SelectItem value="Snack">Snack</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full">Add Entry</Button>
      </form>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Today&apos;s Log</h2>
        <ul className="space-y-2">
          {entries.map((entry, i) => (
            <li key={i} className="border border-zinc-700 rounded-md p-4">
              <p className="font-medium">{entry.food} - {entry.amount}</p>
              <p className="text-sm text-zinc-400">{entry.category}</p>
              <p className="text-sm">Calories: {entry.calories} kcal</p>
              <p className="text-sm">Protein: {entry.protein}g | Carbs: {entry.carbs}g | Fat: {entry.fat}g</p>
              <p className="text-sm text-zinc-400">{entry.micros}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
