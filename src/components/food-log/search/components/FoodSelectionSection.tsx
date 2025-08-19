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
}

interface FoodSelectionSectionProps {
  selectedFood: USDAFood;
  quantity: string;
  setQuantity: (value: string) => void;
  unit: string;
  setUnit: (value: string) => void;
  onAddFood: () => void;
}

export const FoodSelectionSection: React.FC<FoodSelectionSectionProps> = ({
  selectedFood,
  quantity,
  setQuantity,
  unit,
  setUnit,
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
            onKeyDown={handleKeyDown}
            className="w-full p-2 border border-gray-300 rounded-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Unit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 border border-gray-300 rounded-sm"
          >
            <option value="Grams">Grams</option>
            <option value="Ounces">Ounces</option>
            <option value="Cup">Cup</option>
            <option value="Tablespoon">Tablespoon</option>
            <option value="Teaspoon">Teaspoon</option>
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
