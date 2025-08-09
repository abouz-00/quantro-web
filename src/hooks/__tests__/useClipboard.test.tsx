import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useClipboard } from '../useClipboard'
import { FoodEntry } from '../../types/food'

// Test component to use the hook
function TestComponent() {
  const { clipboardEntries, showCopyToast, copyEntries, pasteEntries } = useClipboard()

  const mockEntry: FoodEntry = {
    id: 'test-1',
    description: 'Test Food',
    amount: '100',
    unit: 'g',
    calories: 200,
    protein: 10,
    carbs: 20,
    fat: 5,
    date: new Date().toISOString(),
    mealType: 'breakfast'
  }

  const handlePaste = () => {
    const mockAddFoodEntry = jest.fn()
    pasteEntries(new Date(), mockAddFoodEntry)
  }

  return (
    <div>
      <button onClick={() => copyEntries([mockEntry])}>
        Copy Entries
      </button>
      <button onClick={handlePaste}>
        Paste Entries
      </button>
      {showCopyToast && <div data-testid="toast">Copied entries!</div>}
      <div data-testid="clipboard-count">{clipboardEntries.length}</div>
    </div>
  )
}

describe('useClipboard Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  })

  it('copies food entries and shows toast', async () => {
    const user = userEvent.setup({ delay: null })
    render(<TestComponent />)

    const copyButton = screen.getByText('Copy Entries')
    await act(async () => {
      await user.click(copyButton)
    })

    expect(screen.getByTestId('toast')).toBeInTheDocument()
    expect(screen.getByTestId('clipboard-count')).toHaveTextContent('1')
  })

  it('hides toast after timeout', async () => {
    const user = userEvent.setup({ delay: null })
    render(<TestComponent />)

    const copyButton = screen.getByText('Copy Entries')
    await act(async () => {
      await user.click(copyButton)
    })

    expect(screen.getByTestId('toast')).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    expect(screen.queryByTestId('toast')).not.toBeInTheDocument()
  })

  it('maintains clipboard entries across operations', async () => {
    const user = userEvent.setup({ delay: null })
    render(<TestComponent />)

    const copyButton = screen.getByText('Copy Entries')
    
    await act(async () => {
      await user.click(copyButton)
    })

    expect(screen.getByTestId('clipboard-count')).toHaveTextContent('1')
    
    // Even after toast disappears, entries should remain
    act(() => {
      jest.advanceTimersByTime(2000)
    })

    expect(screen.getByTestId('clipboard-count')).toHaveTextContent('1')
  })
})
