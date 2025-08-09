import React from 'react';
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
  if (!contextMenu.visible) return null;

  return (
    <div
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-48"
      style={{
        left: Math.min(contextMenu.x, window.innerWidth - 200),
        top: Math.min(contextMenu.y, window.innerHeight - 200),
      }}
      onClick={(e) => e.stopPropagation()}
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
        <span>Copy {selectedEntries.length > 0 ? `Selected (${selectedEntries.length})` : 'Item'}</span>
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
        <span>Delete {selectedEntries.length > 0 ? `Selected (${selectedEntries.length})` : 'Item'}</span>
        <span className="text-xs text-red-400 ml-auto">Del</span>
      </button>
    </div>
  );
};
