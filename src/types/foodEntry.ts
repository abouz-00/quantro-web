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
  orderIndex?: number;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  targetEntryId: string | null;
}
