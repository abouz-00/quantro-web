"use client";

import React from "react";

interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface TargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetInput: Nutrients;
  onInputChange: (field: keyof Nutrients, value: number) => void;
  onSave: () => void;
}

export default function TargetsModal({
  isOpen,
  onClose,
  targetInput,
  onInputChange,
  onSave
}: TargetsModalProps) {
  if (!isOpen) return null;

  // Calculate total calories from macronutrients
  const calculateMacroCalories = () => {
    const proteinCalories = targetInput.protein * 4; // 4 kcal per gram
    const carbCalories = targetInput.carbs * 4; // 4 kcal per gram
    const fatCalories = targetInput.fat * 9; // 9 kcal per gram
    return proteinCalories + carbCalories + fatCalories;
  };

  const macroCalories = calculateMacroCalories();
  const caloriesMismatch = Math.abs(macroCalories - targetInput.calories) > 1; // Allow 1 calorie tolerance

  const handleInputChange = (field: keyof Nutrients, value: string) => {
    // Handle empty string by setting to 0, otherwise parse the number
    const numValue = value === '' ? 0 : parseFloat(value);
    // Only update if it's a valid number (including 0 for empty strings)
    if (!isNaN(numValue) && numValue >= 0) {
      onInputChange(field, numValue);
    }
  };

  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Set Custom Targets</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors duration-200"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Close"
          >
            <span className="text-gray-500 text-xl">×</span>
          </button>
        </div>
        
        {caloriesMismatch && (
          <div id="macro-mismatch-error" className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
            <p className="text-red-700 text-sm">
              ⚠️ Target totals don&apos;t match: Macronutrients equal {macroCalories} calories, but calorie target is {targetInput.calories}.
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Calories</label>
            <input
              type="number"
              value={targetInput.calories || ''}
              onChange={(e) => handleInputChange("calories", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
            <input
              type="number"
              value={targetInput.protein || ''}
              onChange={(e) => handleInputChange("protein", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
              aria-describedby={caloriesMismatch ? 'macro-mismatch-error' : undefined}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Carbs (g)</label>
            <input
              type="number"
              value={targetInput.carbs || ''}
              onChange={(e) => handleInputChange("carbs", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
              aria-describedby={caloriesMismatch ? 'macro-mismatch-error' : undefined}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fat (g)</label>
            <input
              type="number"
              value={targetInput.fat || ''}
              onChange={(e) => handleInputChange("fat", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
              aria-describedby={caloriesMismatch ? 'macro-mismatch-error' : undefined}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-white rounded-lg transition-colors duration-200"
            style={{ backgroundColor: '#6e44ff' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a37d9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6e44ff'}
          >
            Save Targets
          </button>
        </div>
      </div>
    </div>
  );
}
