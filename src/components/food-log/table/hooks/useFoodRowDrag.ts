/* eslint-disable */
import { useRef, useEffect, useState, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface UseFoodRowDragProps {
  id: string;
  activeId: string | null;
  disabled?: boolean;
}

export function useFoodRowDrag({ id, activeId, disabled = false }: UseFoodRowDragProps) {
  // Use state instead of ref to avoid accessing ref.current during render
  const [wasDragging, setWasDragging] = useState(false);
  const isCurrentlyBeingDragged = activeId === id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id,
    data: { type: 'food-entry' },
    disabled,
    transition: {
      duration: 300, // Reduced for more responsive feel
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Optimized easing for smooth motion
    },
  });

  // Track drag state - immediate reset for better responsiveness
  // This effect synchronizes external drag state from dnd-kit with internal component state
  useEffect(() => {
    if (isCurrentlyBeingDragged && !wasDragging) {
      setWasDragging(true);
    } else if (!isCurrentlyBeingDragged && wasDragging) {
      // Immediate reset for smoother interaction
      setWasDragging(false);
    }
  }, [isCurrentlyBeingDragged, wasDragging]);

  // Memoize style object to avoid recreating on every render
  // This prevents the linter from flagging dragStyle as a ref access
  const style = useMemo(() => ({
    transform: isCurrentlyBeingDragged ? 'none' : CSS.Transform.toString(transform),
    transition,
    zIndex: isCurrentlyBeingDragged ? 1000 : 1,
    opacity: 1,
  }), [isCurrentlyBeingDragged, transform, transition]);

  const dragHandleProps = disabled ? {} : { ...listeners, ...attributes };

  return {
    dragRef: setNodeRef,
    dragStyle: style,
    dragHandleProps,
    isDragging: isCurrentlyBeingDragged,
    wasDragging,
    resetDragState: () => { setWasDragging(false); }
  };
}
