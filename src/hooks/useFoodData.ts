import { useState, useEffect, useCallback, useMemo } from 'react';
import { FoodEntry } from '../types/food';
import { FoodLogService } from '../services/foodLogService';
import { calculateTotals } from '../utils/foodEntryUtils';
import { sameDay } from '../utils/dateUtils';

export const useFoodData = (selectedDate: Date, formatApiDate: () => string) => {
  const [foodData, setFoodData] = useState<FoodEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  // Load food data from API when component mounts or date changes
  useEffect(() => {
    const loadData = async () => {
      try {
        const dateParam = formatApiDate();
        const data = await FoodLogService.loadFoodData(dateParam);
        
        // Filter by selected date for localStorage fallback
        const filteredData = data.filter((entry: FoodEntry) => {
          const entryDate = new Date(entry.date);
          return sameDay(entryDate, selectedDate);
        });
        
        setFoodData(filteredData);
      } catch (error) {
        console.error('Error loading food data:', error);
        setFoodData([]);
      }
    };

    loadData();
  }, [selectedDate, formatApiDate]);

  const addFoodEntry = useCallback(async (entry: FoodEntry, overrideDate?: Date) => {
    try {
      const targetDate = overrideDate || selectedDate;
      const entryWithCorrectDate = {
        ...entry,
        date: targetDate.toISOString(),
      };

      const savedEntry = await FoodLogService.addFoodEntry(entryWithCorrectDate);
      setFoodData(prev => [...prev, savedEntry]);
    } catch (error) {
      console.error('Error adding food entry:', error);
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

  const handleReorderEntries = useCallback((newOrder: FoodEntry[]) => {
    setFoodData(prevFoodData => {
      const otherEntries = prevFoodData.filter((entry: FoodEntry) => {
        const entryDate = new Date(entry.date);
        return !sameDay(entryDate, selectedDate);
      });
      
      return [...otherEntries, ...newOrder];
    });
  }, [selectedDate]);

  // Handle entry selection with multi-select support
  const handleEntrySelect = useCallback((id: string, index: number, event: React.MouseEvent) => {
    setSelectedEntries(prev => {
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
          return prev.filter(entryId => entryId !== id);
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
