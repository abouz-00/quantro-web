"use client";
import React from "react";
import { Button } from "../../components/ui/button";

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
    <section className="bg-gray-100 p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-medium mb-2">Set Custom Targets</h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium">Calories</label>
          <input
            type="number"
            value={targetInput.calories}
            onChange={(e) => handleInputChange("calories", Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Protein (g)</label>
          <input
            type="number"
            value={targetInput.protein}
            onChange={(e) => handleInputChange("protein", Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Carbs (g)</label>
          <input
            type="number"
            value={targetInput.carbs}
            onChange={(e) => handleInputChange("carbs", Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Fat (g)</label>
          <input
            type="number"
            value={targetInput.fat}
            onChange={(e) => handleInputChange("fat", Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <Button 
          onClick={handleSaveTargets} 
          className="w-full bg-[#6E44FF] hover:bg-[#6E44FF]/90 text-white"
        >
          Save Targets
        </Button>
      </div>
    </section>
  );
}