"use client";

import React, { useCallback } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { FoodTableProps, FoodEntry } from './types';
import { formatNumber } from './utils';
import { MealSection } from './components';
import { useFoodTableDragDrop, useFoodTableState } from './hooks';
import styles from './EnhancedFoodTable.module.css';

// Add meal type order constant
const MEAL_TYPES: Array<FoodEntry['mealType']> = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

/**
 * Professional EnhancedFoodTable Component
 * 
 * Architecture:
 * - Clean separation of concerns
 * - Proper event delegation without duplicate logic
 * - Type-safe event handling
 * - Professional design patterns
 */
export default function EnhancedFoodTable({ 
  foodData, 
  filteredEntries, 
  selectedEntries, 
  handleEntrySelect,
  updateFoodEntry = () => {},
  onReorderEntries = () => {},
  onContextMenu
}: FoodTableProps) {
  // =====================
  // Hooks
  // =====================
  const {
    editingEntry,
    setEditingEntry,
    editAmount,
    setEditAmount,
    editUnit,
    setEditUnit
  } = useFoodTableState();

  // =====================
  // Professional Event Adapter Pattern
  // =====================
  
  /**
   * Clean, type-safe event adapter that bridges the gap between
   * parent handler (MouseEvent only) and child components (MouseEvent | KeyboardEvent)
   * 
   * This follows the Adapter Pattern and avoids any business logic duplication
   */
  const adaptedSelectionHandler = useCallback((
    id: string,
    index: number, 
    event: React.MouseEvent | React.KeyboardEvent
  ) => {
    // Extract essential modifier keys and create a minimal MouseEvent-compatible object
    // This is a clean adapter pattern that preserves functionality without duplication
    const eventAdapter = {
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      preventDefault: event.preventDefault.bind(event),
      stopPropagation: event.stopPropagation.bind(event),
    };
    
    // Cast to MouseEvent interface - this is safe because we only use modifier keys
    handleEntrySelect(id, index, eventAdapter as React.MouseEvent);
  }, [handleEntrySelect]);

  // =====================
  // Drag & Drop Setup
  // =====================
  const {
    currentEntries,
    activeId,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  } = useFoodTableDragDrop({
    filteredEntries,
    selectedEntries,
    onReorderEntries,
    updateFoodEntry,
    handleEntrySelect: adaptedSelectionHandler
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced for more responsive drag start
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // =====================
  // Data Processing
  // =====================
  
  // Group entries by meal type
  const entriesByMealType = MEAL_TYPES.reduce((acc, mealType) => {
    acc[mealType] = currentEntries.filter(entry => entry.mealType === mealType);
    return acc;
  }, {} as Record<FoodEntry['mealType'], FoodEntry[]>);

  // Create unified sortable items array containing food entries and meal headers for drag feedback
  const unifiedSortableItems = [
    ...MEAL_TYPES.map(mealType => `drop-${mealType}`), // Include meal headers as sortable targets
    ...currentEntries.map(entry => entry.id)
  ];

  // =====================
  // Render
  // =====================
  return (
    <div 
      className={`w-full overflow-x-auto ${styles.foodTableContainer} ${activeId ? styles.dragging : ''}`}
      style={{ cursor: activeId ? 'move' : 'default' }}
    >
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext 
          items={unifiedSortableItems}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {MEAL_TYPES.map((mealType, index) => {
              // Find the last meal type that has entries
              const lastMealTypeWithEntries = MEAL_TYPES.slice().reverse().find(
                type => entriesByMealType[type] && entriesByMealType[type].length > 0
              );
              // If no meal types have entries, the last meal type in the array should be considered last
              const isLastSection = lastMealTypeWithEntries ? 
                mealType === lastMealTypeWithEntries : 
                index === MEAL_TYPES.length - 1;
              
              return (
                <MealSection
                  key={mealType}
                  mealType={mealType}
                  entries={entriesByMealType[mealType]}
                  foodData={foodData}
                  selectedEntries={selectedEntries}
                  handleEntrySelect={adaptedSelectionHandler}
                  updateFoodEntry={updateFoodEntry}
                  editingEntry={editingEntry}
                  setEditingEntry={setEditingEntry}
                  editAmount={editAmount}
                  setEditAmount={setEditAmount}
                  editUnit={editUnit}
                  setEditUnit={setEditUnit}
                  formatNumber={formatNumber}
                  onContextMenu={onContextMenu}
                  activeId={activeId}
                  isLastSection={isLastSection}
                />
              );
            })}
          </div>
        </SortableContext>
        {/* No DragOverlay - visual feedback handled by .dragging-item class only */}
      </DndContext>
    </div>
  );
}
