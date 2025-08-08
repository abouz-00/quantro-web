import { renderHook, act } from '@testing-library/react'
import { useGoals } from '../useGoals'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })
  jest.clearAllMocks()
})

describe('useGoals Hook', () => {
  it('initializes with default goals', () => {
    const { result } = renderHook(() => useGoals())
    
    expect(result.current.customGoals).toEqual({
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 70
    })
    
    expect(result.current.targetInput).toEqual({
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 70
    })
  })

  it('loads goals from localStorage when available', () => {
    const savedGoals = {
      calories: 2500,
      protein: 180,
      carbs: 250,
      fat: 80
    }
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedGoals))
    
    const { result } = renderHook(() => useGoals())
    
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('customGoals')
    expect(result.current.customGoals).toEqual(savedGoals)
    expect(result.current.targetInput).toEqual(savedGoals)
  })

  it('handles invalid localStorage data gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json')
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
    
    const { result } = renderHook(() => useGoals())
    
    // Should use default goals when JSON parsing fails
    expect(result.current.customGoals).toEqual({
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 70
    })
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to parse saved goals from localStorage:', 
      expect.any(Error)
    )
    
    consoleSpy.mockRestore()
  })

  it('updates target input using handleInputChange', () => {
    const { result } = renderHook(() => useGoals())
    
    act(() => {
      result.current.handleInputChange('calories', 2500)
    })
    
    expect(result.current.targetInput.calories).toBe(2500)
    
    act(() => {
      result.current.handleInputChange('protein', 200)
    })
    
    expect(result.current.targetInput.protein).toBe(200)
  })

  it('saves goals using handleSaveTargets', () => {
    const { result } = renderHook(() => useGoals())
    
    // Update target input
    act(() => {
      result.current.handleInputChange('calories', 2800)
      result.current.handleInputChange('protein', 180)
    })
    
    // Save the goals
    act(() => {
      result.current.handleSaveTargets()
    })
    
    expect(result.current.customGoals.calories).toBe(2800)
    expect(result.current.customGoals.protein).toBe(180)
  })

  it('saves to localStorage when goals are updated', async () => {
    const { result } = renderHook(() => useGoals())
    
    // Wait for initial load to complete
    await act(async () => {
      // Update input first
      result.current.handleInputChange('calories', 2600)
    })
    
    // Then save the goals in a separate act
    await act(async () => {
      result.current.handleSaveTargets()
    })

    // Wait a bit for the useEffect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // Check that localStorage.setItem was called with the updated goals
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'customGoals', 
      expect.stringContaining('2600')
    )
  })

  it('handles different input value types', () => {
    const { result } = renderHook(() => useGoals())
    
    // Test with zero
    act(() => {
      result.current.handleInputChange('calories', 0)
    })
    
    expect(result.current.targetInput.calories).toBe(0)
    
    // Test with decimal
    act(() => {
      result.current.handleInputChange('fat', 75.5)
    })
    
    expect(result.current.targetInput.fat).toBe(75.5)
  })

  it('maintains goal state consistency', () => {
    const { result } = renderHook(() => useGoals())
    
    const initialGoals = result.current.customGoals
    
    // Update target input but don't save
    act(() => {
      result.current.handleInputChange('calories', 9999)
    })
    
    // Custom goals should remain unchanged
    expect(result.current.customGoals).toEqual(initialGoals)
    expect(result.current.targetInput.calories).toBe(9999)
    
    // After saving, both should match
    act(() => {
      result.current.handleSaveTargets()
    })
    
    expect(result.current.customGoals.calories).toBe(9999)
    expect(result.current.targetInput.calories).toBe(9999)
  })
})
