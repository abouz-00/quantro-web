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
  activeId,
  setActiveId,
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
  activeId: string | null;
  setActiveId: (id: string | null) => void;
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

  // Simple drag listeners - let dnd-kit handle the complexity
  const dragListeners = {
    ...listeners,
  };

  // Simple transform - just vertical movement
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(0px, ${transform.y}px, 0px)` : undefined,
    transition: isDragging ? 'none' : undefined,
    zIndex: isDragging ? 1000 : 1,
  };

  // Simple row classes
  const getRowClasses = () => {
    const baseClasses = "food-table-row border-b border-gray-200 last:border-0";
    if (isDragging) return `${baseClasses} dragging-item`;
    if (isSelected) return `${baseClasses} selected`;
    return baseClasses;
  };

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
      onClick={(e) => {
        handleEntrySelect(item.id, foodData.indexOf(item), e);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        handleEntrySelect(item.id, foodData.indexOf(item), e);
      }}
      onContextMenu={(e) => {
        if (!isDragging) {
          onContextMenu?.(e, item.id);
        }
      }}
      data-id={item.id}
      {...attributes}
      {...dragListeners}
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
  
  // Helper function to format numbers without trailing zeros
  const formatNumber = (num: number): string => {
    // Round to 2 decimal places and remove trailing zeros
    const fixed = num.toFixed(2);
    return parseFloat(fixed).toString();
  };
  
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