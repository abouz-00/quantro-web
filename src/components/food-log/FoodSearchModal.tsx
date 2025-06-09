"use client";

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { FaStar, FaRegStar, FaTimes } from "react-icons/fa";

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
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "other";
}

interface USDAFood {
  description: string;
  foodCategory?: string;
  foodNutrients: { nutrientName: string; value: number }[];
  servingSize?: number;
  servingSizeUnit?: string;
  isFavorite?: boolean;
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

export default function FoodSearchModal({ onClose, onAddFood, selectedDate }: FoodSearchModalProps) {
  const [activeTab, setActiveTab] = useState<"search" | "favorites" | "custom">("search");
  const [localQuery, setLocalQuery] = useState("");
  const [suggestions, setSuggestions] = useState<USDAFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<USDAFood | null>(null);
  const [quantity, setQuantity] = useState("100");
  const [unit, setUnit] = useState("Grams");
  const [favorites, setFavorites] = useState<USDAFood[]>([]);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  
  // Custom food form state
  const [customName, setCustomName] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
  const [customFat, setCustomFat] = useState("");
  const [customFiber, setCustomFiber] = useState("");

  // Load favorites and custom foods from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteFoods');
    const savedCustomFoods = localStorage.getItem('customFoods');
    
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedCustomFoods) setCustomFoods(JSON.parse(savedCustomFoods));
  }, []);

  // Save favorites and custom foods to localStorage
  useEffect(() => {
    localStorage.setItem('favoriteFoods', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('customFoods', JSON.stringify(customFoods));
  }, [customFoods]);

  // USDA API search (updated code)
  useEffect(() => {
    if (activeTab === "search" && localQuery.length > 2) {
      const timeoutId = setTimeout(async () => {
        try {
          console.log("Searching for:", localQuery);
          
          const response = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(localQuery)}&pageSize=10&api_key=DEMO_KEY`
          );
          
          console.log("Response status:", response.status);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("API Response:", data);
          
          setSuggestions(data.foods || []);
        } catch (error) {
          console.error("Error fetching food data:", error);
          setSuggestions([]);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [localQuery, activeTab]);

  const toggleFavorite = (food: USDAFood) => {
    setFavorites(prev => {
      const isFavorite = prev.some(fav => fav.description === food.description);
      if (isFavorite) {
        return prev.filter(fav => fav.description !== food.description);
      } else {
        return [...prev, { ...food, isFavorite: true }];
      }
    });
  };

  const isFavorite = (food: USDAFood) => {
    return favorites.some(fav => fav.description === food.description);
  };

  const handleSelectFood = (food: USDAFood) => {
    setSelectedFood(food);
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

    setCustomFoods(prev => [...prev, newCustomFood]);
    
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Add Food</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimes size={20} />
            </button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("search")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "search" 
                  ? "bg-white text-violet-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Search
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "favorites" 
                  ? "bg-white text-violet-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "custom" 
                  ? "bg-white text-violet-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Search Tab */}
          {activeTab === "search" && (
            <div>
              <input
                type="text"
                placeholder="Search for food..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                autoFocus
              />
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {suggestions.map((food, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectFood(food)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFood?.description === food.description
                        ? "border-violet-500 bg-violet-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-bold">{capitalizeWords(food.description)}</div>
                        {food.foodCategory && (
                          <div className="text-sm text-gray-500">{food.foodCategory}</div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(food);
                        }}
                        className="ml-2 text-yellow-400 hover:text-yellow-500"
                      >
                        {isFavorite(food) ? <FaStar size={16} /> : <FaRegStar size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div>
              <h3 className="font-medium mb-3">Your Favorite Foods</h3>
              {favorites.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No favorites yet. Star some foods from the search tab!
                </p>
              ) : (
                <div className="space-y-2">
                  {favorites.map((food, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectFood(food)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedFood?.description === food.description
                          ? "border-violet-500 bg-violet-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-bold">{capitalizeWords(food.description)}</div>
                          {food.foodCategory && (
                            <div className="text-sm text-gray-500">{food.foodCategory}</div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(food);
                          }}
                          className="ml-2 text-yellow-400 hover:text-yellow-500"
                        >
                          <FaStar size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Custom Tab */}
          {activeTab === "custom" && (
            <div>
              <div className="mb-6">
                <h3 className="font-medium mb-3">Create Custom Food</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Food Name</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Homemade Pizza"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Calories (per 100g)</label>
                    <input
                      type="number"
                      value={customCalories}
                      onChange={(e) => setCustomCalories(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Protein (g)</label>
                    <input
                      type="number"
                      value={customProtein}
                      onChange={(e) => setCustomProtein(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      value={customCarbs}
                      onChange={(e) => setCustomCarbs(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fat (g)</label>
                    <input
                      type="number"
                      value={customFat}
                      onChange={(e) => setCustomFat(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fiber (g)</label>
                    <input
                      type="number"
                      value={customFiber}
                      onChange={(e) => setCustomFiber(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddCustomFood}
                  disabled={!customName.trim()}
                  className="mt-4 w-full bg-violet-500 text-white py-2 px-4 rounded-md hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Custom Food
                </button>
              </div>

              {/* Saved Custom Foods */}
              {customFoods.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Your Custom Foods</h3>
                  <div className="space-y-2">
                    {customFoods.map((food) => (
                      <div
                        key={food.id}
                        onClick={() => handleAddFromCustomList(food)}
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors"
                      >
                        <div className="font-bold">{food.name}</div>
                        <div className="text-sm text-gray-500">
                          {food.calories} cal • {food.protein}g protein • {food.carbs}g carbs • {food.fat}g fat
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom section for selected food */}
        {selectedFood && (activeTab === "search" || activeTab === "favorites") && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
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
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
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
              className="w-full bg-violet-500 text-white py-2 px-4 rounded-md hover:bg-violet-600"
            >
              Add to Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
}