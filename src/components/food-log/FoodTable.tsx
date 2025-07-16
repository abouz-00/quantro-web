"use client";

import React, { useState } from "react";
import { FaTrash, FaPencilAlt, FaCheck, FaGripVertical } from "react-icons/fa";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  CollisionDetection,
  rectIntersection,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface FoodEntry extends Nutrients {
  id: string;
  description: string;
  amount: string;
  unit: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "other";
}

interface FoodTableProps {
  foodData: FoodEntry[];
  filteredEntries: FoodEntry[];
  selectedEntries: string[];
  handleEntrySelect: (id: string, index: number, event: React.MouseEvent) => void;
  removeFoodEntry: (id: string) => void;
  updateFoodEntry?: (id: string, updates: Partial<FoodEntry>) => void;
  onReorderEntries?: (newOrder: FoodEntry[]) => void;
}

// Helper function to capitalize first letter of each word
const capitalizeWords = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Sortable row component
function SortableTableRow({ 
  item, 
  foodData, 
  selectedEntries, 
  handleEntrySelect, 
  removeFoodEntry, 
  updateFoodEntry, 
  editingEntry, 
  setEditingEntry, 
  editAmount, 
  setEditAmount,
  dragOverId,
  dragDirection,
  activeId,
  formatNumber
}: {
  item: FoodEntry;
  foodData: FoodEntry[];
  selectedEntries: string[];
  handleEntrySelect: (id: string, index: number, event: React.MouseEvent) => void;
  removeFoodEntry: (id: string) => void;
  updateFoodEntry: (id: string, updates: Partial<FoodEntry>) => void;
  editingEntry: string | null;
  setEditingEntry: (id: string | null) => void;
  editAmount: string;
  setEditAmount: (amount: string) => void;
  dragOverId: string | null;
  dragDirection: 'up' | 'down' | null;
  activeId: string | null;
  formatNumber: (num: number) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

// Enhanced visual feedback for solid boxes
  const isDropTarget = dragOverId === item.id && activeId !== item.id;
  const isBeingDragged = activeId === item.id;
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging 
      ? 'none' 
      : transition || 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    // Show the item but make it semi-transparent when being dragged
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  // Solid box classes with clear visual states
  const getRowClasses = () => {
    const baseClasses = "food-table-row border-b border-gray-200 last:border-0 select-none relative";
    const selectedClasses = selectedEntries.includes(item.id) ? 'selected' : '';
    const draggingClasses = isDragging ? 'dragging-item' : '';
    const dropTargetClasses = isDropTarget 
      ? `drop-target-${dragDirection}` 
      : '';
    
    return `${baseClasses} ${selectedClasses} ${draggingClasses} ${dropTargetClasses}`.trim();
  };

  // Remove insertion indicator component - using CSS borders instead

  const startEditing = (entry: FoodEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEntry(entry.id);
    setEditAmount(entry.amount);
  };

  const saveEdit = (entry: FoodEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (editAmount === entry.amount) {
      setEditingEntry(null);
      return;
    }
    
    const originalAmount = parseFloat(entry.amount);
    const newAmount = parseFloat(editAmount);
    const ratio = newAmount / originalAmount;
    
    updateFoodEntry(entry.id, {
      amount: editAmount,
      calories: entry.calories * ratio,
      protein: entry.protein * ratio,
      carbs: entry.carbs * ratio,
      fat: entry.fat * ratio,
    });
    
    setEditingEntry(null);
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={getRowClasses()}
      onClick={(e) => handleEntrySelect(item.id, foodData.indexOf(item), e)}
    >
      <td className="py-2 pl-2 pr-2">
        <div 
          className="p-2 rounded pointer-events-auto drag-handle"
          {...attributes}
          {...listeners}
        >
          <FaGripVertical 
            className={`transition-colors duration-200 ${
              isDragging ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
            }`} 
            size={12} 
          />
        </div>
      </td>
      <td className="py-2 pl-2 pr-2">{capitalizeWords(item.description)}</td>
      <td className="py-2 px-2">
        {editingEntry === item.id ? (
          <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              value={editAmount}
              onChange={e => setEditAmount(e.target.value)}
              className="w-16 p-1 border border-gray-300 rounded text-right"
              autoFocus
              onClick={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
            />
            <span>{capitalizeWords(item.unit)}</span>
            <button 
              onClick={(e) => saveEdit(item, e)}
              onPointerDown={e => e.stopPropagation()}
              className="text-green-500 hover:text-green-600 ml-1"
            >
              <FaCheck size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <span 
              className="hover:bg-gray-100 px-1 rounded cursor-pointer"
              onClick={(e) => startEditing(item, e)}
              onPointerDown={e => e.stopPropagation()}
            >
              {formatNumber(parseFloat(item.amount))} {capitalizeWords(item.unit)}
            </span>
            <FaPencilAlt 
              size={12} 
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={(e) => startEditing(item, e)}
              onPointerDown={e => e.stopPropagation()}
            />
          </div>
        )}
      </td>
      <td className="py-2 px-2 text-right">{formatNumber(item.calories)}</td>
      <td className="py-2 px-2 text-right">{formatNumber(item.protein)}g</td>
      <td className="py-2 px-2 text-right">{formatNumber(item.carbs)}g</td>
      <td className="py-2 px-2 text-right">{formatNumber(item.fat)}g</td>
      <td className="py-2 pl-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeFoodEntry(item.id);
          }}
          onPointerDown={e => e.stopPropagation()}
          className="text-gray-500 hover:text-red-500"
          aria-label="Remove entry"
        >
          <FaTrash />
        </button>
      </td>
    </tr>
  );
}

export default function FoodTable({ 
  foodData, 
  filteredEntries, 
  selectedEntries, 
  handleEntrySelect, 
  removeFoodEntry,
  updateFoodEntry = () => {},
  onReorderEntries = () => {}
}: FoodTableProps) {
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragDirection, setDragDirection] = useState<'up' | 'down' | null>(null);
  
  // Helper function to format numbers without trailing zeros
  const formatNumber = (num: number): string => {
    // Round to 2 decimal places and remove trailing zeros
    const fixed = num.toFixed(2);
    return parseFloat(fixed).toString();
  };
  
  // Custom coordinate getter that constrains movement to vertical axis only
  const verticalOnlyCoordinateGetter = (event: KeyboardEvent, args: any) => {
    const coordinates = sortableKeyboardCoordinates(event, args);
    if (coordinates) {
      // Only allow vertical movement, lock horizontal position to 0
      return {
        x: 0,
        y: coordinates.y
      };
    }
    return undefined;
  };

  // Custom collision detection for more precise vertical sorting
  const customCollisionDetection: CollisionDetection = (args) => {
    // Use closest center for more predictable behavior
    const closestCenterCollisions = closestCenter(args);
    
    // If we have results, return them
    if (closestCenterCollisions.length > 0) {
      return closestCenterCollisions;
    }
    
    // Fallback to rect intersection for edge cases
    const rectCollisions = rectIntersection(args);
    return rectCollisions;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced for more responsive dragging
        tolerance: 3,
        delay: 0, // Removed delay for immediate visual feedback
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: verticalOnlyCoordinateGetter,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
    setDragOverId(null);
    setDragDirection(null);
    
    // Lock cursor and prevent any floating behavior
    document.body.style.cursor = 'grabbing';
    document.body.classList.add('dragging');
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setDragOverId(over.id as string);
      
      // Calculate drop direction based on element positions rather than pointer
      const activeRect = active.rect.current.translated;
      const overRect = over.rect;
      
      if (activeRect && overRect) {
        // Compare the centers to determine direction
        const activeCenter = activeRect.top + activeRect.height / 2;
        const overCenter = overRect.top + overRect.height / 2;
        const newDirection = activeCenter < overCenter ? 'down' : 'up';
        setDragDirection(newDirection);
      }
    } else {
      setDragOverId(null);
      setDragDirection(null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    // Clean up all drag-related state
    setActiveId(null);
    setDragOverId(null);
    setDragDirection(null);
    
    // Reset cursor
    document.body.style.cursor = '';
    document.body.classList.remove('dragging');

    // Simple approach: Let dnd-kit handle the positioning automatically
    if (active.id !== over?.id && over?.id) {
      const oldIndex = filteredEntries.findIndex(item => item.id === active.id);
      const newIndex = filteredEntries.findIndex(item => item.id === over.id);
      
      // Ensure we have valid indices
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newOrder = arrayMove(filteredEntries, oldIndex, newIndex);
        onReorderEntries(newOrder);
      }
    }
    // If no valid target, item automatically returns to original position
  }

  // Enhanced CSS for solid, anchored box behavior with strict boundaries
  React.useEffect(() => {
    const style = document.createElement('style');
    style.id = 'food-table-solid-boxes';
    style.textContent = `
      .food-table-container {
        position: relative;
        overflow: visible; /* Allow drag overlay to be visible */
      }
      
      .food-table-container table {
        table-layout: fixed;
        border-collapse: separate;
        border-spacing: 0;
        position: relative;
      }
      
      .food-table-container tbody {
        position: relative;
      }
      
      .food-table-row {
        position: relative;
        background: white;
        border: 1px solid #e5e7eb;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .food-table-row.selected {
        background-color: #E8D5E8 !important;
        border-color: #d1d5db;
      }
      
      .food-table-row:not(.dragging-item):hover {
        background-color: #f9fafb;
        border-color: #d1d5db;
      }
      
      .food-table-row.dragging-item {
        background-color: #f8fafc !important;
        opacity: 0.5;
        border: 2px dashed #9ca3af;
        transform-origin: center;
      }
      
      .food-table-row.drop-target-up {
        border-top: 3px solid #3b82f6;
        background-color: #eff6ff;
        transform: translateY(2px);
        transition: all 0.2s ease;
      }
      
      .food-table-row.drop-target-down {
        border-bottom: 3px solid #3b82f6;
        background-color: #eff6ff;
        transform: translateY(-2px);
        transition: all 0.2s ease;
      }
      
      .drag-handle {
        touch-action: pan-y;
        user-select: none;
        cursor: grab;
        transition: all 0.15s ease;
      }
      
      .drag-handle:active {
        cursor: grabbing;
      }
      
      .dragging {
        user-select: none;
      }
      
      .dragging * {
        pointer-events: none;
      }
      
      .dragging .drag-handle {
        pointer-events: auto;
        cursor: grabbing;
      }
      
      /* Row structure */
      .food-table-row td {
        border-right: 1px solid #f3f4f6;
        position: relative;
      }
      
      .food-table-row td:last-child {
        border-right: none;
      }
    `;
    
    if (!document.getElementById('food-table-solid-boxes')) {
      document.head.appendChild(style);
    }
    
    return () => {
      const existingStyle = document.getElementById('food-table-solid-boxes');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);



  return (
    <div className="w-full overflow-x-auto select-none relative food-table-container">
      <DndContext 
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="min-h-[200px] bg-white rounded-lg shadow-sm border border-gray-100">
          <table className="w-full table-fixed border-collapse">
            <tbody className="divide-y divide-gray-100">
              <SortableContext 
                items={filteredEntries.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredEntries.map((item) => (
                  <SortableTableRow
                    key={item.id}
                    item={item}
                    foodData={foodData}
                    selectedEntries={selectedEntries}
                    handleEntrySelect={handleEntrySelect}
                    removeFoodEntry={removeFoodEntry}
                    updateFoodEntry={updateFoodEntry}
                    editingEntry={editingEntry}
                    setEditingEntry={setEditingEntry}
                    editAmount={editAmount}
                    setEditAmount={setEditAmount}
                    dragOverId={dragOverId}
                    dragDirection={dragDirection}
                    activeId={activeId}
                    formatNumber={formatNumber}
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