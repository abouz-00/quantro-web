import { useState, useCallback, useEffect, useRef } from 'react';
import { ContextMenuState } from '../types/food';

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    targetEntryId: null
  });
  
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActionTimeRef = useRef<number>(0);

  const handleContextMenu = useCallback((e: React.MouseEvent, entryId: string) => {
    e.preventDefault();
    
    const now = Date.now();
    // Prevent rapid successive context menu actions within 100ms
    if (now - lastActionTimeRef.current < 100) {
      return;
    }
    lastActionTimeRef.current = now;
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      targetEntryId: entryId
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    const now = Date.now();
    // Prevent rapid closing within 50ms of opening
    if (now - lastActionTimeRef.current < 50) {
      return;
    }
    lastActionTimeRef.current = now;
    
    setContextMenu({ visible: false, x: 0, y: 0, targetEntryId: null });
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu.visible) {
        // Don't close if this is a Ctrl+click - let the Ctrl+click handler manage it
        if (e.ctrlKey && e.button === 0) {
          return;
        }
        
        // Add a small delay to allow Ctrl+click handlers to process first
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
        }
        
        clickTimeoutRef.current = setTimeout(() => {
          closeContextMenu();
        }, 10);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [contextMenu.visible, closeContextMenu]);

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu
  };
};
