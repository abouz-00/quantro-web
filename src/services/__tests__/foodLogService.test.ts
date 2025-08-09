import { FoodLogService } from '../foodLogService';
import { FoodEntry } from '../../types/food';

// Mock the errorService to prevent real error logging
jest.mock('../errorService', () => ({
  errorService: {
    logError: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock the fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock console.error to prevent noise in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock the utility functions
jest.mock('../../utils/foodEntryUtils', () => ({
  transformApiDataToFoodEntry: jest.fn((data) => ({
    id: data.id,
    description: `${data.foodName} ${data.brand ? `(${data.brand})` : ''}`,
    amount: data.quantity.toString(),
    unit: data.unit,
    calories: data.calories,
    protein: data.protein,
    carbs: data.carbs,
    fat: data.fat,
    fiber: data.fiber || 0,
    date: data.date || new Date().toISOString(),
    mealType: data.mealType || 'breakfast',
  })),
  transformFoodEntryToApiData: jest.fn((entry) => ({
    foodName: entry.description.split(' (')[0],
    brand: entry.description.includes(' (') ? entry.description.split(' (')[1].replace(')', '') : null,
    quantity: parseFloat(entry.amount),
    unit: entry.unit,
    mealType: entry.mealType,
    calories: entry.calories,
    protein: entry.protein,
    carbs: entry.carbs,
    fat: entry.fat,
    fiber: entry.fiber || 0,
  })),
}));

describe('FoodLogService', () => {
  const mockFoodEntry: FoodEntry = {
    id: 'test-id',
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('loadFoodData', () => {
    it('should load food data from API successfully', async () => {
      const mockApiData = [
        {
          id: '1',
          foodName: 'Apple',
          brand: 'Organic',
          quantity: 1,
          unit: 'medium',
          calories: 95,
          protein: 0.5,
          carbs: 25,
          fat: 0.3,
          fiber: 4,
          date: '2023-12-25',
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockApiData,
      });

      const result = await FoodLogService.loadFoodData('2023-12-25');

      expect(mockFetch).toHaveBeenCalledWith('/api/food-logs?date=2023-12-25');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: '1',
        description: 'Apple (Organic)',
      });
    });

    it('should fallback to localStorage when API fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const mockLocalData = JSON.stringify([mockFoodEntry]);
      mockLocalStorage.getItem.mockReturnValue(mockLocalData);

      const result = await FoodLogService.loadFoodData('2023-12-25');

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('foodData');
      expect(result).toEqual([mockFoodEntry]);
    });

    it('should fallback to localStorage when fetch throws error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      mockLocalStorage.getItem.mockReturnValue('[]');

      const result = await FoodLogService.loadFoodData('2023-12-25');

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('foodData');
      expect(result).toEqual([]);
    });

    it('should return empty array when localStorage is empty', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await FoodLogService.loadFoodData('2023-12-25');

      expect(result).toEqual([]);
    });
  });

  describe('addFoodEntry', () => {
    it('should add food entry via API successfully', async () => {
      const mockApiResponse = {
        id: 'api-id',
        foodName: 'Apple',
        brand: 'Organic',
        quantity: 1,
        unit: 'medium',
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        fiber: 4,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await FoodLogService.addFoodEntry(mockFoodEntry);

      expect(mockFetch).toHaveBeenCalledWith('/api/food-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
      
      expect(result).toMatchObject({
        id: 'api-id',
        description: 'Apple (Organic)',
      });
    });

    it('should fallback to localStorage when API fails', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      mockLocalStorage.getItem.mockReturnValue('[]');

      const result = await FoodLogService.addFoodEntry(mockFoodEntry);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'foodData',
        JSON.stringify([mockFoodEntry])
      );
      expect(result).toEqual(mockFoodEntry);
    });

    it('should handle fetch errors and use localStorage', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      mockLocalStorage.getItem.mockReturnValue('[]');

      const result = await FoodLogService.addFoodEntry(mockFoodEntry);

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      expect(result).toEqual(mockFoodEntry);
    });
  });

  describe('removeFoodEntry', () => {
    it('should remove food entry via API successfully', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const result = await FoodLogService.removeFoodEntry('test-id');

      expect(mockFetch).toHaveBeenCalledWith('/api/food-logs?id=test-id', {
        method: 'DELETE',
      });
      expect(result).toBe(true);
    });

    it('should fallback to localStorage when API fails', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const mockData = [mockFoodEntry, { ...mockFoodEntry, id: 'other-id' }];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = await FoodLogService.removeFoodEntry('test-id');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'foodData',
        JSON.stringify([{ ...mockFoodEntry, id: 'other-id' }])
      );
      expect(result).toBe(true);
    });

    it('should handle fetch errors and use localStorage', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      mockLocalStorage.getItem.mockReturnValue('[]');

      const result = await FoodLogService.removeFoodEntry('test-id');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('foodData', '[]');
      expect(result).toBe(true);
    });
  });

  describe('updateFoodEntry', () => {
    const updates = {
      amount: '2',
      calories: 190,
      protein: 1.0,
      carbs: 50,
      fat: 0.6,
    };

    it('should update food entry via API successfully', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const result = await FoodLogService.updateFoodEntry('test-id', updates);

      expect(mockFetch).toHaveBeenCalledWith('/api/food-logs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 'test-id',
          quantity: 2,
          calories: 190,
          protein: 1.0,
          carbs: 50,
          fat: 0.6,
        }),
      });
      expect(result).toBe(true);
    });

    it('should fallback to localStorage when API fails', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const mockData = [mockFoodEntry];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = await FoodLogService.updateFoodEntry('test-id', updates);

      const expectedUpdatedData = [{ ...mockFoodEntry, ...updates }];
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'foodData',
        JSON.stringify(expectedUpdatedData)
      );
      expect(result).toBe(true);
    });

    it('should handle fetch errors and use localStorage', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      mockLocalStorage.getItem.mockReturnValue('[]');

      const result = await FoodLogService.updateFoodEntry('test-id', updates);

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle localStorage with non-matching IDs', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const mockData = [{ ...mockFoodEntry, id: 'different-id' }];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = await FoodLogService.updateFoodEntry('test-id', updates);

      // Should not modify data when ID doesn't match
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'foodData',
        JSON.stringify(mockData)
      );
      expect(result).toBe(true);
    });
  });
});
