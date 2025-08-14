"use client";

import React from "react";
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

export default function EnhancedFoodTable({ 
  foodData, 
  filteredEntries, 
  selectedEntries, 
  handleEntrySelect: _handleEntrySelect, 
  updateFoodEntry = () => {},
  onReorderEntries = () => {},
  onContextMenu,
  setSelectedEntries
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
    setEditUnit,
    contextMenuOpen,
    setContextMenuOpen
  } = useFoodTableState();

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleEntrySelect: (id: string, index: number, event: any) => _handleEntrySelect(id, index, event as React.MouseEvent)
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // =====================
  // Handlers
  // =====================
  // Selection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleEntrySelect(id: string, index: number, event: any) {
    // First, always call the original handler if provided
    // This ensures the parent component's logic is executed
    if (_handleEntrySelect) {
      _handleEntrySelect(id, index, event);
    }
    
    // Then handle our internal selection state if setSelectedEntries is provided
    if (!setSelectedEntries) return;
    
    // Robustly detect modifier keys for multi-select, even if event is synthetic or missing them
    let isMulti = false;
    
    // First try to get modifier keys from the event
    if (event && typeof event === 'object') {
      // Check for our special flag for forced multi-select (used for Ctrl+Click)
      if (event.isMultiSelectForced) {
        isMulti = true;
      } else {
        isMulti = Boolean(event.shiftKey || event.ctrlKey || event.metaKey);
      }
    } 
    
    // Fallback to window.event if available
    if (!isMulti && typeof window !== 'undefined') {
      const winEvent = window.event as MouseEvent | KeyboardEvent | undefined;
      isMulti = winEvent ? Boolean(winEvent.shiftKey || winEvent.ctrlKey || winEvent.metaKey) : false;
    }
    
    // Debug: log event and selection state
    if (process.env.NODE_ENV !== 'production') {
      console.log('[handleEntrySelect]', { id, index, event, isMulti, selectedEntries });
    }
    
    if (isMulti) {
      // Toggle this entry in the selection for multi-select (Cmd/Ctrl/Shift + click)
      if (selectedEntries.includes(id)) {
        setSelectedEntries(selectedEntries.filter(eid => eid !== id));
      } else {
        setSelectedEntries([...selectedEntries, id]);
      }
    } else {
      // For single-select mode:
      // If the entry is already selected, unselect it
      // Otherwise, select just this entry
      if (selectedEntries.length === 1 && selectedEntries[0] === id) {
        setSelectedEntries([]);  // Unselect when clicking the only selected item
      } else {
        setSelectedEntries([id]); // Select only this entry
      }
    }
  }

  // Group entries by meal type
  const entriesByMealType = MEAL_TYPES.reduce((acc, mealType) => {
    acc[mealType] = currentEntries.filter(entry => entry.mealType === mealType);
    return acc;
  }, {} as Record<FoodEntry['mealType'], FoodEntry[]>);

  // Create unified sortable items array containing only food entries for consistent visual feedback
  const unifiedSortableItems = currentEntries.map(entry => entry.id);

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
            {MEAL_TYPES.map((mealType) => (
              <MealSection
                key={mealType}
                mealType={mealType}
                entries={entriesByMealType[mealType]}
                foodData={foodData}
                selectedEntries={selectedEntries}
                handleEntrySelect={handleEntrySelect}
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
                contextMenuOpen={contextMenuOpen}
                setContextMenuOpen={setContextMenuOpen}
              />
            ))}
          </div>
        </SortableContext>
        {/* No DragOverlay - visual feedback handled by .dragging-item class only */}
      </DndContext>
    </div>
  );
}
