import { 
  calculateTotals, 
  transformApiDataToFoodEntry, 
  transformFoodEntryToApiData 
} from '../foodEntryUtils';
import { FoodEntry, Nutrients } from '../../types/food';

describe('foodEntryUtils', () => {
  const mockFoodEntries: FoodEntry[] = [
    {
      id: '1',
      description: 'Apple (Organic)',
      amount: '1',
      unit: 'medium',
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      fiber: 4,
      date: '2023-12-25T10:00:00.000Z',
      mealType: 'breakfast',
    },
    {
      id: '2',
      description: 'Banana',
      amount: '1',
      unit: 'large',
      calories: 121,
      protein: 1.5,
      carbs: 31,
      fat: 0.4,
      fiber: 3.5,
      date: '2023-12-25T12:00:00.000Z',
      mealType: 'lunch',
    },
    {
      id: '3',
      description: 'Chicken Breast (Grilled)',
      amount: '100',
      unit: 'g',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      date: '2023-12-25T18:00:00.000Z',
      mealType: 'dinner',
    },
  ];

  describe('calculateTotals', () => {
    it('should calculate totals correctly for multiple entries', () => {
      const result = calculateTotals(mockFoodEntries);

      expect(result).toEqual({
        calories: 381, // 95 + 121 + 165
        protein: 33,   // 0.5 + 1.5 + 31
        carbs: 56,     // 25 + 31 + 0
        fat: 4.3,      // 0.3 + 0.4 + 3.6
      });
    });

    it('should return zero totals for empty array', () => {
      const result = calculateTotals([]);

      expect(result).toEqual({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
    });

    it('should handle single entry', () => {
      const result = calculateTotals([mockFoodEntries[0]]);

      expect(result).toEqual({
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
      });
    });

    it('should handle entries with undefined nutrients', () => {
      const entriesWithUndefined: FoodEntry[] = [
        {
          ...mockFoodEntries[0],
          protein: undefined as any,
          fat: undefined as any,
        },
      ];

      const result = calculateTotals(entriesWithUndefined);

      expect(result).toEqual({
        calories: 95,
        protein: 0,  // undefined should be treated as 0
        carbs: 25,
        fat: 0,      // undefined should be treated as 0
      });
    });

    it('should round results to one decimal place', () => {
      const entriesWithDecimals: FoodEntry[] = [
        {
          ...mockFoodEntries[0],
          calories: 95.333,
          protein: 0.567,
          carbs: 25.999,
          fat: 0.334,
        },
      ];

      const result = calculateTotals(entriesWithDecimals);

      expect(result).toEqual({
        calories: 95.3,
        protein: 0.6,
        carbs: 26,
        fat: 0.3,
      });
    });
  });

  describe('transformApiDataToFoodEntry', () => {
    const mockApiData = {
      id: 'api-1',
      foodName: 'Apple',
      brand: 'Organic',
      quantity: 1,
      unit: 'medium',
      mealType: 'breakfast',
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      fiber: 4,
      date: '2023-12-25T10:00:00.000Z',
    };

    it('should transform API data to FoodEntry correctly', () => {
      const result = transformApiDataToFoodEntry(mockApiData);

      expect(result).toEqual({
        id: 'api-1',
        description: 'Apple (Organic)',
        amount: '1',
        unit: 'medium',
        mealType: 'breakfast',
        date: '2023-12-25T10:00:00.000Z',
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        fiber: 4,
      });
    });

    it('should handle API data without brand', () => {
      const apiDataWithoutBrand = {
        ...mockApiData,
        brand: null,
      };

      const result = transformApiDataToFoodEntry(apiDataWithoutBrand);

      expect(result.description).toBe('Apple');
    });

    it('should handle API data without fiber', () => {
      const apiDataWithoutFiber = {
        ...mockApiData,
        fiber: undefined,
      };

      const result = transformApiDataToFoodEntry(apiDataWithoutFiber);

      expect(result.fiber).toBe(0);
    });

    it('should handle API data without date', () => {
      const apiDataWithoutDate = {
        ...mockApiData,
        date: undefined,
      };

      const result = transformApiDataToFoodEntry(apiDataWithoutDate);

      expect(result.date).toBeDefined();
      expect(new Date(result.date)).toBeInstanceOf(Date);
    });
  });

  describe('transformFoodEntryToApiData', () => {
    const mockFoodEntry: FoodEntry = {
      id: 'entry-1',
      description: 'Chicken Breast (Grilled)',
      amount: '100',
      unit: 'g',
      mealType: 'dinner',
      date: '2023-12-25T18:00:00.000Z',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
    };

    it('should transform FoodEntry to API data correctly', () => {
      const result = transformFoodEntryToApiData(mockFoodEntry);

      expect(result).toEqual({
        foodName: 'Chicken Breast',
        brand: 'Grilled',
        quantity: 100,
        unit: 'g',
        mealType: 'dinner',
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        fiber: 0,
      });
    });

    it('should handle description without brand (no parentheses)', () => {
      const entryWithoutBrand = {
        ...mockFoodEntry,
        description: 'Plain Rice',
      };

      const result = transformFoodEntryToApiData(entryWithoutBrand);

      expect(result.foodName).toBe('Plain Rice');
      expect(result.brand).toBe(null);
    });

    it('should handle complex descriptions with multiple parentheses', () => {
      const entryWithComplexDescription = {
        ...mockFoodEntry,
        description: 'Yogurt (Greek) (Low Fat)',
      };

      const result = transformFoodEntryToApiData(entryWithComplexDescription);

      expect(result.foodName).toBe('Yogurt');
      expect(result.brand).toBe('Greek');
    });

    it('should parse amount as float correctly', () => {
      const entryWithDecimalAmount = {
        ...mockFoodEntry,
        amount: '150.5',
      };

      const result = transformFoodEntryToApiData(entryWithDecimalAmount);

      expect(result.quantity).toBe(150.5);
    });

    it('should handle missing fiber', () => {
      const entryWithoutFiber = {
        ...mockFoodEntry,
        fiber: undefined as any,
      };

      const result = transformFoodEntryToApiData(entryWithoutFiber);

      expect(result.fiber).toBe(0);
    });
  });
});
