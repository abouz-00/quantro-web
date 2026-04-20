/* eslint-disable */
import { useEffect, useState, useMemo, useCallback } from 'react';
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
  const sortableData = useMemo(() => ({ type: 'food-entry' as const }), []);
  const sortableTransition = useMemo(() => ({
    duration: 150,
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  }), []);
  const sortableConfig = useMemo(() => ({
    id,
    data: sortableData,
    disabled,
    transition: sortableTransition,
  }), [disabled, id, sortableData, sortableTransition]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable(sortableConfig);

  // Track drag state - immediate reset for better responsiveness
  // This effect synchronizes external drag state from dnd-kit with internal component state
  useEffect(() => {
    setWasDragging((previousWasDragging) =>
      previousWasDragging === isCurrentlyBeingDragged
        ? previousWasDragging
        : isCurrentlyBeingDragged
    );
  }, [isCurrentlyBeingDragged]);

  // Row moves inline via CSS transform on div elements (transforms work natively on divs)
  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isCurrentlyBeingDragged ? 50 : undefined,
  }), [isCurrentlyBeingDragged, transform, transition]);

  const dragHandleProps = useMemo(
    () => (disabled ? {} : { ...listeners, ...attributes }),
    [attributes, disabled, listeners]
  );

  const resetDragState = useCallback(() => {
    setWasDragging((previousWasDragging) => (previousWasDragging ? false : previousWasDragging));
  }, []);

  return {
    dragRef: setNodeRef,
    dragStyle: style,
    dragHandleProps,
    isDragging: isCurrentlyBeingDragged,
    wasDragging,
    resetDragState,
  };
}
