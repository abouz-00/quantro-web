import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionButtons } from '../ActionButtons'
import { FoodEntry } from '../../../types/food'

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  [key: string]: unknown;
}

// Mock the Button component
jest.mock('../../ui/button', () => ({
  Button: ({ children, onClick, ...props }: ButtonProps) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )
}))

describe('ActionButtons Component', () => {
  const mockFoodEntry: FoodEntry = {
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

  const defaultProps = {
    onAddFood: jest.fn(),
    clipboardEntries: [],
    filteredEntries: [mockFoodEntry],
    selectedEntries: [],
    onCopyCurrentDay: jest.fn(),
    onCopySelectedItems: jest.fn(),
    onPasteEntries: jest.fn(),
    onDeleteSelected: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders Add Food button', () => {
    render(<ActionButtons {...defaultProps} />)
    
    expect(screen.getByText('Add Food')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add food/i })).toBeInTheDocument()
  })

  it('calls onAddFood when Add Food button is clicked', async () => {
    const user = userEvent.setup()
    render(<ActionButtons {...defaultProps} />)
    
    const addButton = screen.getByText('Add Food')
    await user.click(addButton)
    
    expect(defaultProps.onAddFood).toHaveBeenCalledTimes(1)
  })

  it('shows clipboard indicator when items are copied', () => {
    const propsWithClipboard = {
      ...defaultProps,
      clipboardEntries: [mockFoodEntry, mockFoodEntry]
    }
    
    render(<ActionButtons {...propsWithClipboard} />)
    
    expect(screen.getByText('📋 2 copied')).toBeInTheDocument()
  })

  it('does not show clipboard indicator when no items are copied', () => {
    render(<ActionButtons {...defaultProps} />)
    
    expect(screen.queryByText(/copied/)).not.toBeInTheDocument()
  })

  it('opens menu when dots button is clicked', async () => {
    const user = userEvent.setup()
    render(<ActionButtons {...defaultProps} />)
    
    const menuButton = screen.getByRole('button', { name: '' }) // HiDotsHorizontal button
    await user.click(menuButton)
    
    expect(screen.getByText('Copy Current Day')).toBeInTheDocument()
    expect(screen.getByText('Copy Selected Items')).toBeInTheDocument()
    expect(screen.getByText('Paste')).toBeInTheDocument()
    expect(screen.getByText('Delete Selected')).toBeInTheDocument()
  })

  it('calls onCopyCurrentDay when Copy Current Day is clicked', async () => {
    const user = userEvent.setup()
    render(<ActionButtons {...defaultProps} />)
    
    // Open menu
    const menuButton = screen.getByRole('button', { name: '' })
    await user.click(menuButton)
    
    // Click Copy Current Day
    const copyDayButton = screen.getByText('Copy Current Day')
    await user.click(copyDayButton)
    
    expect(defaultProps.onCopyCurrentDay).toHaveBeenCalledTimes(1)
  })

  it('disables Copy Current Day when no entries exist', async () => {
    const user = userEvent.setup()
    const propsWithNoEntries = {
      ...defaultProps,
      filteredEntries: []
    }
    
    render(<ActionButtons {...propsWithNoEntries} />)
    
    const menuButton = screen.getByRole('button', { name: '' })
    await user.click(menuButton)
    
    const copyDayButton = screen.getByText('Copy Current Day')
    expect(copyDayButton).toBeDisabled()
  })

  it('calls onCopySelectedItems when Copy Selected Items is clicked', async () => {
    const user = userEvent.setup()
    const propsWithSelected = {
      ...defaultProps,
      selectedEntries: ['test-1']
    }
    
    render(<ActionButtons {...propsWithSelected} />)
    
    const menuButton = screen.getByRole('button', { name: '' })
    await user.click(menuButton)
    
    const copySelectedButton = screen.getByText('Copy Selected Items')
    await user.click(copySelectedButton)
    
    expect(defaultProps.onCopySelectedItems).toHaveBeenCalledTimes(1)
  })

  it('disables Copy Selected Items when no items are selected', async () => {
    const user = userEvent.setup()
    render(<ActionButtons {...defaultProps} />)
    
    const menuButton = screen.getByRole('button', { name: '' })
    await user.click(menuButton)
    
    const copySelectedButton = screen.getByText('Copy Selected Items')
    expect(copySelectedButton).toBeDisabled()
  })

  it('calls onPasteEntries when Paste is clicked', async () => {
    const user = userEvent.setup()
    const propsWithClipboard = {
      ...defaultProps,
      clipboardEntries: [mockFoodEntry]
    }
    
    render(<ActionButtons {...propsWithClipboard} />)
    
    const menuButton = screen.getByRole('button', { name: '' })
    await user.click(menuButton)
    
    const pasteButton = screen.getByText('Paste (1 items)')
    await user.click(pasteButton)
    
    expect(defaultProps.onPasteEntries).toHaveBeenCalledTimes(1)
  })

  it('disables Paste when clipboard is empty', async () => {
    const user = userEvent.setup()
    render(<ActionButtons {...defaultProps} />)
    
    const menuButton = screen.getByRole('button', { name: '' })
    await user.click(menuButton)
    
    const pasteButton = screen.getByText('Paste')
    expect(pasteButton).toBeDisabled()
  })

  it('shows item count in paste button when clipboard has items', async () => {
    const user = userEvent.setup()
    const propsWithClipboard = {
      ...defaultProps,
      clipboardEntries: [mockFoodEntry, mockFoodEntry, mockFoodEntry]
    }
    
    render(<ActionButtons {...propsWithClipboard} />)
    
    const menuButton = screen.getByRole('button', { name: '' })
    await user.click(menuButton)
    
    expect(screen.getByText('Paste (3 items)')).toBeInTheDocument()
  })

  it('calls onDeleteSelected when Delete Selected is clicked', async () => {
    const user = userEvent.setup()
    render(<ActionButtons {...defaultProps} />)
    
    const menuButton = screen.getByRole('button', { name: '' })
    await user.click(menuButton)
    
    const deleteButton = screen.getByText('Delete Selected')
    await user.click(deleteButton)
    
    expect(defaultProps.onDeleteSelected).toHaveBeenCalledTimes(1)
  })

  it('applies correct styling to disabled buttons', async () => {
    const user = userEvent.setup()
    render(<ActionButtons {...defaultProps} />)
    
    const menuButton = screen.getByRole('button', { name: '' })
    await user.click(menuButton)
    
    const copySelectedButton = screen.getByText('Copy Selected Items')
    expect(copySelectedButton).toHaveClass('opacity-50', 'cursor-not-allowed')
    
    const pasteButton = screen.getByText('Paste')
    expect(pasteButton).toHaveClass('opacity-50', 'cursor-not-allowed')
  })
})
