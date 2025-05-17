"use client";

import React from "react";
import ProgressBar from "./ProgressBar";
import dynamic from 'next/dynamic';
import MacroChart from './MacroChart';

// Import Doughnut component with SSR disabled
const Doughnut = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Doughnut),
  { ssr: false }
);

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
}

export default function EnergySummary({ totals, customGoals }: EnergySummaryProps) {
  return (
    <section className="bg-gray-100 rounded-lg p-4 shadow-lg">
      <h2 className="text-lg font-medium mb-2">Energy Summary</h2>
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
      <div className="mt-4">
        <MacroChart 
          protein={totals.protein}
          carbs={totals.carbs}
          fat={totals.fat}
        />
      </div>
    </section>
  );
}