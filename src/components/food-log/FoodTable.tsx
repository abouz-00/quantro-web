"use client";

import React, { useState } from "react";
import { FaTrash, FaPencilAlt, FaCheck } from "react-icons/fa";

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
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "other"; // Add "other" as a valid type
}

interface FoodTableProps {
  foodData: FoodEntry[];
  filteredEntries: FoodEntry[]; // Use filtered entries directly
  selectedEntries: string[];
  handleEntrySelect: (id: string, index: number, event: React.MouseEvent) => void;
  removeFoodEntry: (id: string) => void;
  updateFoodEntry?: (id: string, updates: Partial<FoodEntry>) => void;
}

// Helper function to capitalize first letter of each word
const capitalizeWords = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function FoodTable({ 
  foodData, 
  filteredEntries, // Change from groupedEntries to filteredEntries
  selectedEntries, 
  handleEntrySelect, 
  removeFoodEntry,
  updateFoodEntry = () => {} // Default empty function if not provided
}: FoodTableProps) {
  // State for tracking which entry is being edited
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  
  const startEditing = (entry: FoodEntry, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row selection
    setEditingEntry(entry.id);
    setEditAmount(entry.amount);
  };

  const saveEdit = (entry: FoodEntry, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row selection
    
    // Don't update if amount didn't change
    if (editAmount === entry.amount) {
      setEditingEntry(null);
      return;
    }
    
    // Calculate nutrient adjustment ratio
    const originalAmount = parseFloat(entry.amount);
    const newAmount = parseFloat(editAmount);
    const ratio = newAmount / originalAmount;
    
    // Update the entry with scaled nutrients
    updateFoodEntry(entry.id, {
      amount: editAmount,
      calories: entry.calories * ratio,
      protein: entry.protein * ratio,
      carbs: entry.carbs * ratio,
      fat: entry.fat * ratio,
    });
    
    setEditingEntry(null);
  };

  // Helper function to format number with at most 2 decimal places
  const formatNumber = (num: number): string => {
    // Convert to string with up to 2 decimal places
    const rounded = parseFloat(num.toFixed(2));
    // Remove trailing zeros and decimal point if necessary
    return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pl-4 pr-2">Food</th>
            <th className="text-left py-2 px-2 min-w-[120px]">Amount</th>
            <th className="text-right py-2 px-2 min-w-[80px]">Calories</th>
            <th className="text-right py-2 px-2 min-w-[80px]">Protein</th>
            <th className="text-right py-2 px-2 min-w-[80px]">Carbs</th>
            <th className="text-right py-2 px-2 min-w-[80px]">Fat</th>
            <th className="w-16 py-2 pl-4"></th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map(item => (
            <tr 
              key={item.id} 
              className={`border-b border-gray-200 last:border-0 cursor-pointer ${
                selectedEntries.includes(item.id) ? 'bg-blue-50' : ''
              }`}
              onClick={(e) => handleEntrySelect(item.id, foodData.indexOf(item), e)}
            >
              <td className="py-2 pl-4 pr-2">{capitalizeWords(item.description)}</td>
              <td className="py-2 px-2">
                {editingEntry === item.id ? (
                  <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editAmount}
                      onChange={e => setEditAmount(e.target.value)}
                      className="w-16 p-1 border border-gray-300 rounded text-right"
                      autoFocus
                      onClick={e => e.stopPropagation()}
                    />
                    <span>{capitalizeWords(item.unit)}</span>
                    <button 
                      onClick={(e) => saveEdit(item, e)}
                      className="text-green-500 hover:text-green-600 ml-1"
                    >
                      <FaCheck size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <span 
                      className="hover:bg-gray-100 px-1 rounded cursor-pointer"
                      onClick={(e) => startEditing(item, e)}
                    >
                      {formatNumber(parseFloat(item.amount))} {capitalizeWords(item.unit)}
                    </span>
                    <FaPencilAlt 
                      size={12} 
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={(e) => startEditing(item, e)}
                    />
                  </div>
                )}
              </td>
              <td className="py-2 px-2 text-right">{formatNumber(item.calories)}</td>
              <td className="py-2 px-2 text-right">{formatNumber(item.protein)}g</td>
              <td className="py-2 px-2 text-right">{formatNumber(item.carbs)}g</td>
              <td className="py-2 px-2 text-right">{formatNumber(item.fat)}g</td>
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
  );
}