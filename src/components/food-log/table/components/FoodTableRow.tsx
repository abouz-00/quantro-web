/* eslint-disable */
import React, { useEffect, memo } from 'react';
import Image from 'next/image';
import { FoodEntry } from '../types';
import { capitalizeWords } from '../utils';
import { EditableCell } from './EditableCell';
import { useFoodRowDrag } from '../hooks/useFoodRowDrag';
import { useFoodRowInteractions } from '../hooks/useFoodRowInteractions';
import { useContextMenu } from '../hooks/useContextMenu';
import { isSupplement } from '../utils/supplementDetection';
import styles from '../FoodLogTable.module.css';

interface FoodTableRowProps {
  item: FoodEntry;
  foodData: FoodEntry[];
  selectedEntries: string[];
  handleEntrySelect: (
    id: string,
    index: number,
    event?: React.MouseEvent | React.KeyboardEvent | { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } | null
  ) => void;
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
  isLastRow?: boolean;
}

export const FoodTableRow = memo(({
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
  isLastRow = false
}: FoodTableRowProps) => {
  // Initialize hooks
  const contextMenu = useContextMenu();
  
  const drag = useFoodRowDrag({
    id: item.id,
    activeId,
    disabled: contextMenu.isOpen || editingEntry === item.id
  });

  const interactions = useFoodRowInteractions({
    item,
    foodData,
    selectedEntries,
    editingEntry,
    handleEntrySelect,
    setEditingEntry,
    setEditAmount,
    setEditUnit,
    onContextMenu: onContextMenu ? (e, id) => {
      contextMenu.openContextMenu();
      onContextMenu(e, id);
    } : undefined,
    wasDragging: drag.wasDragging,
    resetDragState: drag.resetDragState
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      interactions.cleanup();
    };
  }, [interactions.cleanup]);

  // Generate row classes
  const getRowClasses = () => {
    const classes = [styles.foodTableRow];
    
    if (drag.isDragging) {
      classes.push(styles.draggingItem);
    } else if (interactions.isSelected) {
      classes.push(styles.selected);
    }
    
    if (isLastRow) {
      classes.push(styles.lastRow);
    }
    
    return classes.join(' ');
  };

  return (
    <div
      ref={drag.dragRef}
      style={drag.dragStyle}
      className={getRowClasses()}
      data-id={item.id}
      role="row"
      aria-selected={interactions.isSelected}
      onClick={interactions.handleClick}
      onDoubleClick={interactions.handleDoubleClick}
      onContextMenu={interactions.handleContextMenu}
      onKeyDown={interactions.handleKeyDown}
      onMouseDown={e => {
        if (e.detail > 1) {
          e.preventDefault();
        }
      }}
      onBlur={contextMenu.closeContextMenu}
      onClickCapture={(e) => {
        if (interactions.isEditing && (
          e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLSelectElement ||
          e.target instanceof HTMLOptionElement
        )) {
          e.stopPropagation();
          return;
        }
        contextMenu.closeContextMenu();
      }}
      {...drag.dragHandleProps}
    >
      {/* Food Description Cell */}
      <div
        className={styles.cellDescription}
        aria-label={capitalizeWords(item.description)}
        role="cell"
      >
        <div className="flex items-center space-x-2">
          {isSupplement(item.description) ? (
            <Image 
              src="/pill.svg" 
              alt="pill" 
              width={20} 
              height={20} 
              className="flex-shrink-0" 
              aria-label="supplement pill" 
            />
          ) : (
            <Image 
              src="/toast.svg" 
              alt="toast" 
              width={20} 
              height={20} 
              className="flex-shrink-0" 
              aria-label="food" 
            />
          )}
          <span style={{ marginLeft: '16px', fontWeight: 400 }}>
            {capitalizeWords(item.description)}
          </span>
        </div>
      </div>

      {/* Amount/Unit Cell */}
      <div className={styles.cellAmount} role="cell">
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
          onStartEditing={interactions.startEditing}
        />
      </div>

      {/* Calories Cell */}
      <div
        className={styles.cellCalories}
        role="cell"
      >
        <span style={{ fontWeight: 400 }}>{formatNumber(item.calories)}</span>
        <span className="text-gray-600 ml-1" style={{ fontWeight: 400 }}>kcal</span>
      </div>
    </div>
  );
});

FoodTableRow.displayName = 'FoodTableRow';
