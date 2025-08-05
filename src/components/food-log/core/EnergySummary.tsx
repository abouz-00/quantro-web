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

interface EnergySummaryProps {
  totals: Nutrients;
  customGoals: Nutrients;
  selectedEntryCount?: number;
}

export default function EnergySummary({ totals, customGoals, selectedEntryCount = 0 }: EnergySummaryProps) {
  const isShowingSelectedEntry = selectedEntryCount > 0;
  const title = isShowingSelectedEntry 
    ? `${selectedEntryCount === 1 ? 'Selected Entry' : 'Selected Entries'} (${selectedEntryCount})`
    : 'Daily Summary';
  
  return (
    <section className="bg-gray-100 rounded-lg p-4 md:p-5 shadow-lg select-none">
      <h2 className="text-lg font-medium mb-3">{title}</h2>
      <div className="flex flex-row flex-wrap justify-between">
        <NutrientDonutChart
          label="Calories"
          current={totals.calories}
          goal={customGoals.calories}
          unit="kcal"
          color="#F3439B"
        />
        <NutrientDonutChart
          label="Protein"
          current={totals.protein}
          goal={customGoals.protein}
          unit="g"
          color="#7EE081"
        />
        <NutrientDonutChart
          label="Carbs"
          current={totals.carbs}
          goal={customGoals.carbs}
          unit="g"
          color="#F0E15B"
        />
        <NutrientDonutChart
          label="Fat"
          current={totals.fat}
          goal={customGoals.fat}
          unit="g"
          color="#E55640"
        />
      </div>
    </section>
  );
}