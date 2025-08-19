// Centralized FoodEntry type definition with complete micronutrient support

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface MicroNutrients {
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

export interface AllNutrients extends MacroNutrients, MicroNutrients {}

export interface FoodEntry extends AllNutrients {
  id: string;
  description: string;
  amount: string;
  unit: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "other";
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  targetEntryId: string | null;
}

// Daily Value constants for micronutrients
export const MICRONUTRIENT_DAILY_VALUES = {
  // B Vitamins
  vitaminB1: { value: 1.2, unit: 'mg' },
  vitaminB2: { value: 1.3, unit: 'mg' },
  vitaminB3: { value: 16, unit: 'mg' },
  vitaminB5: { value: 5, unit: 'mg' },
  vitaminB6: { value: 1.7, unit: 'mg' },
  vitaminB12: { value: 2.4, unit: 'μg' },
  biotin: { value: 30, unit: 'μg' },
  folate: { value: 400, unit: 'μg' },
  
  // Fat-Soluble Vitamins
  vitaminA: { value: 900, unit: 'μg' },
  vitaminC: { value: 90, unit: 'mg' },
  vitaminD: { value: 20, unit: 'μg' },
  vitaminK: { value: 120, unit: 'μg' },
  
  // Minerals
  calcium: { value: 1000, unit: 'mg' },
  copper: { value: 0.9, unit: 'mg' },
  iron: { value: 8, unit: 'mg' },
  magnesium: { value: 400, unit: 'mg' },
  manganese: { value: 2.3, unit: 'mg' },
  phosphorus: { value: 700, unit: 'mg' },
  potassium: { value: 3500, unit: 'mg' },
  selenium: { value: 55, unit: 'μg' },
  sodium: { value: 2300, unit: 'mg' },
  zinc: { value: 11, unit: 'mg' },
  
  // Essential Fatty Acids
  omega3: { value: 1.6, unit: 'g' },
  
  // Macronutrients (for completeness)
  fiber: { value: 25, unit: 'g' },
} as const;

// Type for accessing micronutrient keys
export type MicronutrientKey = keyof typeof MICRONUTRIENT_DAILY_VALUES;

// Helper function to get nutrient value from FoodEntry by label
export function getNutrientValueByLabel(entry: FoodEntry, label: string): number {
  const normalizedLabel = label.toLowerCase().replace(/\s+/g, '').replace('-', '');
  
  switch (normalizedLabel) {
    // Macronutrients
    case 'calories': return entry.calories || 0;
    case 'protein': return entry.protein || 0;
    case 'carbs': case 'carbohydrates': return entry.carbs || 0;
    case 'fat': return entry.fat || 0;
    case 'fiber': return entry.fiber || 0;
    
    // Micronutrients
    case 'vitaminb1': return entry.vitaminB1 || 0;
    case 'vitaminb2': return entry.vitaminB2 || 0;
    case 'vitaminb3': return entry.vitaminB3 || 0;
    case 'vitaminb5': return entry.vitaminB5 || 0;
    case 'vitaminb6': return entry.vitaminB6 || 0;
    case 'vitaminb12': return entry.vitaminB12 || 0;
    case 'biotin': return entry.biotin || 0;
    case 'folate': return entry.folate || 0;
    case 'vitamina': return entry.vitaminA || 0;
    case 'vitaminc': return entry.vitaminC || 0;
    case 'vitamind': return entry.vitaminD || 0;
    case 'vitamink': return entry.vitaminK || 0;
    case 'calcium': return entry.calcium || 0;
    case 'copper': return entry.copper || 0;
    case 'iron': return entry.iron || 0;
    case 'magnesium': return entry.magnesium || 0;
    case 'manganese': return entry.manganese || 0;
    case 'phosphorus': return entry.phosphorus || 0;
    case 'potassium': return entry.potassium || 0;
    case 'selenium': return entry.selenium || 0;
    case 'sodium': return entry.sodium || 0;
    case 'zinc': return entry.zinc || 0;
    case 'omega3': case 'omega-3': return entry.omega3 || 0;
    
    default: return 0;
  }
}
