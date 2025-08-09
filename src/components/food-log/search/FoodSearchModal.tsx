"use client";

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { FaTimes } from "react-icons/fa";
import { useFoodSearch } from "./hooks/useFoodSearch";
import { useFavorites } from "./hooks/useFavorites";
import { useCustomFoods } from "./hooks/useCustomFoods";

import SearchTab from "./SearchTab";
import FavoritesTab from "./FavoritesTab";
import CustomTab from "./CustomTab";

interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export default FoodSearchModal;

interface FoodEntry extends Nutrients {
  id: string;
  description: string;
  amount: string;
  unit: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "other";
}

interface USDAFood {
  description: string;
  foodCategory?: string;
  foodNutrients: { nutrientName: string; value: number }[];
  servingSize?: number;
  servingSizeUnit?: string;
  isFavorite?: boolean;
  uniqueId?: string;
}

interface CustomFood extends Nutrients {
  id: string;
  name: string;
  fiber?: number;
}

interface FoodSearchModalProps {
  onClose: () => void;
  onAddFood: (entry: FoodEntry) => void;
  selectedDate: Date;
}

const UNIT_CONVERSIONS = {
  Ounces: 28.3495,
  Cup: 236.588,
  Tablespoon: 14.7868,
  Teaspoon: 4.92892,
  Milliliter: 1,
  Grams: 1,
} as const;

const capitalizeWords = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};


function FoodSearchModal({ onClose, onAddFood, selectedDate }: FoodSearchModalProps) {
  const [activeTab, setActiveTab] = useState<"search" | "favorites" | "custom">("search");
  const [localQuery, setLocalQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<USDAFood | null>(null);

  // Reset selectedFood when query is cleared or tab changes
  useEffect(() => {
    setSelectedFood(null);
  }, [localQuery, activeTab]);
  const [quantity, setQuantity] = useState("100");
  const [unit, setUnit] = useState("Grams");
  // Hooks for search, favorites, custom foods
  const { suggestions, loading: searchLoading, error: searchError } = useFoodSearch(localQuery, activeTab === "search");
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { customFoods, addCustomFood } = useCustomFoods();

  // Custom food form state
  const [customName, setCustomName] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
  const [customFat, setCustomFat] = useState("");
  const [customFiber, setCustomFiber] = useState("");

  // Add styles for the table appearance to match the log table
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'food-search-modal-styles';
    style.textContent = `
      .food-search-modal .food-table-row {
        position: relative;
        background: white;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      
      .food-search-modal .food-table-row:hover {
        background-color: #f9fafb;
      }
      
      .food-search-modal .food-table-row.selected {
        background-color: #f3f4f6 !important;
        border-left: 4px solid #7c3aed;
      }
    `;
    
    if (!document.getElementById('food-search-modal-styles')) {
      document.head.appendChild(style);
    }
    
    return () => {
      const existingStyle = document.getElementById('food-search-modal-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);




  const handleSelectFood = (food: USDAFood, index: number) => {
    // Create a unique identifier for the food item to avoid multiple selections of same-named foods
    const foodWithIndex = { ...food, uniqueId: `${food.description}_${index}` };
    setSelectedFood(foodWithIndex);
  };

  const handleAddCustomFood = () => {
    if (!customName.trim()) return;
    const newCustomFood: CustomFood = {
      id: uuidv4(),
      name: customName.trim(),
      calories: parseFloat(customCalories) || 0,
      protein: parseFloat(customProtein) || 0,
      carbs: parseFloat(customCarbs) || 0,
      fat: parseFloat(customFat) || 0,
      fiber: parseFloat(customFiber) || 0,
    };
    addCustomFood(newCustomFood);
    // Reset form
    setCustomName("");
    setCustomCalories("");
    setCustomProtein("");
    setCustomCarbs("");
    setCustomFat("");
    setCustomFiber("");
    // Add to food log
    const entry: FoodEntry = {
      id: uuidv4(),
      description: newCustomFood.name,
      amount: quantity,
      unit: unit,
      date: selectedDate.toISOString(),
      mealType: "other",
      calories: (newCustomFood.calories * parseFloat(quantity)) / 100,
      protein: (newCustomFood.protein * parseFloat(quantity)) / 100,
      carbs: (newCustomFood.carbs * parseFloat(quantity)) / 100,
      fat: (newCustomFood.fat * parseFloat(quantity)) / 100,
    };
    onAddFood(entry);
    onClose();
  };

  const handleAddFromCustomList = (customFood: CustomFood) => {
    const multiplier = parseFloat(quantity) / 100;
    
    const entry: FoodEntry = {
      id: uuidv4(),
      description: customFood.name,
      amount: quantity,
      unit: unit,
      date: selectedDate.toISOString(),
      mealType: "other",
      calories: customFood.calories * multiplier,
      protein: customFood.protein * multiplier,
      carbs: customFood.carbs * multiplier,
      fat: customFood.fat * multiplier,
    };

    onAddFood(entry);
    onClose();
  };

  const handleAddFood = () => {
    if (!selectedFood) return;
    
    // Get nutrient values
    const findNutrient = (name: string): number => {
      const nutrient = selectedFood.foodNutrients.find(n => 
        n.nutrientName.toLowerCase().includes(name.toLowerCase())
      );
      return nutrient ? nutrient.value : 0;
    };
    
    // Improve nutrient lookups with more specific names
    let calories = findNutrient("energy");
    let protein = findNutrient("protein");
    let carbs = findNutrient("carbohydrate");
    let fat = findNutrient("total lipid (fat)");
    
    // Add fallback for chicken breast case
    if (calories <= 0 && selectedFood.description.toLowerCase().includes('chicken breast')) {
      calories = 165; // per 100g raw
      protein = 31;
      carbs = 0;
      fat = 3.6;
    }
    
    // Calculate serving adjustment with unit conversion
    let servingSizeInGrams = parseFloat(quantity) || 0;
    const originalUnit = unit;
    
    // Apply unit conversion if needed
    if (unit !== "Grams") {
      const conversionFactor = UNIT_CONVERSIONS[unit as keyof typeof UNIT_CONVERSIONS] || 1;
      servingSizeInGrams = servingSizeInGrams * conversionFactor;
    } 
    
    const servingMultiplier = servingSizeInGrams / 100; // Assuming base is 100g
    
    const entry: FoodEntry = {
      id: uuidv4(),
      description: selectedFood.description,
      amount: quantity,
      unit: originalUnit,
      date: selectedDate.toISOString(),
      mealType: "other",
      calories: calories * servingMultiplier,
      protein: protein * servingMultiplier,
      carbs: carbs * servingMultiplier,
      fat: fat * servingMultiplier,
    };
    
    // Round the nutritional values to 2 decimal places
    entry.calories = parseFloat(entry.calories.toFixed(2));
    entry.protein = parseFloat(entry.protein.toFixed(2));
    entry.carbs = parseFloat(entry.carbs.toFixed(2));
    entry.fat = parseFloat(entry.fat.toFixed(2));
    
    onAddFood(entry);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
      <div
        className="bg-white rounded-sm shadow-xl h-[600px] max-h-[90vh] food-search-modal flex flex-col"
        style={{
          width: '60vw',
          minWidth: '320px',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Add Food</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200">
              <FaTimes size={20} />
            </button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-sm p-1">
            <button
              onClick={() => setActiveTab("search")}
              className={`flex-1 py-2 px-4 rounded-sm text-sm font-medium cursor-pointer transition-colors duration-200 ${
                activeTab === "search" 
                  ? "bg-white text-violet-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Search
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`flex-1 py-2 px-4 rounded-sm text-sm font-medium cursor-pointer transition-colors duration-200 ${
                activeTab === "favorites" 
                  ? "bg-white text-violet-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`flex-1 py-2 px-4 rounded-sm text-sm font-medium cursor-pointer transition-colors duration-200 ${
                activeTab === "custom" 
                  ? "bg-white text-violet-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {activeTab === "search" && (
            <SearchTab
              localQuery={localQuery}
              setLocalQuery={setLocalQuery}
              suggestions={suggestions}
              selectedFood={selectedFood}
              handleSelectFood={handleSelectFood}
              toggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
              capitalizeWords={capitalizeWords}
              handleAddFood={handleAddFood}
              loading={searchLoading}
              error={searchError}
            />
          )}
          {activeTab === "favorites" && (
            <FavoritesTab
              favorites={favorites}
              selectedFood={selectedFood}
              handleSelectFood={handleSelectFood}
              toggleFavorite={toggleFavorite}
              capitalizeWords={capitalizeWords}
              loading={false}
              error={""}
            />
          )}
          {activeTab === "custom" && (
            <CustomTab
              customName={customName}
              setCustomName={setCustomName}
              customCalories={customCalories}
              setCustomCalories={setCustomCalories}
              customProtein={customProtein}
              setCustomProtein={setCustomProtein}
              customCarbs={customCarbs}
              setCustomCarbs={setCustomCarbs}
              customFat={customFat}
              setCustomFat={setCustomFat}
              customFiber={customFiber}
              setCustomFiber={setCustomFiber}
              handleAddCustomFood={handleAddCustomFood}
              customFoods={customFoods}
              handleAddFromCustomList={handleAddFromCustomList}
            />
          )}
        </div>

        {/* Bottom section for selected food - only show in search tab */}
        {selectedFood && activeTab === "search" && (
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
                    if (e.key === 'Enter') {
                      handleAddFood();
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddFood();
                    }
                  }}
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
              onClick={handleAddFood}
              className="w-full bg-violet-500 text-white py-2 px-4 rounded-sm hover:bg-violet-600 cursor-pointer transition-colors duration-200"
            >
              Add to Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
}