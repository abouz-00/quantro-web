"use client";

import { useState, useEffect, Fragment } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { FaTrash } from "react-icons/fa";
import { HiPlus } from "react-icons/hi";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { HiDotsHorizontal, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { Menu } from '@headlessui/react';
import FoodSearchModal from "@/components/food-log/FoodSearchModal";
import ProgressBar from "@/components/food-log/ProgressBar";
import FoodTable from "@/components/food-log/FoodTable";
import CustomTargets from "@/components/food-log/CustomTargets";
import EnergySummary from "@/components/food-log/EnergySummary";
import { Doughnut } from 'react-chartjs-2';

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
  date: string; // Add this
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
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
  const [totals, setTotals] = useState<Nutrients>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [targetInput, setTargetInput] = useState<Nutrients>({
    calories: 2740,
    protein: 150,
    carbs: 300,
    fat: 70,
  });
  const [customGoals, setCustomGoals] = useState<Nutrients>(targetInput);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [recentFoods, setRecentFoods] = useState<USDAFood[]>([]);

  useEffect(() => {
    const savedFoodData = localStorage.getItem('foodData');
    const savedTotals = localStorage.getItem('totals');
    const savedGoals = localStorage.getItem('customGoals');
    
    if (savedFoodData) setFoodData(JSON.parse(savedFoodData));
    if (savedTotals) setTotals(JSON.parse(savedTotals));
    if (savedGoals) setCustomGoals(JSON.parse(savedGoals));
  }, []);

  useEffect(() => {
    localStorage.setItem('foodData', JSON.stringify(foodData));
    localStorage.setItem('totals', JSON.stringify(totals));
    localStorage.setItem('customGoals', JSON.stringify(customGoals));
  }, [foodData, totals, customGoals]);

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
  }, []);

  const addFoodEntry = (entry: FoodEntry) => {
    setFoodData(prev => [...prev, entry]);
    setTotals(prev => ({
      calories: prev.calories + entry.calories,
      protein: prev.protein + entry.protein,
      carbs: prev.carbs + entry.carbs,
      fat: prev.fat + entry.fat,
    }));
    updateRecents(entry);
  };

  const updateRecents = (selectedFood: USDAFood) => {
    // Add the food to recent foods if not already there
    setRecentFoods(prev => {
      const exists = prev.some(f => f.description === selectedFood.description);
      if (!exists) {
        return [selectedFood, ...prev].slice(0, 5); // Keep last 5
      }
      return prev;
    });
  };

  const removeFoodEntry = (id: string) => {
    const removedEntry = foodData.find(item => item.id === id);
    if (removedEntry) {
      setTotals(prev => ({
        calories: prev.calories - removedEntry.calories,
        protein: prev.protein - removedEntry.protein,
        carbs: prev.carbs - removedEntry.carbs,
        fat: prev.fat - removedEntry.fat,
      }));
    }
    setFoodData(prev => prev.filter(item => item.id !== id));
  };

  const handleInputChange = (field: keyof Nutrients, value: number) => {
    setTargetInput({ ...targetInput, [field]: value });
  };

  const handleSaveTargets = () => {
    setCustomGoals(targetInput);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleEntrySelect = (id: string, index: number, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(index, lastSelectedIndex);
      const end = Math.max(index, lastSelectedIndex);
      const entriesInRange = foodData.slice(start, end + 1).map(entry => entry.id);
      setSelectedEntries(entriesInRange);
    } else {
      if (selectedEntries.includes(id)) {
        setSelectedEntries(selectedEntries.filter(entryId => entryId !== id));
      } else {
        setSelectedEntries([...selectedEntries, id]);
      }
      setLastSelectedIndex(index);
    }
  };

  const copySelectedEntries = () => {
    const selectedData = foodData.filter(entry => selectedEntries.includes(entry.id));
    navigator.clipboard.writeText(JSON.stringify(selectedData));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(foodData);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `food-log-${selectedDate.toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Update the groupedEntries reducer to filter by selected date
  const groupedEntries = foodData.reduce((acc, entry) => {
    const entryDate = new Date(entry.date);
    const selectedDateStr = selectedDate.toDateString();
    const entryDateStr = entryDate.toDateString();
    
    // Only include entries from the selected date
    if (selectedDateStr === entryDateStr) {
      const dateKey = entryDate.toLocaleDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(entry);
    }
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6"> {/* Increased max-width */}
      <header>
        <h1 className="text-3xl font-bold mb-2">Log Your Food</h1>
        <p className="text-muted-foreground mb-4">
          Search from USDA, track your macros.
        </p>
      </header>

      <div className="mb-6">
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-[#6E44FF] hover:bg-[#6E44FF]/90 text-white px-8 py-3 text-lg flex items-center gap-2 w-full justify-center rounded-lg"
        >
          Add Food
          <HiPlus className="w-5 h-5" />
        </Button>
      </div>

      {/* Food Log Table Section */}
      {foodData.length > 0 && (
        <section className="bg-white rounded-lg shadow-lg mb-6">
          <div className="p-4 flex justify-between items-center border-b">
            <div className="flex items-center gap-2">
              <button onClick={handlePreviousDay} className="p-1 hover:bg-gray-100 rounded">
                <HiChevronLeft className="w-5 h-5" />
              </button>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                customInput={
                  <button className="px-3 py-1 hover:bg-gray-100 rounded">
                    {selectedDate.toLocaleDateString()}
                  </button>
                }
              />
              <button onClick={handleNextDay} className="p-1 hover:bg-gray-100 rounded">
                <HiChevronRight className="w-5 h-5" />
              </button>
            </div>

            <Menu as="div" className="relative">
              <Menu.Button className="p-2 hover:bg-gray-100 rounded">
                <HiDotsHorizontal className="w-5 h-5" />
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } w-full text-left px-4 py-2`}
                      onClick={copySelectedEntries}
                    >
                      Copy Selected
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } w-full text-left px-4 py-2`}
                      onClick={exportData}
                    >
                      Export Data
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } w-full text-left px-4 py-2 text-red-600`}
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all entries?')) {
                          setFoodData([]);
                          setTotals({
                            calories: 0,
                            protein: 0,
                            carbs: 0,
                            fat: 0,
                          });
                        }
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>

          <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <FoodTable 
              foodData={foodData} 
              groupedEntries={groupedEntries} 
              selectedEntries={selectedEntries} 
              handleEntrySelect={handleEntrySelect} 
              removeFoodEntry={removeFoodEntry} 
            />
          </div>
        </section>
      )}

      {/* Grid container for Energy Summary and Custom Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Energy Summary Section */}
        <EnergySummary totals={totals} customGoals={customGoals} />

        {/* Set Custom Targets Section */}
        <CustomTargets 
          targetInput={targetInput} 
          handleInputChange={handleInputChange} 
          handleSaveTargets={handleSaveTargets} 
        />
      </div>

      <div className="mt-4 flex justify-center">
        <div style={{width: '150px', height: '150px'}}>
          <Doughnut
            data={{
              labels: ['Protein', 'Carbs', 'Fat'],
              datasets: [{
                data: [
                  totals.protein * 4, // 4 calories per gram of protein
                  totals.carbs * 4,   // 4 calories per gram of carbs
                  totals.fat * 9,     // 9 calories per gram of fat
                ],
                backgroundColor: ['#7EE081', '#F0E15B', '#E55640'],
              }]
            }}
            options={{
              plugins: {
                legend: {
                  position: 'bottom'
                }
              },
              cutout: '70%'
            }}
          />
        </div>
      </div>

      {isModalOpen && (
        <FoodSearchModal
          onClose={() => setIsModalOpen(false)}
          onAddFood={addFoodEntry}
          selectedDate={selectedDate}
          recentFoods={recentFoods}
        />
      )}
    </main>
  );
}
