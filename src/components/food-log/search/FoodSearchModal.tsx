"use client";

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useFoodSearch } from "./hooks/useFoodSearch";
import { useFavorites } from "./hooks/useFavorites";
import { useCustomFoods } from "../../../hooks";
import { useNutrientCalculator } from "./hooks/useNutrientCalculator";
import { useFoodSearchStyles } from "./hooks/useFoodSearchStyles";
import { FoodEntry } from "../../../types/foodEntry";
import { Modal } from "../../ui/Modal";
import { FoodSelectionSection } from "./components/FoodSelectionSection";
import { capitalizeWords } from "./utils/nutritionUtils";

import SearchTab from "./SearchTab";
import FavoritesTab from "./FavoritesTab";
import CustomTab from "./CustomTab";

interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

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

interface CustomFood extends Nutrients {
  id: string;
  name: string;
}

interface FoodSearchModalProps {
  onClose: () => void;
  onAddFood: (entry: FoodEntry) => void;
  selectedDate: Date;
}

// Move TabButton outside to avoid creating components during render
const TabButton = ({ 
  tab,
  label,
  activeTab,
  setActiveTab
}: { 
  tab: "search" | "favorites" | "custom"; 
  label: string;
  activeTab: "search" | "favorites" | "custom";
  setActiveTab: (tab: "search" | "favorites" | "custom") => void;
}) => (
  <button
    onClick={() => setActiveTab(tab)}
    className={`flex-1 py-2 px-4 rounded-sm text-sm font-medium cursor-pointer transition-colors duration-200 ${
      activeTab === tab 
        ? "bg-white text-violet-600 shadow-sm" 
        : "text-gray-700 hover:text-gray-900"
    }`}
  >
    {label}
  </button>
);

function FoodSearchModal({ onClose, onAddFood, selectedDate }: FoodSearchModalProps) {
  const [activeTab, setActiveTab] = useState<"search" | "favorites" | "custom">("search");
  const [localQuery, setLocalQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<USDAFood | null>(null);
  const [quantity, setQuantity] = useState("100");
  const [unit, setUnit] = useState("Grams");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack" | "other">("breakfast");

  // Initialize styles and hooks
  useFoodSearchStyles();
  const { createFoodEntry } = useNutrientCalculator();

  // Track previous values to detect changes
  const [prevQuery, setPrevQuery] = useState(localQuery);
  const [prevTab, setPrevTab] = useState(activeTab);

  // Reset selectedFood when query is cleared or tab changes (with guard)
  if (prevQuery !== localQuery || prevTab !== activeTab) {
    setPrevQuery(localQuery);
    setPrevTab(activeTab);
    setSelectedFood(null);
  }

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
    };
    addCustomFood(newCustomFood);
    // Reset form
    setCustomName("");
    setCustomCalories("");
    setCustomProtein("");
    setCustomCarbs("");
    setCustomFat("");
    // Add to food log
    const entry: FoodEntry = {
      id: uuidv4(),
      description: newCustomFood.name,
      amount: quantity,
      unit: unit,
      date: selectedDate.toISOString(),
      mealType: mealType,
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
      mealType: mealType,
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
    
    const entry = createFoodEntry(selectedFood, quantity, unit, selectedDate, mealType);
    onAddFood(entry);
    onClose();
  };

  return (
    <Modal 
      isOpen={true}
      onClose={onClose}
      title="Add Food"
    >
      <div className="p-4 h-full flex flex-col">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-sm p-1 mb-4">
          <TabButton tab="search" label="Search" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton tab="favorites" label="Favorites" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton tab="custom" label="Custom" activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
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
              handleAddCustomFood={handleAddCustomFood}
              customFoods={customFoods}
              handleAddFromCustomList={handleAddFromCustomList}
            />
          )}
        </div>

        {/* Bottom Section - Food Selection */}
        {selectedFood && (activeTab === "search" || activeTab === "favorites") && (
          <FoodSelectionSection 
            selectedFood={selectedFood}
            quantity={quantity}
            setQuantity={setQuantity}
            unit={unit}
            setUnit={setUnit}
            mealType={mealType}
            setMealType={setMealType}
            onAddFood={handleAddFood}
          />
        )}
      </div>
    </Modal>
  );
}

export default FoodSearchModal;