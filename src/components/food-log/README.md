# Food Log Components - Modular Structure

This directory contains all components related to food logging functionality, organized in a modular structure for better maintainability and reusability.

## 📁 Directory Structure

```text
src/components/food-log/
├── core/                     # Core functionality components
│   ├── EnergySummary.tsx     # Energy and macro summary component
│   ├── MicronutrientsSection.tsx  # Micronutrients display component
│   └── index.ts              # Core exports
├── charts/                   # Chart and visualization components
│   ├── MacroChart.tsx        # Macro distribution chart
│   ├── ProgressBar.tsx       # Progress bar component
│   └── index.ts              # Chart exports
├── search/                   # Search and modal components
│   ├── FoodSearchModal.tsx   # Food search modal
│   └── index.ts              # Search exports
├── table/                    # Table-related components and utilities
│   ├── SortableTableRow.tsx  # Individual table row component
│   ├── FoodLogTable.tsx # Enhanced table with hooks
│   ├── dragConfig.ts         # Drag and drop configuration
│   ├── styles.ts             # Table-specific styles
│   ├── types.ts              # Original table types
│   ├── enhancedTypes.ts      # Enhanced types with better error handling
│   ├── utils.ts              # Table utility functions
│   └── index.ts              # Table exports
├── hooks/                    # Custom hooks for food log functionality
│   ├── useFoodTable.ts       # Food table state management hook
│   ├── useDragDrop.ts        # Drag and drop functionality hook
│   └── index.ts              # Hook exports
├── FoodTableModular.tsx      # Main modular food table (with error fixes)
├── SimplifiedFoodTable.tsx   # Simplified version using hooks
├── FoodTable.tsx             # Legacy table (maintained for compatibility)
└── index.ts                  # Main exports
```

## 🚀 Usage

### Import from the main module

```tsx
import { 
  EnergySummary, 
  MicronutrientsSection,
  MacroChart,
  ProgressBar,
  FoodSearchModal,
  FoodTableModular,
  SimplifiedFoodTable
} from '@/components/food-log';
```

### Import specific categories

```tsx
// Core components
import { EnergySummary, MicronutrientsSection } from '@/components/food-log/core';

// Charts
import { MacroChart, ProgressBar } from '@/components/food-log/charts';

// Search
import { FoodSearchModal } from '@/components/food-log/search';

// Tables
import { FoodTableModular, FoodLogTable } from '@/components/food-log/table';

// Hooks
import { useFoodTable, useDragDrop } from '@/components/food-log/hooks';
```

## 🛠️ Components

### Core Components

- **EnergySummary**: Displays energy and macro summaries
- **MicronutrientsSection**: Displays micronutrient information

### Chart Components

- **MacroChart**: Visualizes macro distribution
- **ProgressBar**: Shows progress towards targets

### Search Components

- **FoodSearchModal**: Modal for searching and adding food items

### Table Components

- **FoodTableModular**: Main food table with drag-and-drop (error-fixed version)
- **SimplifiedFoodTable**: Simplified version using custom hooks
- **FoodLogTable**: Advanced table with better state management

### Custom Hooks

- **useFoodTable**: Manages food table state (selection, editing)
- **useDragDrop**: Handles drag and drop functionality with proper error handling

## 🔧 Error Fixes Applied

### Fixed "null is not an object (evaluating 'active.id')" Error

Added comprehensive null checks in drag handlers:

```tsx
// Before (error-prone):
const draggedEntryId = event.active.id as string;

// After (safe):
if (!event?.active?.id) {
  return;
}
const draggedEntryId = event.active.id as string;
```

### Enhanced Error Handling

- Added null checks for all drag event handlers
- Implemented proper state cleanup
- Added fallback UI for empty states
- Improved type safety with enhanced types

## 🎯 Migration Guide

### From Old Structure

```tsx
// Old imports
import FoodSearchModal from "../food-log/FoodSearchModal";
import FoodTable from "../food-log/FoodTable";
import EnergySummary from "../food-log/EnergySummary";

// New imports
import { FoodSearchModal } from "../food-log/search";
import { FoodTableModular } from "../food-log";
import { EnergySummary } from "../food-log/core";
```

### Component Updates

```tsx
// Replace FoodTable with FoodTableModular for bug fixes
<FoodTableModular
  foodData={foodData}
  filteredEntries={filteredEntries}
  // ... other props
/>

// Or use the simplified version with hooks
<SimplifiedFoodTable
  foodData={foodData}
  filteredEntries={filteredEntries}
  // ... other props
/>
```

## 📝 Types

All types are available through the main index or specific modules:

```tsx
import type { 
  FoodEntry, 
  FoodTableProps, 
  DragState, 
  EditState 
} from '@/components/food-log';
```

## 🎨 Styling

Table styles are managed through:

- `table/styles.ts` - Core table styling
- CSS classes applied automatically
- Drag state visual feedback

## 🐛 Debugging

The modular structure includes enhanced error handling and debugging capabilities:

- Proper null checks prevent runtime errors
- State cleanup prevents memory leaks
- Visual feedback for drag operations
- Fallback UI for edge cases
