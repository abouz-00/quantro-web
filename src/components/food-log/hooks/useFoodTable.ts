import { useState, useCallback } from 'react';

export interface UseFoodTableState {
  selectedEntries: string[];
  editingEntry: string | null;
  editAmount: string;
}

export interface UseFoodTableActions {
  handleEntrySelect: (id: string, index: number, event: React.MouseEvent) => void;
  setSelectedEntries: (entries: string[]) => void;
  setEditingEntry: (id: string | null) => void;
  setEditAmount: (amount: string) => void;
  clearSelection: () => void;
}

export function useFoodTable(): [UseFoodTableState, UseFoodTableActions] {
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");

  const handleEntrySelect = useCallback((
    id: string, 
    index: number, 
    event: React.MouseEvent
  ) => {
    if (event.shiftKey && selectedEntries.length > 0) {
      // Handle shift selection logic here
      // This is simplified - you'd implement range selection
      setSelectedEntries(prev => [...prev, id]);
    } else if (event.ctrlKey || event.metaKey) {
      // Toggle selection
      setSelectedEntries(prev => 
        prev.includes(id) 
          ? prev.filter(entryId => entryId !== id)
          : [...prev, id]
      );
    } else {
      // Single selection
      setSelectedEntries([id]);
    }
  }, [selectedEntries]);

  const clearSelection = useCallback(() => {
    setSelectedEntries([]);
  }, []);

  const state: UseFoodTableState = {
    selectedEntries,
    editingEntry,
    editAmount,
  };

  const actions: UseFoodTableActions = {
    handleEntrySelect,
    setSelectedEntries,
    setEditingEntry,
    setEditAmount,
    clearSelection,
  };

  return [state, actions];
}
