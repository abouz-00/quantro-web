"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { FoodTableProps, FoodEntry } from './types';
import { EnhancedSortableTableRow } from './EnhancedSortableTableRow';
import { formatNumber } from './utils';

export default function EnhancedFoodTable({ 
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
  const [editUnit, setEditUnit] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentEntries, setCurrentEntries] = useState<FoodEntry[]>(filteredEntries);
  // Removed custom drag physics state for snapping behavior

  // Update current entries when filteredEntries changes
  useEffect(() => {
    setCurrentEntries(filteredEntries);
  }, [filteredEntries]);
  
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

  function handleDragStart(event: DragStartEvent) {
    const draggedEntryId = event.active.id as string;
    setActiveId(draggedEntryId);
    // Auto-select the entry being dragged if not already selected
    if (!selectedEntries.includes(draggedEntryId)) {
      setSelectedEntries?.([draggedEntryId]);
    }
    document.body.classList.add('dragging');
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    
    if (active.id !== over?.id && over?.id) {
      const oldIndex = currentEntries.findIndex((item: FoodEntry) => item.id === active.id);
      const newIndex = currentEntries.findIndex((item: FoodEntry) => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(currentEntries, oldIndex, newIndex);
        setCurrentEntries(newOrder);
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    document.body.classList.remove('dragging');
    // Apply the final order to the parent component
    onReorderEntries(currentEntries);
  }

  // Simple CSS styles
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'enhanced-food-table-styles';
    style.textContent = `
      .food-table-row {
        position: relative;
        background: white;
        color: #111827; /* Ensure default text color */
        cursor: pointer;
        transition: none !important;
        transform-origin: center center;
        box-shadow: none !important;
        z-index: auto !important;
        will-change: color, background;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        contain: paint;
      }
      .food-table-row * {
        color: inherit !important;
      }
      .food-table-row:hover:not(.selected):not(.dragging-item) {
        background-color: #f9fafb;
        transition: all 0.2s ease;
      }
      .food-table-row.selected {
        background-color: #E8D5E8 !important;
        /* border-left: 4px solid #9333ea; */
        border-left: none !important;
        transition: all 0.3s ease;
      }
      .food-table-row.dragging-item {
        color: #a3a3a3 !important; /* Gray text */
        background: white !important;
        opacity: 1 !important;
        box-shadow: none !important;
        z-index: auto !important;
        border-left: none !important;
        border-right: none !important;
        border-top: none !important;
        border-bottom: none !important;
        border-radius: 0 !important;
        outline: none !important;
        transition: color 0.2s ease;
        will-change: color, background;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        contain: paint;
        pointer-events: none;
      }
      .food-table-row.dragging-item * {
        color: #a3a3a3 !important;
      }
      .food-table-row.selected.dragging-item, .food-table-row.dragging-item.selected {
        background: white !important;
        color: #a3a3a3 !important;
        border-left: none !important;
        border-right: none !important;
        border-top: none !important;
        border-bottom: none !important;
        border-radius: 0 !important;
        outline: none !important;
      }
      .food-table-row.selected.dragging-item *, .food-table-row.dragging-item.selected * {
        color: #a3a3a3 !important;
      }
      body.dragging {
        user-select: none;
        cursor: grabbing !important;
      }
      body.dragging * {
        cursor: grabbing !important;
      }
      .food-table-container {
        position: relative;
        border: 2px solid #e5e7eb;
        border-radius: 0.5rem;
      }
      .food-table-container.dragging {
        cursor: grabbing !important;
      }
      .food-table-container.dragging * {
        cursor: grabbing !important;
      }
    `;
    
    if (!document.getElementById('enhanced-food-table-styles')) {
      document.head.appendChild(style);
    }
    
    return () => {
      const existingStyle = document.getElementById('enhanced-food-table-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  return (
    <div 
      className={`w-full overflow-x-auto food-table-container ${activeId ? 'dragging' : ''}`}
      style={{ cursor: activeId ? 'grabbing' : 'default' }}
    >
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-auto" />
              <col className="w-24" />
              <col className="w-20" />
            </colgroup>
            <tbody>
              <SortableContext 
                items={currentEntries.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {currentEntries.map((item) => (
                  <EnhancedSortableTableRow
                    key={item.id}
                    item={item}
                    foodData={foodData}
                    filteredEntries={currentEntries}
                    selectedEntries={selectedEntries}
                    handleEntrySelect={handleEntrySelect}
                    removeFoodEntry={removeFoodEntry}
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
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>
        {/* No DragOverlay - visual feedback handled by .dragging-item class only */}
      </DndContext>
    </div>
  );
}
