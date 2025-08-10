"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  useDroppable,
} from '@dnd-kit/core';
import {
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { FoodTableProps, FoodEntry } from './types';
import { capitalizeWords, abbreviateUnit, AVAILABLE_UNITS, convertUnits, normalizeUnit } from './utils';
import styles from './EnhancedFoodTable.module.css';

// Add meal type order constant
const MEAL_TYPES: Array<FoodEntry['mealType']> = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

// Droppable meal section component
interface MealSectionProps {
  mealType: FoodEntry['mealType'];
  entries: FoodEntry[];
  foodData: FoodEntry[];
  selectedEntries: string[];
  handleEntrySelect: (id: string, index: number, event: React.MouseEvent | React.KeyboardEvent) => void;
  removeFoodEntry: (id: string) => void;
  updateFoodEntry: (id: string, updated: Partial<FoodEntry>) => void;
  editingEntry: string | null;
  setEditingEntry: (id: string | null) => void;
  editAmount: string;
  setEditAmount: (amount: string) => void;
  editUnit: string;
  setEditUnit: (unit: string) => void;
  formatNumber: (n: number) => string;
  onContextMenu?: (e: React.MouseEvent, id: string) => void;
  activeId: string | null;
  contextMenuOpen: boolean;
  setContextMenuOpen: (open: boolean) => void;
  filteredEntries: FoodEntry[];
}

function MealSection({
  mealType,
  entries,
  foodData,
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
  activeId,
  contextMenuOpen,
  setContextMenuOpen,
  filteredEntries
}: MealSectionProps) {
  // Remove sortable functionality - headings are only drop targets now
  const { setNodeRef: setDropRef } = useDroppable({
    id: `drop-${mealType}`,
    data: { type: 'meal-drop-zone', mealType }
  });

  const capitalizedMealType = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  return (
    <div>
      {/* Meal Type Heading - now only a drop target, not draggable */}
      <div 
        ref={setDropRef}
        className="bg-gray-300 px-4 py-2 text-black font-bold text-sm border border-gray-300 border-b-black cursor-default"
      >
        {capitalizedMealType}
      </div>
      
      {/* Entries container - only show if there are entries */}
      {entries.length > 0 && (
        <div className="bg-white border-l border-r border-b border-gray-300">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-auto" />
              <col className="w-24" />
              <col className="w-20" />
            </colgroup>
            <tbody>
              <SortableContext 
                items={entries.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {entries.map((item) => (
                  <EnhancedSortableTableRow
                    key={item.id}
                    item={item}
                    foodData={foodData}
                    filteredEntries={entries}
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
                    contextMenuOpen={contextMenuOpen}
                    setContextMenuOpen={setContextMenuOpen}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Begin EnhancedSortableTableRow (inlined, cleaned) ---
interface EnhancedSortableTableRowProps {
  item: FoodEntry;
  foodData: FoodEntry[];
  filteredEntries: FoodEntry[];
  selectedEntries: string[];
  handleEntrySelect: (id: string, index: number, event: React.MouseEvent | React.KeyboardEvent) => void;
  removeFoodEntry: (id: string) => void;
  updateFoodEntry: (id: string, updated: Partial<FoodEntry>) => void;
  editingEntry: string | null;
  setEditingEntry: (id: string | null) => void;
  editAmount: string;
  setEditAmount: (amount: string) => void;
  editUnit: string;
  setEditUnit: (unit: string) => void;
  formatNumber: (n: number) => string;
  onContextMenu?: (e: React.MouseEvent, id: string) => void;
  activeId: string | null;
  contextMenuOpen: boolean;
  setContextMenuOpen: (open: boolean) => void;
}

function EnhancedSortableTableRow({
  item,
  foodData,
  filteredEntries: _filteredEntries,
  selectedEntries,
  handleEntrySelect,
  removeFoodEntry: _removeFoodEntry,
  updateFoodEntry,
  editingEntry,
  setEditingEntry,
  editAmount,
  setEditAmount,
  editUnit,
  setEditUnit,
  formatNumber,
  onContextMenu,
  activeId,
  contextMenuOpen,
  setContextMenuOpen
}: EnhancedSortableTableRowProps) {
  // Track if a drag occurred to distinguish from click
  const wasDraggingRef = useRef(false);
  const isSelected = selectedEntries.includes(item.id);
  const isSupplement = useCallback((description: string) => {
    const supplementKeywords = [
      'vitamin', 'supplement', 'capsule', 'tablet', 'pill', 'gummy',
      'multivitamin', 'protein powder', 'creatine', 'omega', 'probiotic',
      'magnesium', 'calcium', 'iron', 'zinc', 'b12', 'b-12', 'd3',
      'fish oil', 'biotin', 'collagen', 'ashwagandha', 'turmeric'
    ];
    const lowerDescription = description.toLowerCase();
    return supplementKeywords.some(keyword => lowerDescription.includes(keyword));
  }, []);

  // Helper to check if drag should be disabled for a pointer or keyboard event
  const _shouldDisableDrag = (_e?: PointerEvent | MouseEvent | KeyboardEvent) => {
    // Only disable if editing or context menu is open
    if (editingEntry === item.id || contextMenuOpen) return true;
    // Also check global flag for fallback
    if (typeof window !== 'undefined' && (window as unknown as { _disableDragForRow?: string })._disableDragForRow === item.id) {
      return true;
    }
    return false;
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
    // Do not disable drag here; let listeners/attributes control it
    data: { type: 'food-entry' },
    transition: {
      duration: 600,
      easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
    },
  });

  // Check if this item is currently being dragged
  const isCurrentlyBeingDragged = activeId === item.id;

  // Listen for drag events to set/reset drag state
  useEffect(() => {
    if (isCurrentlyBeingDragged) {
      wasDraggingRef.current = true;
    } else {
      // Reset after drag ends
      wasDraggingRef.current = false;
    }
  }, [isCurrentlyBeingDragged]);

  const style = {
    transform: isCurrentlyBeingDragged ? 'none' : CSS.Transform.toString(transform),
    transition,
    zIndex: 1,
    opacity: 1,
  };

  const getRowClasses = () => {
    const classes = [styles.foodTableRow];
    // Use activeId comparison instead of isDragging for more reliable state
    const isCurrentlyBeingDragged = activeId === item.id;
    if (isCurrentlyBeingDragged) {
      classes.push(styles.draggingItem);
    } else if (isSelected) {
      classes.push(styles.selected);
    }
    return classes.join(' ');
  };

  const startEditing = (entry: FoodEntry, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    
    // Create a synthetic mouse event for handleEntrySelect
    const syntheticEvent = {
      type: 'click',
      button: 0,
      ctrlKey: false,
      shiftKey: false,
      metaKey: false,
      stopPropagation: () => {},
      preventDefault: () => {}
    } as React.MouseEvent;
    
    // Ensure this entry is selected (even if already selected, re-select to trigger parent handlers)
    handleEntrySelect(entry.id, foodData.indexOf(entry), 'button' in (e || {}) ? e as React.MouseEvent : syntheticEvent);
    
    setEditingEntry(entry.id);
    setEditAmount(entry.amount);
    setEditUnit(normalizeUnit(entry.unit));
  };

  const [editError, setEditError] = useState<string | null>(null);

  const saveEdit = (entry: FoodEntry, e?: React.MouseEvent | React.KeyboardEvent | React.FocusEvent) => {
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

  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (editingEntry === item.id && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingEntry, item.id]);

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

  // --- Click logic only: selection is only handled by onClick ---
  return (
    <tr
      ref={setNodeRef}
      style={{...style, position: 'relative'}} // ensure relative for overlay
      className={getRowClasses()}
      data-id={item.id}
      aria-selected={isSelected}
      onPointerUp={e => {
        // Skip selection logic if currently editing this row
        if (editingEntry === item.id) {
          return;
        }
        
        // If editing and clicking another row, save edit first
        if (editingEntry && editingEntry !== item.id) {
          // Save edit for the previous editing row
          setEditingEntry(null); // triggers blur on input/select, which will save
        }
        
        // Handle different click behaviors
        if (!wasDraggingRef.current) {
          // Special handling for Ctrl+Click (don't deselect)
          if (e.ctrlKey && e.button === 0) {
            // For Ctrl+Click, we only want to select (never deselect)
            if (!selectedEntries.includes(item.id)) {
              // Force multi-select behavior to add to selection
              const modifiedEvent = {...e, isMultiSelectForced: true};
              handleEntrySelect(item.id, foodData.indexOf(item), modifiedEvent);
            }
            
            // Then handle context menu
            if (typeof onContextMenu === 'function') {
              setTimeout(() => {
                setContextMenuOpen(true);
                const syntheticEvent = {
                  ...e,
                  preventDefault: () => e.preventDefault(),
                  stopPropagation: () => e.stopPropagation(),
                  type: 'contextmenu',
                  currentTarget: e.currentTarget,
                  target: e.target,
                  clientX: e.clientX,
                  clientY: e.clientY,
                };
                onContextMenu(syntheticEvent, item.id);
              }, 0);
            }
          } else {
            // Normal click handling (without Ctrl)
            handleEntrySelect(item.id, foodData.indexOf(item), e);
          }
        }
        
        // Always reset drag flag after pointer up
        wasDraggingRef.current = false;
      }}
      onDoubleClick={e => {
        e.preventDefault();
        e.stopPropagation();
        if (editingEntry && editingEntry !== item.id) {
          setEditingEntry(null); // triggers blur/save
        }
        
        // Only select on double-click, don't start editing
        handleEntrySelect(item.id, foodData.indexOf(item), e);
      }}
      onContextMenu={e => {
        if (!isDragging) {
          if (editingEntry && editingEntry !== item.id) {
            setEditingEntry(null); // triggers blur/save
          }
          
          // Always select the right-clicked item
          handleEntrySelect(item.id, foodData.indexOf(item), e);
          
          setContextMenuOpen(true);
          onContextMenu?.(e, item.id);
        }
      }}
      onMouseDown={e => {
        // Prevent text selection on multiple clicks
        if (e.detail > 1) {
          e.preventDefault();
        }
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          // Prevent default space scrolling
          if (e.key === ' ') e.preventDefault();
          
          // Save any existing edits first
          if (editingEntry) setEditingEntry(null);
          
          // Select the item on keyboard activation
          handleEntrySelect(item.id, foodData.indexOf(item), e);
          
          // If enter/space and not currently editing, start editing
          if (editingEntry !== item.id) {
            startEditing(item, e);
          }
        }
      }}
      // Prevent drag listeners if context menu is open
      draggable={contextMenuOpen ? false : undefined}
      onBlur={() => setContextMenuOpen(false)}
      onClickCapture={(e) => {
        // Don't close context menu if clicking within the edit controls
        if (editingEntry === item.id && (
          e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLSelectElement ||
          e.target instanceof HTMLOptionElement
        )) {
          e.stopPropagation();
          return;
        }
        setContextMenuOpen(false);
      }}
    >
      {/* Drag handle area - only active when not editing */}
      {/* Drag handle area - only active when not editing */}
      <td
        className="py-2 pl-2 pr-2 min-w-[16rem] w-64"
        style={{
          cursor: editingEntry === item.id ? 'default' : isDragging ? 'move' : 'move'
        }}
        aria-label={capitalizeWords(item.description)}
        {...((!contextMenuOpen && editingEntry !== item.id) ? { ...listeners, ...attributes } : {})}
      >
        <div className="flex items-center space-x-2">
          {isSupplement(item.description) ? (
            <img src="/pill.svg" alt="pill" className="w-5 h-5 flex-shrink-0" aria-label="supplement pill" />
          ) : (
            <img src="/toast.svg" alt="toast" className="w-5 h-5 flex-shrink-0" aria-label="food" />
          )}
          <span style={{ marginLeft: '16px', fontWeight: 400 }}>{capitalizeWords(item.description)}</span>
        </div>
      </td>

      <td className="py-2 px-4 text-center" style={{ minWidth: 160 }}>
        {editingEntry === item.id ? (
          <div className="inline-flex items-center gap-6 justify-center w-full" onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} tabIndex={-1}>
            <input
              ref={inputRef}
              type="text"
              value={editAmount}
              onChange={e => {
                let val = e.target.value;
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
                  e.preventDefault();
                  selectRef.current?.focus();
                }
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
              }}
              onBlur={handleBlur}
              className={
                "w-16 p-1 pr-2 border rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
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
                  e.preventDefault();
                  inputRef.current?.focus();
                }
              }}
              onBlur={handleBlur}
              className="p-1 border rounded text-sm bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-16 border-gray-300"
              aria-label="Edit unit"
              onClick={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
              onPointerUp={e => e.stopPropagation()}
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
          <div
            className="inline-flex items-center gap-6 justify-center w-full"
            style={{ cursor: editingEntry === item.id ? 'default' : isDragging ? 'move' : 'move' }}
            {...((!contextMenuOpen && editingEntry !== item.id) ? { ...listeners, ...attributes } : {})}
          >
            <span
              className="hover:bg-gray-100 px-1 rounded cursor-pointer flex items-center transition-colors"
              tabIndex={0}
              role="button"
              aria-label="Edit amount"
              onClick={(e) => startEditing(item, e)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') startEditing(item, e);
              }}
            >
              <span className="text-right min-w-[3rem]" style={{fontWeight: 400}}>{formatNumber(parseFloat(item.amount))}</span>
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
            >
              <span className="inline-block w-12 text-left text-gray-600" style={{fontWeight: 400}}>{abbreviateUnit(item.unit)}</span>
            </span>
          </div>
        )}
      </td>

      <td className="py-2 px-8 text-right" style={{ minWidth: 140 }} role="cell">
        <div
          className="flex items-center justify-end space-x-2"
          style={{ cursor: editingEntry === item.id ? 'default' : isDragging ? 'move' : 'move' }}
          {...((!contextMenuOpen && editingEntry !== item.id) ? { ...listeners, ...attributes } : {})}
        >
          <span style={{fontWeight: 400}}>{formatNumber(item.calories)}</span>
          <span className="text-gray-600" style={{fontWeight: 400}}>kcal</span>
        </div>
      </td>
    </tr>
  );
}
// --- End EnhancedSortableTableRow (inlined, cleaned) ---
import { formatNumber } from './utils';

export default function EnhancedFoodTable({ 
  foodData, 
  filteredEntries, 
  selectedEntries, 
  handleEntrySelect: _handleEntrySelect, 
  removeFoodEntry,
  updateFoodEntry = () => {},
  onReorderEntries = () => {},
  onContextMenu,
  setSelectedEntries
}: FoodTableProps) {
  // =====================
  // State
  // =====================
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [editUnit, setEditUnit] = useState<string>("");
  const [currentEntries, setCurrentEntries] = useState<FoodEntry[]>(filteredEntries);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
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

  // Add a global effect to handle cursor during drag
  useEffect(() => {
    if (activeId) {
      // Use requestAnimationFrame to ensure DOM is ready
      const handleCursor = () => {
        document.body.style.setProperty('cursor', 'move', 'important');
        document.documentElement.style.setProperty('cursor', 'move', 'important');
        
        // Apply to all elements
        const allElements = document.querySelectorAll('*');
        allElements.forEach((el) => {
          (el as HTMLElement).style.setProperty('cursor', 'move', 'important');
        });
      };
      
      const rafId = requestAnimationFrame(handleCursor);
      const intervalId = setInterval(handleCursor, 16); // 60fps
      
      return () => {
        cancelAnimationFrame(rafId);
        clearInterval(intervalId);
        
        // Cleanup
        document.body.style.removeProperty('cursor');
        document.documentElement.style.removeProperty('cursor');
        const allElements = document.querySelectorAll('*');
        allElements.forEach((el) => {
          (el as HTMLElement).style.removeProperty('cursor');
        });
      };
    }
  }, [activeId]);

  // =====================
  // Effects
  // =====================
  // Keep currentEntries in sync with filteredEntries
  useEffect(() => {
    setCurrentEntries(filteredEntries);
  }, [filteredEntries]);


  // =====================
  // Handlers
  // =====================
  // Selection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleEntrySelect(id: string, index: number, event: any) {
    // First, always call the original handler if provided
    // This ensures the parent component's logic is executed
    if (_handleEntrySelect) {
      _handleEntrySelect(id, index, event);
    }
    
    // Then handle our internal selection state if setSelectedEntries is provided
    if (!setSelectedEntries) return;
    
    // Robustly detect modifier keys for multi-select, even if event is synthetic or missing them
    let isMulti = false;
    
    // First try to get modifier keys from the event
    if (event && typeof event === 'object') {
      // Check for our special flag for forced multi-select (used for Ctrl+Click)
      if (event.isMultiSelectForced) {
        isMulti = true;
      } else {
        isMulti = Boolean(event.shiftKey || event.ctrlKey || event.metaKey);
      }
    } 
    
    // Fallback to window.event if available
    if (!isMulti && typeof window !== 'undefined') {
      const winEvent = window.event as MouseEvent | KeyboardEvent | undefined;
      isMulti = winEvent ? Boolean(winEvent.shiftKey || winEvent.ctrlKey || winEvent.metaKey) : false;
    }
    
    // Debug: log event and selection state
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[handleEntrySelect]', { id, index, event, isMulti, selectedEntries });
    }
    
    if (isMulti) {
      // Toggle this entry in the selection for multi-select (Cmd/Ctrl/Shift + click)
      if (selectedEntries.includes(id)) {
        setSelectedEntries(selectedEntries.filter(eid => eid !== id));
      } else {
        setSelectedEntries([...selectedEntries, id]);
      }
    } else {
      // For single-select mode:
      // If the entry is already selected, unselect it
      // Otherwise, select just this entry
      if (selectedEntries.length === 1 && selectedEntries[0] === id) {
        setSelectedEntries([]);  // Unselect when clicking the only selected item
      } else {
        setSelectedEntries([id]); // Select only this entry
      }
    }
  }

  // Drag
  function handleDragStart(event: DragStartEvent) {
    const draggedEntryId = event.active.id as string;
    setActiveId(draggedEntryId);
    
    // Auto-select the entry being dragged if not already selected
    if (!selectedEntries.includes(draggedEntryId)) {
      // Create a synthetic event to pass to handleEntrySelect
      const syntheticEvent = {
        type: 'dragstart',
        preventDefault: () => {},
        stopPropagation: () => {},
      };
      
      // Get the index of the entry
      const index = currentEntries.findIndex(item => item.id === draggedEntryId);
      
      // Call handleEntrySelect to ensure proper parent update
      if (index !== -1) {
        handleEntrySelect(draggedEntryId, index, syntheticEvent);
      }
    }
    
    document.body.classList.add('dragging');
    document.documentElement.classList.add('dragging');
    // Force cursor style override with maximum specificity
    document.body.style.cursor = 'move';
    document.documentElement.style.cursor = 'move';
    
    // Create aggressive cursor override
    const styleElement = document.createElement('style');
    styleElement.id = 'drag-cursor-override';
    styleElement.innerHTML = `
      html, html *, body, body * {
        cursor: move !important;
      }
      html:hover, html:hover *, body:hover, body:hover * {
        cursor: move !important;
      }
      * {
        cursor: move !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Add event listener to force cursor on mouse movement
    const forceCursor = (e: MouseEvent) => {
      (e.target as HTMLElement)?.style?.setProperty('cursor', 'move', 'important');
      document.body.style.cursor = 'move';
      document.documentElement.style.cursor = 'move';
    };
    document.addEventListener('mousemove', forceCursor);
    document.addEventListener('dragover', forceCursor);
    
    // Store the cleanup function
    (window as any).__dragCleanup = () => {
      document.removeEventListener('mousemove', forceCursor);
      document.removeEventListener('dragover', forceCursor);
    };
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!active.id || !over?.id || active.id === over.id) {
      return;
    }

    const overData = over.data.current;
    const activeEntry = currentEntries.find(entry => entry.id === active.id);
    
    if (!activeEntry) return;

    // Check if dragging over a meal section heading
    if (overData?.type === 'meal-drop-zone') {
      const targetMealType = overData.mealType;
      
      // If the dragged entry is not already in the target meal type, move it to the top of that section
      if (activeEntry.mealType !== targetMealType) {
        const newEntries = [...currentEntries];
        const activeIndex = newEntries.findIndex(entry => entry.id === active.id);
        
        if (activeIndex !== -1) {
          // Remove the active entry from its current position
          const [movedEntry] = newEntries.splice(activeIndex, 1);
          
          // Update its meal type and find where to insert it (at the top of the target meal section)
          const updatedEntry = { ...movedEntry, mealType: targetMealType };
          
          // Find the first entry of the target meal type to insert before it
          // If no entries exist for that meal type, it will be inserted at the appropriate position
          let insertIndex = newEntries.length; // Default to end
          
          for (let i = 0; i < newEntries.length; i++) {
            const currentMealTypeIndex = MEAL_TYPES.indexOf(newEntries[i].mealType);
            const targetMealTypeIndex = MEAL_TYPES.indexOf(targetMealType);
            
            if (currentMealTypeIndex > targetMealTypeIndex) {
              insertIndex = i;
              break;
            } else if (currentMealTypeIndex === targetMealTypeIndex) {
              insertIndex = i;
              break;
            }
          }
          
          // Insert the entry at the beginning of the target meal section
          newEntries.splice(insertIndex, 0, updatedEntry);
          setCurrentEntries(newEntries);
        }
      }
    } else {
      // Regular entry-to-entry reordering
      const oldIndex = currentEntries.findIndex((item: FoodEntry) => item.id === active.id);
      const newIndex = currentEntries.findIndex((item: FoodEntry) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(currentEntries, oldIndex, newIndex);
        setCurrentEntries(newOrder);
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    document.body.classList.remove('dragging');
    document.documentElement.classList.remove('dragging');
    
    // Clean up cursor override
    document.body.style.cursor = '';
    document.documentElement.style.cursor = '';
    const styleElement = document.getElementById('drag-cursor-override');
    if (styleElement) {
      document.head.removeChild(styleElement);
    }
    
    // Call cleanup function for event listeners
    if ((window as any).__dragCleanup) {
      (window as any).__dragCleanup();
      delete (window as any).__dragCleanup;
    }

    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const overData = over.data.current;
    
    // Check if we're dragging a food entry
    const activeEntry = currentEntries.find(entry => entry.id === active.id);
    
    if (activeEntry) {
      // Dragging a food entry
      let newEntries = [...currentEntries];
      
      if (overData?.type === 'meal-section' || overData?.type === 'meal-drop-zone') {
        // Dropped on a meal section - the position was already set during dragOver
        // Just ensure the meal type is updated (it should already be correct from dragOver)
        const targetMealType = overData.mealType;
        const currentEntry = newEntries.find(entry => entry.id === active.id);
        if (currentEntry && currentEntry.mealType !== targetMealType) {
          newEntries = newEntries.map(entry => 
            entry.id === active.id 
              ? { ...entry, mealType: targetMealType }
              : entry
          );
        }
      } else {
        // Dropped on another food entry - reorder (this was already handled in dragOver)
        const overEntry = currentEntries.find(entry => entry.id === over.id);
        if (overEntry) {
          const activeEntryInNewOrder = newEntries.find(entry => entry.id === active.id);
          if (activeEntryInNewOrder) {
            // Update meal type to match the target entry's meal type
            newEntries = newEntries.map(entry => 
              entry.id === active.id 
                ? { ...entry, mealType: overEntry.mealType }
                : entry
            );
          }
        }
      }
      
      setCurrentEntries(newEntries);
      onReorderEntries(newEntries);
    }
    // Removed meal section reordering logic since headings are no longer draggable
  }

  // Misc
  function handleCtrlClick(
    e: React.MouseEvent,
    item: FoodEntry
  ) {
    if (e.ctrlKey && e.button === 0 && typeof onContextMenu === 'function') {
      // Synthesize a right-click event
      const syntheticEvent = {
        ...e,
        preventDefault: () => e.preventDefault(),
        stopPropagation: () => e.stopPropagation(),
        type: 'contextmenu',
        currentTarget: e.currentTarget,
        target: e.target,
        clientX: e.clientX,
        clientY: e.clientY,
        item,
      };
      onContextMenu(syntheticEvent, item.id);
    }
  }

  // Group entries by meal type
  const entriesByMealType = MEAL_TYPES.reduce((acc, mealType) => {
    acc[mealType] = currentEntries.filter(entry => entry.mealType === mealType);
    return acc;
  }, {} as Record<FoodEntry['mealType'], FoodEntry[]>);

  // Create unified sortable items array containing only food entries for consistent visual feedback
  const unifiedSortableItems = currentEntries.map(entry => entry.id);

  // =====================
  // Render
  // =====================
  return (
    <div 
      className={`w-full overflow-x-auto ${styles.foodTableContainer} ${activeId ? styles.dragging : ''}`}
      style={{ cursor: activeId ? 'move' : 'default' }}
    >
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext 
          items={unifiedSortableItems}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {MEAL_TYPES.map((mealType) => (
              <MealSection
                key={mealType}
                mealType={mealType}
                entries={entriesByMealType[mealType]}
                foodData={foodData}
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
                contextMenuOpen={contextMenuOpen}
                setContextMenuOpen={setContextMenuOpen}
                filteredEntries={entriesByMealType[mealType]}
              />
            ))}
          </div>
        </SortableContext>
        {/* No DragOverlay - visual feedback handled by .dragging-item class only */}
      </DndContext>
    </div>
  );
}
