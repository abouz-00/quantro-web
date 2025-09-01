import { 
  calculateTotals, 
  calculateAllNutrientTotals,
  transformApiDataToFoodEntry, 
  transformFoodEntryToApiData 
} from '../foodEntryUtils';
import { FoodEntry } from '../../types/food';

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
          protein: undefined as unknown as number,
          fat: undefined as unknown as number,
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

  describe('calculateAllNutrientTotals', () => {
    const mockEntriesWithAllNutrients: FoodEntry[] = [
      {
        id: '1',
        description: 'Salmon (Wild)',
        amount: '100',
        unit: 'g',
        calories: 206,
        protein: 22.1,
        carbs: 0,
        fat: 12.4,
        fiber: 0,
        vitaminB1: 0.15,
        vitaminB2: 0.22,
        vitaminB3: 6.04,
        vitaminB5: 1.22,
        vitaminB6: 0.61,
        vitaminB12: 3.05,
        biotin: 4.0,
        folate: 25,
        vitaminA: 40,
        vitaminC: 0,
        vitaminD: 10.9,
        vitaminK: 0.1,
        calcium: 11,
        copper: 0.05,
        iron: 0.34,
        magnesium: 29,
        manganese: 0.02,
        phosphorus: 252,
        potassium: 363,
        selenium: 41.4,
        sodium: 59,
        zinc: 0.64,
        omega3: 1.86,
        date: '2023-12-25T10:00:00.000Z',
        mealType: 'dinner',
      },
      {
        id: '2',
        description: 'Broccoli',
        amount: '100',
        unit: 'g',
        calories: 34,
        protein: 2.8,
        carbs: 7.2,
        fat: 0.4,
        fiber: 2.6,
        vitaminB1: 0.07,
        vitaminB2: 0.12,
        vitaminB3: 0.64,
        vitaminB5: 0.54,
        vitaminB6: 0.18,
        vitaminB12: 0,
        biotin: 1.0,
        folate: 63,
        vitaminA: 623,
        vitaminC: 89.2,
        vitaminD: 0,
        vitaminK: 101.6,
        calcium: 47,
        copper: 0.05,
        iron: 0.73,
        magnesium: 21,
        manganese: 0.21,
        phosphorus: 66,
        potassium: 316,
        selenium: 2.5,
        sodium: 33,
        zinc: 0.41,
        omega3: 0.15,
        date: '2023-12-25T12:00:00.000Z',
        mealType: 'lunch',
      },
    ];

    it('should calculate all nutrient totals correctly', () => {
      const result = calculateAllNutrientTotals(mockEntriesWithAllNutrients);

      expect(result).toEqual({
        calories: 240,
        protein: 24.9,
        carbs: 7.2,
        fat: 12.8,
        fiber: 2.6,
        vitaminB1: 0.2,
        vitaminB2: 0.3,
        vitaminB3: 6.7,
        vitaminB5: 1.8,
        vitaminB6: 0.8,
        vitaminB12: 3.05,
        biotin: 5.0,
        folate: 88,
        vitaminA: 663,
        vitaminC: 89.2,
        vitaminD: 10.9,
        vitaminK: 101.7,
        calcium: 58,
        copper: 0.1,
        iron: 1.1,
        magnesium: 50,
        manganese: 0.2,
        phosphorus: 318,
        potassium: 679,
        selenium: 43.9,
        sodium: 92,
        zinc: 1.1,
        omega3: 2.0,
      });
    });

    it('should handle empty array', () => {
      const result = calculateAllNutrientTotals([]);

      expect(result).toEqual({
        calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
        vitaminB1: 0, vitaminB2: 0, vitaminB3: 0, vitaminB5: 0, vitaminB6: 0, vitaminB12: 0,
        biotin: 0, folate: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminK: 0,
        calcium: 0, copper: 0, iron: 0, magnesium: 0, manganese: 0, phosphorus: 0,
        potassium: 0, selenium: 0, sodium: 0, zinc: 0, omega3: 0,
      });
    });

    it('should handle entries with undefined nutrients', () => {
      const entriesWithUndefined: FoodEntry[] = [
        {
          id: '1',
          description: 'Test Food',
          amount: '100',
          unit: 'g',
          calories: 100,
          protein: undefined as unknown as number,
          carbs: 10,
          fat: undefined as unknown as number,
          fiber: undefined as unknown as number,
          vitaminB1: undefined as unknown as number,
          vitaminB2: 0.1,
          vitaminB3: undefined as unknown as number,
          vitaminB5: 0.5,
          vitaminB6: undefined as unknown as number,
          vitaminB12: undefined as unknown as number,
          biotin: undefined as unknown as number,
          folate: 10,
          vitaminA: undefined as unknown as number,
          vitaminC: 5,
          vitaminD: undefined as unknown as number,
          vitaminK: undefined as unknown as number,
          calcium: undefined as unknown as number,
          copper: 0.02,
          iron: undefined as unknown as number,
          magnesium: 20,
          manganese: undefined as unknown as number,
          phosphorus: undefined as unknown as number,
          potassium: 100,
          selenium: undefined as unknown as number,
          sodium: undefined as unknown as number,
          zinc: 0.5,
          omega3: undefined as unknown as number,
          date: '2023-12-25T10:00:00.000Z',
          mealType: 'breakfast',
        },
      ];

      const result = calculateAllNutrientTotals(entriesWithUndefined);

      expect(result).toEqual({
        calories: 100,
        protein: 0,  // undefined treated as 0
        carbs: 10,
        fat: 0,      // undefined treated as 0
        fiber: 0,    // undefined treated as 0
        vitaminB1: 0,
        vitaminB2: 0.1,
        vitaminB3: 0,
        vitaminB5: 0.5,
        vitaminB6: 0,
        vitaminB12: 0,
        biotin: 0,
        folate: 10,
        vitaminA: 0,
        vitaminC: 5,
        vitaminD: 0,
        vitaminK: 0,
        calcium: 0,
        copper: 0.0,
        iron: 0,
        magnesium: 20,
        manganese: 0,
        phosphorus: 0,
        potassium: 100,
        selenium: 0,
        sodium: 0,
        zinc: 0.5,
        omega3: 0,
      });
    });

    it('should round nutrients to correct decimal places', () => {
      const entriesWithPreciseValues: FoodEntry[] = [
        {
          id: '1',
          description: 'Test Food',
          amount: '100',
          unit: 'g',
          calories: 100.123,
          protein: 10.567,
          carbs: 20.999,
          fat: 5.234,
          fiber: 3.456,
          vitaminB1: 0.123,
          vitaminB2: 0.456,
          vitaminB3: 1.789,
          vitaminB5: 0.987,
          vitaminB6: 0.654,
          vitaminB12: 0.00123,  // Should round to 2 decimal places
          biotin: 0.00234,       // Should round to 2 decimal places
          folate: 12.345,        // Should round to 2 decimal places
          vitaminA: 123.456,     // Should round to 2 decimal places
          vitaminC: 45.678,
          vitaminD: 0.00987,     // Should round to 2 decimal places
          vitaminK: 0.01234,     // Should round to 2 decimal places
          calcium: 200.789,
          copper: 0.03456,
          iron: 1.234,
          magnesium: 150.987,
          manganese: 0.05678,
          phosphorus: 250.123,
          potassium: 300.456,
          selenium: 0.0789,      // Should round to 2 decimal places
          sodium: 400.567,
          zinc: 2.345,
          omega3: 0.123,
          date: '2023-12-25T10:00:00.000Z',
          mealType: 'breakfast',
        },
      ];

      const result = calculateAllNutrientTotals(entriesWithPreciseValues);

      expect(result).toEqual({
        calories: 100.1,
        protein: 10.6,
        carbs: 21.0,
        fat: 5.2,
        fiber: 3.5,
        vitaminB1: 0.1,
        vitaminB2: 0.5,
        vitaminB3: 1.8,
        vitaminB5: 1.0,
        vitaminB6: 0.7,
        vitaminB12: 0.00,  // 2 decimal places
        biotin: 0.00,       // 2 decimal places
        folate: 12.35,      // 2 decimal places
        vitaminA: 123.46,   // 2 decimal places
        vitaminC: 45.7,
        vitaminD: 0.01,     // 2 decimal places
        vitaminK: 0.01,     // 2 decimal places
        calcium: 200.8,
        copper: 0.0,
        iron: 1.2,
        magnesium: 151.0,
        manganese: 0.1,
        phosphorus: 250.1,
        potassium: 300.5,
        selenium: 0.08,     // 2 decimal places
        sodium: 400.6,
        zinc: 2.3,
        omega3: 0.1,
      });
    });

    it('should handle single entry with all nutrients', () => {
      const result = calculateAllNutrientTotals([mockEntriesWithAllNutrients[0]]);

      expect(result.calories).toBe(206);
      expect(result.protein).toBe(22.1);
      expect(result.vitaminB12).toBe(3.05);
      expect(result.selenium).toBe(41.4);
    });

    it('should accumulate nutrients correctly across multiple entries', () => {
      const result = calculateAllNutrientTotals(mockEntriesWithAllNutrients);

      // Verify accumulation: salmon + broccoli
      expect(result.calories).toBe(206 + 34); // 240
      expect(result.protein).toBeCloseTo(22.1 + 2.8, 1); // 24.9
      expect(result.vitaminA).toBe(40 + 623); // 663
      expect(result.vitaminC).toBeCloseTo(0 + 89.2, 1); // 89.2
    });
  });

  describe('transformApiDataToFoodEntry', () => {
    const mockApiData = {
      id: 'api-1',
      foodName: 'Apple',
      brand: 'Organic',
      quantity: 1,
      unit: 'medium',
      mealType: 'breakfast' as const,
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
        brand: undefined,
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
        fiber: undefined as unknown as number,
      };

      const result = transformFoodEntryToApiData(entryWithoutFiber);

      expect(result.fiber).toBe(0);
    });

    it('should handle empty description gracefully', () => {
      const entryWithEmptyDescription = {
        ...mockFoodEntry,
        description: '',
      };

      const result = transformFoodEntryToApiData(entryWithEmptyDescription);

      expect(result.foodName).toBe('');
      expect(result.brand).toBe(null);
    });

    it('should handle non-numeric amount strings', () => {
      const entryWithNonNumericAmount = {
        ...mockFoodEntry,
        amount: 'invalid',
      };

      const result = transformFoodEntryToApiData(entryWithNonNumericAmount);

      expect(result.quantity).toBeNaN();
    });
  });
});
