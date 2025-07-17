"use client";

import React, { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { FoodTableProps, FoodEntry } from './types';
import { SortableTableRow } from './SortableTableRow';
import { formatNumber } from './utils';

export default function FoodTable({ 
  foodData, 
  filteredEntries, 
  selectedEntries, 
  handleEntrySelect, 
  removeFoodEntry,
  updateFoodEntry = () => {},
  onReorderEntries = () => {},
  onContextMenu,
  setSelectedEntries
}: FoodTableProps) {
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Small movement threshold for clean drag activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const draggedEntryId = event.active.id as string;
    setActiveId(draggedEntryId);
    
    // Auto-select the entry being dragged if not already selected
    if (!selectedEntries.includes(draggedEntryId)) {
      setSelectedEntries?.([draggedEntryId]);
    }
    
    document.body.classList.add('dragging');
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    setActiveId(null);
    document.body.classList.remove('dragging');

    if (active.id !== over?.id && over?.id) {
      const oldIndex = filteredEntries.findIndex((item: FoodEntry) => item.id === active.id);
      const newIndex = filteredEntries.findIndex((item: FoodEntry) => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(filteredEntries, oldIndex, newIndex);
        onReorderEntries(newOrder);
      }
    }
  }

  // Simple CSS for clean drag behavior
  React.useEffect(() => {
    const style = document.createElement('style');
    style.id = 'food-table-drag-styles';
    style.textContent = `
      .food-table-row {
        position: relative;
        background: white;
        cursor: pointer;
      }
      
      .food-table-row.selected {
        background-color: #E8D5E8 !important;
      }
      
      .food-table-row:hover:not(.selected):not(.dragging-item) {
        background-color: #f9fafb;
      }
      
      .food-table-row.dragging-item {
        background-color: #f3f4f6 !important;
        opacity: 0.8;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        cursor: move !important;
        z-index: 1000;
      }
      
      body.dragging {
        user-select: none;
      }
    `;
    
    if (!document.getElementById('food-table-drag-styles')) {
      document.head.appendChild(style);
    }
    
    return () => {
      const existingStyle = document.getElementById('food-table-drag-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      document.body.classList.remove('dragging');
    };
  }, []);

  return (
    <div className="w-full overflow-x-auto food-table-container">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <table className="w-full">
            <tbody>
              <SortableContext 
                items={filteredEntries.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredEntries.map((item) => (
                  <SortableTableRow
                    key={item.id}
                    item={item}
                    foodData={foodData}
                    filteredEntries={filteredEntries}
                    selectedEntries={selectedEntries}
                    handleEntrySelect={handleEntrySelect}
                    removeFoodEntry={removeFoodEntry}
                    updateFoodEntry={updateFoodEntry}
                    editingEntry={editingEntry}
                    setEditingEntry={setEditingEntry}
                    editAmount={editAmount}
                    setEditAmount={setEditAmount}
                    activeId={activeId}
                    setActiveId={setActiveId}
                    formatNumber={formatNumber}
                    onContextMenu={onContextMenu}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>
      </DndContext>
    </div>
  );
}
