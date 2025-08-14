import { useState, useEffect } from 'react';
import { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { FoodEntry } from '../types';

// Add meal type order constant
const MEAL_TYPES: Array<FoodEntry['mealType']> = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

// Extend window interface for drag cleanup
declare global {
  interface Window {
    __dragCleanup?: () => void;
  }
}

interface UseFoodTableDragDropProps {
  filteredEntries: FoodEntry[];
  selectedEntries: string[];
  onReorderEntries: (newOrder: FoodEntry[]) => void;
  updateFoodEntry?: (id: string, updates: Partial<FoodEntry>) => void;
  handleEntrySelect: (id: string, index: number, event: React.MouseEvent | React.KeyboardEvent | {
    type: string;
    preventDefault: () => void;
    stopPropagation: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) => any;
}

export function useFoodTableDragDrop({
  filteredEntries,
  selectedEntries,
  onReorderEntries,
  updateFoodEntry,
  handleEntrySelect
}: UseFoodTableDragDropProps) {
  const [currentEntries, setCurrentEntries] = useState<FoodEntry[]>(filteredEntries);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Keep currentEntries in sync with filteredEntries
  useEffect(() => {
    setCurrentEntries(filteredEntries);
  }, [filteredEntries]);

  // Add a global effect to handle cursor during drag
  useEffect(() => {
    if (activeId) {
      // Use requestAnimationFrame to ensure DOM is ready
      const handleCursor = () => {
        document.body.style.setProperty('cursor', 'move', 'important');
        document.documentElement.style.setProperty('cursor', 'move', 'important');
        
        // Apply to all elements
        const allElements = document.querySelectorAll('*');
        allElements.forEach((el) => {
          (el as HTMLElement).style.setProperty('cursor', 'move', 'important');
        });
      };
      
      const rafId = requestAnimationFrame(handleCursor);
      const intervalId = setInterval(handleCursor, 16); // 60fps
      
      return () => {
        cancelAnimationFrame(rafId);
        clearInterval(intervalId);
        
        // Cleanup
        document.body.style.removeProperty('cursor');
        document.documentElement.style.removeProperty('cursor');
        const allElements = document.querySelectorAll('*');
        allElements.forEach((el) => {
          (el as HTMLElement).style.removeProperty('cursor');
        });
      };
    }
  }, [activeId]);

  function handleDragStart(event: DragStartEvent) {
    const draggedEntryId = event.active.id as string;
    setActiveId(draggedEntryId);
    
    // Auto-select the entry being dragged if not already selected
    if (!selectedEntries.includes(draggedEntryId)) {
      // Create a synthetic event to pass to handleEntrySelect
      const syntheticEvent = {
        type: 'dragstart',
        preventDefault: () => {},
        stopPropagation: () => {},
      };
      
      // Get the index of the entry
      const index = currentEntries.findIndex(item => item.id === draggedEntryId);
      
      // Call handleEntrySelect to ensure proper parent update
      if (index !== -1) {
        handleEntrySelect(draggedEntryId, index, syntheticEvent);
      }
    }
    
    document.body.classList.add('dragging');
    document.documentElement.classList.add('dragging');
    // Force cursor style override with maximum specificity
    document.body.style.cursor = 'move';
    document.documentElement.style.cursor = 'move';
    
    // Create aggressive cursor override
    const styleElement = document.createElement('style');
    styleElement.id = 'drag-cursor-override';
    styleElement.innerHTML = `
      html, html *, body, body * {
        cursor: move !important;
      }
      html:hover, html:hover *, body:hover, body:hover * {
        cursor: move !important;
      }
      * {
        cursor: move !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Add event listener to force cursor on mouse movement
    const forceCursor = (e: MouseEvent) => {
      (e.target as HTMLElement)?.style?.setProperty('cursor', 'move', 'important');
      document.body.style.cursor = 'move';
      document.documentElement.style.cursor = 'move';
    };
    document.addEventListener('mousemove', forceCursor);
    document.addEventListener('dragover', forceCursor);
    
    // Store the cleanup function
    window.__dragCleanup = () => {
      document.removeEventListener('mousemove', forceCursor);
      document.removeEventListener('dragover', forceCursor);
    };
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!active.id || !over?.id || active.id === over.id) {
      return;
    }

    const overData = over.data.current;
    const activeEntry = currentEntries.find(entry => entry.id === active.id);
    
    if (!activeEntry) return;

    // Check if dragging over a meal section heading
    if (overData?.type === 'meal-drop-zone') {
      const targetMealType = overData.mealType;
      
      // If the dragged entry is not already in the target meal type, move it to the top of that section
      if (activeEntry.mealType !== targetMealType) {
        const newEntries = [...currentEntries];
        const activeIndex = newEntries.findIndex(entry => entry.id === active.id);
        
        if (activeIndex !== -1) {
          // Remove the active entry from its current position
          const [movedEntry] = newEntries.splice(activeIndex, 1);
          
          // Update its meal type and find where to insert it (at the top of the target meal section)
          const updatedEntry = { ...movedEntry, mealType: targetMealType };
          
          // Find the first entry of the target meal type to insert before it
          // If no entries exist for that meal type, it will be inserted at the appropriate position
          let insertIndex = newEntries.length; // Default to end
          
          for (let i = 0; i < newEntries.length; i++) {
            const currentMealTypeIndex = MEAL_TYPES.indexOf(newEntries[i].mealType);
            const targetMealTypeIndex = MEAL_TYPES.indexOf(targetMealType);
            
            if (currentMealTypeIndex > targetMealTypeIndex) {
              insertIndex = i;
              break;
            } else if (currentMealTypeIndex === targetMealTypeIndex) {
              insertIndex = i;
              break;
            }
          }
          
          // Insert the entry at the beginning of the target meal section
          newEntries.splice(insertIndex, 0, updatedEntry);
          setCurrentEntries(newEntries);
          
          // Persist the meal type change immediately for better UX
          if (updateFoodEntry) {
            updateFoodEntry(active.id as string, { mealType: targetMealType });
          }
        }
      }
    } else {
      // Regular entry-to-entry reordering
      const oldIndex = currentEntries.findIndex((item: FoodEntry) => item.id === active.id);
      const newIndex = currentEntries.findIndex((item: FoodEntry) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(currentEntries, oldIndex, newIndex);
        const overEntry = currentEntries.find(entry => entry.id === over.id);
        
        // If the dragged entry is being moved to a different meal type, update it
        if (overEntry && activeEntry.mealType !== overEntry.mealType) {
          const updatedOrder = newOrder.map(entry => 
            entry.id === active.id 
              ? { ...entry, mealType: overEntry.mealType }
              : entry
          );
          setCurrentEntries(updatedOrder);
          
          // Persist the meal type change immediately
          if (updateFoodEntry) {
            updateFoodEntry(active.id as string, { mealType: overEntry.mealType });
          }
        } else {
          setCurrentEntries(newOrder);
        }
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    document.body.classList.remove('dragging');
    document.documentElement.classList.remove('dragging');
    
    // Clean up cursor override
    document.body.style.cursor = '';
    document.documentElement.style.cursor = '';
    const styleElement = document.getElementById('drag-cursor-override');
    if (styleElement) {
      document.head.removeChild(styleElement);
    }
    
    // Call cleanup function for event listeners
    if (window.__dragCleanup) {
      window.__dragCleanup();
      delete window.__dragCleanup;
    }

    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const overData = over.data.current;
    
    // Check if we're dragging a food entry
    const activeEntry = currentEntries.find(entry => entry.id === active.id);
    
    if (activeEntry) {
      // Dragging a food entry
      let newEntries = [...currentEntries];
      let mealTypeChanged = false;
      let newMealType: FoodEntry['mealType'] | undefined;
      
      if (overData?.type === 'meal-section' || overData?.type === 'meal-drop-zone') {
        // Dropped on a meal section - the position was already set during dragOver
        // Just ensure the meal type is updated (it should already be correct from dragOver)
        const targetMealType = overData.mealType;
        const currentEntry = newEntries.find(entry => entry.id === active.id);
        if (currentEntry && currentEntry.mealType !== targetMealType) {
          newEntries = newEntries.map(entry => 
            entry.id === active.id 
              ? { ...entry, mealType: targetMealType }
              : entry
          );
          mealTypeChanged = true;
          newMealType = targetMealType;
        }
      } else {
        // Dropped on another food entry - reorder (this was already handled in dragOver)
        const overEntry = currentEntries.find(entry => entry.id === over.id);
        if (overEntry) {
          const activeEntryInNewOrder = newEntries.find(entry => entry.id === active.id);
          if (activeEntryInNewOrder && activeEntryInNewOrder.mealType !== overEntry.mealType) {
            // Update meal type to match the target entry's meal type
            newEntries = newEntries.map(entry => 
              entry.id === active.id 
                ? { ...entry, mealType: overEntry.mealType }
                : entry
            );
            mealTypeChanged = true;
            newMealType = overEntry.mealType;
          }
        }
      }
      
      // Persist the meal type change to the database/storage
      if (mealTypeChanged && newMealType && updateFoodEntry) {
        updateFoodEntry(active.id as string, { mealType: newMealType });
      }
      
      setCurrentEntries(newEntries);
      onReorderEntries(newEntries);
    }
  }

  return {
    currentEntries,
    setCurrentEntries,
    activeId,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
}
