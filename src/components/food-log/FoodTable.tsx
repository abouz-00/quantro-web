"use client";

import React, { useState } from "react";
import { FaPencilAlt, FaCheck } from "react-icons/fa";
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
  onContextMenu?: (e: React.MouseEvent, entryId: string) => void;
  setSelectedEntries?: (entries: string[]) => void; // Add this prop to allow direct selection
}

// Helper function to capitalize first letter of each word
const capitalizeWords = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to abbreviate units
const abbreviateUnit = (unit: string): string => {
  const lowerUnit = unit.toLowerCase();
  const unitMap: { [key: string]: string } = {
    'grams': 'g',
    'gram': 'g',
    'cups': 'cups',
    'cup': 'cups',
    'ounces': 'oz',
    'ounce': 'oz',
    'tablespoons': 'tbsp',
    'tablespoon': 'tbsp',
    'teaspoons': 'tsp',
    'teaspoon': 'tsp'
  };
  
  return unitMap[lowerUnit] || unit;
};

// Sortable row component
function SortableTableRow({ 
  item, 
  foodData, 
  filteredEntries,
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
  formatNumber,
  onContextMenu
}: {
  item: FoodEntry;
  foodData: FoodEntry[];
  filteredEntries: FoodEntry[];
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
  onContextMenu?: (e: React.MouseEvent, entryId: string) => void;
}) {
  const isSelected = selectedEntries.includes(item.id);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    disabled: false // Allow dragging on any entry
  });

  // Custom drag listeners that respect modifier keys and preserve click behavior
  const customListeners = {
    ...listeners,
    onPointerDown: (event: React.PointerEvent) => {
      // Don't start drag if modifier keys are held - let click handler manage selection
      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        return;
      }
      
      // Also don't start drag immediately on pointer down to allow for click-to-deselect
      // The activation constraint distance/delay will handle this naturally
      
      // Call the original pointer down handler
      if (listeners?.onPointerDown) {
        listeners.onPointerDown(event as any);
      }
    }
  };

  // Simplified transform - instant snapping with no smooth animations
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(0px, ${transform.y}px, 0px)` : undefined,
    transition: 'none', // Remove all transitions for instant snapping
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 1000 : 1,
    // Ensure dragged element maintains table structure
    ...(isDragging && {
      position: 'relative' as const,
      backgroundColor: '#f8fafc',
      border: '2px solid #3b82f6',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      borderRadius: '4px',
    }),
    // Add cursor style based on state
    cursor: 'pointer', // Always show pointer cursor for clicking
    ...(isDragging && { cursor: 'move' }), // Show move cursor when dragging
  };

  // Enhanced visual feedback for discrete snapping
  const isDropTarget = dragOverId === item.id && activeId !== item.id;
  const isBeingDragged = activeId === item.id;

  // Solid box classes with clear visual states
  const getRowClasses = () => {
    const baseClasses = "food-table-row border-b border-gray-200 last:border-0 select-none relative";
    const selectedClasses = isSelected ? 'selected' : '';
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
      onContextMenu={(e) => {
        // Prevent context menu during drag operations
        if (!isDragging && !activeId) {
          onContextMenu?.(e, item.id);
        }
      }}
      data-id={item.id}
      {...attributes}
      {...customListeners} // Use custom listeners that respect modifier keys
    >
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
            <span>{abbreviateUnit(item.unit)}</span>
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
              {formatNumber(parseFloat(item.amount))} {abbreviateUnit(item.unit)}
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
      <td className="py-2 px-2 text-right">{formatNumber(item.calories)} cal</td>
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
  onReorderEntries = () => {},
  onContextMenu,
  setSelectedEntries
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

  // Custom collision detection for discrete snapping behavior
  const customCollisionDetection: CollisionDetection = (args) => {
    // Use closest center for predictable discrete positioning
    const closestCenterCollisions = closestCenter(args);
    
    if (closestCenterCollisions.length > 0) {
      // Filter to only include valid table entries
      const validCollisions = closestCenterCollisions.filter(collision => {
        return filteredEntries.some((entry: FoodEntry) => entry.id === collision.id);
      });
      
      if (validCollisions.length > 0) {
        // Only return the closest valid collision to prevent dropping outside bounds
        return [validCollisions[0]];
      }
    }
    
    // No valid collision found - return empty array to prevent invalid drops
    return [];
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Increase distance to allow clicks without triggering drag
        tolerance: 5,
        delay: 100, // Add small delay to distinguish clicks from drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: verticalOnlyCoordinateGetter,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const draggedEntryId = event.active.id as string;
    
    // Don't allow dragging if there's only one entry or no entries
    if (filteredEntries.length <= 1) {
      return;
    }
    
    // Auto-select the entry being dragged if it's not already selected
    if (!selectedEntries.includes(draggedEntryId)) {
      setSelectedEntries?.([draggedEntryId]);
    }
    
    setActiveId(draggedEntryId);
    setDragOverId(null);
    setDragDirection(null);
    
    // Lock cursor and prevent any floating behavior
    document.body.style.cursor = 'move'; // Show move cursor during drag
    document.body.classList.add('dragging');
    
    // Highlight the container boundaries during drag
    const containerElement = document.querySelector('.food-table-container .bg-white.rounded-lg');
    if (containerElement) {
      containerElement.classList.add('drag-boundary-active');
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Only allow dropping on valid targets (other entries)
      const isValidTarget = filteredEntries.some((entry: FoodEntry) => entry.id === over.id);
      
      if (isValidTarget) {
        setDragOverId(over.id as string);
        
        // Calculate direction for visual feedback
        const activeIndex = filteredEntries.findIndex((entry: FoodEntry) => entry.id === active.id);
        const overIndex = filteredEntries.findIndex((entry: FoodEntry) => entry.id === over.id);
        
        // Ensure both indices are valid
        if (activeIndex !== -1 && overIndex !== -1) {
          const newDirection = activeIndex < overIndex ? 'down' : 'up';
          setDragDirection(newDirection);
        } else {
          setDragOverId(null);
          setDragDirection(null);
        }
      } else {
        setDragOverId(null);
        setDragDirection(null);
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
    
    // Remove boundary highlight
    const containerElement = document.querySelector('.food-table-container .bg-white.rounded-lg');
    if (containerElement) {
      containerElement.classList.remove('drag-boundary-active');
    }

    // Only allow reordering if dropping on a valid target
    if (active.id !== over?.id && over?.id) {
      const oldIndex = filteredEntries.findIndex((item: FoodEntry) => item.id === active.id);
      const newIndex = filteredEntries.findIndex((item: FoodEntry) => item.id === over.id);
      
      // Ensure we have valid indices and they're different
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newOrder = arrayMove(filteredEntries, oldIndex, newIndex);
        onReorderEntries(newOrder);
      }
    }
    // If no valid target, item automatically snaps back to original position
  }

  // Enhanced CSS for solid, anchored box behavior with strict boundaries
  React.useEffect(() => {
    const style = document.createElement('style');
    style.id = 'food-table-solid-boxes';
    style.textContent = `
      .food-table-container {
        position: relative;
        overflow: hidden; /* Prevent infinite scrolling */
        max-height: fit-content; /* Only as tall as content */
        contain: layout; /* CSS containment for better performance */
        /* Define clear rounded boundary */
        border-radius: 0.5rem; /* rounded-lg */
      }
      
      .food-table-container table {
        table-layout: fixed;
        border-collapse: separate;
        border-spacing: 0;
        position: relative;
        width: 100%;
        height: fit-content; /* Only as tall as needed */
      }
      
      .food-table-container tbody {
        position: relative;
        overflow: hidden; /* Prevent tbody from creating extra space */
        height: fit-content; /* Only as tall as needed */
      }
      
      .food-table-row {
        position: relative;
        background: white;
        border: 1px solid #e5e7eb;
        transition: none; /* Remove all transitions for instant snapping */
        width: 100%;
        display: table-row;
        height: fit-content; /* Prevent extra height */
        cursor: pointer; /* Show pointer cursor for all rows */
      }
      
      .food-table-row.selected {
        background-color: #E8D5E8 !important;
        border-color: #d1d5db;
        cursor: pointer !important;
        transition: none; /* No transitions */
      }
      
      .food-table-row.selected.dragging-item {
        cursor: move !important; /* Show move cursor when dragging */
        transition: none; /* No transitions during drag */
      }
      
      .food-table-row:not(.selected):not(.dragging-item):hover {
        background-color: #f9fafb;
        border-color: #d1d5db;
        cursor: pointer; /* Maintain pointer cursor on hover */
        transition: none; /* Remove hover transition */
      }
      
      /* Special cursor for shift/ctrl selection */
      .food-table-row:not(.dragging-item):hover:active {
        cursor: pointer; /* Show pointer cursor when clicking for selection */
      }
      
      .food-table-row.dragging-item {
        background-color: #f8fafc !important;
        opacity: 0.8;
        border: 2px solid #3b82f6;
        transform-origin: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        /* Ensure dragged row maintains table structure */
        display: table-row !important;
        width: 100% !important;
        position: relative !important;
        left: 0 !important;
        right: 0 !important;
        /* Constrain dragged element within container bounds */
        z-index: 1000;
      }
      
      .food-table-row.dragging-item td {
        /* Prevent table cells from breaking during drag */
        position: relative;
        border-right: 1px solid #f3f4f6;
      }
      
      .food-table-row.drop-target-up {
        border-top: 3px solid #3b82f6;
        background-color: #eff6ff;
        box-shadow: 0 -2px 4px rgba(59, 130, 246, 0.2);
        transition: none; /* Instant visual feedback */
      }
      
      .food-table-row.drop-target-down {
        border-bottom: 3px solid #3b82f6;
        background-color: #eff6ff;
        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
        transition: none; /* Instant visual feedback */
      }
      
      .dragging {
        user-select: none;
      }
      
      .dragging * {
        pointer-events: none;
      }
      
      .dragging .food-table-row.selected {
        pointer-events: auto;
        cursor: move; /* Show move cursor during drag */
      }
      
      /* Visual boundary indicator when dragging */
      .drag-boundary-active {
        border: 2px solid #3b82f6 !important;
        box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2) inset !important;
        background-color: rgba(59, 130, 246, 0.01) !important;
        transition: none !important; /* Instant boundary feedback */
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



  // Modifiers for instant snapping behavior - no smooth interpolation
  const dragModifiers = [
    (args: any) => {
      const { transform } = args;
      
      if (!transform) return transform;
      
      // Lock horizontal movement and snap vertical movement to discrete positions
      const snapThreshold = 40; // Snap every 40px (approximate row height)
      const snappedY = Math.round(transform.y / snapThreshold) * snapThreshold;
      
      return {
        ...transform,
        x: 0, // Lock horizontal movement
        y: snappedY, // Snap to discrete vertical positions
      };
    }
  ];

  return (
    <div className="w-full overflow-x-auto select-none relative food-table-container">
      <DndContext 
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={dragModifiers}
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
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
                    filteredEntries={filteredEntries}
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