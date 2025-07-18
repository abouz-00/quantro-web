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
  closestCenter,
  DragOverlay,
  rectIntersection,
  DragOverEvent,
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
  const [draggedItem, setDraggedItem] = useState<FoodEntry | null>(null);
  
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
    const draggedEntry = filteredEntries.find(entry => entry.id === draggedEntryId);
    
    setActiveId(draggedEntryId);
    setDraggedItem(draggedEntry || null);
    
    // Auto-select the entry being dragged if not already selected
    if (!selectedEntries.includes(draggedEntryId)) {
      setSelectedEntries?.([draggedEntryId]);
    }
    
    document.body.classList.add('dragging');
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    setActiveId(null);
    setDraggedItem(null);
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

  // Simple CSS styles
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'enhanced-food-table-styles';
    style.textContent = `
      .food-table-row {
        position: relative;
        background: white;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      
      .food-table-row:hover:not(.selected):not(.dragging-item) {
        background-color: #f9fafb;
      }
      
      .food-table-row.selected {
        background-color: #E8D5E8 !important;
        border-left: 4px solid #9333ea;
      }
      
      .food-table-row.dragging-item {
        background-color: #f3f4f6 !important;
        opacity: 0.8;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
      }
      
      body.dragging {
        user-select: none;
      }
      
      .food-table-container {
        position: relative;
        border: 2px solid #e5e7eb;
        border-radius: 0.5rem;
      }
      
      .drag-overlay-item {
        background: white;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        border-radius: 0.375rem;
        opacity: 0.95;
        border: 2px solid #9333ea;
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
    <div className={`w-full overflow-x-auto food-table-container ${activeId ? 'dragging' : ''}`}>
      <DndContext 
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <table className="w-full">
            <tbody>
              <SortableContext 
                items={filteredEntries.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredEntries.map((item) => (
                  <EnhancedSortableTableRow
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
                    editUnit={editUnit}
                    setEditUnit={setEditUnit}
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
        
        <DragOverlay>
          {draggedItem ? (
            <div className="drag-overlay-item">
              <table className="w-full">
                <tbody>
                  <EnhancedSortableTableRow
                    item={draggedItem}
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
                    editUnit={editUnit}
                    setEditUnit={setEditUnit}
                    activeId={activeId}
                    setActiveId={setActiveId}
                    formatNumber={formatNumber}
                    onContextMenu={onContextMenu}
                  />
                </tbody>
              </table>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
