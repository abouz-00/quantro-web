// Re-export types from the centralized foodEntry types file
export type { 
  MacroNutrients as Nutrients, 
  MicroNutrients,
  AllNutrients,
  FoodEntry, 
  ContextMenuState,
  MicronutrientKey
} from './foodEntry';

export { MICRONUTRIENT_DAILY_VALUES, getNutrientValueByLabel } from './foodEntry';
