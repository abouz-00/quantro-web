"use client";

import React, { useState, useEffect, useCallback } from "react";
import FoodSearchModal from "../food-log/FoodSearchModal";
import FoodTable from "../food-log/FoodTable";
import CustomTargets from "../food-log/CustomTargets";
import EnergySummary from "../food-log/EnergySummary";
import { Button } from "../ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { HiDotsHorizontal, HiChevronLeft, HiChevronRight, HiPlus } from "react-icons/hi";
import { Menu } from "@headlessui/react";

// Types for nutrients, food entry, and USDA food suggestion (extended)
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

interface USDAFood {
  description: string;
  foodCategory?: string;
  foodNutrients: { nutrientName: string; value: number }[];
  servingSize?: number;
  servingSizeUnit?: string;
}

export default function LogPage() {
  const [foodData, setFoodData] = useState<FoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const recentFoods: USDAFood[] = []; // Simple constant array instead of state
  
  const [totals, setTotals] = useState<Nutrients>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  
  const [targetInput, setTargetInput] = useState<Nutrients>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 70,
  });
  
  const [customGoals, setCustomGoals] = useState<Nutrients>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 70,
  });
  
  // Define these callback functions BEFORE the useEffect that depends on them
  const handleDateChange = useCallback((date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  }, []);

  const handlePreviousDay = useCallback(() => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  }, [selectedDate]);

  const handleNextDay = useCallback(() => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  }, [selectedDate]);

  // Local storage effects
  useEffect(() => {
    const savedFoodData = localStorage.getItem('foodData');
    const savedTotals = localStorage.getItem('totals');
    const savedGoals = localStorage.getItem('customGoals');
    
    if (savedFoodData) setFoodData(JSON.parse(savedFoodData));
    if (savedTotals) setTotals(JSON.parse(savedTotals));
    if (savedGoals) setCustomGoals(JSON.parse(savedGoals));
  }, []);

  // Add this effect to recalculate totals when the date changes
  useEffect(() => {
    // Calculate totals for the current date
    const entriesForDay = foodData.filter(entry => {
      const entryDate = new Date(entry.date);
      return sameDay(entryDate, selectedDate);
    });
    
    // Reset totals for the current day
    const dailyTotals = entriesForDay.reduce((acc, entry) => {
      return {
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat,
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
    
    setTotals(dailyTotals);
  }, [selectedDate, foodData]);

  // Remove the existing totals from localStorage since we're now calculating them per day
  // Keep this effect for saving food data and goals only
  useEffect(() => {
    localStorage.setItem('foodData', JSON.stringify(foodData));
    localStorage.setItem('customGoals', JSON.stringify(customGoals));
  }, [foodData, customGoals]);

  // Keyboard shortcuts effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Add food - Ctrl/Cmd + A
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsModalOpen(true);
      }
      
      // Next day - Ctrl/Cmd + Right Arrow
      if (e.key === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleNextDay();
      }
      
      // Previous day - Ctrl/Cmd + Left Arrow
      if (e.key === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handlePreviousDay();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextDay, handlePreviousDay]);

  const addFoodEntry = (entry: FoodEntry) => {
    setFoodData(prev => [...prev, entry]);
    setTotals(prev => ({
      calories: prev.calories + entry.calories,
      protein: prev.protein + entry.protein,
      carbs: prev.carbs + entry.carbs,
      fat: prev.fat + entry.fat,
    }));
  };

  const removeFoodEntry = (id: string) => {
    const entryToRemove = foodData.find(item => item.id === id);
    
    if (!entryToRemove) return;
    
    setFoodData(prev => prev.filter(item => item.id !== id));
    setSelectedEntries(prev => prev.filter(item => item !== id));
    
    // Subtract the removed entry's nutrients from totals
    setTotals(prev => ({
      calories: prev.calories - entryToRemove.calories,
      protein: prev.protein - entryToRemove.protein,
      carbs: prev.carbs - entryToRemove.carbs,
      fat: prev.fat - entryToRemove.fat,
    }));
  };

  const updateFoodEntry = (id: string, updates: Partial<FoodEntry>) => {
    setFoodData(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    }));

    // If we're updating nutrients, recalculate totals
    if ('calories' in updates || 'protein' in updates || 'carbs' in updates || 'fat' in updates) {
      // Find the original entry
      const originalEntry = foodData.find(item => item.id === id);
      if (originalEntry) {
        // Calculate differences
        const calorieDiff = (updates.calories || 0) - originalEntry.calories;
        const proteinDiff = (updates.protein || 0) - originalEntry.protein;
        const carbsDiff = (updates.carbs || 0) - originalEntry.carbs;
        const fatDiff = (updates.fat || 0) - originalEntry.fat;

        // Update totals with differences
        setTotals(prev => ({
          calories: prev.calories + calorieDiff,
          protein: prev.protein + proteinDiff,
          carbs: prev.carbs + carbsDiff,
          fat: prev.fat + fatDiff,
        }));
      }
    }
  };

  const handleInputChange = (field: keyof Nutrients, value: number) => {
    setTargetInput(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveTargets = () => {
    setCustomGoals({ ...targetInput });
  };

  // Filter entries by selected date (only showing entries for the current day)
  const sameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const filteredEntries = foodData.filter(entry => {
    const entryDate = new Date(entry.date);
    return sameDay(entryDate, selectedDate);
  });

  // Handle entry selection
  const handleEntrySelect = (id: string, index: number, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Toggle selection when Ctrl/Cmd is pressed
      setSelectedEntries(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else if (event.shiftKey && selectedEntries.length > 0) {
      // Select range when Shift is pressed
      const lastSelectedIndex = foodData.findIndex(
        entry => entry.id === selectedEntries[selectedEntries.length - 1]
      );
      
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      
      const newSelection = foodData
        .slice(start, end + 1)
        .map(entry => entry.id);
      
      setSelectedEntries(prev => [...new Set([...prev, ...newSelection])]);
    } else {
      // Regular click (select just this entry)
      setSelectedEntries([id]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with date navigation */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousDay}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Previous day"
          >
            <HiChevronLeft className="h-6 w-6" />
          </button>
          
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="MMMM d, yyyy"
            className="border-none bg-transparent text-xl font-bold text-center cursor-pointer"
          />
          
          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Next day"
          >
            <HiChevronRight className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex items-center">
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="default"
            className="flex items-center bg-violet-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-violet-600"
          >
            <HiPlus className="mr-1 h-5 w-5" />
            Add Food
          </Button>
          
          <div className="relative ml-2">
            <Menu>
              <Menu.Button className="p-2 hover:bg-gray-100 rounded-full">
                <HiDotsHorizontal className="h-5 w-5" />
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-1 w-56 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-10">
                <div className="p-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${active ? 'bg-gray-100' : ''} w-full text-left px-4 py-2`}
                        onClick={() => {
                          if (selectedEntries.length > 0) {
                            selectedEntries.forEach(id => removeFoodEntry(id));
                          }
                        }}
                      >
                        Delete Selected
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Menu>
          </div>
        </div>
      </div>
      
      {/* Food entries table - MOVED UP */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        {filteredEntries.length > 0 ? (
          <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <FoodTable
              foodData={foodData}
              filteredEntries={filteredEntries} // Pass filtered entries directly
              selectedEntries={selectedEntries}
              handleEntrySelect={handleEntrySelect}
              removeFoodEntry={removeFoodEntry}
              updateFoodEntry={updateFoodEntry}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No entries for this date. Add some food to get started!
          </div>
        )}
      </div>
      
      {/* Summary and targets grid - MOVED DOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <EnergySummary totals={totals} customGoals={customGoals} />
        <CustomTargets
          targetInput={targetInput}
          handleInputChange={handleInputChange}
          handleSaveTargets={handleSaveTargets}
        />
      </div>
      
      {/* Food search modal */}
      {isModalOpen && (
        <FoodSearchModal
          onClose={() => setIsModalOpen(false)}
          onAddFood={addFoodEntry}
          selectedDate={selectedDate}
          recentFoods={recentFoods}
        />
      )}
    </div>
  );
}