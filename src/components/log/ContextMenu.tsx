import React, { useRef, useMemo } from 'react';
import { ContextMenuState, FoodEntry } from '../../types/food';

interface ContextMenuProps {
  contextMenu: ContextMenuState;
  selectedEntries: string[];
  clipboardEntries: FoodEntry[];
  onEditEntry: () => void;
  onCopyEntries: () => void;
  onPasteEntries: () => void;
  onDeleteSelectedEntries: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  contextMenu,
  selectedEntries,
  clipboardEntries,
  onEditEntry,
  onCopyEntries,
  onPasteEntries,
  onDeleteSelectedEntries
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const position = useMemo(() => {
    if (!contextMenu.visible) return { left: 0, top: 0 };
    // Use fallback dimensions since ref isn't available during memo;
    // the menu is positioned before paint via the style prop.
    const menuWidth = 200;
    const menuHeight = 200;
    return {
      left: Math.min(contextMenu.x, (typeof window !== 'undefined' ? window.innerWidth : 1024) - menuWidth - 8),
      top: Math.min(contextMenu.y, (typeof window !== 'undefined' ? window.innerHeight : 768) - menuHeight - 8),
    };
  }, [contextMenu.visible, contextMenu.x, contextMenu.y]);

  if (!contextMenu.visible) return null;

  // Use selectedEntries for accessibility/data attributes without displaying count
  const hasSelection = selectedEntries.length > 0;

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-48"
      style={{
        left: position.left,
        top: position.top,
      }}
      onClick={(e) => e.stopPropagation()}
      data-has-selection={hasSelection}
    >
      <button
        onClick={onEditEntry}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center space-x-2 transition-colors duration-150"
      >
        <span>✏️</span>
        <span>View/Edit Food</span>
      </button>
      <button
        onClick={onCopyEntries}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center space-x-2 transition-colors duration-150"
      >
        <span>📋</span>
        <span>Copy Selected</span>
        <span className="text-xs text-gray-400 ml-auto">Ctrl+C</span>
      </button>
      <button
        onClick={onPasteEntries}
        disabled={clipboardEntries.length === 0}
        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors duration-150 ${
          clipboardEntries.length === 0 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span>📋</span>
        <span>Paste {clipboardEntries.length > 0 ? `(${clipboardEntries.length} items)` : ''}</span>
        {clipboardEntries.length > 0 && <span className="text-xs text-gray-400 ml-auto">Ctrl+V</span>}
      </button>
      <hr className="my-1 border-gray-200" />
      <button
        onClick={onDeleteSelectedEntries}
        className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center space-x-2 transition-colors duration-150"
      >
        <span>🗑️</span>
        <span>Delete Selected</span>
        <span className="text-xs text-red-400 ml-auto">Del</span>
      </button>
    </div>
  );
};
