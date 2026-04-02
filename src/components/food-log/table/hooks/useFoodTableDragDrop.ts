import { useState, useEffect, useCallback, useMemo } from 'react';
import { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { FoodEntry } from '../types';

interface UseFoodTableDragDropProps {
  filteredEntries: FoodEntry[];
  selectedEntries: string[];
  onReorderEntries: (newOrder: FoodEntry[]) => void;
  updateFoodEntry?: (id: string, updates: Partial<FoodEntry>) => void;
  handleEntrySelect: (id: string, index: number, event: React.MouseEvent | React.KeyboardEvent) => void;
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
  // Current state of entries (for visual feedback during drag)
  const [currentEntries, setCurrentEntries] = useState<FoodEntry[]>(filteredEntries);
  // Track which item is being dragged
  const [activeId, setActiveId] = useState<string | null>(null);
  // Track which meal section is being dragged over
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  // Sync local state with prop changes
  useEffect(() => {
    setCurrentEntries(filteredEntries);
  }, [filteredEntries]);

  // Auto-select dragged item if not already selected - optimized
  const ensureItemSelected = useCallback((draggedId: string) => {
    if (!selectedEntries.includes(draggedId)) {
      const index = currentEntries.findIndex(item => item.id === draggedId);
      if (index !== -1) {
        // Create optimized synthetic event for handleEntrySelect
        const syntheticEvent = {
          type: 'click',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          preventDefault: () => {},
          stopPropagation: () => {},
        } as React.MouseEvent;
        
        handleEntrySelect(draggedId, index, syntheticEvent);
      }
    }
  }, [selectedEntries, currentEntries, handleEntrySelect]);

  // Memoize entry lookup maps for performance
  const entryIndexMap = useMemo(() => {
    return currentEntries.reduce((map, entry, index) => {
      map.set(entry.id, index);
      return map;
    }, new Map<string, number>());
  }, [currentEntries]);

  const entryByIdMap = useMemo(() => {
    return currentEntries.reduce((map, entry) => {
      map.set(entry.id, entry);
      return map;
    }, new Map<string, FoodEntry>());
  }, [currentEntries]);

  // Handle drag start - set active item and ensure it's selected
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const draggedId = event.active.id as string;
    setActiveId(draggedId);
    ensureItemSelected(draggedId);
  }, [ensureItemSelected]);

  // Handle drag over - provide immediate visual feedback with cross-meal reordering support
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!active.id || !over?.id || active.id === over.id) {
      setDragOverTarget(null);
      return;
    }

    const overData = over?.data?.current;
    const activeEntry = entryByIdMap.get(active.id as string);
    
    if (!activeEntry) return;
    
    // Check if we're dragging over a meal section/drop zone
    if (overData?.type === 'meal-section' || overData?.type === 'meal-drop-zone') {
      setDragOverTarget(String(over.id));
      
      const targetMealType = overData.mealType;
      
      if (targetMealType && activeEntry.mealType !== targetMealType) {
        // Professional cross-meal reordering: Move entry to target meal's position
        const newEntries = [...currentEntries];
        const activeIndex = entryIndexMap.get(active.id as string) ?? -1;
        
        if (activeIndex !== -1) {
          // Create updated entry with new meal type
          const updatedEntry = { ...activeEntry, mealType: targetMealType };
          
          // Remove from current position
          newEntries.splice(activeIndex, 1);
          
          // Find insertion point: before the first entry of the target meal type
          // This allows dragging "past" meal headers by inserting at the meal boundary
          let insertionIndex = newEntries.length; // Default to end
          
          for (let i = 0; i < newEntries.length; i++) {
            if (newEntries[i].mealType === targetMealType) {
              insertionIndex = i;
              break;
            }
          }
          
          // Insert at the calculated position
          newEntries.splice(insertionIndex, 0, updatedEntry);
          setCurrentEntries(newEntries);
        }
      }
      return;
    }

    // Clear meal section target since we're over an entry
    setDragOverTarget(null);

    // Enhanced entry-to-entry reordering with cross-meal support
    const activeIndex = entryIndexMap.get(active.id as string) ?? -1;
    const overIndex = entryIndexMap.get(over.id as string) ?? -1;
    const overEntry = entryByIdMap.get(over.id as string);
    
    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex && overEntry) {
      let newEntries = [...currentEntries];
      
      // If dragging to a different meal type, update the meal type
      if (activeEntry.mealType !== overEntry.mealType) {
        const updatedActiveEntry = { ...activeEntry, mealType: overEntry.mealType };
        newEntries[activeIndex] = updatedActiveEntry;
      }
      
      // Perform the reordering
      newEntries = arrayMove(newEntries, activeIndex, overIndex);
      setCurrentEntries(newEntries);
    }
  }, [currentEntries, entryIndexMap, entryByIdMap]);

  // Determine if meal type should change based on drop target
  const getMealTypeFromDrop = useCallback((over: { id: string; data?: { current?: { type?: string; mealType?: FoodEntry['mealType'] } } }, activeEntry: FoodEntry): FoodEntry['mealType'] | null => {
    const overData = over?.data?.current;
    
    // Dropped on meal section or drop zone
    if (overData?.type === 'meal-section' || overData?.type === 'meal-drop-zone') {
      return overData.mealType && overData.mealType !== activeEntry.mealType ? overData.mealType : null;
    }
    
    // Dropped on another entry - use filteredEntries for the original mealType
    // to avoid using mealTypes that were temporarily modified during handleDragOver
    const overEntry = filteredEntries.find(e => e.id === over.id);
    if (overEntry && overEntry.mealType !== activeEntry.mealType) {
      return overEntry.mealType;
    }
    
    return null;
  }, [filteredEntries]);

  // Build a map from entry ID to original mealType from filteredEntries (source of truth)
  const originalMealTypeMap = useMemo(() => {
    return new Map(filteredEntries.map(e => [e.id, e.mealType]));
  }, [filteredEntries]);

  // Handle drag end - finalize changes
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    setDragOverTarget(null);
    
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      // Drag was cancelled or dropped in same position - reset to source of truth
      // to discard any mealType changes made during handleDragOver preview
      setCurrentEntries(filteredEntries);
      return;
    }

    // Look up the ORIGINAL entry from filteredEntries (source of truth)
    const originalEntry = filteredEntries.find(e => e.id === active.id);
    if (!originalEntry) {
      setCurrentEntries(filteredEntries);
      return;
    }

    // Check if meal type needs to change based on drop target, using the ORIGINAL mealType
    const dropTarget = { id: String(over.id), data: over.data };
    const newMealType = getMealTypeFromDrop(dropTarget, originalEntry);
    
    // Use currentEntries for ordering (preserves drag preview position),
    // but restore original mealTypes for ALL non-dragged entries to prevent
    // handleDragOver preview changes from leaking into persisted state
    let finalEntries = currentEntries.map(entry => {
      if (entry.id === active.id) {
        // For the dragged entry: apply the intended mealType change (or restore original)
        return { ...entry, mealType: newMealType || originalEntry.mealType };
      }
      // For all other entries: restore their original mealType from filteredEntries
      const origMealType = originalMealTypeMap.get(entry.id);
      if (origMealType !== undefined && entry.mealType !== origMealType) {
        return { ...entry, mealType: origMealType };
      }
      return entry;
    });

    if (newMealType) {
      // Persist the meal type change
      updateFoodEntry?.(active.id as string, { mealType: newMealType });
    }
    
    // Update state and notify parent
    setCurrentEntries(finalEntries);
    onReorderEntries(finalEntries);
  }, [currentEntries, filteredEntries, getMealTypeFromDrop, updateFoodEntry, onReorderEntries, originalMealTypeMap]);

  return {
    currentEntries,
    activeId,
    dragOverTarget,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
}
