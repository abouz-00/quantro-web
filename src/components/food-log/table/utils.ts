// Utility functions for food table

// Helper function to capitalize first letter of each word
export const capitalizeWords = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to abbreviate units
export const abbreviateUnit = (unit: string): string => {
  const lowerUnit = unit.toLowerCase();
  const unitMap: { [key: string]: string } = {
    'grams': 'g',
    'gram': 'g',
    'cups': 'cups',
    'cup': 'cups',
    'ounces': 'oz',
    'ounce': 'oz',
    'tablespoons': 'tbsp',
    'tablespoon': 'tbsp',
    'teaspoons': 'tsp',
    'teaspoon': 'tsp'
  };
  
  return unitMap[lowerUnit] || unit;
};

// Helper function to format numbers without trailing zeros
export const formatNumber = (num: number): string => {
  // Round to 2 decimal places and remove trailing zeros
  const fixed = num.toFixed(2);
  return parseFloat(fixed).toString();
};

// Unit conversions to grams
export const UNIT_CONVERSIONS = {
  Grams: 1,
  Ounces: 28.3495,
  Cup: 236.588,
  Tablespoon: 14.7868,
  Teaspoon: 4.92892,
} as const;

// Available units for editing
export const AVAILABLE_UNITS = ['Grams', 'Ounces', 'Cup', 'Tablespoon', 'Teaspoon'] as const;

// Convert between units
export const convertUnits = (amount: number, fromUnit: string, toUnit: string): number => {
  if (fromUnit === toUnit) return amount;
  
  // Convert to grams first
  const inGrams = amount * (UNIT_CONVERSIONS[fromUnit as keyof typeof UNIT_CONVERSIONS] || 1);
  
  // Convert from grams to target unit
  const targetMultiplier = UNIT_CONVERSIONS[toUnit as keyof typeof UNIT_CONVERSIONS] || 1;
  
  return inGrams / targetMultiplier;
};

// Normalize unit names to match our system
export const normalizeUnit = (unit: string): string => {
  const normalized = unit.toLowerCase();
  const unitMapping: { [key: string]: string } = {
    'g': 'Grams',
    'gram': 'Grams', 
    'grams': 'Grams',
    'oz': 'Ounces',
    'ounce': 'Ounces',
    'ounces': 'Ounces',
    'cup': 'Cup',
    'cups': 'Cup',
    'tbsp': 'Tablespoon',
    'tablespoon': 'Tablespoon',
    'tablespoons': 'Tablespoon',
    'tsp': 'Teaspoon',
    'teaspoon': 'Teaspoon',
    'teaspoons': 'Teaspoon',
  };
  
  return unitMapping[normalized] || unit;
};
