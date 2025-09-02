import { useState, useEffect, useCallback, useMemo } from 'react';
import { FoodEntry } from '../types/food';
import { FoodLogService } from '../services/foodLogService';
import { calculateTotals } from '../utils/foodEntryUtils';
import { sameDay } from '../utils/dateUtils';

interface FoodDataDebugEntry {
  id: string;
  description: string;
  date: string;
}

interface FoodDataDebugError {
  timestamp: string;
  error: string;
  stack?: string;
}

interface FoodDataDebugInfo {
  lastLoadAttempt?: string;
  dateParam?: string;
  selectedDate?: string;
  lastLoadSuccess?: string;
  totalEntries?: number;
  filteredEntries?: number;
  entries?: FoodDataDebugEntry[];
  lastError?: FoodDataDebugError;
  lastAddAttempt?: {
    timestamp: string;
    entry: FoodEntry;
  };
  lastAddSuccess?: {
    timestamp: string;
    savedEntry: FoodEntry;
  };
  lastAddError?: FoodDataDebugError;
}

// Extend Window interface
declare global {
  interface Window {
    __foodDataDebug?: FoodDataDebugInfo;
  }
}

export const useFoodData = (selectedDate: Date, formatApiDate: () => string) => {
  const [foodData, setFoodData] = useState<FoodEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  // Load food data from API when component mounts or date changes
  useEffect(() => {
    const loadData = async () => {
      try {
        const dateParam = formatApiDate();
        console.log('🚀 useFoodData: Loading data for date:', dateParam, 'selectedDate:', selectedDate.toISOString());
        
        // Add window debug info
        if (typeof window !== 'undefined') {
          window.__foodDataDebug = {
            lastLoadAttempt: new Date().toISOString(),
            dateParam,
            selectedDate: selectedDate.toISOString()
          };
        }
        
        const data = await FoodLogService.loadFoodData(dateParam);
        console.log('📊 useFoodData: Received data:', data.length, 'entries');
        
        // Filter by selected date for localStorage fallback
        const filteredData = data.filter((entry: FoodEntry) => {
          const entryDate = new Date(entry.date);
          const isSameDay = sameDay(entryDate, selectedDate);
          console.log('📅 Entry date:', entry.date, 'parsed:', entryDate.toISOString(), 'same day:', isSameDay);
          return isSameDay;
        });
        
        console.log('✅ useFoodData: Filtered data:', filteredData.length, 'entries');
        
        // Update window debug info
        if (typeof window !== 'undefined') {
          window.__foodDataDebug = {
            ...window.__foodDataDebug,
            lastLoadSuccess: new Date().toISOString(),
            totalEntries: data.length,
            filteredEntries: filteredData.length,
            entries: filteredData.map(e => ({ id: e.id, description: e.description, date: e.date }))
          };
        }
        
        setFoodData(filteredData);
      } catch (error) {
        console.error('❌ Error loading food data:', error);
        
        // Update window debug info with error
        if (typeof window !== 'undefined') {
          window.__foodDataDebug = {
            ...window.__foodDataDebug,
            lastError: {
              timestamp: new Date().toISOString(),
              error: String(error),
              stack: error instanceof Error ? error.stack : undefined
            }
          };
        }
        
        setFoodData([]);
      }
    };

    console.log('🔄 useFoodData useEffect triggered, selectedDate:', selectedDate.toISOString());
    loadData();
  }, [selectedDate, formatApiDate]);

  const addFoodEntry = useCallback(async (entry: FoodEntry, overrideDate?: Date) => {
    try {
      const targetDate = overrideDate || selectedDate;
      const entryWithCorrectDate = {
        ...entry,
        date: targetDate.toISOString(),
      };

      console.log('🔄 Adding food entry:', entryWithCorrectDate);
      
      // Update window debug info
      if (typeof window !== 'undefined') {
        window.__foodDataDebug = {
          ...window.__foodDataDebug,
          lastAddAttempt: {
            timestamp: new Date().toISOString(),
            entry: entryWithCorrectDate
          }
        };
      }

      const savedEntry = await FoodLogService.addFoodEntry(entryWithCorrectDate);
      console.log('✅ Food entry saved:', savedEntry);
      
      setFoodData(prev => {
        const newData = [...prev, savedEntry];
        console.log('📊 Updated foodData, total entries:', newData.length);
        return newData;
      });
      
      // Update window debug info
      if (typeof window !== 'undefined') {
        window.__foodDataDebug = {
          ...window.__foodDataDebug,
          lastAddSuccess: {
            timestamp: new Date().toISOString(),
            savedEntry
          }
        };
      }
    } catch (error) {
      console.error('❌ Error adding food entry:', error);
      
      // Update window debug info with error
      if (typeof window !== 'undefined') {
        window.__foodDataDebug = {
          ...window.__foodDataDebug,
          lastAddError: {
            timestamp: new Date().toISOString(),
            error: String(error),
            stack: error instanceof Error ? error.stack : undefined
          }
        };
      }
    }
  }, [selectedDate]);

  const removeFoodEntry = useCallback(async (id: string) => {
    try {
      await FoodLogService.removeFoodEntry(id);
      setFoodData(prev => prev.filter(item => item.id !== id));
      setSelectedEntries(prev => prev.filter(item => item !== id));
    } catch (error) {
      console.error('Error removing food entry:', error);
    }
  }, []);

  const updateFoodEntry = useCallback(async (id: string, updates: Partial<FoodEntry>) => {
    try {
      await FoodLogService.updateFoodEntry(id, updates);
      setFoodData(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      }));
    } catch (error) {
      console.error('Error updating food entry:', error);
    }
  }, []);

  const filteredEntries = useMemo(() => {
    return foodData.filter(entry => {
      const entryDate = new Date(entry.date);
      return sameDay(entryDate, selectedDate);
    });
  }, [foodData, selectedDate]);

  // Calculate daily totals
  const totals = useMemo(() => {
    return calculateTotals(filteredEntries);
  }, [filteredEntries]);

  // Calculate totals for selected entries
  const selectedEntriesTotals = useMemo(() => {
    if (selectedEntries.length === 0) return totals;
    
    const selectedItems = filteredEntries.filter(entry => selectedEntries.includes(entry.id));
    return calculateTotals(selectedItems);
  }, [filteredEntries, selectedEntries, totals]);

  const displayTotals = selectedEntries.length > 0 ? selectedEntriesTotals : totals;

  const handleReorderEntries = useCallback(async (newOrder: FoodEntry[]) => {
    // Update local state immediately for responsive UI
    setFoodData(prevFoodData => {
      const otherEntries = prevFoodData.filter((entry: FoodEntry) => {
        const entryDate = new Date(entry.date);
        return !sameDay(entryDate, selectedDate);
      });
      
      return [...otherEntries, ...newOrder];
    });

    // Persist the order to the database
    try {
      const entryIds = newOrder.map(entry => entry.id);
      const response = await fetch('/api/food-logs/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entryIds }),
      });

      if (!response) {
        console.error('Failed to persist entry order: No response received');
        // Optionally show a toast notification to the user
      } else if (!response.ok) {
        console.error('Failed to persist entry order:', response.statusText);
        // Optionally show a toast notification to the user
      } else {
        console.log('Entry order persisted successfully');
      }
    } catch (error) {
      console.error('Error persisting entry order:', error);
      // Optionally show a toast notification to the user
    }
  }, [selectedDate]);

  // Handle entry selection with multi-select support
  const handleEntrySelect = useCallback((id: string, index: number, event: React.MouseEvent) => {
    setSelectedEntries(prev => {
      // Fast path for simple deselection - most common case
      if (!event.ctrlKey && !event.metaKey && !event.shiftKey && prev.length === 1 && prev[0] === id) {
        return [];
      }
      
      if (event.ctrlKey || event.metaKey) {
        // Multi-select with Ctrl/Cmd - toggle selection
        if (prev.includes(id)) {
          return prev.filter(entryId => entryId !== id);
        } else {
          return [...prev, id];
        }
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
        // Single click - toggle selection or select new item
        if (prev.includes(id)) {
          // If already selected, deselect it
          return [];
        } else {
          // If not selected, select only this item (replace any previous selection)
          return [id];
        }
      }
    });
  }, [filteredEntries]);

  return {
    foodData,
    selectedEntries,
    setSelectedEntries,
    filteredEntries,
    totals,
    displayTotals,
    addFoodEntry,
    removeFoodEntry,
    updateFoodEntry,
    handleReorderEntries,
    handleEntrySelect
  };
};
