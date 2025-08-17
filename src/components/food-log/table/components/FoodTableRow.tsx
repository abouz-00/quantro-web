import React, { useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FoodEntry } from '../types';
import { capitalizeWords, normalizeUnit } from '../utils';
import { EditableCell } from './EditableCell';
import styles from '../EnhancedFoodTable.module.css';

interface FoodTableRowProps {
  item: FoodEntry;
  foodData: FoodEntry[];
  selectedEntries: string[];
  handleEntrySelect: (id: string, index: number, event: React.MouseEvent | React.KeyboardEvent) => void;
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

export function FoodTableRow({
  item,
  foodData,
  selectedEntries,
  handleEntrySelect,
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
}: FoodTableRowProps) {
  // Track if a drag occurred to distinguish from click
  const wasDraggingRef = useRef(false);
  const contextMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: item.id,
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (contextMenuTimeoutRef.current) {
        clearTimeout(contextMenuTimeoutRef.current);
      }
    };
  }, []);

  const style = {
    transform: isCurrentlyBeingDragged ? 'none' : CSS.Transform.toString(transform),
    transition,
    zIndex: 1,
    opacity: 1,
  };

  const getRowClasses = () => {
    const classes = [styles.foodTableRow];
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

  const dragHandleProps = (!contextMenuOpen && editingEntry !== item.id) ? { ...listeners, ...attributes } : {};
  const isDragging = activeId === item.id;

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
              const modifiedEvent = {...e, isMultiSelectForced: true} as React.MouseEvent & { isMultiSelectForced: boolean };
              handleEntrySelect(item.id, foodData.indexOf(item), modifiedEvent);
            }
            
            // Then handle context menu with debounce
            if (typeof onContextMenu === 'function') {
              // Clear any existing timeout to prevent rapid opening/closing
              if (contextMenuTimeoutRef.current) {
                clearTimeout(contextMenuTimeoutRef.current);
              }
              
              // If context menu is already open for this item, don't flicker
              if (contextMenuOpen) {
                return;
              }
              
              contextMenuTimeoutRef.current = setTimeout(() => {
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
      <td
        className="py-2 pl-2 pr-2 min-w-[16rem] w-64"
        style={{
          cursor: editingEntry === item.id ? 'default' : isDragging ? 'move' : 'move'
        }}
        aria-label={capitalizeWords(item.description)}
        {...dragHandleProps}
      >
        <div className="flex items-center space-x-2">
          {isSupplement(item.description) ? (
            <Image src="/pill.svg" alt="pill" width={20} height={20} className="flex-shrink-0" aria-label="supplement pill" />
          ) : (
            <Image src="/toast.svg" alt="toast" width={20} height={20} className="flex-shrink-0" aria-label="food" />
          )}
          <span style={{ marginLeft: '16px', fontWeight: 400 }}>{capitalizeWords(item.description)}</span>
        </div>
      </td>

      <td className="py-2 px-4 text-center" style={{ minWidth: 160 }}>
        <EditableCell
          item={item}
          editingEntry={editingEntry}
          editAmount={editAmount}
          setEditAmount={setEditAmount}
          editUnit={editUnit}
          setEditUnit={setEditUnit}
          updateFoodEntry={updateFoodEntry}
          setEditingEntry={setEditingEntry}
          formatNumber={formatNumber}
          onStartEditing={startEditing}
        />
      </td>

      <td className="py-2 px-8 text-right" style={{ minWidth: 140 }} role="cell">
        <div
          className="flex items-center justify-end space-x-2"
          style={{ cursor: editingEntry === item.id ? 'default' : isDragging ? 'move' : 'move' }}
          {...dragHandleProps}
        >
          <span style={{fontWeight: 400}}>{formatNumber(item.calories)}</span>
          <span className="text-gray-600" style={{fontWeight: 400}}>kcal</span>
        </div>
      </td>
    </tr>
  );
}
