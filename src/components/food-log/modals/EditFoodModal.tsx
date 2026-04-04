"use client";

import React, { useState, useEffect } from "react";
import { capitalizeWords, AVAILABLE_UNITS, convertUnits, normalizeUnit } from "../table/utils";

interface FoodEntry {
  id: string;
  description: string;
  amount: string;
  unit: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "other";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface EditFoodModalProps {
  entry: FoodEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<FoodEntry>) => void;
  originalEntry?: FoodEntry; // The original entry for ratio calculations
}

export default function EditFoodModal({ 
  entry, 
  isOpen, 
  onClose, 
  onSave,
  originalEntry 
}: EditFoodModalProps) {
  // Initialize edited entry directly from entry prop
  // This avoids calling setState in useEffect
  const [editedEntry, setEditedEntry] = useState<FoodEntry | null>(() => 
    (entry && isOpen) ? entry : null
  );

  // Reset edited entry when entry or modal state changes
  // Using layout effect to avoid visual flicker
  React.useLayoutEffect(() => {
    if (entry && isOpen) {
      setEditedEntry(entry);
    } else if (!isOpen) {
      setEditedEntry(null);
    }
  }, [entry, isOpen]);

  if (!isOpen || !entry || !editedEntry) {
    return null;
  }

  const handleSave = () => {
    const baseEntry = originalEntry || entry;
    const originalAmount = parseFloat(baseEntry.amount);
    const newAmount = parseFloat(editedEntry.amount);
    const originalUnit = normalizeUnit(baseEntry.unit);
    const newUnit = normalizeUnit(editedEntry.unit);
    
    if ((originalAmount !== newAmount || originalUnit !== newUnit) && newAmount > 0) {
      // Convert original amount to grams for baseline calculation
      const originalAmountInGrams = convertUnits(originalAmount, originalUnit, 'Grams');
      // Convert new amount to grams
      const newAmountInGrams = convertUnits(newAmount, newUnit, 'Grams');
      
      // Calculate the ratio based on grams
      const ratio = newAmountInGrams / originalAmountInGrams;
      
      onSave(editedEntry.id, {
        amount: editedEntry.amount,
        unit: newUnit,
        calories: baseEntry.calories * ratio,
        protein: baseEntry.protein * ratio,
        carbs: baseEntry.carbs * ratio,
        fat: baseEntry.fat * ratio,
      });
    }
    onClose();
  };

  const calculateNutrientValue = (nutrientKey: keyof Pick<FoodEntry, 'calories' | 'protein' | 'carbs' | 'fat'>) => {
    const baseEntry = originalEntry || entry;
    const originalAmount = parseFloat(baseEntry.amount);
    const newAmount = parseFloat(editedEntry.amount) || 0;
    const originalUnit = normalizeUnit(baseEntry.unit);
    const newUnit = normalizeUnit(editedEntry.unit);
    
    // Convert to grams for proper ratio calculation
    const originalAmountInGrams = convertUnits(originalAmount, originalUnit, 'Grams');
    const newAmountInGrams = convertUnits(newAmount, newUnit, 'Grams');
    const ratio = newAmountInGrams / originalAmountInGrams;
    
    return (baseEntry[nutrientKey] * ratio).toFixed(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-modal-backdrop">
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto animate-modal-content">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit Food Entry</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors duration-200 hover:bg-gray-100"
            aria-label="Close"
          >
            <span className="text-gray-500 text-xl">×</span>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Food Description</label>
            <p className="mt-1 p-3 bg-gray-50 rounded-md text-gray-800">
              {capitalizeWords(editedEntry.description)}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              value={editedEntry.amount}
              onChange={(e) => {
                setEditedEntry({...editedEntry, amount: e.target.value});
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <select
              value={normalizeUnit(editedEntry.unit)}
              onChange={(e) => {
                setEditedEntry({...editedEntry, unit: e.target.value});
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
              style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
            >
              {AVAILABLE_UNITS.map(unit => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Calories</label>
              <p className="mt-1 p-3 bg-gray-50 rounded-md text-gray-800">
                {calculateNutrientValue('calories')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
              <p className="mt-1 p-3 bg-gray-50 rounded-md text-gray-800">
                {calculateNutrientValue('protein')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Carbs (g)</label>
              <p className="mt-1 p-3 bg-gray-50 rounded-md text-gray-800">
                {calculateNutrientValue('carbs')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fat (g)</label>
              <p className="mt-1 p-3 bg-gray-50 rounded-md text-gray-800">
                {calculateNutrientValue('fat')}
              </p>
            </div>
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
            className="px-6 py-2 text-white rounded-lg transition-colors duration-200 bg-primary hover:bg-[#5a37d9] active:bg-[#4e2fc7]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
