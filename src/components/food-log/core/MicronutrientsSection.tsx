"use client";

import React from "react";
import { MicronutrientDonut } from "../charts";
import { FoodEntry, MICRONUTRIENT_DAILY_VALUES, MicronutrientKey, getNutrientValueByLabel } from "../../../types/foodEntry";

interface MicronutrientsSectionProps {
  entries: FoodEntry[];
}

// Colors to cycle through for the donuts
const COLORS = ['#FFBF7B', '#7FDFFF', '#7BFF9C', '#FF7B99', '#D27BFF'];

export default function MicronutrientsSection({ entries = [] }: MicronutrientsSectionProps) {
  
  // Calculate actual micronutrient totals from food entries
  const getMicronutrientValue = (nutrientKey: string): number => {
    if (!entries || entries.length === 0) return 0;
    
    return entries.reduce((total, entry) => {
      return total + getNutrientValueByLabel(entry, nutrientKey);
    }, 0);
  };

  const micronutrients = [
    { key: 'fiber', label: 'Fiber' },
    { key: 'omega3', label: 'Omega-3' },
    { key: 'vitaminB1', label: 'Vitamin B1' },
    { key: 'vitaminB2', label: 'Vitamin B2' },
    { key: 'vitaminB3', label: 'Vitamin B3' },
    { key: 'vitaminB5', label: 'Vitamin B5' },
    { key: 'vitaminB6', label: 'Vitamin B6' },
    { key: 'vitaminB12', label: 'Vitamin B12' },
    { key: 'biotin', label: 'Biotin' },
    { key: 'folate', label: 'Folate' },
    { key: 'vitaminA', label: 'Vitamin A' },
    { key: 'vitaminC', label: 'Vitamin C' },
    { key: 'vitaminD', label: 'Vitamin D' },
    { key: 'vitaminK', label: 'Vitamin K' },
    { key: 'calcium', label: 'Calcium' },
    { key: 'copper', label: 'Copper' },
    { key: 'iron', label: 'Iron' },
    { key: 'magnesium', label: 'Magnesium' },
    { key: 'manganese', label: 'Manganese' },
    { key: 'phosphorus', label: 'Phosphorus' },
    { key: 'potassium', label: 'Potassium' },
    { key: 'selenium', label: 'Selenium' },
    { key: 'sodium', label: 'Sodium' },
    { key: 'zinc', label: 'Zinc' },
  ];

  return (
    <section className="bg-white rounded-lg p-4 md:p-5 shadow-lg select-none">
      <h2 className="text-lg font-bold mb-3">Micronutrients</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
        {micronutrients.map((nutrient, index) => {
          const dailyValue = MICRONUTRIENT_DAILY_VALUES[nutrient.key as MicronutrientKey];
          const currentValue = getMicronutrientValue(nutrient.key);
          const color = COLORS[index % COLORS.length];
          
          return (
            <div key={nutrient.key} className="min-w-[100px]">
              <MicronutrientDonut
                label={nutrient.label}
                current={currentValue}
                goal={dailyValue.value}
                unit={dailyValue.unit}
                color={color}
                entries={entries}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
