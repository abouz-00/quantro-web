"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Montserrat } from 'next/font/google';
import FoodSearchModal from "../food-log/FoodSearchModal";
import FoodTable from "../food-log/FoodTable";
import EnergySummary from "../food-log/EnergySummary";
import { Button } from "../ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { HiDotsHorizontal, HiChevronLeft, HiChevronRight, HiPlus, HiCalendar, HiMenu } from "react-icons/hi";
import { Menu } from "@headlessui/react";

const montserrat = Montserrat({ subsets: ['latin'] });

// Types for nutrients and food entry
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

// Remove the USDAFood interface since it's not used in this component

export default function LogPage() {
  const [foodData, setFoodData] = useState<FoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isTargetsModalOpen, setIsTargetsModalOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  
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
      setIsCalendarOpen(false); // Close calendar after date selection
    }
  }, []);

  const handleCalendarToggle = useCallback(() => {
    setIsCalendarOpen(prev => !prev);
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
      // Close calendar with Escape key
      if (e.key === 'Escape' && isCalendarOpen) {
        e.preventDefault();
        setIsCalendarOpen(false);
      }
      
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
  }, [handleNextDay, handlePreviousDay, isCalendarOpen]);

  // Manual click outside handler
  useEffect(() => {
    if (!isCalendarOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Don't close if clicking inside the calendar components
      if (target.closest('.react-datepicker') || 
          target.closest('.react-datepicker-popper') ||
          target.closest('.custom-datepicker') ||
          target.closest('.custom-datepicker-wrapper') ||
          target.closest('.datepicker-container') ||
          target.closest('.react-datepicker__navigation') ||
          target.closest('.react-datepicker__navigation-icon') ||
          target.closest('.react-datepicker__header') ||
          target.closest('.react-datepicker__month') ||
          target.closest('.react-datepicker__week') ||
          target.closest('.react-datepicker__day') ||
          target.closest('input[class*="border-none"]') ||
          target.closest('[class*="cursor-pointer"]')) {
        return;
      }
      
      setIsCalendarOpen(false);
    };

    // Add listener with a small delay to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

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
    setSelectedEntries(prev => {
      if (prev.includes(id)) {
        // If already selected, deselect it
        return prev.filter(entryId => entryId !== id);
      } else {
        // If not selected, add to selection
        if (event.ctrlKey || event.metaKey) {
          // Multi-select with Ctrl/Cmd
          return [...prev, id];
        } else {
          // Single select
          return [id];
        }
      }
    });
  };

  const handleReorderEntries = (newOrder: FoodEntry[]) => {
    // Update the food data to reflect the new order
    const otherEntries = foodData.filter(entry => {
      const entryDate = new Date(entry.date);
      return !sameDay(entryDate, selectedDate);
    });
    
    setFoodData([...otherEntries, ...newOrder]);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E7', userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Header/Nav Bar - Fixed at top, full width */}
      <header className="w-full h-16 flex items-center justify-between px-6 shadow-sm relative" style={{ backgroundColor: '#6e44ff' }}>
        <div className="flex items-center">
          <Image 
            src="/logo.svg" 
            alt="Quantro Icon" 
            width={48}
            height={48}
            className="mr-3"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          />
          <h1 className={`text-2xl font-semibold text-white ${montserrat.className}`}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            Quantro
          </h1>
        </div>
        
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2 rounded-lg transition-all duration-300 relative z-50 cursor-pointer ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          <HiMenu className="h-6 w-6 text-white" />
        </button>
      </header>
      
      {/* Content Area with Flex Layout */}
      <div className="flex" style={{ height: 'calc(100vh - 4rem)' }}>
        {/* Main Content Area */}
        <div 
          className="flex-1 transition-all duration-300 ease-out overflow-hidden"
          style={{ minWidth: 0 }} // Prevent flex item from growing beyond available space
        >

        <div className="container mx-auto px-4 py-8">
      {/* Header with date navigation */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2 bg-white rounded-full shadow-lg px-3 py-2" style={{ backgroundColor: '#F8F5F0', border: '1px solid #EDE6DC' }}>
          <button
            onClick={handlePreviousDay}
            className="p-2 hover:bg-white hover:bg-opacity-60 rounded-full transition-colors duration-200"
            aria-label="Previous day"
          >
            <HiChevronLeft className="h-6 w-6 text-gray-600" />
          </button>
          
          <div 
            className="flex items-center space-x-2 custom-datepicker-wrapper" 
            style={{ userSelect: 'none', WebkitUserSelect: 'none', position: 'relative' }}
          >
            <HiCalendar 
              className="h-6 w-6 text-gray-600 cursor-pointer" 
              onClick={() => setIsCalendarOpen(true)}
            />
            <div className="datepicker-container">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="MMMM d, yyyy"
                className="border-none bg-transparent text-xl font-bold text-center cursor-pointer text-gray-800 px-0"
                onKeyDown={(e) => e.preventDefault()}
                onFocus={(e) => e.target.blur()}
                showPopperArrow={false}
                calendarClassName="custom-datepicker"
                popperPlacement="bottom"
                autoComplete="off"
                open={isCalendarOpen}
                onInputClick={handleCalendarToggle}
                preventOpenOnFocus={true}
                shouldCloseOnSelect={true}
                dayClassName={(date) => {
                  // Only highlight the exact selected date - very precise matching
                  if (selectedDate) {
                    const isSameDate = date.getDate() === selectedDate.getDate() &&
                                     date.getMonth() === selectedDate.getMonth() &&
                                     date.getFullYear() === selectedDate.getFullYear();
                    
                    if (isSameDate) {
                      return 'custom-selected-day';
                    }
                  }
                  
                  // Return empty string for other days (today highlighting is handled by CSS)
                  return '';
                }}
                highlightDates={[]}
              />
            </div>
          </div>
          
          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-white hover:bg-opacity-60 rounded-full transition-colors duration-200"
            aria-label="Next day"
          >
            <HiChevronRight className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex items-center">
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="default"
            className="flex items-center text-white px-4 py-2 rounded-full text-sm font-medium cursor-pointer"
            style={{ backgroundColor: '#6e44ff' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a37d9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6e44ff'}
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
              onReorderEntries={handleReorderEntries}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            No entries for this date. Add some food to get started!
          </div>
        )}
      </div>
      
      {/* Summary grid - Single column now */}
      <div className="mb-6">
        <EnergySummary totals={totals} customGoals={customGoals} />
      </div>
      
      {/* Food search modal */}
      {isModalOpen && (
        <FoodSearchModal
          onClose={() => setIsModalOpen(false)}
          onAddFood={addFoodEntry}
          selectedDate={selectedDate}
        />
      )}
        </div>

        {/* Targets Modal */}
      {isTargetsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 transition-opacity duration-300"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
            onClick={() => setIsTargetsModalOpen(false)}
          ></div>
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Set Custom Targets</h2>
              <button
                onClick={() => setIsTargetsModalOpen(false)}
                className="p-1 rounded-full transition-colors duration-200"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                aria-label="Close"
              >
                <span className="text-gray-500 text-xl">×</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Calories</label>
                <input
                  type="number"
                  value={targetInput.calories}
                  onChange={(e) => handleInputChange("calories", Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
                <input
                  type="number"
                  value={targetInput.protein}
                  onChange={(e) => handleInputChange("protein", Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Carbs (g)</label>
                <input
                  type="number"
                  value={targetInput.carbs}
                  onChange={(e) => handleInputChange("carbs", Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fat (g)</label>
                <input
                  type="number"
                  value={targetInput.fat}
                  onChange={(e) => handleInputChange("fat", Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsTargetsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSaveTargets();
                  setIsTargetsModalOpen(false);
                }}
                className="px-6 py-2 text-white rounded-lg transition-colors duration-200"
                style={{ backgroundColor: '#6e44ff' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a37d9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6e44ff'}
              >
                Save Targets
              </button>
            </div>
          </div>
        </div>
      )}
      </div>        {/* Sidebar */}
        <div className={`transition-all duration-300 ease-out ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
          {isSidebarOpen && (
            <>
              {/* Backdrop for mobile/overlay effect */}
              <div 
                className="fixed inset-0 transition-opacity duration-300 z-40 lg:hidden"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
                onClick={() => setIsSidebarOpen(false)}
              ></div>
              
              {/* Sidebar Content */}
              <div className="shadow-xl relative z-50"
                   style={{ backgroundColor: '#6e44ff', height: '100vh' }}>
                {/* Hamburger positioned to match header exactly using fixed positioning */}
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="fixed right-6 p-2 rounded-lg transition-colors duration-200 z-50 cursor-pointer"
                  style={{ top: '0.75rem' }} // 12px from viewport top to match header hamburger exactly
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  aria-label="Close menu"
                >
                  <HiMenu className="h-6 w-6 text-white" />
                </button>
                
                <div className="flex flex-col h-full pt-4">
                  {/* Sidebar Content */}
                  <div className="flex-1 px-6 pt-2">
                  <nav>
                    <button
                      onClick={() => {
                        setIsTargetsModalOpen(true);
                        setIsSidebarOpen(false);
                      }}
                      className="w-full text-left p-4 rounded-lg transition-colors duration-200 flex items-center justify-between"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span className="text-white font-medium text-lg">Set Targets</span>
                      <span className="text-white text-xl">🎯</span>
                    </button>
                  </nav>
                  </div>
                </div>
              </div>
          </>
        )}
      </div>

      {/* Targets Modal */}
      {isTargetsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 transition-opacity duration-300"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
            onClick={() => setIsTargetsModalOpen(false)}
          ></div>
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Set Custom Targets</h2>
              <button
                onClick={() => setIsTargetsModalOpen(false)}
                className="p-1 rounded-full transition-colors duration-200"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                aria-label="Close"
              >
                <span className="text-gray-500 text-xl">×</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Calories</label>
                <input
                  type="number"
                  value={targetInput.calories}
                  onChange={(e) => handleInputChange("calories", Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
                <input
                  type="number"
                  value={targetInput.protein}
                  onChange={(e) => handleInputChange("protein", Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Carbs (g)</label>
                <input
                  type="number"
                  value={targetInput.carbs}
                  onChange={(e) => handleInputChange("carbs", Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fat (g)</label>
                <input
                  type="number"
                  value={targetInput.fat}
                  onChange={(e) => handleInputChange("fat", Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsTargetsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSaveTargets();
                  setIsTargetsModalOpen(false);
                }}
                className="px-6 py-2 text-white rounded-lg transition-colors duration-200"
                style={{ backgroundColor: '#6e44ff' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a37d9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6e44ff'}
              >
                Save Targets
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}