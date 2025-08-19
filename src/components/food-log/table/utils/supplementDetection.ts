/**
 * Checks if a food description indicates it's a supplement
 */
export function isSupplement(description: string): boolean {
  const supplementKeywords = [
    'vitamin', 'supplement', 'capsule', 'tablet', 'pill', 'gummy',
    'multivitamin', 'protein powder', 'creatine', 'omega', 'probiotic',
    'magnesium', 'calcium', 'iron', 'zinc', 'b12', 'b-12', 'd3',
    'fish oil', 'biotin', 'collagen', 'ashwagandha', 'turmeric'
  ];
  
  const lowerDescription = description.toLowerCase();
  return supplementKeywords.some(keyword => lowerDescription.includes(keyword));
}
