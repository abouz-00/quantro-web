import { renderHook, act, waitFor } from '@testing-library/react'
import { useGoals } from '../useGoals'

// Mock apiClient
const mockGet = jest.fn()
const mockPut = jest.fn()
jest.mock('../../lib/apiClient', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    put: (...args: unknown[]) => mockPut(...args),
  },
}))

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
  // Reset localStorage mock to return null by default
  mockLocalStorage.getItem.mockReturnValue(null)
  // Default API response: fail (so tests fall back to localStorage by default)
  mockGet.mockRejectedValue(new Error('Network error'))
  mockPut.mockResolvedValue({})
})

describe('useGoals Hook', () => {
  it('initializes with default goals', async () => {
    const { result } = renderHook(() => useGoals())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

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

  it('loads goals from API when available', async () => {
    const apiGoals = {
      dailyCalorieGoal: 2500,
      dailyProteinGoal: 180,
      dailyCarbGoal: 250,
      dailyFatGoal: 80,
      goalsUpdatedAt: '2026-01-01T00:00:00Z',
      firstLoggedAt: null,
    }
    mockGet.mockResolvedValue(apiGoals)

    const { result } = renderHook(() => useGoals())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.customGoals).toEqual({
      calories: 2500,
      protein: 180,
      carbs: 250,
      fat: 80,
    })
    expect(result.current.hasCustomGoals).toBe(true)
  })

  it('falls back to localStorage when API fails', async () => {
    const savedGoals = {
      calories: 2500,
      protein: 180,
      carbs: 250,
      fat: 80
    }
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedGoals))
    mockGet.mockRejectedValue(new Error('Network error'))
    
    const { result } = renderHook(() => useGoals())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.customGoals).toEqual(savedGoals)
    expect(result.current.targetInput).toEqual(savedGoals)
  })

  it('handles invalid localStorage data gracefully on API failure', async () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json')
    mockGet.mockRejectedValue(new Error('Network error'))
    
    const { result } = renderHook(() => useGoals())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Should use default goals when JSON parsing fails
    expect(result.current.customGoals).toEqual({
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 70
    })
  })

  it('updates target input using handleInputChange', async () => {
    const { result } = renderHook(() => useGoals())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.handleInputChange('calories', 2500)
    })
    
    expect(result.current.targetInput.calories).toBe(2500)
    
    act(() => {
      result.current.handleInputChange('protein', 200)
    })
    
    expect(result.current.targetInput.protein).toBe(200)
  })

  it('saves goals using handleSaveTargets', async () => {
    const { result } = renderHook(() => useGoals())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Update target input
    act(() => {
      result.current.handleInputChange('calories', 2800)
      result.current.handleInputChange('protein', 180)
    })
    
    // Save the goals
    await act(async () => {
      result.current.handleSaveTargets()
    })
    
    expect(result.current.customGoals.calories).toBe(2800)
    expect(result.current.customGoals.protein).toBe(180)
  })

  it('saves to localStorage and API when goals are updated', async () => {
    mockPut.mockResolvedValue({})

    const { result } = renderHook(() => useGoals())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      result.current.handleInputChange('calories', 2600)
    })
    
    await act(async () => {
      await result.current.handleSaveTargets()
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'customGoals', 
      expect.stringContaining('2600')
    )

    expect(mockPut).toHaveBeenCalledWith('/user/profile', {
      dailyCalorieGoal: 2600,
      dailyProteinGoal: 150,
      dailyCarbGoal: 200,
      dailyFatGoal: 70,
    })
  })

  it('handles different input value types', async () => {
    const { result } = renderHook(() => useGoals())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

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

  it('maintains goal state consistency', async () => {
    const { result } = renderHook(() => useGoals())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const initialGoals = result.current.customGoals
    
    // Update target input but don't save
    act(() => {
      result.current.handleInputChange('calories', 9999)
    })
    
    // Custom goals should remain unchanged
    expect(result.current.customGoals).toEqual(initialGoals)
    expect(result.current.targetInput.calories).toBe(9999)
    
    // After saving, both should match
    await act(async () => {
      result.current.handleSaveTargets()
    })
    
    expect(result.current.customGoals.calories).toBe(9999)
    expect(result.current.targetInput.calories).toBe(9999)
  })

  it('reports hasEverLogged from API', async () => {
    mockGet.mockResolvedValue({
      dailyCalorieGoal: 2000,
      dailyProteinGoal: 150,
      dailyCarbGoal: 200,
      dailyFatGoal: 70,
      goalsUpdatedAt: null,
      firstLoggedAt: '2026-03-15T12:00:00Z',
    })

    const { result } = renderHook(() => useGoals())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hasEverLogged).toBe(true)
    expect(result.current.hasCustomGoals).toBe(false)
  })
})
