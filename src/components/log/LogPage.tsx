"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Poppins } from 'next/font/google';
import FoodSearchModal from "../food-log/FoodSearchModal";
import FoodTable from "../food-log/FoodTable";
import EnergySummary from "../food-log/EnergySummary";
import { Button } from "../ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { HiDotsHorizontal, HiChevronLeft, HiChevronRight, HiPlus, HiCalendar, HiMenu, HiX } from "react-icons/hi";
import { Menu } from "@headlessui/react";

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

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
  const [clipboardEntries, setClipboardEntries] = useState<FoodEntry[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    targetEntryId: string | null;
  }>({ visible: false, x: 0, y: 0, targetEntryId: null });
  const [editModalEntry, setEditModalEntry] = useState<FoodEntry | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  
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

  // Load food data from API when component mounts or date changes
  useEffect(() => {
    const loadFoodData = async () => {
      try {
        // Format the selected date for the API
        const dateParam = selectedDate.toISOString().split('T')[0];
        const response = await fetch(`/api/food-logs?date=${dateParam}`);
        
        if (response.ok) {
          const apiData = await response.json();
          // Convert API data to frontend format
          const formattedData: FoodEntry[] = apiData.map((log: any) => ({
            id: log.id,
            description: log.foodName + (log.brand ? ` (${log.brand})` : ''),
            amount: log.quantity.toString(),
            unit: log.unit,
            date: log.date,
            mealType: log.mealType,
            calories: log.calories,
            protein: log.protein,
            carbs: log.carbs,
            fat: log.fat,
            fiber: log.fiber || 0,
          }));
          setFoodData(formattedData);
        } else {
          // If API fails, try localStorage as fallback
          const savedFoodData = localStorage.getItem('foodData');
          if (savedFoodData) {
            const parsedData = JSON.parse(savedFoodData);
            // Filter by selected date
            const filteredData = parsedData.filter((entry: FoodEntry) => {
              const entryDate = new Date(entry.date);
              return sameDay(entryDate, selectedDate);
            });
            setFoodData(filteredData);
          } else {
            setFoodData([]);
          }
        }
      } catch (error) {
        console.error('Error loading food data:', error);
        // Fallback to localStorage
        const savedFoodData = localStorage.getItem('foodData');
        if (savedFoodData) {
          const parsedData = JSON.parse(savedFoodData);
          const filteredData = parsedData.filter((entry: FoodEntry) => {
            const entryDate = new Date(entry.date);
            return sameDay(entryDate, selectedDate);
          });
          setFoodData(filteredData);
        } else {
          setFoodData([]);
        }
      }
    };

    loadFoodData();
  }, [selectedDate]); // Re-load when date changes

  // Load goals on component mount
  useEffect(() => {
    const loadGoals = () => {
      const savedGoals = localStorage.getItem('customGoals');
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        setCustomGoals(parsedGoals);
        setTargetInput(parsedGoals); // Also sync target input
      }
    };

    loadGoals();
  }, []);

  // Helper function to check if two dates are the same day
  const sameDay = useCallback((d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
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
  }, [selectedDate, foodData, sameDay]);

  // Save goals to localStorage when they change (but skip initial load)
  const [goalsLoaded, setGoalsLoaded] = useState(false);
  useEffect(() => {
    if (goalsLoaded) {
      localStorage.setItem('customGoals', JSON.stringify(customGoals));
    } else {
      setGoalsLoaded(true);
    }
  }, [customGoals, goalsLoaded]);

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

  const addFoodEntry = useCallback(async (entry: FoodEntry) => {
    try {
      // Ensure the entry uses the selected date
      const entryWithCorrectDate = {
        ...entry,
        date: selectedDate.toISOString(),
      };

      // Save to API
      const response = await fetch('/api/food-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodName: entryWithCorrectDate.description.split(' (')[0], // Extract food name before brand
          brand: entryWithCorrectDate.description.includes(' (') ? entryWithCorrectDate.description.split(' (')[1].replace(')', '') : null,
          quantity: parseFloat(entryWithCorrectDate.amount),
          unit: entryWithCorrectDate.unit,
          mealType: entryWithCorrectDate.mealType,
          calories: entryWithCorrectDate.calories,
          protein: entryWithCorrectDate.protein,
          carbs: entryWithCorrectDate.carbs,
          fat: entryWithCorrectDate.fat,
          fiber: entryWithCorrectDate.fiber || 0,
        }),
      });

      if (response.ok) {
        const savedEntry = await response.json();
        // Update local state with API response
        const formattedEntry: FoodEntry = {
          id: savedEntry.id,
          description: savedEntry.foodName + (savedEntry.brand ? ` (${savedEntry.brand})` : ''),
          amount: savedEntry.quantity.toString(),
          unit: savedEntry.unit,
          date: savedEntry.date,
          mealType: savedEntry.mealType,
          calories: savedEntry.calories,
          protein: savedEntry.protein,
          carbs: savedEntry.carbs,
          fat: savedEntry.fat,
          fiber: savedEntry.fiber || 0,
        };
        setFoodData(prev => [...prev, formattedEntry]);
      } else {
        // Fallback to local storage
        setFoodData(prev => [...prev, entryWithCorrectDate]);
        const allLocalData = JSON.parse(localStorage.getItem('foodData') || '[]');
        localStorage.setItem('foodData', JSON.stringify([...allLocalData, entryWithCorrectDate]));
      }
    } catch (error) {
      console.error('Error saving food entry:', error);
      // Fallback to local storage
      const entryWithCorrectDate = {
        ...entry,
        date: selectedDate.toISOString(),
      };
      setFoodData(prev => [...prev, entryWithCorrectDate]);
      const allLocalData = JSON.parse(localStorage.getItem('foodData') || '[]');
      localStorage.setItem('foodData', JSON.stringify([...allLocalData, entryWithCorrectDate]));
    }
  }, [selectedDate]);

  const removeFoodEntry = useCallback(async (id: string) => {
    const entryToRemove = foodData.find(item => item.id === id);
    
    if (!entryToRemove) return;
    
    try {
      // Try to delete from API
      const response = await fetch(`/api/food-logs?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state only if API call succeeds
        setFoodData(prev => prev.filter(item => item.id !== id));
        setSelectedEntries(prev => prev.filter(item => item !== id));
      } else {
        // Fallback to local storage only
        setFoodData(prev => prev.filter(item => item.id !== id));
        setSelectedEntries(prev => prev.filter(item => item !== id));
        localStorage.setItem('foodData', JSON.stringify(foodData.filter(item => item.id !== id)));
      }
    } catch (error) {
      console.error('Error deleting food entry:', error);
      // Fallback to local storage only
      setFoodData(prev => prev.filter(item => item.id !== id));
      setSelectedEntries(prev => prev.filter(item => item !== id));
      localStorage.setItem('foodData', JSON.stringify(foodData.filter(item => item.id !== id)));
    }
  }, [foodData]);

  const updateFoodEntry = useCallback(async (id: string, updates: Partial<FoodEntry>) => {
    try {
      // Try to update via API
      const response = await fetch('/api/food-logs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          quantity: updates.amount ? parseFloat(updates.amount) : undefined,
          calories: updates.calories,
          protein: updates.protein,
          carbs: updates.carbs,
          fat: updates.fat,
        }),
      });

      if (response.ok) {
        // Update local state only if API call succeeds
        setFoodData(prev => prev.map(item => {
          if (item.id === id) {
            return { ...item, ...updates };
          }
          return item;
        }));
      } else {
        // Fallback to local storage only
        setFoodData(prev => prev.map(item => {
          if (item.id === id) {
            return { ...item, ...updates };
          }
          return item;
        }));
        localStorage.setItem('foodData', JSON.stringify(foodData.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )));
      }
    } catch (error) {
      console.error('Error updating food entry:', error);
      // Fallback to local storage only
      setFoodData(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      }));
      localStorage.setItem('foodData', JSON.stringify(foodData.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )));
    }
  }, [foodData]);

  const handleInputChange = useCallback((field: keyof Nutrients, value: number) => {
    setTargetInput(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveTargets = useCallback(() => {
    setCustomGoals({ ...targetInput });
  }, [targetInput]);

  const filteredEntries = useMemo(() => {
    return foodData.filter(entry => {
      const entryDate = new Date(entry.date);
      return sameDay(entryDate, selectedDate);
    });
  }, [foodData, selectedDate, sameDay]);

  // Calculate totals for selected entries (if any selected) or use daily totals
  const selectedEntriesTotals = useMemo(() => {
    if (selectedEntries.length === 0) return totals;
    
    return filteredEntries
      .filter((entry: FoodEntry) => selectedEntries.includes(entry.id))
      .reduce((acc: Nutrients, entry: FoodEntry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat,
      }), {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
  }, [filteredEntries, selectedEntries, totals]);

  const displayTotals = selectedEntries.length > 0 ? selectedEntriesTotals : totals;

  // Handle entry selection
  const handleEntrySelect = useCallback((id: string, index: number, event: React.MouseEvent) => {
    setSelectedEntries(prev => {
      if (prev.includes(id)) {
        // If already selected, deselect it
        return prev.filter(entryId => entryId !== id);
      } else {
        // If not selected, add to selection
        if (event.ctrlKey || event.metaKey) {
          // Multi-select with Ctrl/Cmd
          return [...prev, id];
        } else if (event.shiftKey && prev.length > 0) {
          // Range selection with Shift
          const lastSelectedIndex = filteredEntries.findIndex((entry: FoodEntry) => 
            entry.id === prev[prev.length - 1]
          );
          
          if (lastSelectedIndex !== -1) {
            const startIndex = Math.min(lastSelectedIndex, index);
            const endIndex = Math.max(lastSelectedIndex, index);
            const rangeIds = filteredEntries
              .slice(startIndex, endIndex + 1)
              .map((entry: FoodEntry) => entry.id);
            
            // Combine existing selection with range selection
            const combined = [...prev, ...rangeIds];
            // Remove duplicates
            return [...new Set(combined)];
          } else {
            // Fallback to regular multi-select
            return [...prev, id];
          }
        } else {
          // Single select
          return [id];
        }
      }
    });
  }, [filteredEntries]);

  const handleReorderEntries = useCallback((newOrder: FoodEntry[]) => {
    // Update the food data to reflect the new order
    const otherEntries = foodData.filter((entry: FoodEntry) => {
      const entryDate = new Date(entry.date);
      return !sameDay(entryDate, selectedDate);
    });
    
    setFoodData([...otherEntries, ...newOrder]);
  }, [foodData, selectedDate, sameDay]);

  // Context menu handlers
  const handleContextMenu = useCallback((e: React.MouseEvent, entryId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      targetEntryId: entryId
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0, targetEntryId: null });
  }, []);

  const handleCopyEntries = useCallback(() => {
    const entriesToCopy = selectedEntries.length > 0 
      ? foodData.filter(entry => selectedEntries.includes(entry.id))
      : contextMenu.targetEntryId 
        ? foodData.filter(entry => entry.id === contextMenu.targetEntryId)
        : [];
    
    setClipboardEntries(entriesToCopy);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
    closeContextMenu();
  }, [selectedEntries, foodData, contextMenu.targetEntryId, closeContextMenu]);

  const handleCopyCurrentDay = useCallback(() => {
    const currentDayEntries = filteredEntries;
    setClipboardEntries(currentDayEntries);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  }, [filteredEntries]);

  const handleCopySelectedItems = useCallback(() => {
    if (selectedEntries.length === 0) return;
    const entriesToCopy = foodData.filter(entry => selectedEntries.includes(entry.id));
    setClipboardEntries(entriesToCopy);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  }, [selectedEntries, foodData]);

  const handlePasteEntries = useCallback(() => {
    if (clipboardEntries.length === 0) return;
    
    const newEntries = clipboardEntries.map(entry => ({
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: selectedDate.toISOString()
    }));
    
    newEntries.forEach(entry => addFoodEntry(entry));
    closeContextMenu();
  }, [clipboardEntries, selectedDate, addFoodEntry, closeContextMenu]);

  const handleDeleteSelectedEntries = useCallback(() => {
    const entriesToDelete = selectedEntries.length > 0 
      ? selectedEntries
      : contextMenu.targetEntryId 
        ? [contextMenu.targetEntryId]
        : [];
    
    entriesToDelete.forEach(id => removeFoodEntry(id));
    closeContextMenu();
  }, [selectedEntries, contextMenu.targetEntryId, removeFoodEntry, closeContextMenu]);

  const handleEditEntry = useCallback(() => {
    const entryToEdit = contextMenu.targetEntryId 
      ? foodData.find(entry => entry.id === contextMenu.targetEntryId)
      : selectedEntries.length === 1 
        ? foodData.find(entry => entry.id === selectedEntries[0])
        : null;
    
    if (entryToEdit) {
      setEditModalEntry(entryToEdit);
    }
    closeContextMenu();
  }, [contextMenu.targetEntryId, selectedEntries, foodData, closeContextMenu]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        closeContextMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.visible, closeContextMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl+C or Cmd+C - Copy selected entries
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedEntries.length > 0) {
        e.preventDefault();
        const entriesToCopy = foodData.filter(entry => selectedEntries.includes(entry.id));
        setClipboardEntries(entriesToCopy);
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
      }

      // Ctrl+V or Cmd+V - Paste entries
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboardEntries.length > 0) {
        e.preventDefault();
        handlePasteEntries();
      }

      // Delete or Backspace - Delete selected entries
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEntries.length > 0) {
        e.preventDefault();
        selectedEntries.forEach(id => removeFoodEntry(id));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedEntries, foodData, clipboardEntries, handlePasteEntries, removeFoodEntry]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E7', userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Header/Nav Bar - Fixed at top, full width */}
      <header className={`w-full h-16 flex items-center justify-between px-6 shadow-sm relative transition-all duration-300 rounded-b-3xl`} style={{ backgroundColor: '#6e44ff' }}>
        <div className="flex items-center">
          <img 
            src="/main_header.svg" 
            alt="Quantro Logo" 
            className="h-6.5"
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none',
              filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.1))', // Adding subtle drop shadow
              maxHeight: '2rem', // Enforce 32px max height
              width: 'auto' // Let width scale proportionally
            }}
          />
        </div>
        
        <div className="relative">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg transition-colors duration-200 relative z-[60] cursor-pointer"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            <HiMenu className={`h-6 w-6 ${isSidebarOpen ? 'text-[#6e44ff]' : 'text-white'}`} />
          </button>
          
          {/* Dropdown Menu */}
          {isSidebarOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 transition-opacity duration-300 z-40"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
                onClick={() => setIsSidebarOpen(false)}
              ></div>
              
              {/* Dropdown Content */}
              <div 
                className="absolute top-12 right-0 bg-white rounded-lg shadow-xl z-50"
                style={{ 
                  width: '12rem', 
                  minWidth: '10rem',
                  animation: 'fadeIn 0.15s ease-out'
                }}
              >
                <div className="py-2">
                  <nav>
                    <button
                      onClick={() => {
                        setIsTargetsModalOpen(true);
                        setIsSidebarOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 transition-colors duration-200 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    >
                      <span className="font-medium text-base flex items-center gap-2" style={{ color: '#6e44ff' }}>
                        🎯 Set Targets
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        // Add sign out logic here
                        setIsSidebarOpen(false);
                        console.log('Sign out clicked');
                      }}
                      className="w-full text-left px-4 py-3 transition-colors duration-200 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    >
                      <span className="font-medium text-base flex items-center gap-2" style={{ color: '#6e44ff' }}>
                        🚪 Sign Out
                      </span>
                    </button>
                  </nav>
                </div>
              </div>
            </>
          )}
        </div>
      </header>
      
      {/* Content Area with Flex Layout */}
      <div className="flex rounded-t-3xl bg-inherit" style={{ height: 'calc(100vh - 4rem)' }}>
        {/* Main Content Area */}
        <div 
          className={`flex-1 transition-all duration-300 ease-out overflow-hidden rounded-t-3xl`}
          style={{ minWidth: 0, backgroundColor: '#F5F0E7' }} // Prevent flex item from growing beyond available space
        >

        <div className="container mx-auto px-4 py-8">
      {/* Header with date navigation */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2 bg-white rounded-full shadow-lg px-3 py-2" style={{ backgroundColor: '#F8F5F0', border: '1px solid #EDE6DC' }}>
          <button
            onClick={handlePreviousDay}
            className="p-2 hover:bg-white hover:bg-opacity-60 rounded-full transition-colors duration-200 cursor-pointer"
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
            className="p-2 hover:bg-white hover:bg-opacity-60 rounded-full transition-colors duration-200 cursor-pointer"
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
          
          {/* Clipboard indicator */}
          {clipboardEntries.length > 0 && (
            <div className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              📋 {clipboardEntries.length} copied
            </div>
          )}
          
          <div className="relative ml-2">
            <Menu>
              <Menu.Button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors duration-200">
                <HiDotsHorizontal className="h-5 w-5" />
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-1 w-56 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-10">
                <div className="p-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${active ? 'bg-gray-100' : ''} w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-md`}
                        onClick={handleCopyCurrentDay}
                        disabled={filteredEntries.length === 0}
                      >
                        Copy Current Day
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${active ? 'bg-gray-100' : ''} w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-md ${selectedEntries.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleCopySelectedItems}
                        disabled={selectedEntries.length === 0}
                      >
                        Copy Selected Items
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${active ? 'bg-gray-100' : ''} w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-md ${clipboardEntries.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handlePasteEntries}
                        disabled={clipboardEntries.length === 0}
                      >
                        Paste {clipboardEntries.length > 0 ? `(${clipboardEntries.length} items)` : ''}
                      </button>
                    )}
                  </Menu.Item>
                </div>
                <div className="p-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${active ? 'bg-gray-100' : ''} w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-md`}
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
          <div className="w-full -mx-4 px-4 sm:mx-0 sm:px-0">
            <FoodTable
              foodData={foodData}
              filteredEntries={filteredEntries} // Pass filtered entries directly
              selectedEntries={selectedEntries}
              handleEntrySelect={handleEntrySelect}
              removeFoodEntry={removeFoodEntry}
              updateFoodEntry={updateFoodEntry}
              onReorderEntries={handleReorderEntries}
              onContextMenu={handleContextMenu}
              setSelectedEntries={setSelectedEntries}
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
        <EnergySummary 
          totals={displayTotals} 
          customGoals={customGoals} 
          selectedEntryCount={selectedEntries.length}
        />
      </div>
      
      {/* Food search modal */}
      {isModalOpen && (
        <FoodSearchModal
          onClose={() => setIsModalOpen(false)}
          onAddFood={addFoodEntry}
          selectedDate={selectedDate}
        />
      )}

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-48"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 200), // Prevent off-screen
            top: Math.min(contextMenu.y, window.innerHeight - 200),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleEditEntry}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center space-x-2 transition-colors duration-150"
          >
            <span>✏️</span>
            <span>View/Edit Food</span>
          </button>
          <button
            onClick={handleCopyEntries}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center space-x-2 transition-colors duration-150"
          >
            <span>📋</span>
            <span>Copy {selectedEntries.length > 0 ? `Selected (${selectedEntries.length})` : 'Item'}</span>
            <span className="text-xs text-gray-400 ml-auto">Ctrl+C</span>
          </button>
          <button
            onClick={handlePasteEntries}
            disabled={clipboardEntries.length === 0}
            className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors duration-150 ${
              clipboardEntries.length === 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>📋</span>
            <span>Paste {clipboardEntries.length > 0 ? `(${clipboardEntries.length} items)` : ''}</span>
            {clipboardEntries.length > 0 && <span className="text-xs text-gray-400 ml-auto">Ctrl+V</span>}
          </button>
          <hr className="my-1 border-gray-200" />
          <button
            onClick={handleDeleteSelectedEntries}
            className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center space-x-2 transition-colors duration-150"
          >
            <span>🗑️</span>
            <span>Delete {selectedEntries.length > 0 ? `Selected (${selectedEntries.length})` : 'Item'}</span>
            <span className="text-xs text-red-400 ml-auto">Del</span>
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editModalEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 transition-opacity duration-300"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
            onClick={() => setEditModalEntry(null)}
          ></div>
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Edit Food Entry</h2>
              <button
                onClick={() => setEditModalEntry(null)}
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
                <label className="block text-sm font-medium text-gray-700">Food Description</label>
                <p className="mt-1 p-3 bg-gray-50 rounded-md text-gray-800">{editModalEntry.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  value={editModalEntry.amount}
                  onChange={(e) => {
                    const newAmount = e.target.value;
                    setEditModalEntry({...editModalEntry, amount: newAmount});
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <p className="mt-1 p-3 bg-gray-50 rounded-md text-gray-800">{editModalEntry.unit}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Calories</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md text-gray-800">
                    {(() => {
                      const originalEntry = foodData.find(entry => entry.id === editModalEntry.id);
                      if (originalEntry) {
                        const ratio = parseFloat(editModalEntry.amount) / parseFloat(originalEntry.amount);
                        return (originalEntry.calories * ratio).toFixed(1);
                      }
                      return editModalEntry.calories.toFixed(1);
                    })()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md text-gray-800">
                    {(() => {
                      const originalEntry = foodData.find(entry => entry.id === editModalEntry.id);
                      if (originalEntry) {
                        const ratio = parseFloat(editModalEntry.amount) / parseFloat(originalEntry.amount);
                        return (originalEntry.protein * ratio).toFixed(1);
                      }
                      return editModalEntry.protein.toFixed(1);
                    })()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Carbs (g)</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md text-gray-800">
                    {(() => {
                      const originalEntry = foodData.find(entry => entry.id === editModalEntry.id);
                      if (originalEntry) {
                        const ratio = parseFloat(editModalEntry.amount) / parseFloat(originalEntry.amount);
                        return (originalEntry.carbs * ratio).toFixed(1);
                      }
                      return editModalEntry.carbs.toFixed(1);
                    })()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fat (g)</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md text-gray-800">
                    {(() => {
                      const originalEntry = foodData.find(entry => entry.id === editModalEntry.id);
                      if (originalEntry) {
                        const ratio = parseFloat(editModalEntry.amount) / parseFloat(originalEntry.amount);
                        return (originalEntry.fat * ratio).toFixed(1);
                      }
                      return editModalEntry.fat.toFixed(1);
                    })()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditModalEntry(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editModalEntry) {
                    // Find the original entry to get the original amount
                    const originalEntry = foodData.find(entry => entry.id === editModalEntry.id);
                    if (originalEntry) {
                      const originalAmount = parseFloat(originalEntry.amount);
                      const newAmount = parseFloat(editModalEntry.amount);
                      
                      if (originalAmount !== newAmount && newAmount > 0) {
                        const ratio = newAmount / originalAmount;
                        updateFoodEntry(editModalEntry.id, {
                          amount: editModalEntry.amount,
                          calories: originalEntry.calories * ratio,
                          protein: originalEntry.protein * ratio,
                          carbs: originalEntry.carbs * ratio,
                          fat: originalEntry.fat * ratio,
                        });
                      }
                    }
                    setEditModalEntry(null);
                  }
                }}
                className="px-6 py-2 text-white rounded-lg transition-colors duration-200"
                style={{ backgroundColor: '#6e44ff' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a37d9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6e44ff'}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
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

      {/* Copy Toast Notification */}
      {showCopyToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <span>📋</span>
          <span>Copied {clipboardEntries.length} item{clipboardEntries.length !== 1 ? 's' : ''} to clipboard</span>
        </div>
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