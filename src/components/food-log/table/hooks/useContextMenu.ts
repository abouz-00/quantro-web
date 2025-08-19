import { useState, useCallback, useEffect } from 'react';

export function useContextMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const openContextMenu = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeContextMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close context menu when clicking outside or on escape
  useEffect(() => {
    const handleClickOutside = () => closeContextMenu();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeContextMenu();
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, closeContextMenu]);

  return {
    isOpen,
    openContextMenu,
    closeContextMenu
  };
}
