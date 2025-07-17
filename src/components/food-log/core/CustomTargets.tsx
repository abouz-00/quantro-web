"use client";
import React from "react";
import { Button } from "../../ui/button";

interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface CustomTargetsProps {
  targetInput: Nutrients;
  handleInputChange: (field: keyof Nutrients, value: number) => void;
  handleSaveTargets: () => void;
}

export default function CustomTargets({ 
  targetInput, 
  handleInputChange, 
  handleSaveTargets 
}: CustomTargetsProps) {
  return (
    <section className="select-none">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-white">Calories</label>
          <input
            type="number"
            value={targetInput.calories}
            onChange={(e) => handleInputChange("calories", Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
            style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">Protein (g)</label>
          <input
            type="number"
            value={targetInput.protein}
            onChange={(e) => handleInputChange("protein", Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
            style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">Carbs (g)</label>
          <input
            type="number"
            value={targetInput.carbs}
            onChange={(e) => handleInputChange("carbs", Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
            style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">Fat (g)</label>
          <input
            type="number"
            value={targetInput.fat}
            onChange={(e) => handleInputChange("fat", Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
            style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
          />
        </div>
        <Button 
          onClick={handleSaveTargets} 
          className="w-full text-white bg-white bg-opacity-20 hover:bg-opacity-30 border border-white border-opacity-30"
        >
          Save Targets
        </Button>
      </div>
    </section>
  );
}