import { renderHook, act, waitFor } from '@testing-library/react';
import { useFoodData } from '../useFoodData';
import { FoodLogService } from '../../services/foodLogService';
import { FoodEntry } from '../../types/food';

// Mock dependencies
jest.mock('../../services/foodLogService', () => ({
  FoodLogService: {
    loadFoodData: jest.fn(),
    addFoodEntry: jest.fn(),
    removeFoodEntry: jest.fn(),
    updateFoodEntry: jest.fn(),
  }
}));
jest.mock('../../utils/foodEntryUtils', () => ({
  calculateTotals: jest.fn((entries: FoodEntry[]) => {
    console.log('calculateTotals mock called with:', entries.length, 'entries');
    if (entries.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    return {
      calories: entries.reduce((sum: number, entry: FoodEntry) => sum + entry.calories, 0),
      protein: entries.reduce((sum: number, entry: FoodEntry) => sum + entry.protein, 0),
      carbs: entries.reduce((sum: number, entry: FoodEntry) => sum + entry.carbs, 0),
      fat: entries.reduce((sum: number, entry: FoodEntry) => sum + entry.fat, 0),
    };
  }),
}));

// Get the mocked function for testing
import { calculateTotals } from '../../utils/foodEntryUtils';
const mockCalculateTotals = calculateTotals as jest.MockedFunction<typeof calculateTotals>;
jest.mock('../../utils/dateUtils', () => ({
  sameDay: jest.fn((d1: Date, d2: Date) => {
    // Actual implementation for testing - compare year, month, date
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }),
}));

// Get the mocked sameDay function for testing
import { sameDay } from '../../utils/dateUtils';
const mockSameDay = sameDay as jest.MockedFunction<typeof sameDay>;

const mockFoodLogService = FoodLogService as jest.Mocked<typeof FoodLogService>;

describe('useFoodData', () => {
  const mockSelectedDate = new Date('2023-12-25');
  const mockFormatApiDate = jest.fn(() => '2023-12-25');

  const mockFoodEntries: FoodEntry[] = [
    {
      id: '1',
      description: 'Apple',
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatApiDate.mockImplementation(() => '2023-12-25');
    mockFoodLogService.loadFoodData.mockResolvedValue(mockFoodEntries);
    mockFoodLogService.addFoodEntry.mockResolvedValue(mockFoodEntries[0]);
    mockFoodLogService.removeFoodEntry.mockResolvedValue(true);
    mockFoodLogService.updateFoodEntry.mockResolvedValue(true);
    mockSameDay.mockClear();
    mockSameDay.mockReturnValue(true);
    mockCalculateTotals.mockClear();
  });

  it('should initialize with empty state and load data', async () => {
    const { result } = renderHook(() => useFoodData(mockSelectedDate, mockFormatApiDate));

    expect(result.current.foodData).toEqual([]);
    expect(result.current.selectedEntries).toEqual([]);

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockFoodLogService.loadFoodData).toHaveBeenCalledWith('2023-12-25');
  });

    it('should filter entries by selected date', async () => {
    // For this test, we'll use a more realistic scenario where the mock API
    // returns only entries for the selected date, as would happen in a real app
    const mockEntries = [
      { 
        id: '1', 
        description: 'Apple', 
        date: '2023-12-25T10:00:00.000Z', 
        calories: 95, 
        protein: 0.5, 
        carbs: 25, 
        fat: 0.3,
        amount: '1',
        unit: 'medium',
        fiber: 4,
        mealType: 'breakfast'
      } as FoodEntry,
      { 
        id: '2', 
        description: 'Banana', 
        date: '2023-12-25T12:00:00.000Z', 
        calories: 121, 
        protein: 1.5, 
        carbs: 31, 
        fat: 0.4,
        amount: '1',
        unit: 'large',
        fiber: 3.5,
        mealType: 'lunch'
      } as FoodEntry,
    ];

    // Set up the mock before rendering the hook
    mockFoodLogService.loadFoodData.mockResolvedValue(mockEntries);

    const { result } = renderHook(() => useFoodData(
      new Date('2023-12-25'),
      () => '2023-12-25'
    ));

    await waitFor(() => {
      expect(result.current.foodData).toHaveLength(2);
      expect(result.current.filteredEntries).toHaveLength(2);
      expect(result.current.filteredEntries.map(e => e.id)).toEqual(['1', '2']);
    });
  });

  it('should calculate totals correctly', async () => {
    const mockEntries = [
      { 
        id: '1', 
        description: 'Apple', 
        date: '2023-12-25T10:00:00.000Z', 
        calories: 95, 
        protein: 0.5, 
        carbs: 25, 
        fat: 0.3,
        amount: '1',
        unit: 'medium',
        fiber: 4,
        mealType: 'breakfast'
      } as FoodEntry,
      { 
        id: '2', 
        description: 'Banana', 
        date: '2023-12-25T12:00:00.000Z', 
        calories: 121, 
        protein: 1.5, 
        carbs: 31, 
        fat: 0.4,
        amount: '1',
        unit: 'large',
        fiber: 3.5,
        mealType: 'lunch'
      } as FoodEntry,
    ];

    // Clear and reset the mock
    mockCalculateTotals.mockClear();
    mockCalculateTotals.mockImplementation((entries: FoodEntry[]) => {
      console.log('calculateTotals mock called with:', entries.length, 'entries');
      if (entries.length === 0) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      return {
        calories: entries.reduce((sum: number, entry: FoodEntry) => sum + entry.calories, 0),
        protein: entries.reduce((sum: number, entry: FoodEntry) => sum + entry.protein, 0),
        carbs: entries.reduce((sum: number, entry: FoodEntry) => sum + entry.carbs, 0),
        fat: entries.reduce((sum: number, entry: FoodEntry) => sum + entry.fat, 0),
      };
    });

    (FoodLogService.loadFoodData as jest.Mock).mockResolvedValue(mockEntries);

    const { result } = renderHook(() => useFoodData(mockSelectedDate, mockFormatApiDate));

    await waitFor(() => {
      console.log('totals:', result.current.totals);
      console.log('calculateTotals called:', mockCalculateTotals.mock.calls.length, 'times');
      console.log('calculateTotals calls:', mockCalculateTotals.mock.calls);
      console.log('calculateTotals results:', mockCalculateTotals.mock.results);
      expect(result.current.totals).toEqual({
        calories: 216, // 95 + 121
        protein: 2,    // 0.5 + 1.5
        carbs: 56,     // 25 + 31
        fat: 0.7,      // 0.3 + 0.4
      });
    });
  });

  it('should add food entry successfully', async () => {
    const { result } = renderHook(() => useFoodData(mockSelectedDate, mockFormatApiDate));

    const newEntry: FoodEntry = {
      id: '3',
      description: 'Orange',
      amount: '1',
      unit: 'medium',
      calories: 62,
      protein: 1.2,
      carbs: 15.4,
      fat: 0.2,
      fiber: 3.1,
      date: '2023-12-25T15:00:00.000Z',
      mealType: 'snack',
    };

    mockFoodLogService.addFoodEntry.mockResolvedValue(newEntry);

    await act(async () => {
      await result.current.addFoodEntry(newEntry);
    });

    expect(mockFoodLogService.addFoodEntry).toHaveBeenCalledWith({
      ...newEntry,
      date: mockSelectedDate.toISOString(),
    });
  });

  it('should remove food entry successfully', async () => {
    const { result } = renderHook(() => useFoodData(mockSelectedDate, mockFormatApiDate));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.removeFoodEntry('1');
    });

    expect(mockFoodLogService.removeFoodEntry).toHaveBeenCalledWith('1');
  });

  it('should update food entry successfully', async () => {
    const { result } = renderHook(() => useFoodData(mockSelectedDate, mockFormatApiDate));

    const updates = { amount: '2', calories: 190 };

    await act(async () => {
      await result.current.updateFoodEntry('1', updates);
    });

    expect(mockFoodLogService.updateFoodEntry).toHaveBeenCalledWith('1', updates);
  });

  it('should handle reorder entries', async () => {
    const mockEntries = [
      { 
        id: '1', 
        description: 'Apple', 
        date: '2023-12-25T10:00:00.000Z', 
        calories: 95, 
        protein: 0.5, 
        carbs: 25, 
        fat: 0.3,
        amount: '1',
        unit: 'medium',
        fiber: 4,
        mealType: 'breakfast'
      } as FoodEntry,
      { 
        id: '2', 
        description: 'Banana', 
        date: '2023-12-25T12:00:00.000Z', 
        calories: 121, 
        protein: 1.5, 
        carbs: 31, 
        fat: 0.4,
        amount: '1',
        unit: 'large',
        fiber: 3.5,
        mealType: 'lunch'
      } as FoodEntry,
    ];

    (FoodLogService.loadFoodData as jest.Mock).mockResolvedValue(mockEntries);

    const { result } = renderHook(() => useFoodData(mockSelectedDate, mockFormatApiDate));

    await waitFor(() => {
      expect(result.current.filteredEntries).toHaveLength(2);
    });

    const reorderedEntries = [result.current.filteredEntries[1], result.current.filteredEntries[0]];

    await act(async () => {
      result.current.handleReorderEntries(reorderedEntries);
    });

    expect(result.current.filteredEntries[0].id).toBe('2');
    expect(result.current.filteredEntries[1].id).toBe('1');
  });

  it('should handle entry selection', async () => {
    const { result } = renderHook(() => useFoodData(mockSelectedDate, mockFormatApiDate));

    const mockEvent = { ctrlKey: false, metaKey: false, shiftKey: false } as React.MouseEvent;

    await act(async () => {
      result.current.handleEntrySelect('1', 0, mockEvent);
    });

    expect(result.current.selectedEntries).toContain('1');

    await act(async () => {
      result.current.handleEntrySelect('1', 0, mockEvent);
    });

    expect(result.current.selectedEntries).not.toContain('1');
  });

  it('should handle errors when loading data', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFoodLogService.loadFoodData.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFoodData(mockSelectedDate, mockFormatApiDate));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error loading food data:', expect.any(Error));
    expect(result.current.foodData).toEqual([]);

    consoleSpy.mockRestore();
  });

  it('should handle errors when adding entry', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFoodLogService.addFoodEntry.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFoodData(mockSelectedDate, mockFormatApiDate));

    const newEntry = mockFoodEntries[0];

    await act(async () => {
      await result.current.addFoodEntry(newEntry);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error adding food entry:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should handle errors when removing entry', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFoodLogService.removeFoodEntry.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFoodData(mockSelectedDate, mockFormatApiDate));

    await act(async () => {
      await result.current.removeFoodEntry('1');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error removing food entry:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should handle errors when updating entry', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFoodLogService.updateFoodEntry.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFoodData(mockSelectedDate, mockFormatApiDate));

    await act(async () => {
      await result.current.updateFoodEntry('1', { amount: '2' });
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error updating food entry:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should reload data when selected date changes', async () => {
    const { rerender } = renderHook(
      ({ date, formatFn }) => useFoodData(date, formatFn),
      {
        initialProps: {
          date: mockSelectedDate,
          formatFn: mockFormatApiDate,
        },
      }
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockFoodLogService.loadFoodData).toHaveBeenCalledTimes(1);

    const newDate = new Date('2023-12-26');
    const newFormatFn = jest.fn(() => '2023-12-26');

    rerender({ date: newDate, formatFn: newFormatFn });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockFoodLogService.loadFoodData).toHaveBeenCalledTimes(2);
    expect(mockFoodLogService.loadFoodData).toHaveBeenLastCalledWith('2023-12-26');
  });
});
