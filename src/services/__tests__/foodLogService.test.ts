// Mock utility functions FIRST (hoisting requirement)
jest.mock('../../utils/foodEntryUtils', () => ({
  transformApiDataToFoodEntry: jest.fn(),
  transformFoodEntryToApiData: jest.fn(),
}));

// Mock the errorService to prevent real error logging
jest.mock('../errorService', () => ({
  errorService: {
    logError: jest.fn().mockResolvedValue(undefined),
  },
}));

import { FoodLogService } from '../foodLogService';
import { FoodEntry } from '../../types/food';
import { transformApiDataToFoodEntry, transformFoodEntryToApiData } from '../../utils/foodEntryUtils';

// Cast mocked functions
const mockTransformApiDataToFoodEntry = transformApiDataToFoodEntry as jest.MockedFunction<typeof transformApiDataToFoodEntry>;
const mockTransformFoodEntryToApiData = transformFoodEntryToApiData as jest.MockedFunction<typeof transformFoodEntryToApiData>;

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

// Spy on console methods to verify error handling
const mockConsoleError = jest.spyOn(console, 'error');
const mockConsoleLog = jest.spyOn(console, 'log');

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
    mockConsoleLog.mockClear();
    
    // Set up transform function mocks
    mockTransformApiDataToFoodEntry.mockImplementation((data) => ({
      id: data.id,
      description: data.foodName && data.brand ? `${data.foodName} (${data.brand})` : data.foodName,
      amount: data.quantity?.toString() || '1',
      unit: data.unit || 'serving',
      calories: data.calories || 0,
      protein: data.protein || 0,
      carbs: data.carbs || 0,
      fat: data.fat || 0,
      fiber: data.fiber || 0,
      date: data.date || new Date().toISOString(),
      mealType: data.mealType || 'breakfast',
    }));
    
    mockTransformFoodEntryToApiData.mockImplementation((entry) => ({
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
      sodium: entry.sodium || 0,
      date: entry.date,
    }));
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
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
        status: 200,
        statusText: 'OK',
        json: async () => mockApiData,
        text: async () => JSON.stringify(mockApiData),
      });

      const result = await FoodLogService.loadFoodData('2023-12-25');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/food-logs?date=2023-12-25'),
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
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
        statusText: 'Internal Server Error',
        json: async () => ({}),
        text: async () => 'Internal Server Error',
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
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({}),
        text: async () => 'Not Found',
      });
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
        status: 200,
        statusText: 'OK',
        json: async () => mockApiResponse,
        text: async () => JSON.stringify(mockApiResponse),
      });

      const result = await FoodLogService.addFoodEntry(mockFoodEntry);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/food-logs'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.any(String),
        })
      );
      
      expect(result).toMatchObject({
        id: 'api-id',
        description: 'Apple (Organic)',
      });
    });

    it('should throw error on 400 Bad Request', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({}),
        text: async () => 'Bad Request',
      });
      mockLocalStorage.getItem.mockReturnValue('[]');

      await expect(FoodLogService.addFoodEntry(mockFoodEntry)).rejects.toThrow(
        'Invalid food entry data'
      );
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
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({}),
        text: async () => 'OK',
      });

      const result = await FoodLogService.removeFoodEntry('test-id');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/food-logs?id=test-id'),
        expect.objectContaining({
          method: 'DELETE',
          credentials: 'include',
        })
      );
      expect(result).toBe(true);
    });

    it('should fallback to localStorage when API fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({}),
        text: async () => 'Not Found',
      });
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
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({}),
        text: async () => 'OK',
      });

      const result = await FoodLogService.updateFoodEntry('test-id', updates);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/food-logs'),
        expect.objectContaining({
          method: 'PUT',
          credentials: 'include',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            id: 'test-id',
            quantity: 2,
            calories: 190,
            protein: 1.0,
            carbs: 50,
            fat: 0.6,
          }),
        })
      );
      expect(result).toBe(true);
    });

    it('should throw error on 400 Bad Request', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({}),
        text: async () => 'Bad Request',
      });
      const mockData = [mockFoodEntry];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      await expect(FoodLogService.updateFoodEntry('test-id', updates)).rejects.toThrow(
        'Invalid food entry update data'
      );
    });

    it('should handle fetch errors and use localStorage', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      mockLocalStorage.getItem.mockReturnValue('[]');

      const result = await FoodLogService.updateFoodEntry('test-id', updates);

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw error on 404 Not Found', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({}),
        text: async () => 'Not Found',
      });
      const mockData = [{ ...mockFoodEntry, id: 'different-id' }];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      await expect(FoodLogService.updateFoodEntry('test-id', updates)).rejects.toThrow(
        'Food entry not found'
      );
    });
  });

  describe('Error Handling - Specific HTTP Status Codes', () => {
    describe('loadFoodData - HTTP errors', () => {
      it('should handle 401 Unauthorized error and fallback to localStorage', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: async () => ({}),
          text: async () => 'Unauthorized',
        });
        mockLocalStorage.getItem.mockReturnValue('[]');

        const result = await FoodLogService.loadFoodData('2023-12-25');

        // Should fallback to localStorage on auth error
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('foodData');
        expect(result).toEqual([]);
      });

      it('should handle 403 Forbidden error and fallback to localStorage', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          json: async () => ({}),
          text: async () => 'Forbidden',
        });
        mockLocalStorage.getItem.mockReturnValue('[]');

        const result = await FoodLogService.loadFoodData('2023-12-25');

        // Should fallback to localStorage on auth error
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('foodData');
        expect(result).toEqual([]);
      });

      it('should handle 404 Not Found error and return empty array', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({}),
          text: async () => 'Not Found',
        });
        mockLocalStorage.getItem.mockReturnValue(null);

        const result = await FoodLogService.loadFoodData('2023-12-25');

        expect(result).toEqual([]);
      });

      it('should handle 500 Internal Server Error and fallback to localStorage', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({}),
          text: async () => 'Internal Server Error',
        });
        mockLocalStorage.getItem.mockReturnValue('[]');

        const result = await FoodLogService.loadFoodData('2023-12-25');

        // Should fallback to localStorage on server error
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('foodData');
        expect(result).toEqual([]);
      });

      it('should handle 503 Service Unavailable error and fallback to localStorage', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          json: async () => ({}),
          text: async () => 'Service Unavailable',
        });
        mockLocalStorage.getItem.mockReturnValue('[]');

        const result = await FoodLogService.loadFoodData('2023-12-25');

        // Should fallback to localStorage on service unavailable error
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('foodData');
        expect(result).toEqual([]);
      });
    });

    describe('addFoodEntry - HTTP errors', () => {
      it('should throw error on 401 Unauthorized', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: async () => ({}),
          text: async () => 'Unauthorized',
        });

        await expect(FoodLogService.addFoodEntry(mockFoodEntry)).rejects.toThrow(
          'Authentication required to save food entry'
        );
      });

      it('should throw error on 403 Forbidden', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          json: async () => ({}),
          text: async () => 'Forbidden',
        });

        await expect(FoodLogService.addFoodEntry(mockFoodEntry)).rejects.toThrow(
          'Authentication required to save food entry'
        );
      });

      it('should throw error on 400 Bad Request', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: async () => ({}),
          text: async () => 'Bad Request',
        });

        await expect(FoodLogService.addFoodEntry(mockFoodEntry)).rejects.toThrow(
          'Invalid food entry data'
        );
      });

      it('should fallback to localStorage on 500 error', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({}),
          text: async () => 'Internal Server Error',
        });
        mockLocalStorage.getItem.mockReturnValue('[]');

        const result = await FoodLogService.addFoodEntry(mockFoodEntry);

        expect(mockLocalStorage.setItem).toHaveBeenCalled();
        expect(result).toEqual(mockFoodEntry);
      });
    });

    describe('removeFoodEntry - HTTP errors', () => {
      it('should throw error on 401 Unauthorized', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: async () => ({}),
          text: async () => 'Unauthorized',
        });

        await expect(FoodLogService.removeFoodEntry('test-id')).rejects.toThrow(
          'Authentication required to delete food entry'
        );
      });

      it('should throw error on 403 Forbidden', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          json: async () => ({}),
          text: async () => 'Forbidden',
        });

        await expect(FoodLogService.removeFoodEntry('test-id')).rejects.toThrow(
          'Authentication required to delete food entry'
        );
      });

      it('should handle 404 Not Found gracefully', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({}),
          text: async () => 'Not Found',
        });
        mockLocalStorage.getItem.mockReturnValue('[]');

        const result = await FoodLogService.removeFoodEntry('test-id');

        expect(result).toBe(true);
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      });
    });

    describe('updateFoodEntry - HTTP errors', () => {
      const updates = { amount: '2', calories: 190 };

      it('should throw error on 401 Unauthorized', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: async () => ({}),
          text: async () => 'Unauthorized',
        });

        await expect(FoodLogService.updateFoodEntry('test-id', updates)).rejects.toThrow(
          'Authentication required to update food entry'
        );
      });

      it('should throw error on 403 Forbidden', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          json: async () => ({}),
          text: async () => 'Forbidden',
        });

        await expect(FoodLogService.updateFoodEntry('test-id', updates)).rejects.toThrow(
          'Authentication required to update food entry'
        );
      });

      it('should throw error on 400 Bad Request', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: async () => ({}),
          text: async () => 'Bad Request',
        });

        await expect(FoodLogService.updateFoodEntry('test-id', updates)).rejects.toThrow(
          'Invalid food entry update data'
        );
      });

      it('should throw error on 404 Not Found', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({}),
          text: async () => 'Not Found',
        });

        await expect(FoodLogService.updateFoodEntry('test-id', updates)).rejects.toThrow(
          'Food entry not found'
        );
      });

      it('should fallback to localStorage on 500 error', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({}),
          text: async () => 'Internal Server Error',
        });
        mockLocalStorage.getItem.mockReturnValue('[]');

        const result = await FoodLogService.updateFoodEntry('test-id', updates);

        expect(mockLocalStorage.setItem).toHaveBeenCalled();
        expect(result).toBe(true);
      });
    });
  });

  describe('Edge Cases and Additional Coverage', () => {
    it('should handle non-Error objects in catch blocks', async () => {
      mockFetch.mockRejectedValue('string error');
      mockLocalStorage.getItem.mockReturnValue('[]');

      const result = await FoodLogService.loadFoodData('2023-12-25');

      expect(result).toEqual([]);
    });

    it('should handle empty foodData in localStorage correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
        text: async () => 'Internal Server Error',
      });
      mockLocalStorage.getItem.mockReturnValue('[]');

      const result = await FoodLogService.loadFoodData('2023-12-25');

      expect(result).toEqual([]);
    });

    it('should handle updates with undefined optional fields', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({}),
        text: async () => 'OK',
      });

      const updates = { mealType: 'lunch' as const };
      const result = await FoodLogService.updateFoodEntry('test-id', updates);

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/food-logs'),
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('lunch'),
        })
      );
    });

    it('should correctly transform multiple food entries from API', async () => {
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
        },
        {
          id: '2',
          foodName: 'Banana',
          quantity: 2,
          unit: 'large',
          calories: 210,
          protein: 2,
          carbs: 54,
          fat: 0.8,
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockApiData,
        text: async () => JSON.stringify(mockApiData),
      });

      const result = await FoodLogService.loadFoodData('2023-12-25');

      expect(result).toHaveLength(2);
      expect(mockTransformApiDataToFoodEntry).toHaveBeenCalledTimes(2);
    });
  });
});
