"use client";

import React from "react";
import { FaTrash } from "react-icons/fa";

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
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
}

interface FoodTableProps {
  foodData: FoodEntry[];
  groupedEntries: Record<string, FoodEntry[]>;
  selectedEntries: string[];
  handleEntrySelect: (id: string, index: number, event: React.MouseEvent) => void;
  removeFoodEntry: (id: string) => void;
}

// Helper function to capitalize first letter of each word
const capitalizeWords = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to get a friendly meal type name
const getMealTypeName = (mealType: string): string => {
  switch(mealType) {
    case 'breakfast': return 'Breakfast';
    case 'lunch': return 'Lunch';
    case 'dinner': return 'Dinner';
    case 'snack': return 'Snack';
    default: return 'Other';
  }
};

export default function FoodTable({ 
  foodData, 
  groupedEntries, 
  selectedEntries, 
  handleEntrySelect, 
  removeFoodEntry 
}: FoodTableProps) {
  // Get meal types in a specific order
  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];
  const sortedMealTypes = Object.keys(groupedEntries).sort(
    (a, b) => mealOrder.indexOf(a) - mealOrder.indexOf(b)
  );

  return (
    <div>
      {sortedMealTypes.map(mealType => (
        <div key={mealType} className="mb-6 last:mb-0">
          <h3 className="font-medium text-gray-700 mb-2 uppercase text-sm tracking-wider">
            {getMealTypeName(mealType)}
          </h3>
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Food</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-right py-2">Calories</th>
                <th className="text-right py-2">Protein</th>
                <th className="text-right py-2">Carbs</th>
                <th className="text-right py-2">Fat</th>
                <th className="w-10 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {groupedEntries[mealType].map(item => (
                <tr 
                  key={item.id} 
                  className={`border-b border-gray-200 last:border-0 cursor-pointer ${
                    selectedEntries.includes(item.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={(e) => handleEntrySelect(item.id, foodData.indexOf(item), e)}
                >
                  <td className="py-2">{capitalizeWords(item.description)}</td>
                  <td className="py-2">{item.amount} {capitalizeWords(item.unit)}</td>
                  <td className="py-2 text-right">{Number(item.calories.toFixed(1))}</td>
                  <td className="py-2 text-right">{Number(item.protein.toFixed(1))}g</td>
                  <td className="py-2 text-right">{Number(item.carbs.toFixed(1))}g</td>
                  <td className="py-2 text-right">{Number(item.fat.toFixed(1))}g</td>
                  <td className="py-2 pl-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFoodEntry(item.id);
                      }}
                      className="text-gray-500 hover:text-red-500"
                      aria-label="Remove entry"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}