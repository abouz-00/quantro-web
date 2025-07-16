"use client";

import React from "react";
import ProgressBar from "./ProgressBar";

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
    <section className="bg-gray-100 rounded-lg p-4 shadow-lg select-none">
      <h2 className="text-lg font-medium mb-2">{title}</h2>
      <ProgressBar
        label="Calories"
        current={totals.calories}
        goal={customGoals.calories}
        unit="kcal"
        color="bg-[#6E44FF]"
      />
      <ProgressBar
        label="Protein"
        current={totals.protein}
        goal={customGoals.protein}
        unit="g"
        color="bg-[#7EE081]"
      />
      <ProgressBar
        label="Carbs"
        current={totals.carbs}
        goal={customGoals.carbs}
        unit="g"
        color="bg-[#F0E15B]"
      />
      <ProgressBar
        label="Fat"
        current={totals.fat}
        goal={customGoals.fat}
        unit="g"
        color="bg-[#E55640]"
      />
    </section>
  );
}