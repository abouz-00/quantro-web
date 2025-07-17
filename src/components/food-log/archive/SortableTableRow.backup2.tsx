"use client";

import React from "react";
import { FaPencilAlt, FaCheck } from "react-icons/fa";
import { useSortable } from '@dnd-kit/sortable';
import { FoodEntry, SortableRowProps } from './types';
import { capitalizeWords, abbreviateUnit } from './utils';

export function SortableTableRow({
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
}: SortableRowProps) {
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
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    disabled: false
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
