# Food Log Table Components - Refactored & Modular

## 📁 Structure Overview

This directory contains the refactored table components for the food log feature. The original 1,039-line monolithic file has been split into smaller, more maintainable components.

### 🗂️ Files

```
table/
├── EnhancedFoodTable.tsx      # Main table component (now ~140 lines)
├── components/                # Individual UI components
│   ├── EditableCell.tsx       # Inline editing component (~200 lines)
│   ├── FoodTableRow.tsx       # Individual row component (~290 lines)
│   ├── MealSection.tsx        # Meal section component (~80 lines)
│   └── index.ts               # Component exports
├── hooks/                     # Custom hooks for logic separation
│   ├── useFoodTableDragDrop.ts # Drag & drop logic (~240 lines)
│   ├── useFoodTableState.ts   # State management (~40 lines)
│   └── index.ts               # Hook exports
├── types.ts                   # TypeScript type definitions
├── utils.ts                   # Utility functions for table operations
├── index.ts                   # Clean exports
└── README.md                  # This documentation
```

## 🎯 Refactored Components

### `EnhancedFoodTable` (Main Container)
- **Orchestrates** all table functionality
- **Manages** drag & drop context and sensors
- **Groups entries** by meal type
- **Handles** selection logic
- **Renders** meal sections in proper order

### `MealSection`
- **Meal type headings** (Breakfast, Lunch, Dinner, etc.)
- **Drop zone targets** for cross-meal dragging
- **Contains** sortable context for entries within each meal
- **Conditionally renders** only when entries exist

### `FoodTableRow`
- **Individual row** component with full interaction support
- **Drag handles** throughout the row
- **Selection state** management
- **Context menu** support
- **Keyboard navigation** support

### `EditableCell`
- **Inline editing** for amount and unit values
- **Input validation** and error handling
- **Unit conversion** calculations
- **Focus management** between input and select
- **Blur handling** to save edits

## 🎣 Custom Hooks

### `useFoodTableDragDrop`
- **Encapsulates** all drag & drop logic
- **Manages** drag state and visual feedback
- **Handles** meal type changes during drag
- **Provides** drag event handlers
- **Controls** cursor styling during drag

### `useFoodTableState`
- **Manages** editing state
- **Handles** context menu state
- **Provides** helper functions for state transitions
- **Simplifies** component prop passing

## 🧰 Utilities

### `types.ts`
- `FoodEntry` interface
- `SortableRowProps` interface  
- `FoodTableProps` interface
- Component-specific prop interfaces

### `utils.ts`
- `formatNumber()` - Number formatting
- `capitalizeWords()` - Text capitalization
- `abbreviateUnit()` - Unit abbreviations
- `convertUnits()` - Unit conversions
- `normalizeUnit()` - Unit normalization
- `AVAILABLE_UNITS` - List of supported units

## ✅ Benefits of Refactoring

### 🔧 Maintainability
- **Single responsibility** - Each component has one clear purpose
- **Easier debugging** - Issues can be isolated to specific components
- **Cleaner code** - Smaller files are easier to read and understand

### 🧪 Testability
- **Unit testing** - Individual components can be tested in isolation
- **Mocking** - Hooks can be mocked for testing UI components
- **Coverage** - Better test coverage through targeted testing

### 🚀 Performance
- **Selective re-renders** - Components only re-render when their specific props change
- **Hook optimization** - Logic is memoized within custom hooks
- **Bundle splitting** - Components can be lazy-loaded if needed

### 👥 Team Collaboration
- **Parallel development** - Multiple developers can work on different components
- **Code ownership** - Clear boundaries for code responsibility
- **Reduced conflicts** - Smaller files mean fewer merge conflicts

### 🔄 Reusability
- **Component library** - Components can be reused in other parts of the app
- **Hook reuse** - Custom hooks can be used in other table implementations
- **Composition** - Components can be composed in different ways

## 🎛️ Usage

```tsx
import { EnhancedFoodTable } from './components/food-log/table';

// All the same props as before - the API hasn't changed
<EnhancedFoodTable
  foodData={foodData}
  filteredEntries={filteredEntries}
  selectedEntries={selectedEntries}
  handleEntrySelect={handleEntrySelect}
  updateFoodEntry={updateFoodEntry}
  onReorderEntries={onReorderEntries}
  onContextMenu={onContextMenu}
  setSelectedEntries={setSelectedEntries}
/>
```

## 🔄 Migration Notes

- **No breaking changes** - The public API remains the same
- **Internal refactoring** - All changes are internal to the table components
- **Same functionality** - All existing features continue to work as before
- **Better structure** - Code is now organized for long-term maintainability

## 📦 Exports

All components are exported through `index.ts`:

```typescript
// Main table (enhanced version)
import { FoodTable, EnhancedFoodTable } from './table';

// Row component
import { EnhancedSortableTableRow } from './table';

// Types and utilities
import { FoodEntry, SortableRowProps, formatNumber } from './table';
```

## 🎨 Features

- ✅ **Solid Black Boundaries** - Visual drag constraints
- ✅ **Bulletproof Containment** - Cannot drag outside table
- ✅ **Inline Editing** - Click to edit amount/unit
- ✅ **Smart Unit Conversion** - Automatic nutritional scaling
- ✅ **Supplement Detection** - Visual pill icons for supplements (now uses `pill.svg`)
- ✅ **Selection Management** - Multi-select with visual feedback
- ✅ **Context Menu Support** - Right-click actions
- ✅ **Keyboard Navigation** - Full accessibility
- ✅ **Persistent Meal Categories** - Entries maintain their meal type assignment across page refreshes and date changes
- ✅ **Cross-Meal Dragging** - Drag entries between different meal categories with automatic persistence

## 🏗️ Architecture

The components follow a clean, modular architecture:

1. **Single Responsibility** - Each component has one clear purpose
2. **Type Safety** - Full TypeScript coverage
3. **Reusable Utilities** - Shared functions in utils.ts
4. **Clean Exports** - Simple import structure
5. **Performance Optimized** - Efficient drag operations

## 🔄 Migration

All previous table variants have been consolidated:
- ~~`FoodTable.tsx`~~ → `EnhancedFoodTable.tsx`
- ~~`FoodTable.simple.tsx`~~ → `EnhancedFoodTable.tsx`  
- ~~`SortableTableRow.tsx`~~ → `EnhancedSortableTableRow.tsx`
- ~~`SortableTableRowClean.tsx`~~ → `EnhancedSortableTableRow.tsx`

## 🚀 Usage

```tsx
import { EnhancedFoodTable } from '../food-log';

<EnhancedFoodTable
  foodData={foodData}
  filteredEntries={filteredEntries}
  selectedEntries={selectedEntries}
  handleEntrySelect={handleEntrySelect}
  updateFoodEntry={updateFoodEntry}
  onReorderEntries={onReorderEntries}
  onContextMenu={onContextMenu}
/>
```
