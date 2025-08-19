export const UNIT_CONVERSIONS = {
  Ounces: 28.3495,
  Cup: 236.588,
  Tablespoon: 14.7868,
  Teaspoon: 4.92892,
  Milliliter: 1,
  Grams: 1,
} as const;

export const capitalizeWords = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const roundNutrientValue = (value: number | undefined, decimals: number = 1): number => {
  if (!value) return 0;
  return parseFloat(value.toFixed(decimals));
};

export const roundNutrients = (nutrients: Record<string, number | undefined>) => {
  const rounded: Record<string, number> = {};
  
  // Macronutrients - 1 decimal place
  const macroNutrients = ['calories', 'protein', 'carbs', 'fat', 'fiber'];
  
  // Micronutrients - 2 decimal places for precision
  const microNutrients = [
    'vitaminB1', 'vitaminB2', 'vitaminB3', 'vitaminB5', 'vitaminB6', 'vitaminB12',
    'biotin', 'folate', 'vitaminA', 'vitaminC', 'vitaminD', 'vitaminK',
    'copper', 'manganese', 'selenium', 'zinc', 'omega3'
  ];
  
  // Minerals - 1 decimal place
  const minerals = ['calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'sodium'];
  
  Object.entries(nutrients).forEach(([key, value]) => {
    if (microNutrients.includes(key)) {
      rounded[key] = roundNutrientValue(value, 2);
    } else if (macroNutrients.includes(key) || minerals.includes(key)) {
      rounded[key] = roundNutrientValue(value, 1);
    } else {
      rounded[key] = roundNutrientValue(value);
    }
  });
  
  return rounded;
};

export const getFallbackNutrients = (foodDescription: string) => {
  const description = foodDescription.toLowerCase();
  
  if (description.includes('chicken breast')) {
    return {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
    };
  }
  
  return null;
};
