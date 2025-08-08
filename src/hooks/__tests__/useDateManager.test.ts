import { renderHook, act } from '@testing-library/react'
import { useDateManager } from '../useDateManager'

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

    // Should ignore localStorage and use today
    expect(result.current.selectedDate).toEqual(mockDate)
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
})
