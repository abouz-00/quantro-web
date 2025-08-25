"use client";

import React from "react";
import { NutrientDonutChart } from "../charts";

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
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "other";
}

interface EnergySummaryProps {
  totals: Nutrients;
  customGoals: Nutrients;
  selectedEntryCount?: number;
  entries?: FoodEntry[]; // Add entries prop
}

export default function EnergySummary({ totals, customGoals, selectedEntryCount = 0, entries = [] }: EnergySummaryProps) {
  const isShowingSelectedEntry = selectedEntryCount > 0;
  const title = isShowingSelectedEntry 
    ? `${selectedEntryCount === 1 ? 'Selected Entry' : 'Selected Entries'} (${selectedEntryCount})`
    : 'Daily Summary';
  
  return (
    <section className="bg-white rounded-lg p-4 md:p-5 shadow-lg select-none">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      <div className="flex flex-row overflow-x-auto no-scrollbar pb-2">
        <NutrientDonutChart
          label="Calories"
          current={totals.calories}
          goal={customGoals.calories}
          unit="kcal"
          color="#FF9F1C"
          entries={entries}
        />
        <NutrientDonutChart
          label="Protein"
          current={totals.protein}
          goal={customGoals.protein}
          unit="g"
          color="#8BC34A"
          entries={entries}
        />
        <NutrientDonutChart
          label="Carbs"
          current={totals.carbs}
          goal={customGoals.carbs}
          unit="g"
          color="#4ECDC4"
          entries={entries}
        />
        <NutrientDonutChart
          label="Fat"
          current={totals.fat}
          goal={customGoals.fat}
          unit="g"
          color="#FF6B6B"
          entries={entries}
        />
      </div>
    </section>
  );
}