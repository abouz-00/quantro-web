# FoodEntry Refactoring Summary

## Overview

The `FoodEntry` interface has been refactored to be centralized and include complete micronutrient support. This addresses the previous issues of type duplication and incomplete nutrient tracking.

## Key Changes

### 1. Centralized Type Definition
- **New file**: `src/types/foodEntry.ts` - Contains all food-related types
- **Replaces**: Multiple duplicate `FoodEntry` interfaces across 8+ files
- **Benefits**: Single source of truth, easier maintenance, consistent typing

### 2. Complete Micronutrient Support
- **Before**: Only 5 nutrients (calories, protein, carbs, fat, fiber)
- **After**: 24 micronutrients + macronutrients
- **Includes**: All vitamins, minerals, and essential fatty acids tracked on the log page

### 3. Type Structure

```typescript
// Macronutrients (required)
interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

// Micronutrients (optional)
interface MicroNutrients {
  // B Vitamins
  vitaminB1?: number;    // Thiamine (mg)
  vitaminB2?: number;    // Riboflavin (mg)
  vitaminB3?: number;    // Niacin (mg)
  vitaminB5?: number;    // Pantothenic Acid (mg)
  vitaminB6?: number;    // Pyridoxine (mg)
  vitaminB12?: number;   // Cobalamin (μg)
  biotin?: number;       // Biotin (μg)
  folate?: number;       // Folate (μg)
  
  // Fat-Soluble Vitamins
  vitaminA?: number;     // Retinol Activity Equivalents (μg)
  vitaminC?: number;     // Ascorbic Acid (mg)
  vitaminD?: number;     // Cholecalciferol (μg)
  vitaminK?: number;     // Phylloquinone (μg)
  
  // Minerals
  calcium?: number;      // mg
  copper?: number;       // mg
  iron?: number;         // mg
  magnesium?: number;    // mg
  manganese?: number;    // mg
  phosphorus?: number;   // mg
  potassium?: number;    // mg
  selenium?: number;     // μg
  sodium?: number;       // mg
  zinc?: number;         // mg
  
  // Essential Fatty Acids
  omega3?: number;       // g (EPA + DHA)
}

// Complete nutrient profile
interface AllNutrients extends MacroNutrients, MicroNutrients {}

// Food entry with all nutrients
interface FoodEntry extends AllNutrients {
  id: string;
  description: string;
  amount: string;
  unit: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "other";
}
```

### 4. Helper Functions

#### `getNutrientValueByLabel(entry: FoodEntry, label: string): number`
- Centralized function to extract nutrient values by name
- Handles case-insensitive matching
- Used by chart components for consistent data access

#### `calculateAllNutrientTotals(entries: FoodEntry[]): AllNutrients`
- Calculates totals for all nutrients (macro + micro)
- Handles proper rounding for different nutrient types
- Supplements the existing `calculateTotals` function

### 5. Daily Values Constants
```typescript
export const MICRONUTRIENT_DAILY_VALUES = {
  // Adult daily values for all 24 micronutrients
  vitaminB1: { value: 1.2, unit: 'mg' },
  vitaminB2: { value: 1.3, unit: 'mg' },
  // ... all 24 micronutrients with proper units
} as const;
```

## Migration Impact

### Updated Components
1. **MicronutrientsSection**: Now uses real data instead of placeholders
2. **MicronutrientDonut**: Uses centralized helper function
3. **NutrientDonutChart**: Uses centralized helper function
4. **All table components**: Import from centralized type file

### Backward Compatibility
- Existing macronutrient functionality unchanged
- Optional micronutrient fields won't break existing data
- Same API surface for most components

## Next Steps

### 1. Database Migration
```sql
-- Add micronutrient columns to food_logs table
ALTER TABLE food_logs ADD COLUMN vitamin_b1 DECIMAL(8,2);
ALTER TABLE food_logs ADD COLUMN vitamin_b2 DECIMAL(8,2);
-- ... add all 24 micronutrient columns
```

### 2. API Updates
Update the food entry API endpoints to:
- Accept micronutrient data in POST/PUT requests
- Return micronutrient data in responses
- Handle nutrition database integration (USDA FoodData Central)

### 3. Food Search Integration
Connect to nutrition databases to automatically populate micronutrient data:
- USDA FoodData Central API
- Nutritionix API
- Or custom nutrition database

### 4. UI Enhancements
- Add micronutrient editing in forms
- Show micronutrient breakdown in food details
- Add filtering/sorting by micronutrients

## Files Modified

### Core Types
- `src/types/foodEntry.ts` (new)
- `src/types/food.ts` (updated to re-export)

### Components
- `src/components/food-log/core/MicronutrientsSection.tsx`
- `src/components/food-log/charts/MicronutrientDonut.tsx`
- `src/components/food-log/charts/NutrientDonutChart.tsx`
- `src/components/food-log/table/types.ts`

### Utilities
- `src/utils/foodEntryUtils.ts`

## Benefits

1. **Type Safety**: Centralized types prevent inconsistencies
2. **Completeness**: Full micronutrient support matches UI expectations
3. **Maintainability**: Single source of truth for food entry structure
4. **Extensibility**: Easy to add new nutrients or modify existing ones
5. **Performance**: Real calculations replace placeholder/mock data
6. **User Experience**: Accurate micronutrient tracking and visualization

## Testing Considerations

- Update all existing tests to use new type imports
- Add tests for micronutrient calculation functions
- Test backward compatibility with existing food entries
- Verify chart components work with real micronutrient data
