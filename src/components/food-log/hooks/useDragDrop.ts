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
    
    // Add visual feedback with strict containment
    requestAnimationFrame(() => {
      document.body.classList.add('dragging');
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
      const windowWithCleanup = window as Window & { __dragCleanup?: () => void };
      windowWithCleanup.__dragCleanup = () => {
        document.removeEventListener('mousemove', forceCursor);
        document.removeEventListener('dragover', forceCursor);
      };
      
      const container = document.querySelector('.food-table-container');
      if (container) {
        container.classList.add('drag-boundary-active');
        // Ensure strict overflow containment
        (container as HTMLElement).style.overflow = 'hidden';
        (container as HTMLElement).style.position = 'relative';
        (container as HTMLElement).style.isolation = 'isolate';
      }
    });
  }, [filteredEntries.length, selectedEntries, setSelectedEntries]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!active?.id || !over?.id || active.id === over.id) {
      setDragOverId(null);
      setDragDirection(null);
      return;
    }
    
    // STRICT: Only allow operations within valid entries and strict boundaries
    const isValidTarget = filteredEntries.some((entry: FoodEntry) => entry.id === over.id);
    
    if (isValidTarget) {
      // Additional boundary checking - ensure we're still within the container
      const container = document.querySelector('.food-table-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const activatorEvent = event.activatorEvent as PointerEvent | null;
        
        if (activatorEvent) {
          const isWithinBounds = 
            activatorEvent.clientX >= containerRect.left &&
            activatorEvent.clientX <= containerRect.right &&
            activatorEvent.clientY >= containerRect.top &&
            activatorEvent.clientY <= containerRect.bottom;
          
          if (!isWithinBounds) {
            setDragOverId(null);
            setDragDirection(null);
            return;
          }
        }
      }
      
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
    
    // Cleanup visual feedback with strict containment cleanup
    document.body.classList.remove('dragging');
    // Clean up cursor override
    document.body.style.cursor = '';
    document.documentElement.style.cursor = '';
    const styleElement = document.getElementById('drag-cursor-override');
    if (styleElement) {
      document.head.removeChild(styleElement);
    }
    
    // Call cleanup function for event listeners
    const windowWithCleanup = window as Window & { __dragCleanup?: () => void };
    if (windowWithCleanup.__dragCleanup) {
      windowWithCleanup.__dragCleanup();
      delete windowWithCleanup.__dragCleanup;
    }
    
    const container = document.querySelector('.food-table-container');
    if (container) {
      container.classList.remove('drag-boundary-active');
      // Reset strict containment styles
      (container as HTMLElement).style.overflow = '';
      (container as HTMLElement).style.position = '';
      (container as HTMLElement).style.isolation = '';
    }

    if (active?.id && over?.id && active.id !== over.id) {
      // Final boundary check before allowing reorder
      const containerElement = document.querySelector('.food-table-container');
      if (containerElement) {
        const containerRect = containerElement.getBoundingClientRect();
        const activatorEvent = event.activatorEvent as PointerEvent | null;
        
        if (activatorEvent) {
          const isWithinBounds = 
            activatorEvent.clientX >= containerRect.left &&
            activatorEvent.clientX <= containerRect.right &&
            activatorEvent.clientY >= containerRect.top &&
            activatorEvent.clientY <= containerRect.bottom;
          
          if (!isWithinBounds) {
            // Drop is outside bounds, cancel the operation
            return;
          }
        }
      }

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
    
    // Enhanced cleanup with strict containment reset
    document.body.classList.remove('dragging');
    // Clean up cursor override
    document.body.style.cursor = '';
    document.documentElement.style.cursor = '';
    const styleElement = document.getElementById('drag-cursor-override');
    if (styleElement) {
      document.head.removeChild(styleElement);
    }
    
    // Call cleanup function for event listeners
    const windowWithCleanup = window as Window & { __dragCleanup?: () => void };
    if (windowWithCleanup.__dragCleanup) {
      windowWithCleanup.__dragCleanup();
      delete windowWithCleanup.__dragCleanup;
    }
    
    const container = document.querySelector('.food-table-container');
    if (container) {
      container.classList.remove('drag-boundary-active');
      // Reset all strict containment styles
      (container as HTMLElement).style.overflow = '';
      (container as HTMLElement).style.position = '';
      (container as HTMLElement).style.isolation = '';
    }
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
