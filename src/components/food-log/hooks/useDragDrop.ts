import { useState, useCallback } from 'react';
import { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { FoodEntry } from '../table/types';

export interface UseDragDropState {
  activeId: string | null;
  dragOverId: string | null;
  dragDirection: 'up' | 'down' | null;
}

export interface UseDragDropActions {
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  resetDragState: () => void;
}

export function useDragDrop(
  filteredEntries: FoodEntry[],
  selectedEntries: string[],
  setSelectedEntries: (entries: string[]) => void,
  onReorderEntries: (newOrder: FoodEntry[]) => void
): [UseDragDropState, UseDragDropActions] {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragDirection, setDragDirection] = useState<'up' | 'down' | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (!event?.active?.id || filteredEntries.length <= 1) {
      return;
    }
    
    const draggedEntryId = event.active.id as string;
    
    if (!selectedEntries.includes(draggedEntryId)) {
      setSelectedEntries([draggedEntryId]);
    }
    
    setActiveId(draggedEntryId);
    setDragOverId(null);
    setDragDirection(null);
    
    // Add visual feedback
    requestAnimationFrame(() => {
      document.body.classList.add('dragging');
      const container = document.querySelector('.food-table-container .bg-white.rounded-lg');
      container?.classList.add('drag-boundary-active');
    });
  }, [filteredEntries.length, selectedEntries, setSelectedEntries]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!active?.id || !over?.id || active.id === over.id) {
      setDragOverId(null);
      setDragDirection(null);
      return;
    }
    
    const isValidTarget = filteredEntries.some((entry: FoodEntry) => entry.id === over.id);
    
    if (isValidTarget) {
      const activeIndex = filteredEntries.findIndex((entry: FoodEntry) => entry.id === active.id);
      const overIndex = filteredEntries.findIndex((entry: FoodEntry) => entry.id === over.id);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        setDragOverId(over.id as string);
        setDragDirection(activeIndex < overIndex ? 'down' : 'up');
      }
    } else {
      setDragOverId(null);
      setDragDirection(null);
    }
  }, [filteredEntries]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset state immediately
    setActiveId(null);
    setDragOverId(null);
    setDragDirection(null);
    
    // Cleanup visual feedback
    document.body.classList.remove('dragging');
    const container = document.querySelector('.food-table-container .bg-white.rounded-lg');
    container?.classList.remove('drag-boundary-active');

    if (active?.id && over?.id && active.id !== over.id) {
      const isValidDropTarget = filteredEntries.some((entry: FoodEntry) => entry.id === over.id);
      
      if (isValidDropTarget) {
        const oldIndex = filteredEntries.findIndex((item: FoodEntry) => item.id === active.id);
        const newIndex = filteredEntries.findIndex((item: FoodEntry) => item.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newOrder = arrayMove(filteredEntries, oldIndex, newIndex);
          onReorderEntries(newOrder);
        }
      }
    }
  }, [filteredEntries, onReorderEntries]);

  const resetDragState = useCallback(() => {
    setActiveId(null);
    setDragOverId(null);
    setDragDirection(null);
    
    document.body.classList.remove('dragging');
    const container = document.querySelector('.food-table-container .bg-white.rounded-lg');
    container?.classList.remove('drag-boundary-active');
  }, []);

  const state: UseDragDropState = {
    activeId,
    dragOverId,
    dragDirection,
  };

  const actions: UseDragDropActions = {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    resetDragState,
  };

  return [state, actions];
}
