import { useCallback } from 'react';
import { FoodEntry } from '../types';
import { normalizeUnit } from '../utils';

interface UseFoodRowInteractionsProps {
  item: FoodEntry;
  foodData: FoodEntry[];
  selectedEntries: string[];
  editingEntry: string | null;
  handleEntrySelect: (
    id: string,
    index: number,
    event?: React.MouseEvent | React.KeyboardEvent | { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } | null
  ) => void;
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
  const itemIndex = foodData.findIndex((entry) => entry.id === item.id);

  const getRowSelectionTarget = useCallback((
    event?: React.MouseEvent | React.KeyboardEvent
  ) => {
    const clickedId =
      event && 'currentTarget' in event
        ? (event.currentTarget as HTMLElement | null)?.dataset?.id
        : undefined;

    const resolvedId = clickedId || item.id;
    const resolvedIndex = foodData.findIndex((entry) => entry.id === resolvedId);

    return {
      id: resolvedId,
      index: resolvedIndex >= 0 ? resolvedIndex : itemIndex,
    };
  }, [foodData, item.id, itemIndex]);

  // Start editing mode
  const startEditing = useCallback((entry: FoodEntry, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    
    // Ensure item is selected
    const index = foodData.findIndex((candidate) => candidate.id === entry.id);
    handleEntrySelect(entry.id, index >= 0 ? index : itemIndex, e);
    
    setEditingEntry(entry.id);
    setEditAmount(entry.amount);
    setEditUnit(normalizeUnit(entry.unit));
  }, [foodData, handleEntrySelect, itemIndex, setEditingEntry, setEditAmount, setEditUnit]);

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
      const target = getRowSelectionTarget(e);

      if (e.ctrlKey || e.metaKey) {
        // Ctrl+Click: only add to selection, never remove
        if (!selectedEntries.includes(target.id)) {
          handleEntrySelect(target.id, target.index, e);
        }
        
        // Handle context menu for Ctrl+Click
        if (onContextMenu) {
          onContextMenu(e, target.id);
        }
      } else {
        // Normal click - handle selection immediately
        handleEntrySelect(target.id, target.index, e);
      }
    }
    
    // Reset drag state immediately after handling
    resetDragState();
  }, [editingEntry, getRowSelectionTarget, handleEntrySelect, isEditing, onContextMenu, resetDragState, selectedEntries, setEditingEntry, wasDragging]);

  // Handle double click
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (editingEntry && editingEntry !== item.id) {
      setEditingEntry(null);
    }
    
    const target = getRowSelectionTarget(e);

    // Select on double-click
    handleEntrySelect(target.id, target.index, e);
  }, [editingEntry, getRowSelectionTarget, handleEntrySelect, setEditingEntry]);

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (editingEntry && editingEntry !== item.id) {
      setEditingEntry(null);
    }
    
    const target = getRowSelectionTarget(e);

    // Always select the right-clicked item
    handleEntrySelect(target.id, target.index, e);
    
    onContextMenu?.(e, target.id);
  }, [editingEntry, getRowSelectionTarget, handleEntrySelect, onContextMenu, setEditingEntry]);

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
