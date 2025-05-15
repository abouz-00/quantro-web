"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { v4 as uuidv4 } from "uuid";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

export default function LogPage() {
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState("100g");
  const [foodData, setFoodData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  const fetchUSDAFood = async () => {
    if (!query) return;
    const apiKey = process.env.NEXT_PUBLIC_USDA_API_KEY;
    const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${query}&api_key=${apiKey}`);
    const data = await res.json();
    const first = data.foods?.[0];
    if (first) {
      const nutrients = first.foodNutrients.reduce((acc: any, n: any) => {
        if (n.nutrientName === "Energy") acc.calories = n.value;
        if (n.nutrientName === "Protein") acc.protein = n.value;
        if (n.nutrientName === "Carbohydrate, by difference") acc.carbs = n.value;
        if (n.nutrientName === "Total lipid (fat)") acc.fat = n.value;
        return acc;
      }, {});
      const entry = {
        id: uuidv4(),
        description: first.description,
        amount,
        ...nutrients,
      };
      setFoodData([...foodData, entry]);
      setTotals({
        calories: totals.calories + (nutrients.calories || 0),
        protein: totals.protein + (nutrients.protein || 0),
        carbs: totals.carbs + (nutrients.carbs || 0),
        fat: totals.fat + (nutrients.fat || 0),
      });
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Log Your Food</h1>
      <p className="text-muted-foreground mb-4">Search from USDA, track your macros.</p>
      <div className="flex gap-2 mb-6">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search food..." />
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 100g" />
        <Button onClick={fetchUSDAFood}>Add</Button>
      </div>
      <div className="bg-violet-600 text-white p-4 rounded-md mb-4">
        <h2 className="text-xl font-semibold">Today's Totals</h2>
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
              <li key={item.id} className="mb-2">
                {item.description} - {item.amount} ({item.calories} kcal, P: {item.protein}g, C: {item.carbs}g, F: {item.fat}g)
              </li>
            ))}
          </ul>
          <PieChart width={300} height={200}>
            <Pie
              dataKey="value"
              data={[
                { name: "Protein", value: totals.protein },
                { name: "Carbs", value: totals.carbs },
                { name: "Fat", value: totals.fat },
              ]}
              cx="50%"
              cy="50%"
              outerRadius={60}
              label
            >
              {COLORS.map((color, index) => (
                <Cell key={index} fill={color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </>
      )}
    </main>
  );
}