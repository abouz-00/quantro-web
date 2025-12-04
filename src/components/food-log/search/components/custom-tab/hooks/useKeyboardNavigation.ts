import { useState, useEffect, useRef } from 'react';
import { CustomFood } from '../types';

export const useKeyboardNavigation = (
  items: CustomFood[],
  onSelect: (item: CustomFood) => void,
  isDisabled: boolean = false
) => {
  const [highlightedIdx, setHighlightedIdx] = useState<number>(-1);
  const [prevItems, setPrevItems] = useState(items);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  // Reset highlighted index when items change (with guard)
  if (prevItems !== items) {
    setPrevItems(items);
    setHighlightedIdx(-1);
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIdx >= 0 && rowRefs.current[highlightedIdx]) {
      rowRefs.current[highlightedIdx]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIdx]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    if (items.length === 0 || isDisabled) return;
    
    if (e.key === "ArrowDown") {
      setHighlightedIdx((prev) => (prev + 1) % items.length);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIdx((prev) => (prev - 1 + items.length) % items.length);
      e.preventDefault();
    } else if (e.key === "Enter" && highlightedIdx >= 0 && !isDisabled) {
      onSelect(items[highlightedIdx]);
      e.preventDefault();
    }
  };

  const setRowRef = (idx: number) => (el: HTMLTableRowElement | null) => {
    rowRefs.current[idx] = el;
  };

  return {
    highlightedIdx,
    setHighlightedIdx,
    handleKeyDown,
    setRowRef,
  };
};
