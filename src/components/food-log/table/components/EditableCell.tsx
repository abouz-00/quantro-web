import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { FoodEntry } from '../types';
import { AVAILABLE_UNITS, abbreviateUnit, normalizeUnit, convertUnits } from '../utils';

interface EditableCellProps {
  item: FoodEntry;
  editingEntry: string | null;
  editAmount: string;
  setEditAmount: (amount: string) => void;
  editUnit: string;
  setEditUnit: (unit: string) => void;
  updateFoodEntry: (id: string, updated: Partial<FoodEntry>) => void;
  setEditingEntry: (id: string | null) => void;
  formatNumber: (n: number) => string;
  onStartEditing: (entry: FoodEntry, e?: React.MouseEvent | React.KeyboardEvent) => void;
}

export const EditableCell = memo(({
  item,
  editingEntry,
  editAmount,
  setEditAmount,
  editUnit,
  setEditUnit,
  updateFoodEntry,
  setEditingEntry,
  formatNumber,
  onStartEditing
}: EditableCellProps) => {
  const [editError, setEditError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (editingEntry === item.id && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingEntry, item.id]);

  const saveEdit = useCallback((entry: FoodEntry, e?: React.MouseEvent | React.KeyboardEvent | React.FocusEvent) => {
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
  }, [editAmount, editUnit, setEditAmount, setEditUnit, setEditingEntry, updateFoodEntry]);

  // Save edit if focus leaves the input/select (blur)
  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      // Check if focus is moving to another edit control within the same row
      if (
        e.relatedTarget &&
        (e.relatedTarget === inputRef.current || e.relatedTarget === selectRef.current)
      ) {
        return; // Don't save yet, focus is still within the edit controls
      }
      
      // Only save if still editing this row
      if (editingEntry === item.id) {
        saveEdit(item, e);
      }
    },
    [editingEntry, item, saveEdit]
  );

  const handleAmountChange = (value: string) => {
    let val = value;
    val = val.replace(/[^\d.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts.length === 2) {
      parts[1] = parts[1].slice(0, 2);
      val = parts[0] + '.' + parts[1];
    }
    setEditAmount(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent, isSelect = false) => {
    if (e.key === 'Enter') {
      saveEdit(item, e);
    } else if (e.key === 'Escape') {
      setEditingEntry(null);
      setEditAmount(item.amount);
      setEditUnit(normalizeUnit(item.unit));
      setEditError(null);
    } else if (e.key === 'Tab' && !isSelect && !e.shiftKey) {
      e.preventDefault();
      selectRef.current?.focus();
    } else if (e.key === 'Tab' && isSelect && e.shiftKey) {
      e.preventDefault();
      inputRef.current?.focus();
    }

    // Additional validation for input field
    if (!isSelect) {
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
      if (e.key === '.' && editAmount.includes('.')) {
        e.preventDefault();
      }
    }
  };

  const stopPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  if (editingEntry === item.id) {
    return (
      <div className="inline-flex items-center gap-6 justify-center w-full" onClick={stopPropagation} onPointerDown={stopPropagation} tabIndex={-1}>
        <input
          ref={inputRef}
          type="text"
          value={editAmount}
          onChange={e => handleAmountChange(e.target.value)}
          onKeyDown={e => handleKeyDown(e, false)}
          onBlur={handleBlur}
          className={
            "w-16 p-1 pr-2 border rounded text-right focus:outline-none " +
            (editError ? "border-red-500" : "border-gray-300")
          }
          autoFocus
          aria-label="Edit amount"
          aria-invalid={!!editError}
          onClick={stopPropagation}
          onPointerDown={stopPropagation}
          inputMode="decimal"
        />
        <select
          ref={selectRef}
          value={editUnit}
          onChange={e => setEditUnit(e.target.value)}
          onKeyDown={e => handleKeyDown(e, true)}
          onBlur={handleBlur}
          className="p-1 border rounded text-sm bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-16 border-gray-300"
          aria-label="Edit unit"
          onClick={stopPropagation}
          onPointerDown={stopPropagation}
          onPointerUp={stopPropagation}
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
    );
  }

  return (
    <div className="inline-flex items-center gap-6 justify-center w-full">
      <span
        className="hover:bg-gray-100 px-1 rounded cursor-pointer flex items-center transition-colors"
        tabIndex={0}
        role="button"
        aria-label="Edit amount"
        onClick={(e) => onStartEditing(item, e)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') onStartEditing(item, e);
        }}
      >
        <span className="text-right min-w-[3rem]" style={{fontWeight: 400}}>{formatNumber(parseFloat(item.amount))}</span>
      </span>
      <span
        className="hover:bg-gray-100 px-1 rounded cursor-pointer flex items-center transition-colors"
        tabIndex={0}
        role="button"
        aria-label="Edit unit"
        onClick={(e) => onStartEditing(item, e)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') onStartEditing(item, e);
        }}
      >
        <span className="inline-block w-12 text-left" style={{fontWeight: 400}}>{abbreviateUnit(item.unit)}</span>
      </span>
    </div>
  );
});

EditableCell.displayName = 'EditableCell';
