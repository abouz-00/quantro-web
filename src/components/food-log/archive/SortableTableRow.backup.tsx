"use client";

import React from "react";
import { FaPencilAlt, FaCheck } from "react-icons/fa";
import { useSortable } from '@dnd-kit/sortable';
import { SortableRowProps } from './types';
import { capitalizeWords, abbreviateUnit } from './utils';

export function SortableTableRow({
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
  dragOverId,
  dragDirection,
  activeId,
  setActiveId,
  setDragOverId,
  setDragDirection,
  formatNumber,
  onContextMenu,
  lastClickTime,
  setLastClickTime,
  clickedEntryId,
  setClickedEntryId
}: SortableRowProps) {
  const isSelected = selectedEntries.includes(item.id);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    disabled: false // Allow dragging on any entry
  });

  // Custom drag listeners that respect modifier keys and preserve click behavior
  const customListeners = {
    ...listeners,
    onPointerDown: (event: React.PointerEvent) => {
      // Don't start drag if modifier keys are held - let click handler manage selection
      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        return;
      }
      
      // Don't start drag on double-click events (browser native detection)
      if (event.detail === 2) {
        return;
      }
      
      // NO TIME-BASED INTERFERENCE - let the drag system's own distance/delay handle it
      // This allows clicks of ANY speed to work properly
      
      // Call the original pointer down handler
      if (listeners?.onPointerDown) {
        listeners.onPointerDown(event as any);
      }
    },
    
    onPointerUp: (event: React.PointerEvent) => {
      // Simplified cleanup
      if (!activeId && document.body.classList.contains('dragging')) {
        document.body.classList.remove('dragging');
        const containerElement = document.querySelector('.food-table-container .bg-white.rounded-lg');
        if (containerElement) {
          containerElement.classList.remove('drag-boundary-active');
        }
      }
      
      if (listeners?.onPointerUp) {
        listeners.onPointerUp(event as any);
      }
    }
  };

  // Simplified transform - instant snapping with no smooth animations
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(0px, ${transform.y}px, 0px)` : undefined,
    transition: 'none', // Remove all transitions for instant snapping
    zIndex: isDragging ? 1000 : 1,
    // Add cursor style based on state
    cursor: 'pointer', // Always show pointer cursor for clicking
    ...(isDragging && { cursor: 'move' }), // Show move cursor when dragging
  };

  // Enhanced visual feedback for discrete snapping
  const isDropTarget = dragOverId === item.id && activeId !== item.id;
  const isBeingDragged = activeId === item.id;

  // Solid box classes with clear visual states
  const getRowClasses = () => {
    const baseClasses = "food-table-row border-b border-gray-200 last:border-0 select-none relative";
    const selectedClasses = isSelected ? 'selected' : '';
    const draggingClasses = isDragging ? 'dragging-item' : '';
    const dropTargetClasses = isDropTarget 
      ? `drop-target-${dragDirection}` 
      : '';
    
    return `${baseClasses} ${selectedClasses} ${draggingClasses} ${dropTargetClasses}`.trim();
  };

  const startEditing = (entry: typeof item, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEntry(entry.id);
    setEditAmount(entry.amount);
  };

  const saveEdit = (entry: typeof item, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (editAmount === entry.amount) {
      setEditingEntry(null);
      return;
    }
    
    const originalAmount = parseFloat(entry.amount);
    const newAmount = parseFloat(editAmount);
    const ratio = newAmount / originalAmount;
    
    updateFoodEntry(entry.id, {
      amount: editAmount,
      calories: entry.calories * ratio,
      protein: entry.protein * ratio,
      carbs: entry.carbs * ratio,
      fat: entry.fat * ratio,
    });
    
    setEditingEntry(null);
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={getRowClasses()}
      onClick={(e) => {
        // Always handle selection immediately, regardless of drag state
        const now = Date.now();
        setLastClickTime(now);
        setClickedEntryId(item.id);
        handleEntrySelect(item.id, foodData.indexOf(item), e);
        
        // Cleanup any stuck states asynchronously (don't block the click)
        setTimeout(() => {
          if (document.body.classList.contains('dragging') && !activeId) {
            document.body.classList.remove('dragging');
            const containerElement = document.querySelector('.food-table-container .bg-white.rounded-lg');
            if (containerElement) {
              containerElement.classList.remove('drag-boundary-active');
            }
          }
        }, 0);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        
        // Always handle selection immediately
        handleEntrySelect(item.id, foodData.indexOf(item), e);
        
        // Cleanup asynchronously
        setTimeout(() => {
          document.body.classList.remove('dragging');
          const containerElement = document.querySelector('.food-table-container .bg-white.rounded-lg');
          if (containerElement) {
            containerElement.classList.remove('drag-boundary-active');
          }
          
          if (activeId) {
            setActiveId(null);
            setDragOverId(null);
            setDragDirection(null);
          }
        }, 0);
      }}
      onContextMenu={(e) => {
        // Prevent context menu during drag operations
        if (!isDragging && !activeId) {
          onContextMenu?.(e, item.id);
        }
      }}
      data-id={item.id}
      {...attributes}
      {...customListeners} // Use custom listeners that respect modifier keys
    >
      <td className="py-2 pl-2 pr-2">{capitalizeWords(item.description)}</td>
      <td className="py-2 px-2">
        {editingEntry === item.id ? (
          <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              value={editAmount}
              onChange={e => setEditAmount(e.target.value)}
              className="w-16 p-1 border border-gray-300 rounded text-right"
              autoFocus
              onClick={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
            />
            <span>{abbreviateUnit(item.unit)}</span>
            <button 
              onClick={(e) => saveEdit(item, e)}
              onPointerDown={e => e.stopPropagation()}
              className="text-green-500 hover:text-green-600 ml-1"
            >
              <FaCheck size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <span 
              className="hover:bg-gray-100 px-1 rounded cursor-pointer"
              onClick={(e) => startEditing(item, e)}
              onPointerDown={e => e.stopPropagation()}
            >
              {formatNumber(parseFloat(item.amount))} {abbreviateUnit(item.unit)}
            </span>
            <FaPencilAlt 
              size={12} 
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={(e) => startEditing(item, e)}
              onPointerDown={e => e.stopPropagation()}
            />
          </div>
        )}
      </td>
      <td className="py-2 px-2 text-right">{formatNumber(item.calories)} cal</td>
    </tr>
  );
}
