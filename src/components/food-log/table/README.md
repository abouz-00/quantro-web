# Food Log Table Components - Clean & Modular

## 📁 Structure Overview

This directory contains the consolidated table components for the food log feature.

### 🗂️ Files

```
table/
├── EnhancedFoodTable.tsx      # Main table component with solid black boundaries
├── EnhancedSortableTableRow.tsx # Enhanced row component with all features
├── types.ts                   # TypeScript type definitions
├── utils.ts                   # Utility functions for table operations
├── index.ts                   # Clean exports
└── README.md                  # This documentation
```

## 🎯 Components

### `EnhancedFoodTable`
- **Main table component** with bulletproof drag boundaries
- **Solid black boundaries** that prevent items from escaping
- **Advanced collision detection** and drag modifiers
- **Professional styling** with strict containment
- **Auto-scroll disabled** to prevent boundary escaping

### `EnhancedSortableTableRow`
- **Enhanced row component** with all table features
- **Inline editing** capabilities for amount and unit
- **Supplement detection** with visual indicators
- **Drag constraints** with absolute boundary enforcement
- **Selection state management**

## 🧰 Utilities

### `types.ts`
- `FoodEntry` interface
- `SortableRowProps` interface  
- `FoodTableProps` interface

### `utils.ts`
- `formatNumber()` - Number formatting
- `capitalizeWords()` - Text capitalization
- `abbreviateUnit()` - Unit abbreviations
- `convertUnits()` - Unit conversions
- `normalizeUnit()` - Unit normalization
- `AVAILABLE_UNITS` - List of supported units

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
- ✅ **Supplement Detection** - Visual pill icons for supplements
- ✅ **Selection Management** - Multi-select with visual feedback
- ✅ **Context Menu Support** - Right-click actions
- ✅ **Keyboard Navigation** - Full accessibility

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
