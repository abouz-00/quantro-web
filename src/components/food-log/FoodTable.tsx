"use client";

import React, { useState } from "react";
import { FaTrash, FaPencilAlt, FaCheck, FaGripVertical } from "react-icons/fa";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
  setEditAmount 
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
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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

  const formatNumber = (num: number): string => {
    const rounded = parseFloat(num.toFixed(2));
    return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-200 last:border-0 cursor-pointer ${
        selectedEntries.includes(item.id) ? 'bg-blue-50' : ''
      } ${isDragging ? 'shadow-lg' : ''}`}
      onClick={(e) => handleEntrySelect(item.id, foodData.indexOf(item), e)}
    >
      <td className="py-2 pl-2 pr-2">
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <FaGripVertical className="text-gray-400" size={12} />
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
            />
            <span>{capitalizeWords(item.unit)}</span>
            <button 
              onClick={(e) => saveEdit(item, e)}
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
            >
              {formatNumber(parseFloat(item.amount))} {capitalizeWords(item.unit)}
            </span>
            <FaPencilAlt 
              size={12} 
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={(e) => startEditing(item, e)}
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
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = filteredEntries.findIndex(item => item.id === active.id);
      const newIndex = filteredEntries.findIndex(item => item.id === over?.id);
      
      const newOrder = arrayMove(filteredEntries, oldIndex, newIndex);
      onReorderEntries(newOrder);
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="w-8 py-2 pl-2"></th>
              <th className="text-left py-2 pl-2 pr-2">Food</th>
              <th className="text-left py-2 px-2 min-w-[120px]">Amount</th>
              <th className="text-right py-2 px-2 min-w-[80px]">Calories</th>
              <th className="text-right py-2 px-2 min-w-[80px]">Protein</th>
              <th className="text-right py-2 px-2 min-w-[80px]">Carbs</th>
              <th className="text-right py-2 px-2 min-w-[80px]">Fat</th>
              <th className="w-16 py-2 pl-4"></th>
            </tr>
          </thead>
          <tbody>
            <SortableContext 
              items={filteredEntries.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredEntries.map((item, index) => (
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
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>
    </div>
  );
}