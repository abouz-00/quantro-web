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

// import { Pill } from "lucide-react"; // Replaced by pill.svg
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { capitalizeWords, abbreviateUnit, AVAILABLE_UNITS, convertUnits, normalizeUnit } from './utils';
import styles from './EnhancedFoodTable.module.css';

// --- Begin EnhancedSortableTableRow (inlined, cleaned) ---
interface EnhancedSortableTableRowProps {
  item: FoodEntry;
  foodData: FoodEntry[];
  filteredEntries: FoodEntry[];
  selectedEntries: string[];
  handleEntrySelect: (id: string, index: number, event: React.MouseEvent | any) => void;
  removeFoodEntry: (id: string) => void;
  updateFoodEntry: (id: string, updated: Partial<FoodEntry>) => void;
  editingEntry: string | null;
  setEditingEntry: (id: string | null) => void;
  editAmount: string;
  setEditAmount: (amount: string) => void;
  editUnit: string;
  setEditUnit: (unit: string) => void;
  formatNumber: (n: number) => string;
  onContextMenu?: (e: React.MouseEvent | any, id: string) => void;
  activeId: string | null;
  contextMenuOpen: boolean;
  setContextMenuOpen: (open: boolean) => void;
}

function EnhancedSortableTableRow({
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
  const shouldDisableDrag = (e?: PointerEvent | MouseEvent | KeyboardEvent | any) => {
    // Only disable if editing or context menu is open
    if (editingEntry === item.id || contextMenuOpen) return true;
    // Also check global flag for fallback
    if (typeof window !== 'undefined' && (window as any)._disableDragForRow === item.id) {
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

  // Listen for drag events to set/reset drag state
  useEffect(() => {
    if (isDragging) {
      wasDraggingRef.current = true;
    } else {
      // Reset after drag ends
      wasDraggingRef.current = false;
    }
  }, [isDragging]);

  const style = {
    transform: isDragging ? 'none' : CSS.Transform.toString(transform),
    transition,
    zIndex: 1,
    opacity: 1,
  };

  const getRowClasses = () => {
    let classes = [styles.foodTableRow];
    if (isDragging) {
      classes.push(styles.draggingItem);
    } else if (isSelected) {
      classes.push(styles.selected);
    }
    return classes.join(' ');
  };

  const startEditing = (entry: FoodEntry, e: React.MouseEvent | React.KeyboardEvent | any) => {
    if (e) e.stopPropagation();
    if (!isSelected) {
      let mouseEvent = (e && 'button' in e) ? e : {
        stopPropagation: () => {},
        preventDefault: () => {},
        type: 'click',
        button: 0,
        ctrlKey: false,
        shiftKey: false,
        metaKey: false,
        ...e
      };
      handleEntrySelect(entry.id, foodData.indexOf(entry), mouseEvent);
    }
    setEditingEntry(entry.id);
    setEditAmount(entry.amount);
    setEditUnit(normalizeUnit(entry.unit));
  };

  const [editError, setEditError] = useState<string | null>(null);

  const saveEdit = (entry: FoodEntry, e: React.MouseEvent | React.KeyboardEvent | any) => {
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
        // If editing and clicking another row, save edit first
        if (editingEntry && editingEntry !== item.id) {
          // Save edit for the previous editing row
          setEditingEntry(null); // triggers blur on input/select, which will save
        }
        // Only select/deselect if not a drag
        if (!wasDraggingRef.current) {
          handleEntrySelect(item.id, foodData.indexOf(item), e);
        }
        // Always reset drag flag after pointer up
        wasDraggingRef.current = false;
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 && e.ctrlKey && e.button === 0 && typeof onContextMenu === 'function') {
          if (editingEntry !== item.id && !isSelected) {
            handleEntrySelect(item.id, foodData.indexOf(item), e);
          }
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
      }}
      onDoubleClick={e => {
        e.stopPropagation();
        if (editingEntry && editingEntry !== item.id) {
          setEditingEntry(null); // triggers blur/save
        }
        if (editingEntry !== item.id) {
          handleEntrySelect(item.id, foodData.indexOf(item), e);
        }
      }}
      onContextMenu={e => {
        if (!isDragging) {
          if (editingEntry && editingEntry !== item.id) {
            setEditingEntry(null); // triggers blur/save
          }
          if (editingEntry !== item.id && !isSelected) {
            handleEntrySelect(item.id, foodData.indexOf(item), e);
          }
          setContextMenuOpen(true);
          onContextMenu?.(e, item.id);
        }
      }}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && editingEntry !== item.id) {
          if (editingEntry) setEditingEntry(null); // triggers blur/save
          startEditing(item, e);
        }
      }}
      // Prevent drag listeners if context menu is open
      draggable={contextMenuOpen ? false : undefined}
      onBlur={() => setContextMenuOpen(false)}
      onClickCapture={() => setContextMenuOpen(false)}
    >
      {/* Drag handle area - only active when not editing */}
      {/* Drag handle area - only active when not editing */}
      <td
        className="py-2 pl-2 pr-2 min-w-[16rem] w-64"
        style={{
          cursor: editingEntry === item.id ? 'default' : isDragging ? 'grabbing' : 'grab'
        }}
        aria-label={capitalizeWords(item.description)}
        {...((!contextMenuOpen && editingEntry !== item.id) ? { ...listeners, ...attributes } : {})}
      >
        <div className="flex items-center space-x-2">
          {isSupplement(item.description) ? (
            <img src="/pill.svg" alt="pill" className="w-6 h-6 flex-shrink-0" aria-label="supplement pill" />
          ) : (
            <img src="/toast.svg" alt="toast" className="w-6 h-6 flex-shrink-0" aria-label="food" />
          )}
          <span style={{ marginLeft: '32px', fontWeight: 400 }}>{capitalizeWords(item.description)}</span>
        </div>
      </td>

      <td className="py-2 px-4 text-center" style={{ minWidth: 160 }}>
        {editingEntry === item.id ? (
          <div className="inline-flex items-center gap-6 justify-center w-full" onClick={e => e.stopPropagation()} tabIndex={-1}>
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
            style={{ cursor: editingEntry === item.id ? 'default' : isDragging ? 'grabbing' : 'grab' }}
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
          style={{ cursor: editingEntry === item.id ? 'default' : isDragging ? 'grabbing' : 'grab' }}
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
  function handleEntrySelect(id: string, index: number, event: React.MouseEvent) {
    if (!setSelectedEntries) return;
    // Robustly detect modifier keys for multi-select, even if event is synthetic or missing them
    let isMulti = false;
    if (event && (typeof event.shiftKey === 'boolean' || typeof event.ctrlKey === 'boolean' || typeof event.metaKey === 'boolean')) {
      isMulti = event.shiftKey || event.ctrlKey || event.metaKey;
    } else if (typeof window !== 'undefined') {
      // Fallback: check global key state (best effort)
      const winEvent = window.event as MouseEvent | undefined;
      isMulti = winEvent ? (winEvent.shiftKey || winEvent.ctrlKey || winEvent.metaKey) : false;
    }
    // Debug: log event and selection state
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[handleEntrySelect]', { id, index, event, isMulti, selectedEntries });
    }
    if (isMulti) {
      // Toggle this entry in the selection
      if (selectedEntries.includes(id)) {
        setSelectedEntries(selectedEntries.filter(eid => eid !== id));
      } else {
        setSelectedEntries([...selectedEntries, id]);
      }
    } else {
      // Always select the clicked entry (single-select mode)
      setSelectedEntries([id]);
    }
    // Optionally call the original handler if needed
    if (_handleEntrySelect) _handleEntrySelect(id, index, event);
  }

  // Drag
  function handleDragStart(event: DragStartEvent) {
    const draggedEntryId = event.active.id as string;
    setActiveId(draggedEntryId);
    // Auto-select the entry being dragged if not already selected
    if (!selectedEntries.includes(draggedEntryId)) {
      setSelectedEntries?.([draggedEntryId]);
    }
    document.body.classList.add('dragging');
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
    setActiveId(null);
    document.body.classList.remove('dragging');
    // Apply the final order to the parent component
    onReorderEntries(currentEntries);
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

  // =====================
  // Render
  // =====================
  return (
    <div 
      className={`w-full overflow-x-auto ${styles.foodTableContainer} ${activeId ? styles.dragging : ''}`}
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
                    contextMenuOpen={contextMenuOpen}
                    setContextMenuOpen={setContextMenuOpen}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>
        {/* No DragOverlay - visual feedback handled by .dragging-item class only */}
      </DndContext>
    </div>
  );
}
