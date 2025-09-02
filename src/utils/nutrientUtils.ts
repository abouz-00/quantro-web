import { FoodEntry } from '../types/foodEntry';

/**
 * Helper function to get nutrient value from FoodEntry by label
 */
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
