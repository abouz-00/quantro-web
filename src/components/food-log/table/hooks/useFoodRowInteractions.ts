import { useCallback } from 'react';
import { FoodEntry } from '../types';
import { normalizeUnit } from '../utils';

interface UseFoodRowInteractionsProps {
  item: FoodEntry;
  foodData: FoodEntry[];
  selectedEntries: string[];
  editingEntry: string | null;
  handleEntrySelect: (id: string, index: number, event: React.MouseEvent | React.KeyboardEvent) => void;
  setEditingEntry: (id: string | null) => void;
  setEditAmount: (amount: string) => void;
  setEditUnit: (unit: string) => void;
  onContextMenu?: (e: React.MouseEvent, id: string) => void;
  wasDragging: boolean;
  resetDragState: () => void;
}

export function useFoodRowInteractions({
  item,
  foodData,
  selectedEntries,
  editingEntry,
  handleEntrySelect,
  setEditingEntry,
  setEditAmount,
  setEditUnit,
  onContextMenu,
  wasDragging,
  resetDragState
}: UseFoodRowInteractionsProps) {
  
  const isSelected = selectedEntries.includes(item.id);
  const isEditing = editingEntry === item.id;
  const itemIndex = foodData.indexOf(item);

  // Start editing mode
  const startEditing = useCallback((entry: FoodEntry, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    
    // Create synthetic event for selection if needed
    const syntheticEvent = {
      type: 'click',
      button: 0,
      ctrlKey: false,
      shiftKey: false,
      metaKey: false,
      stopPropagation: () => {},
      preventDefault: () => {}
    } as React.MouseEvent;
    
    // Ensure item is selected
    handleEntrySelect(entry.id, foodData.indexOf(entry), (e && 'button' in e) ? e as React.MouseEvent : syntheticEvent);
    
    setEditingEntry(entry.id);
    setEditAmount(entry.amount);
    setEditUnit(normalizeUnit(entry.unit));
  }, [foodData, handleEntrySelect, setEditingEntry, setEditAmount, setEditUnit]);

  // Handle row click with improved drag detection
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Skip if currently editing this row
    if (isEditing) return;
    
    // Save any other editing entry
    if (editingEntry && editingEntry !== item.id) {
      setEditingEntry(null);
    }
    
    // Only handle click if not dragging - check immediately
    if (!wasDragging) {
      if (e.ctrlKey || e.metaKey) {
        // Ctrl+Click: only add to selection, never remove
        if (!isSelected) {
          const modifiedEvent = { ...e, isMultiSelectForced: true } as React.MouseEvent & { isMultiSelectForced: boolean };
          handleEntrySelect(item.id, itemIndex, modifiedEvent);
        }
        
        // Handle context menu for Ctrl+Click
        if (onContextMenu) {
          // Use requestAnimationFrame for smoother performance
          requestAnimationFrame(() => {
            const syntheticEvent = { ...e, type: 'contextmenu' } as React.MouseEvent;
            onContextMenu(syntheticEvent, item.id);
          });
        }
      } else {
        // Normal click - handle selection immediately
        handleEntrySelect(item.id, itemIndex, e);
      }
    }
    
    // Reset drag state immediately after handling
    resetDragState();
  }, [item.id, itemIndex, isEditing, isSelected, editingEntry, wasDragging, handleEntrySelect, setEditingEntry, onContextMenu, resetDragState]);

  // Handle double click
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (editingEntry && editingEntry !== item.id) {
      setEditingEntry(null);
    }
    
    // Select on double-click
    handleEntrySelect(item.id, itemIndex, e);
  }, [item.id, itemIndex, editingEntry, handleEntrySelect, setEditingEntry]);

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (editingEntry && editingEntry !== item.id) {
      setEditingEntry(null);
    }
    
    // Always select the right-clicked item
    handleEntrySelect(item.id, itemIndex, e);
    
    onContextMenu?.(e, item.id);
  }, [item.id, itemIndex, editingEntry, handleEntrySelect, setEditingEntry, onContextMenu]);

  // Handle keyboard interaction
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.key === ' ') e.preventDefault();
      
      // Save any existing edits
      if (editingEntry) setEditingEntry(null);
      
      // Select the item
      handleEntrySelect(item.id, itemIndex, e);
      
      // Start editing if not already editing
      if (!isEditing) {
        startEditing(item, e);
      }
    }
  }, [item, itemIndex, editingEntry, isEditing, handleEntrySelect, setEditingEntry, startEditing]);

  // Cleanup function (simplified)
  const cleanup = useCallback(() => {
    // Cleanup any remaining refs if needed
  }, []);

  return {
    isSelected,
    isEditing,
    startEditing,
    handleClick,
    handleDoubleClick,
    handleContextMenu,
    handleKeyDown,
    cleanup
  };
}
