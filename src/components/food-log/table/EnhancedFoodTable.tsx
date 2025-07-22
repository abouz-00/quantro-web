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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const dragResistance = 0.3; // How much the item resists movement (0-1, lower = more resistance)

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
    setDragOffset({ x: 0, y: 0 });
    setVelocity({ x: 0, y: 0 });
    
    // Auto-select the entry being dragged if not already selected
    if (!selectedEntries.includes(draggedEntryId)) {
      setSelectedEntries?.([draggedEntryId]);
    }
    
    document.body.classList.add('dragging');
    
    // Add mouse move listener for physics simulation
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - lastMousePosition.x;
      const deltaY = e.clientY - lastMousePosition.y;
      
      // Apply resistance to movement
      const newVelocityX = velocity.x + (deltaX * dragResistance);
      const newVelocityY = velocity.y + (deltaY * dragResistance);
      
      // Apply damping to simulate weight/friction
      setVelocity({
        x: newVelocityX * 0.85,
        y: newVelocityY * 0.85
      });
      
      setDragOffset(prev => ({
        x: prev.x + newVelocityX,
        y: prev.y + newVelocityY
      }));
      
      setLastMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const activatorEvent = event.activatorEvent as MouseEvent;
    setLastMousePosition({ x: activatorEvent.clientX, y: activatorEvent.clientY });
    document.addEventListener('mousemove', handleMouseMove);
    
    // Clean up listener
    const cleanup = () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
    
    // Store cleanup function
    (window as any).dragCleanup = cleanup;
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
    const { active, over } = event;
    
    setActiveId(null);
    setDragOffset({ x: 0, y: 0 });
    setVelocity({ x: 0, y: 0 });
    document.body.classList.remove('dragging');
    
    // Clean up mouse move listener
    if ((window as any).dragCleanup) {
      (window as any).dragCleanup();
      (window as any).dragCleanup = null;
    }

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
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
        transform-origin: center center;
      }
      
      .food-table-row:hover:not(.selected):not(.dragging-item) {
        background-color: #f9fafb;
        transition: all 0.2s ease;
      }
      
      .food-table-row.selected {
        background-color: #E8D5E8 !important;
        border-left: 4px solid #9333ea;
        transition: all 0.3s ease;
      }
      
      .food-table-row.dragging-item {
        background-color: #f3f4f6 !important;
        opacity: 0.85;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1), 
                    box-shadow 0.3s ease, 
                    opacity 0.2s ease;
        will-change: transform;
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
        
        <DragOverlay>
          {/* Empty DragOverlay - visual feedback handled by individual rows */}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
