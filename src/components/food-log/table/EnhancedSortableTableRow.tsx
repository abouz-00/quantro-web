"use client";

import React, { useRef, useEffect, useCallback, useMemo, useState } from "react";
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
  
  // Memoized supplement check for performance
  const isSupplement = useCallback((description: string): boolean => {
    const supplementKeywords = [
      'vitamin', 'supplement', 'capsule', 'tablet', 'pill', 'gummy',
      'multivitamin', 'protein powder', 'creatine', 'omega', 'probiotic',
      'magnesium', 'calcium', 'iron', 'zinc', 'b12', 'b-12', 'd3',
      'fish oil', 'biotin', 'collagen', 'ashwagandha', 'turmeric'
    ];
    const lowerDescription = description.toLowerCase();
    return supplementKeywords.some(keyword => lowerDescription.includes(keyword));
  }, []);
  
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
    // Snap the dragged row in place by disabling transform when dragging
    transform: isDragging ? 'none' : CSS.Transform.toString(transform),
    transition: transition,
    zIndex: 1,
    opacity: 1,
    // No background, border, or shadow changes for drag or selection
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


  // Keyboard navigation: allow Enter/Space to start editing
  const startEditing = (entry: FoodEntry, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    // Ensure the row is selected when editing starts
    if (!isSelected) {
      let mouseEvent: React.MouseEvent<Element, MouseEvent>;
      if (e && 'button' in e) {
        mouseEvent = e as React.MouseEvent<Element, MouseEvent>;
      } else {
        // Create a synthetic MouseEvent if e is a KeyboardEvent or undefined
        mouseEvent = {
          stopPropagation: () => {},
          preventDefault: () => {},
          nativeEvent: {} as MouseEvent,
          currentTarget: null as any,
          target: null as any,
          bubbles: false,
          cancelable: false,
          defaultPrevented: false,
          eventPhase: 0,
          isTrusted: true,
          timeStamp: Date.now(),
          type: 'click',
          persist: () => {},
          isDefaultPrevented: () => false,
          isPropagationStopped: () => false,
          isPersistent: () => false,
          // MouseEvent specific
          altKey: false,
          button: 0,
          buttons: 0,
          clientX: 0,
          clientY: 0,
          ctrlKey: false,
          metaKey: false,
          movementX: 0,
          movementY: 0,
          pageX: 0,
          pageY: 0,
          relatedTarget: null,
          screenX: 0,
          screenY: 0,
          shiftKey: false,
        } as unknown as React.MouseEvent<Element, MouseEvent>;
      }
      handleEntrySelect(entry.id, foodData.indexOf(entry), mouseEvent);
    }
    setEditingEntry(entry.id);
    setEditAmount(entry.amount);
    setEditUnit(normalizeUnit(entry.unit));
  };


  // Error state for invalid input
  const [editError, setEditError] = useState<string | null>(null);

  // Save edit with error handling
  const saveEdit = (entry: FoodEntry, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setEditError(null);
    const originalAmount = parseFloat(entry.amount);
    const newAmount = parseFloat(editAmount);
    const originalUnit = normalizeUnit(entry.unit);
    const newUnit = editUnit;
    if (isNaN(newAmount) || newAmount <= 0) {
      setEditError("Please enter a valid positive number.");
      setEditAmount(entry.amount);
      setEditUnit(originalUnit);
      return;
    }
    if (editAmount === entry.amount && originalUnit === newUnit) {
      setEditingEntry(null);
      return;
    }
    const originalAmountInGrams = convertUnits(originalAmount, originalUnit, 'Grams');
    const newAmountInGrams = convertUnits(newAmount, newUnit, 'Grams');
    if (isNaN(originalAmountInGrams) || isNaN(newAmountInGrams) || originalAmountInGrams <= 0) {
      setEditError("Unit conversion failed. Please check your input.");
      setEditAmount(entry.amount);
      setEditUnit(originalUnit);
      setEditingEntry(null);
      return;
    }
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

  // Refs for keyboard focus management
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingEntry === item.id && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingEntry, item.id]);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={getRowClasses() + (editingEntry === item.id ? ' bg-blue-50' : '')}
      data-id={item.id}
      aria-selected={isSelected}
      onClick={(e) => {
        if (editingEntry !== item.id) {
          handleEntrySelect(item.id, foodData.indexOf(item), e);
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (editingEntry !== item.id) {
          handleEntrySelect(item.id, foodData.indexOf(item), e);
        }
      }}
      onContextMenu={(e) => {
        if (!isDragging && editingEntry !== item.id) {
          onContextMenu?.(e, item.id);
        }
      }}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && editingEntry !== item.id) {
          startEditing(item, e);
        }
      }}
      {...attributes}
      {...listeners}
    >
      {/* Drag handle area - only active when not editing */}
      <td
        className="py-2 pl-2 pr-2 min-w-[16rem] w-64"
        style={{
          cursor: editingEntry === item.id ? 'default' : isDragging ? 'grabbing' : 'grab'
        }}
        role="cell"
        aria-label={capitalizeWords(item.description)}
      >
        <div className="flex items-center space-x-2">
          {isSupplement(item.description) ? (
            <Pill size={16} className="text-blue-500 flex-shrink-0" />
          ) : (
            <span className="text-lg flex-shrink-0" aria-label="food">🍞</span>
          )}
          <span>{capitalizeWords(item.description)}</span>
        </div>
      </td>

      <td className="py-2 px-4 text-center" style={{ minWidth: 160 }} role="cell">
        {editingEntry === item.id ? (
          <div className="inline-flex items-center gap-6 justify-center w-full" onClick={e => e.stopPropagation()} tabIndex={-1}>
            <input
              ref={inputRef}
              type="text"
              value={editAmount}
              onChange={e => {
                // Only allow digits and a single decimal point, and up to two decimal places
                let val = e.target.value;
                val = val.replace(/[^\d.]/g, '');
                const parts = val.split('.');
                if (parts.length > 2) {
                  val = parts[0] + '.' + parts.slice(1).join('');
                }
                if (parts.length === 2) {
                  parts[1] = parts[1].slice(0, 2); // Limit to 2 decimal places
                  val = parts[0] + '.' + parts[1];
                }
                setEditAmount(val);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  saveEdit(item, e);
                } else if (e.key === 'Escape') {
                  setEditingEntry(null);
                  setEditAmount(item.amount);
                  setEditUnit(normalizeUnit(item.unit));
                  setEditError(null);
                } else if (e.key === 'Tab' && !e.shiftKey) {
                  // Move focus to select
                  e.preventDefault();
                  selectRef.current?.focus();
                }
                // Prevent entering multiple dots or non-digit characters
                if (
                  !(
                    (e.key >= '0' && e.key <= '9') ||
                    e.key === '.' ||
                    e.key === 'Backspace' ||
                    e.key === 'Delete' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight' ||
                    e.key === 'Tab' ||
                    e.key === 'Enter' ||
                    e.key === 'Escape'
                  )
                ) {
                  e.preventDefault();
                }
                // Prevent more than one dot
                if (e.key === '.' && editAmount.includes('.')) {
                  e.preventDefault();
                }
              }}
              className={
                "w-16 p-1 pr-2 border rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono " +
                (editError ? "border-red-500" : "border-gray-300")
              }
              autoFocus
              aria-label="Edit amount"
              aria-invalid={!!editError}
              onClick={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
              inputMode="decimal"
            />
            <select
              ref={selectRef}
              value={editUnit}
              onChange={e => setEditUnit(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  saveEdit(item, e);
                } else if (e.key === 'Escape') {
                  setEditingEntry(null);
                  setEditAmount(item.amount);
                  setEditUnit(normalizeUnit(item.unit));
                  setEditError(null);
                } else if (e.key === 'Tab' && e.shiftKey) {
                  // Move focus back to input
                  e.preventDefault();
                  inputRef.current?.focus();
                }
              }}
              className="p-1 border rounded text-sm bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-16 border-gray-300"
              aria-label="Edit unit"
              onClick={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
            >
              {AVAILABLE_UNITS.map(unit => (
                <option key={unit} value={unit}>
                  {abbreviateUnit(unit)}
                </option>
              ))}
            </select>
            {editError && (
              <span className="ml-2 text-red-500 text-xs" role="alert">{editError}</span>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-6 justify-center w-full">
            <span
              className="hover:bg-gray-100 px-1 rounded cursor-pointer flex items-center transition-colors"
              tabIndex={0}
              role="button"
              aria-label="Edit amount"
              onClick={(e) => startEditing(item, e)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') startEditing(item, e);
              }}
              onPointerDown={e => e.stopPropagation()}
            >
              <span className="font-medium text-right min-w-[3rem] font-mono">{formatNumber(parseFloat(item.amount))}</span>
            </span>
            <span
              className="hover:bg-gray-100 px-1 rounded cursor-pointer flex items-center transition-colors"
              tabIndex={0}
              role="button"
              aria-label="Edit unit"
              onClick={(e) => startEditing(item, e)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') startEditing(item, e);
              }}
              onPointerDown={e => e.stopPropagation()}
            >
              <span className="inline-block w-12 text-left text-gray-600">{abbreviateUnit(item.unit)}</span>
            </span>
          </div>
        )}
      </td>

      <td className="py-2 px-8 text-right" style={{ minWidth: 140 }} role="cell">
        <div className="flex items-center justify-end space-x-2">
          <span className="font-medium">{formatNumber(item.calories)}</span>
          <span className="text-gray-600">kcal</span>
        </div>
      </td>
    </tr>
  );
}
