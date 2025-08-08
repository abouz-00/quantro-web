import { useEffect } from 'react';

interface KeyboardShortcuts {
  onAddFood: () => void;
  onNextDay: () => void;
  onPreviousDay: () => void;
  onGoToToday: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Add food - Ctrl/Cmd + A
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        shortcuts.onAddFood();
      }
      
      // Next day - Ctrl/Cmd + Right Arrow
      if (e.key === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        shortcuts.onNextDay();
      }
      
      // Previous day - Ctrl/Cmd + Left Arrow
      if (e.key === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        shortcuts.onPreviousDay();
      }
      
      // Go to today - Ctrl/Cmd + T
      if (e.key === 't' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        shortcuts.onGoToToday();
      }

      // Copy - Ctrl/Cmd + C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && shortcuts.onCopy) {
        e.preventDefault();
        shortcuts.onCopy();
      }

      // Paste - Ctrl/Cmd + V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && shortcuts.onPaste) {
        e.preventDefault();
        shortcuts.onPaste();
      }

      // Delete - Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && shortcuts.onDelete) {
        e.preventDefault();
        shortcuts.onDelete();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
