import { useState, useEffect, useCallback, useMemo } from 'react';
import { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { FoodEntry } from '../types';

const MEAL_TYPE_ORDER: Record<string, number> = {
  breakfast: 0, lunch: 1, dinner: 2, snack: 3, other: 4
};

/** Stable sort by meal type order — preserves within-meal ordering */
function sortByMealType(entries: FoodEntry[]): FoodEntry[] {
  return [...entries].sort((a, b) =>
    (MEAL_TYPE_ORDER[a.mealType] ?? 5) - (MEAL_TYPE_ORDER[b.mealType] ?? 5)
  );
}

function areEntriesEquivalent(left: FoodEntry[], right: FoodEntry[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((entry, index) => {
    const other = right[index];
    return other && entry.id === other.id && entry.mealType === other.mealType;
  });
}

interface UseFoodTableDragDropProps {
  filteredEntries: FoodEntry[];
  selectedEntries: string[];
  onReorderEntries: (newOrder: FoodEntry[]) => void;
  updateFoodEntry?: (id: string, updates: Partial<FoodEntry>) => void;
  handleEntrySelect: (
    id: string,
    index: number,
    event?: React.MouseEvent | React.KeyboardEvent | { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } | null
  ) => void;
}

/**
 * Custom hook for handling drag and drop functionality in the food table
 * Provides clean separation between visual feedback and data updates
 */
export function useFoodTableDragDrop({
  filteredEntries,
  selectedEntries,
  onReorderEntries,
  updateFoodEntry,
  handleEntrySelect
}: UseFoodTableDragDropProps) {
  // Base ordered entries. During drag we derive a preview from this state instead
  // of mutating the array on every drag-over event.
  const [baseEntries, setBaseEntries] = useState<FoodEntry[]>(filteredEntries);
  // Track which item is being dragged
  const [activeId, setActiveId] = useState<string | null>(null);
  // Track which meal section is being dragged over
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  // Sync local state with prop changes (only when not actively dragging)
  // Sort by meal type so array indices match DOM render order
  useEffect(() => {
    if (!activeId) {
      const nextEntries = sortByMealType(filteredEntries);
      setBaseEntries((previousEntries) =>
        areEntriesEquivalent(previousEntries, nextEntries) ? previousEntries : nextEntries
      );
    }
  }, [filteredEntries, activeId]);

  // Auto-select dragged item if not already selected - optimized
  const ensureItemSelected = useCallback((draggedId: string) => {
    if (!selectedEntries.includes(draggedId)) {
      const index = baseEntries.findIndex(item => item.id === draggedId);
      if (index !== -1) {
        handleEntrySelect(draggedId, index, null);
      }
    }
  }, [selectedEntries, baseEntries, handleEntrySelect]);

  const currentEntries = baseEntries;

  const entryByIdMap = useMemo(() => {
    return currentEntries.reduce((map, entry) => {
      map.set(entry.id, entry);
      return map;
    }, new Map<string, FoodEntry>());
  }, [currentEntries]);

  const filteredEntryByIdMap = useMemo(() => {
    return filteredEntries.reduce((map, entry) => {
      map.set(entry.id, entry);
      return map;
    }, new Map<string, FoodEntry>());
  }, [filteredEntries]);

  // Handle drag start - set active item and ensure it's selected
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const draggedId = event.active.id as string;
    setActiveId(draggedId);
    ensureItemSelected(draggedId);
  }, [ensureItemSelected]);

  // Handle drag over by updating only lightweight preview state.
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!active.id || !over?.id || active.id === over.id) {
      setDragOverTarget(null);
      return;
    }

    const overId = String(over.id);
    const overData = over?.data?.current;
    const activeEntry = baseEntries.find((entry) => entry.id === String(active.id));

    if (!activeEntry) {
      setDragOverTarget(null);
      return;
    }
    
    // Track the drag target for visual feedback (e.g., auto-expand collapsed meals)
    if (overData?.type === 'meal-drop-zone') {
      setDragOverTarget(overId);
      return;
    }

    // Track which entry we're hovering over
    const overEntry = entryByIdMap.get(overId);
    if (overEntry) {
      setDragOverTarget(`drop-${overEntry.mealType}`);
      return;
    }

    setDragOverTarget(null);
  }, [baseEntries, entryByIdMap]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setDragOverTarget(null);
    
    if (!over || active.id === over.id) {
      return;
    }

    const activeEntry = entryByIdMap.get(active.id as string);
    const sourceEntry = filteredEntryByIdMap.get(active.id as string);
    if (!activeEntry) return;

    let finalEntries = [...baseEntries];
    
    // Determine new meal type based on drop target
    const overData = over?.data?.current;
    let newMealType: FoodEntry['mealType'] | null = null;
    
    if (overData?.type === 'meal-drop-zone' && overData.mealType !== activeEntry.mealType) {
      newMealType = overData.mealType;
    } else {
      const overEntry = entryByIdMap.get(String(over.id));
      if (overEntry && overEntry.mealType !== activeEntry.mealType) {
        newMealType = overEntry.mealType;
      }
    }
    
    if (newMealType) {
      // Cross-meal move: update meal type, then re-sort so entry lands in correct group
      finalEntries = finalEntries.map(entry => 
        entry.id === active.id 
          ? { ...entry, mealType: newMealType }
          : entry
      );
      finalEntries = sortByMealType(finalEntries);
    } else {
      // Within-meal reorder
      const activeIndex = finalEntries.findIndex(e => e.id === active.id);
      const overIndex = finalEntries.findIndex(e => e.id === over.id);
      
      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        finalEntries = arrayMove(finalEntries, activeIndex, overIndex);
      }
    }

    const finalActiveEntry = finalEntries.find((entry) => entry.id === active.id);

    if (sourceEntry && finalActiveEntry && sourceEntry.mealType !== finalActiveEntry.mealType) {
      updateFoodEntry?.(active.id as string, { mealType: finalActiveEntry.mealType });
    }
    
    setBaseEntries(finalEntries);
    onReorderEntries(finalEntries);
  }, [baseEntries, filteredEntryByIdMap, updateFoodEntry, onReorderEntries, entryByIdMap]);

  return {
    currentEntries,
    activeId,
    dragOverTarget,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
}
