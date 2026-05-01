import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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

function moveEntryToMealStart(
  entries: FoodEntry[],
  activeEntryId: string,
  targetMealType: FoodEntry['mealType']
): FoodEntry[] {
  const activeIndex = entries.findIndex((entry) => entry.id === activeEntryId);

  if (activeIndex === -1) {
    return entries;
  }

  const activeEntry = entries[activeIndex];
  const remainingEntries = entries.filter((entry) => entry.id !== activeEntryId);
  const targetIndex = remainingEntries.findIndex((entry) => entry.mealType === targetMealType);

  let insertionIndex = targetIndex;

  if (insertionIndex === -1) {
    const targetMealOrder = MEAL_TYPE_ORDER[targetMealType] ?? 5;
    insertionIndex = remainingEntries.findIndex(
      (entry) => (MEAL_TYPE_ORDER[entry.mealType] ?? 5) > targetMealOrder
    );
  }

  if (insertionIndex === -1) {
    insertionIndex = remainingEntries.length;
  }

  const nextEntry = {
    ...activeEntry,
    mealType: targetMealType,
  };

  const nextEntries = [...remainingEntries];
  nextEntries.splice(insertionIndex, 0, nextEntry);

  const isUnchanged = entries.length === nextEntries.length && entries.every((entry, index) => {
    const nextListEntry = nextEntries[index];
    return entry.id === nextListEntry.id && entry.mealType === nextListEntry.mealType;
  });

  return isUnchanged ? entries : nextEntries;
}

function entriesMatch(leftEntries: FoodEntry[], rightEntries: FoodEntry[]): boolean {
  return leftEntries.length === rightEntries.length && leftEntries.every((entry, index) => {
    const rightEntry = rightEntries[index];
    return entry.id === rightEntry.id && entry.mealType === rightEntry.mealType;
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
  onDragTargetChange?: (target: string | null) => void;
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
  handleEntrySelect,
  onDragTargetChange
}: UseFoodTableDragDropProps) {
  // Track which item is being dragged
  const [activeId, setActiveId] = useState<string | null>(null);
  // Track which meal section is being dragged over
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  const sortedEntries = useMemo(() => sortByMealType(filteredEntries), [filteredEntries]);
  const [previewEntries, setPreviewEntries] = useState<FoodEntry[]>(sortedEntries);
  const previewEntriesRef = useRef(previewEntries);

  const updatePreviewEntries = useCallback((nextEntries: FoodEntry[]) => {
    previewEntriesRef.current = nextEntries;
    setPreviewEntries(nextEntries);
  }, []);

  useEffect(() => {
    if (!activeId) {
      previewEntriesRef.current = sortedEntries;
      setPreviewEntries(sortedEntries);
    }
  }, [activeId, sortedEntries]);

  const currentEntries = activeId ? previewEntries : sortedEntries;

  const updateDragOverTarget = useCallback((nextDragOverTarget: string | null) => {
    setDragOverTarget((previousDragOverTarget) => {
      if (previousDragOverTarget === nextDragOverTarget) {
        return previousDragOverTarget;
      }

      onDragTargetChange?.(nextDragOverTarget);
      return nextDragOverTarget;
    });
  }, [onDragTargetChange]);

  // Auto-select dragged item if not already selected - optimized
  const ensureItemSelected = useCallback((draggedId: string) => {
    if (!selectedEntries.includes(draggedId)) {
      const index = currentEntries.findIndex((item) => item.id === draggedId);
      if (index !== -1) {
        handleEntrySelect(draggedId, index, null);
      }
    }
  }, [selectedEntries, currentEntries, handleEntrySelect]);

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
    updatePreviewEntries(sortedEntries);
    ensureItemSelected(draggedId);
  }, [ensureItemSelected, sortedEntries, updatePreviewEntries]);

  // Handle drag over by snapping list order within the current meal or into the top of a new meal.
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!active.id || !over?.id || active.id === over.id) {
      updateDragOverTarget(null);
      return;
    }

    const overId = String(over.id);
    const overData = over?.data?.current;
    const activeEntry = entryByIdMap.get(String(active.id));

    if (!activeEntry) {
      updateDragOverTarget(null);
      return;
    }
    
    const targetMealType = (overData?.type === 'meal-drop-zone'
      ? overData.mealType as FoodEntry['mealType']
      : null)
      ?? entryByIdMap.get(overId)?.mealType
      ?? null;

    if (overData?.type === 'meal-drop-zone' && targetMealType) {
      setPreviewEntries((previousEntries) => {
        const nextEntries = moveEntryToMealStart(previousEntries, String(active.id), targetMealType);
        previewEntriesRef.current = nextEntries;
        return nextEntries;
      });

      updateDragOverTarget(`drop-${targetMealType}`);
      return;
    }

    if (targetMealType && targetMealType !== activeEntry.mealType) {
      setPreviewEntries((previousEntries) => {
        const nextEntries = moveEntryToMealStart(previousEntries, String(active.id), targetMealType);
        previewEntriesRef.current = nextEntries;
        return nextEntries;
      });

      updateDragOverTarget(`drop-${targetMealType}`);
      return;
    }

    const overEntry = entryByIdMap.get(overId);
    if (overEntry && overEntry.mealType === activeEntry.mealType) {
      setPreviewEntries((previousEntries) => {
        const activeIndex = previousEntries.findIndex((entry) => entry.id === active.id);
        const overIndex = previousEntries.findIndex((entry) => entry.id === overId);

        if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
          return previousEntries;
        }

        const nextEntries = arrayMove(previousEntries, activeIndex, overIndex);
        previewEntriesRef.current = nextEntries;
        return nextEntries;
      });

      updateDragOverTarget(`drop-${overEntry.mealType}`);
      return;
    }

    updateDragOverTarget(null);
  }, [entryByIdMap, updateDragOverTarget]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    const finalEntries = previewEntriesRef.current;
    
    setActiveId(null);
    updateDragOverTarget(null);
    
    const sourceEntry = filteredEntryByIdMap.get(active.id as string);
    const finalActiveEntry = finalEntries.find((entry) => entry.id === active.id);
    const hasMeaningfulChange = !entriesMatch(finalEntries, sortedEntries);

    if (!sourceEntry || !finalActiveEntry) {
      updatePreviewEntries(sortedEntries);
      return;
    }

    if (!over && !hasMeaningfulChange) {
      updatePreviewEntries(sortedEntries);
      return;
    }

    if (over && active.id === over.id && !hasMeaningfulChange) {
      updatePreviewEntries(sortedEntries);
      return;
    }

    if (finalActiveEntry.mealType !== sourceEntry.mealType) {
      updateFoodEntry?.(active.id as string, { mealType: finalActiveEntry.mealType });
    }
    
    if (hasMeaningfulChange) {
      onReorderEntries(finalEntries);
      return;
    }

    updatePreviewEntries(sortedEntries);
  }, [filteredEntryByIdMap, onReorderEntries, sortedEntries, updateDragOverTarget, updateFoodEntry, updatePreviewEntries]);

  return {
    currentEntries,
    activeId,
    dragOverTarget,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
}
