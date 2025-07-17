// Drag and drop configuration for the food table

import {
  CollisionDetection,
  closestCenter,
  rectIntersection,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { FoodEntry } from './types';

// Custom coordinate getter that constrains movement to vertical axis only
export const verticalOnlyCoordinateGetter = (event: KeyboardEvent, args: any) => {
  const coordinates = sortableKeyboardCoordinates(event, args);
  if (coordinates) {
    // Only allow vertical movement, lock horizontal position to 0
    return {
      x: 0,
      y: coordinates.y
    };
  }
  return undefined;
};

// Custom collision detection for discrete snapping behavior
export const createCustomCollisionDetection = (filteredEntries: FoodEntry[]): CollisionDetection => {
  return (args) => {
    // Use rectangle intersection first for better boundary detection
    const rectCollisions = rectIntersection(args);
    
    if (rectCollisions.length > 0) {
      // Filter to only include valid table entries within the table bounds
      const validCollisions = rectCollisions.filter(collision => {
        return filteredEntries.some((entry: FoodEntry) => entry.id === collision.id);
      });
      
      if (validCollisions.length > 0) {
        // Return the closest valid collision
        return [validCollisions[0]];
      }
    }
    
    // Fallback to closest center but still filter for valid entries
    const closestCenterCollisions = closestCenter(args);
    
    if (closestCenterCollisions.length > 0) {
      const validCollisions = closestCenterCollisions.filter(collision => {
        return filteredEntries.some((entry: FoodEntry) => entry.id === collision.id);
      });
      
      if (validCollisions.length > 0) {
        return [validCollisions[0]];
      }
    }
    
    // No valid collision found - return empty array to prevent invalid drops
    return [];
  };
};

// Modifiers for strict table boundary enforcement - keep dragged items visible
export const dragModifiers = [
  (args: any) => {
    const { transform, active } = args;
    
    if (!transform || !active || !active.id) {
      return transform;
    }
    
    // Get the dragged row and table container
    const draggedRow = document.querySelector(`[data-id="${active.id}"]`) as HTMLElement;
    const tableContainer = document.querySelector('.food-table-container .bg-white.rounded-lg');
    
    if (draggedRow && tableContainer) {
      const containerRect = tableContainer.getBoundingClientRect();
      const rowRect = draggedRow.getBoundingClientRect();
      
      // Calculate the current position of the dragged row
      const currentTop = rowRect.top + transform.y;
      const currentBottom = rowRect.bottom + transform.y;
      
      // Define strict boundaries - dragged item must stay completely within container
      const containerTop = containerRect.top;
      const containerBottom = containerRect.bottom;
      
      // Calculate constraints to keep the entire row visible
      let constrainedY = transform.y;
      
      // If dragging would move the top of the row above the container top
      if (currentTop < containerTop) {
        constrainedY = containerTop - rowRect.top;
      }
      
      // If dragging would move the bottom of the row below the container bottom
      if (currentBottom > containerBottom) {
        constrainedY = containerBottom - rowRect.bottom;
      }
      
      // Lock horizontal movement and apply strict vertical boundaries
      return {
        ...transform,
        x: 0, // Lock horizontal movement completely
        y: constrainedY, // Keep row completely visible within table
      };
    }
    
    // Fallback: lock horizontal movement and prevent any vertical movement
    return {
      ...transform,
      x: 0,
      y: 0,
    };
  }
];
