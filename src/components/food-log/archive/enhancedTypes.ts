// Enhanced table types with better error handling
export interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface FoodEntry extends Nutrients {
  id: string;
  description: string;
  amount: string;
  unit: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "other";
}

export interface FoodTableProps {
  foodData: FoodEntry[];
  filteredEntries: FoodEntry[];
  selectedEntries: string[];
  handleEntrySelect: (id: string, index: number, event: React.MouseEvent) => void;
  removeFoodEntry: (id: string) => void;
  updateFoodEntry?: (id: string, updates: Partial<FoodEntry>) => void;
  onReorderEntries?: (newOrder: FoodEntry[]) => void;
  onContextMenu?: (e: React.MouseEvent, entryId: string) => void;
  setSelectedEntries?: (entries: string[]) => void;
}

export interface TableRowProps {
  item: FoodEntry;
  isSelected: boolean;
  onSelect: (id: string, index: number, event: React.MouseEvent) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FoodEntry>) => void;
  onContextMenu?: (e: React.MouseEvent, entryId: string) => void;
  formatNumber: (num: number) => string;
}

export interface DragState {
  activeId: string | null;
  dragOverId: string | null;
  dragDirection: 'up' | 'down' | null;
}

export interface EditState {
  editingEntry: string | null;
  editAmount: string;
}
