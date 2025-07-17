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
