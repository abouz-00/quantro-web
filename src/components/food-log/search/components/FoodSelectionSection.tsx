import React from "react";
import { capitalizeWords } from "../utils/nutritionUtils";

interface USDAFood {
  description: string;
  foodCategory?: string;
  foodNutrients: { nutrientName: string; value: number }[];
  servingSize?: number;
  servingSizeUnit?: string;
  isFavorite?: boolean;
  uniqueId?: string;
  fdcId?: number;
}

interface FoodSelectionSectionProps {
  selectedFood: USDAFood;
  quantity: string;
  setQuantity: (value: string) => void;
  unit: string;
  setUnit: (value: string) => void;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "other";
  setMealType: (mealType: "breakfast" | "lunch" | "dinner" | "snack" | "other") => void;
  onAddFood: () => void;
}

export const FoodSelectionSection: React.FC<FoodSelectionSectionProps> = ({
  selectedFood,
  quantity,
  setQuantity,
  unit,
  setUnit,
  mealType,
  setMealType,
  onAddFood
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAddFood();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
      <div className="mb-4">
        <div className="font-bold">{capitalizeWords(selectedFood.description)}</div>
      </div>
      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onKeyDown={(e) => {
              // Prevent non-numeric characters except decimal point, backspace, delete, arrow keys, tab
              if (
                !/[0-9.]/.test(e.key) && 
                !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
                !(e.key === 'a' && (e.metaKey || e.ctrlKey)) && // Allow Cmd/Ctrl+A
                !(e.key === 'c' && (e.metaKey || e.ctrlKey)) && // Allow Cmd/Ctrl+C
                !(e.key === 'v' && (e.metaKey || e.ctrlKey)) && // Allow Cmd/Ctrl+V
                !(e.key === 'x' && (e.metaKey || e.ctrlKey))    // Allow Cmd/Ctrl+X
              ) {
                e.preventDefault();
              }
              // Call original handleKeyDown for Enter key functionality
              if (e.key === 'Enter') {
                handleKeyDown(e);
              }
            }}
            onPaste={(e) => {
              // Prevent pasting non-numeric content
              const pastedText = e.clipboardData.getData('text');
              if (!/^[0-9.]*$/.test(pastedText)) {
                e.preventDefault();
              }
            }}
            min="0"
            step="any"
            className="w-full p-2 border border-gray-300 rounded-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Unit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 border border-gray-300 rounded-sm cursor-pointer"
          >
            <option value="Grams">Grams</option>
            <option value="Ounces">Ounces</option>
            <option value="Cup">Cup</option>
            <option value="Tablespoon">Tablespoon</option>
            <option value="Teaspoon">Teaspoon</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Meal</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as "breakfast" | "lunch" | "dinner" | "snack" | "other")}
            onKeyDown={handleKeyDown}
            className="w-full p-2 border border-gray-300 rounded-sm cursor-pointer"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <button
        onClick={onAddFood}
        className="w-full bg-violet-500 text-white py-2 px-4 rounded-sm hover:bg-violet-600 cursor-pointer transition-colors duration-200"
      >
        Add to Log
      </button>
    </div>
  );
};
