/* eslint-disable */
import type { CSSProperties } from 'react';
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
  const sortableConfig = useMemo(() => ({
    id,
    data: sortableData,
    disabled,
    transition: null,
  }), [disabled, id, sortableData]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
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

  const style = useMemo<CSSProperties>(() => {
    return {
      transform: CSS.Transform.toString(null),
      transition: undefined,
      zIndex: isCurrentlyBeingDragged ? 50 : undefined,
      visibility: isCurrentlyBeingDragged ? 'hidden' : undefined,
      pointerEvents: isCurrentlyBeingDragged ? 'none' : undefined,
    };
  }, [isCurrentlyBeingDragged]);

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
