import { renderHook, act } from '@testing-library/react';
import { useCustomFoods } from '../useCustomFoods';
import { CustomFood } from '../../components/food-log/search/components/custom-tab/types';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useCustomFoods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads custom foods from localStorage on mount', () => {
    const mockFoods: CustomFood[] = [
      { id: '1', name: 'Test Food', calories: 100, protein: 10, carbs: 20, fat: 5 },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFoods));

    const { result } = renderHook(() => useCustomFoods());

    expect(localStorageMock.getItem).toHaveBeenCalledWith('customFoods');
    expect(result.current.customFoods).toEqual(mockFoods);
  });

  it('handles invalid JSON in localStorage', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useCustomFoods());

    expect(consoleSpy).toHaveBeenCalledWith('Failed to parse custom foods from localStorage:', expect.any(SyntaxError));
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('customFoods');
    expect(result.current.customFoods).toEqual([]);

    consoleSpy.mockRestore();
  });

  it('saves custom foods to localStorage when they change', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCustomFoods());

    const newFood: CustomFood = { id: '1', name: 'New Food', calories: 200, protein: 20, carbs: 30, fat: 10 };

    act(() => {
      result.current.addCustomFood(newFood);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('customFoods', JSON.stringify([newFood]));
  });

  it('adds a custom food', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCustomFoods());

    const newFood: CustomFood = { id: '1', name: 'New Food', calories: 200, protein: 20, carbs: 30, fat: 10 };

    act(() => {
      result.current.addCustomFood(newFood);
    });

    expect(result.current.customFoods).toEqual([newFood]);
  });

  it('allows setting custom foods directly', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCustomFoods());

    const foods: CustomFood[] = [
      { id: '1', name: 'Food 1', calories: 100, protein: 10, carbs: 20, fat: 5 },
      { id: '2', name: 'Food 2', calories: 150, protein: 15, carbs: 25, fat: 7 },
    ];

    act(() => {
      result.current.setCustomFoods(foods);
    });

    expect(result.current.customFoods).toEqual(foods);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('customFoods', JSON.stringify(foods));
  });
});
