// Shared types for food table components
import type { FoodEntry, MacroNutrients as Nutrients } from '../../../types/foodEntry';

// Re-export for backward compatibility
export type { FoodEntry, Nutrients };

export interface FoodTableProps {
  foodData: FoodEntry[];
  filteredEntries: FoodEntry[];
  selectedEntries: string[];
  handleEntrySelect: (
    id: string,
    index: number,
    event?: React.MouseEvent | React.KeyboardEvent | { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } | null
  ) => void;
  removeFoodEntry: (id: string) => void;
  updateFoodEntry?: (id: string, updates: Partial<FoodEntry>) => void;
  onReorderEntries?: (newOrder: FoodEntry[]) => void;
  onContextMenu?: (e: React.MouseEvent, entryId: string) => void;
  setSelectedEntries?: (entries: string[]) => void;
}

export interface SortableRowProps {
  item: FoodEntry;
  foodData: FoodEntry[];
  filteredEntries: FoodEntry[];
  selectedEntries: string[];
  handleEntrySelect: (
    id: string,
    index: number,
    event?: React.MouseEvent | React.KeyboardEvent | { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } | null
  ) => void;
  removeFoodEntry: (id: string) => void;
  updateFoodEntry: (id: string, updates: Partial<FoodEntry>) => void;
  editingEntry: string | null;
  setEditingEntry: (id: string | null) => void;
  editAmount: string;
  setEditAmount: (amount: string) => void;
  editUnit: string;
  setEditUnit: (unit: string) => void;
  formatNumber: (num: number) => string;
  onContextMenu?: (e: React.MouseEvent, entryId: string) => void;
  activeId?: string | null; // Add activeId to detect when any item is being dragged
}
