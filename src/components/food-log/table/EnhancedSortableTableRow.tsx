"use client";

import React from "react";
import { FaPencilAlt, FaCheck } from "react-icons/fa";
import { Pill } from "lucide-react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FoodEntry, SortableRowProps } from './types';
import { capitalizeWords, abbreviateUnit, AVAILABLE_UNITS, convertUnits, normalizeUnit } from './utils';

export function EnhancedSortableTableRow({
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
  editUnit,
  setEditUnit,
  formatNumber,
  onContextMenu,
  activeId
}: SortableRowProps) {
  const isSelected = selectedEntries.includes(item.id);
  
  // Helper function to determine if an entry is a supplement
  const isSupplement = (description: string): boolean => {
    const supplementKeywords = [
      'vitamin', 'supplement', 'capsule', 'tablet', 'pill', 'gummy',
      'multivitamin', 'protein powder', 'creatine', 'omega', 'probiotic',
      'magnesium', 'calcium', 'iron', 'zinc', 'b12', 'b-12', 'd3',
      'fish oil', 'biotin', 'collagen', 'ashwagandha', 'turmeric'
    ];
    
    const lowerDescription = description.toLowerCase();
    return supplementKeywords.some(keyword => lowerDescription.includes(keyword));
  };
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    disabled: editingEntry === item.id, // Disable dragging when editing
    data: {
      type: 'food-entry',
    },
    transition: {
      duration: 600, // Slower transitions for weight effect
      easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
    },
  });

  const style: React.CSSProperties = {
    // Apply a more weighted transform with momentum simulation
    transform: isDragging 
      ? 'scale(1.02) rotate(0.5deg)' 
      : CSS.Transform.toString(transform),
    // Disable transitions for non-dragged items when any item is being dragged
    // This prevents the "snapping" animation that conflicts with the heavy drag feel
    transition: isDragging 
      ? 'transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.3s ease' 
      : activeId && activeId !== item.id 
        ? 'none' // No transition for items being displaced during drag
        : transition, // Normal transition when no drag is active
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.9 : 1,
    // Add inline styles for selection to override any CSS conflicts
    ...(isSelected && !isDragging && {
      backgroundColor: '#E8D5E8',
      borderLeft: '4px solid #9333ea',
    }),
    // Style the dragged item with weight simulation
    ...(isDragging && {
      backgroundColor: '#E8D5E8',
      borderLeft: '4px solid #9333ea',
      boxShadow: '0 12px 35px rgba(0, 0, 0, 0.2), 0 4px 15px rgba(147, 51, 234, 0.1)',
      borderRadius: '0.375rem',
      transformOrigin: 'center center',
    }),
  };

  // Clean row classes with proper state management
  const getRowClasses = () => {
    const baseClasses = "food-table-row border-b border-gray-200 last:border-0 transition-colors duration-150";
    let classes = [baseClasses];
    
    if (isDragging) {
      classes.push('dragging-item opacity-80');
    } else if (isSelected) {
      classes.push('selected');
    }
    
    return classes.join(' ');
  };

  const startEditing = (entry: FoodEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEntry(entry.id);
    setEditAmount(entry.amount);
    setEditUnit(normalizeUnit(entry.unit));
  };

  const saveEdit = (entry: FoodEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const originalAmount = parseFloat(entry.amount);
    const newAmount = parseFloat(editAmount);
    const originalUnit = normalizeUnit(entry.unit);
    const newUnit = editUnit;
    
    // Validate the new amount
    if (isNaN(newAmount) || newAmount <= 0) {
      // Reset to original values if invalid
      setEditAmount(entry.amount);
      setEditUnit(originalUnit);
      return;
    }
    
    // Check if nothing changed
    if (editAmount === entry.amount && originalUnit === newUnit) {
      setEditingEntry(null);
      return;
    }
    
    // Convert the original amount in grams for the nutritional calculation
    const originalAmountInGrams = convertUnits(originalAmount, originalUnit, 'Grams');
    const newAmountInGrams = convertUnits(newAmount, newUnit, 'Grams');
    
    // Validate conversion results
    if (isNaN(originalAmountInGrams) || isNaN(newAmountInGrams) || originalAmountInGrams <= 0) {
      // Reset to original values if conversion fails
      setEditAmount(entry.amount);
      setEditUnit(originalUnit);
      setEditingEntry(null);
      return;
    }
    
    // Calculate the ratio based on the gram equivalents
    const ratio = newAmountInGrams / originalAmountInGrams;
    
    updateFoodEntry(entry.id, {
      amount: editAmount,
      unit: newUnit,
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
        // Only handle selection when not editing
        if (editingEntry !== item.id) {
          handleEntrySelect(item.id, foodData.indexOf(item), e);
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        // Only handle selection when not editing
        if (editingEntry !== item.id) {
          handleEntrySelect(item.id, foodData.indexOf(item), e);
        }
      }}
      onContextMenu={(e) => {
        // Only show context menu when not dragging or editing
        if (!isDragging && editingEntry !== item.id) {
          onContextMenu?.(e, item.id);
        }
      }}
      data-id={item.id}
      {...attributes}
      {...listeners}
    >
      {/* Drag handle area - only active when not editing */}
      <td 
        className="py-2 pl-2 pr-2"
        style={{ 
          cursor: editingEntry === item.id ? 'default' : isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div className="flex items-center space-x-2">
          {isSupplement(item.description) ? (
            <Pill size={16} className="text-blue-500 flex-shrink-0" />
          ) : (
            <span className="text-lg flex-shrink-0">🍞</span>
          )}
          <span>{capitalizeWords(item.description)}</span>
        </div>
      </td>
      
      <td className="py-2 px-2">
        {editingEntry === item.id ? (
          <div className="flex items-center justify-end space-x-1" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              value={editAmount}
              onChange={e => setEditAmount(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  saveEdit(item, e as any);
                } else if (e.key === 'Escape') {
                  setEditingEntry(null);
                  setEditAmount(item.amount);
                  setEditUnit(normalizeUnit(item.unit));
                }
              }}
              className="w-16 p-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
              onClick={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
            />
            <select
              value={editUnit}
              onChange={e => setEditUnit(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  saveEdit(item, e as any);
                } else if (e.key === 'Escape') {
                  setEditingEntry(null);
                  setEditAmount(item.amount);
                  setEditUnit(normalizeUnit(item.unit));
                }
              }}
              className="p-1 border border-gray-300 rounded text-sm bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onClick={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
            >
              {AVAILABLE_UNITS.map(unit => (
                <option key={unit} value={unit}>
                  {abbreviateUnit(unit)}
                </option>
              ))}
            </select>
            <button 
              onClick={(e) => saveEdit(item, e)}
              onPointerDown={e => e.stopPropagation()}
              className="text-green-500 hover:text-green-600 ml-1 p-1 rounded hover:bg-green-50 transition-colors"
            >
              <FaCheck size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end space-x-2">
            <span 
              className="hover:bg-gray-100 px-1 rounded cursor-pointer flex items-center transition-colors"
              onClick={(e) => startEditing(item, e)}
              onPointerDown={e => e.stopPropagation()}
            >
              <span className="font-medium text-right min-w-[3rem]">{formatNumber(parseFloat(item.amount))}</span>
              <span className="text-gray-600 text-left ml-1">{abbreviateUnit(item.unit)}</span>
            </span>
            <FaPencilAlt 
              size={12} 
              className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
              onClick={(e) => startEditing(item, e)}
              onPointerDown={e => e.stopPropagation()}
            />
          </div>
        )}
      </td>
      
      <td className="py-2 px-2 text-right">
        <div className="flex items-center justify-end space-x-2">
          <span className="font-medium">{formatNumber(item.calories)}</span>
          <span className="text-gray-600">kcal</span>
        </div>
      </td>
    </tr>
  );
}
