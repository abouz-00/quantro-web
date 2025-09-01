import { renderHook, act } from '@testing-library/react'
import { useDateManager, dateHelpers } from '../useDateManager'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

describe('useDateManager Hook', () => {
  // Use normalized dates (year, month, date only) to match hook behavior
  const mockDate = new Date(2023, 5, 15) // June 15, 2023 (month is 0-indexed)

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(2023, 5, 15, 12, 0, 0)) // Set to noon for consistency
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with today\'s date by default', () => {
    const { result } = renderHook(() => useDateManager({}))
    
    expect(result.current.selectedDate).toEqual(mockDate)
    expect(result.current.isToday).toBe(true)
  })

  it('initializes with provided initial date', () => {
    const initialDate = new Date(2023, 0, 1) // Jan 1, 2023
    const { result } = renderHook(() => useDateManager({ initialDate }))
    
    expect(result.current.selectedDate).toEqual(initialDate)
    expect(result.current.isToday).toBe(false)
  })

  it('updates selected date correctly', () => {
    const { result } = renderHook(() => useDateManager({ 
      enableLocalStorage: true,
      storageKey: 'test-date' 
    }))
    
    const newDate = new Date(2023, 11, 25) // Dec 25, 2023
    
    act(() => {
      result.current.setSelectedDate(newDate)
    })

    expect(result.current.selectedDate).toEqual(newDate)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'test-date', 
      newDate.toISOString()
    )
  })

  it('navigates to today correctly', () => {
    const { result } = renderHook(() => useDateManager({}))
    
    act(() => {
      result.current.goToToday()
    })
    
    expect(result.current.selectedDate).toEqual(mockDate)
    expect(result.current.isToday).toBe(true)
  })

  it('navigates to previous day correctly', () => {
    const { result } = renderHook(() => useDateManager({}))
    
    act(() => {
      result.current.goToPreviousDay()
    })
    
    const expectedDate = new Date(2023, 5, 14) // June 14, 2023
    expect(result.current.selectedDate).toEqual(expectedDate)
    expect(result.current.isToday).toBe(false)
  })

  it('navigates to next day correctly', () => {
    const { result } = renderHook(() => useDateManager({}))
    
    act(() => {
      result.current.goToNextDay()
    })
    
    const expectedDate = new Date(2023, 5, 16) // June 16, 2023
    expect(result.current.selectedDate).toEqual(expectedDate)
    expect(result.current.isToday).toBe(false)
  })

  it('loads from localStorage when enabled', () => {
    const savedDate = new Date(2023, 10, 11) // Nov 11, 2023
    mockLocalStorage.getItem.mockReturnValue(savedDate.toISOString())
    
    const { result } = renderHook(() => useDateManager({ 
      enableLocalStorage: true,
      storageKey: 'test-date' 
    }))

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-date')
    expect(result.current.selectedDate).toEqual(savedDate)
  })

  it('defaults to today when defaultToTodayOnRefresh is true', () => {
    const savedDate = new Date(2023, 10, 11) // Nov 11, 2023
    mockLocalStorage.getItem.mockReturnValue(savedDate.toISOString())
    
    const { result } = renderHook(() => useDateManager({ 
      enableLocalStorage: true,
      storageKey: 'test-date',
      defaultToTodayOnRefresh: true
    }))

    // Should ignore saved date and use today instead
    expect(result.current.selectedDate.toDateString()).toBe(new Date().toDateString())
  })

  it('handles invalid localStorage date gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-date')
    
    const { result } = renderHook(() => useDateManager({ 
      enableLocalStorage: true,
      storageKey: 'test-date'
    }))

    // Should fallback to today when date is invalid
    expect(result.current.selectedDate.toDateString()).toBe(new Date().toDateString())
  })

  it('works correctly when localStorage is disabled', () => {
    const initialDate = new Date(2023, 5, 15) // June 15, 2023
    
    const { result } = renderHook(() => useDateManager({ 
      initialDate,
      enableLocalStorage: false
    }))

    expect(mockLocalStorage.getItem).not.toHaveBeenCalled()
    expect(result.current.selectedDate).toEqual(initialDate)
  })

  it('handles invalid localStorage data gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-date')
    
    const { result } = renderHook(() => useDateManager({ 
      enableLocalStorage: true,
      storageKey: 'test-date' 
    }))

    // Should fall back to current date when localStorage has invalid data
    expect(result.current.selectedDate).toEqual(mockDate)
  })

  it('calls onDateChange callback when date changes', () => {
    const onDateChange = jest.fn()
    const { result } = renderHook(() => useDateManager({ onDateChange }))
    
    const newDate = new Date(2023, 11, 25) // Dec 25, 2023
    act(() => {
      result.current.setSelectedDate(newDate)
    })
    
    expect(onDateChange).toHaveBeenCalledWith(newDate)
  })

  describe('dateHelpers', () => {
    it('isValidDate returns true for valid dates', () => {
      expect(dateHelpers.isValidDate(new Date())).toBe(true);
    });

    it('isValidDate returns false for invalid dates', () => {
      expect(dateHelpers.isValidDate(new Date('invalid'))).toBe(false);
      expect(dateHelpers.isValidDate('not a date')).toBe(false);
    });

    it('isToday returns true for today', () => {
      expect(dateHelpers.isToday(new Date())).toBe(true);
    });

    it('isToday returns false for other dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(dateHelpers.isToday(yesterday)).toBe(false);
    });

    it('isSameDate returns true for same dates', () => {
      const date1 = new Date(2023, 5, 15);
      const date2 = new Date(2023, 5, 15);
      expect(dateHelpers.isSameDate(date1, date2)).toBe(true);
    });

    it('isSameDate returns false for different dates', () => {
      const date1 = new Date(2023, 5, 15);
      const date2 = new Date(2023, 5, 16);
      expect(dateHelpers.isSameDate(date1, date2)).toBe(false);
    });

    it('formatDisplayDate returns "Today" for today', () => {
      expect(dateHelpers.formatDisplayDate(new Date())).toBe('Today');
    });

    it('formatDisplayDate returns formatted date for other dates', () => {
      const date = new Date(2023, 4, 15); // May 15, 2023 (different from June 15)
      expect(dateHelpers.formatDisplayDate(date)).toBe('May 15, 2023');
    });

    it('formatApiDate returns formatted string', () => {
      const date = new Date(2023, 5, 15);
      expect(dateHelpers.formatApiDate(date)).toBe('2023-06-15');
    });

    it('addDays adds days correctly', () => {
      const date = new Date(2023, 5, 15);
      const result = dateHelpers.addDays(date, 5);
      expect(result.getDate()).toBe(20);
    });

    it('subtractDays subtracts days correctly', () => {
      const date = new Date(2023, 5, 15);
      const result = dateHelpers.subtractDays(date, 5);
      expect(result.getDate()).toBe(10);
    });

    it('getStartOfDay returns start of day', () => {
      const date = new Date(2023, 5, 15, 12, 30);
      const result = dateHelpers.getStartOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });

    it('getEndOfDay returns end of day', () => {
      const date = new Date(2023, 5, 15, 12, 30);
      const result = dateHelpers.getEndOfDay(date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
    });

    it('isWeekend returns true for weekends', () => {
      const saturday = new Date(2023, 5, 17); // Saturday
      const sunday = new Date(2023, 5, 18); // Sunday
      expect(dateHelpers.isWeekend(saturday)).toBe(true);
      expect(dateHelpers.isWeekend(sunday)).toBe(true);
    });

    it('isWeekend returns false for weekdays', () => {
      const monday = new Date(2023, 5, 12); // Monday
      expect(dateHelpers.isWeekend(monday)).toBe(false);
    });
  });
})
