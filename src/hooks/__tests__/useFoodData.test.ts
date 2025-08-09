import { renderHook, act, waitFor } from '@testing-library/react';
import { useFoodData } from '../useFoodData';
import { FoodLogService } from '../../services/foodLogService';
import { FoodEntry } from '../../types/food';

// Mock dependencies
jest.mock('../../services/foodLogService');
jest.mock('../../utils/foodEntryUtils', () => ({
  calculateTotals: jest.fn((entries: Array<{ calories: number; protein: number; carbs: number; fat: number }>) => ({
    calories: entries.reduce((sum: number, entry) => sum + entry.calories, 0),
    protein: entries.reduce((sum: number, entry) => sum + entry.protein, 0),
    carbs: entries.reduce((sum: number, entry) => sum + entry.carbs, 0),
    fat: entries.reduce((sum: number, entry) => sum + entry.fat, 0),
  })),
}));
jest.mock('../../utils/dateUtils', () => ({
  sameDay: jest.fn((date1, date2) => {
    return (
      date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() === date2.getUTCDate()
    );
  }),
}));

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
    mockFoodLogService.loadFoodData.mockResolvedValue(mockFoodEntries);
    mockFoodLogService.addFoodEntry.mockResolvedValue(mockFoodEntries[0]);
    mockFoodLogService.removeFoodEntry.mockResolvedValue(true);
    mockFoodLogService.updateFoodEntry.mockResolvedValue(true);
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
    const mockEntries = [
      { id: '1', description: 'Apple', date: '2024-01-01', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 } as FoodEntry,
      { id: '2', description: 'Banana', date: '2024-01-01', calories: 121, protein: 1.5, carbs: 31, fat: 0.4 } as FoodEntry,
      { id: '3', description: 'Orange', date: '2024-01-02', calories: 85, protein: 1.0, carbs: 21, fat: 0.2 } as FoodEntry,
    ];

    (FoodLogService.loadFoodData as jest.Mock).mockResolvedValue(mockEntries);

    const { result } = renderHook(() => useFoodData(
      new Date('2024-01-01'),
      () => '2024-01-01'
    ));

    await waitFor(() => {
      expect(result.current.filteredEntries).toHaveLength(2);
      expect(result.current.filteredEntries.map(e => e.id)).toEqual(['1', '2']);
    });
  });

  it('should calculate totals correctly', async () => {
    const { result } = renderHook(() => useFoodData(mockSelectedDate, mockFormatApiDate));

    await waitFor(() => {
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
    const { result, rerender } = renderHook(
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
