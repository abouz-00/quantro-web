import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContextMenu } from '../ContextMenu'

// Mock food entry for clipboard tests
const mockFoodEntry = {
  id: '1',
  description: 'Test Food',
  amount: '100',
  unit: 'g',
  date: '2023-12-25',
  mealType: 'breakfast' as const,
  calories: 100,
  protein: 5,
  carbs: 20,
  fat: 3,
  fiber: 2
}

// Mock data
const defaultProps = {
  contextMenu: {
    visible: true,
    x: 100,
    y: 150,
    targetEntryId: 'test-1'
  },
  selectedEntries: ['test-1'],
  clipboardEntries: [],
  onEditEntry: jest.fn(),
  onCopyEntries: jest.fn(),
  onPasteEntries: jest.fn(),
  onDeleteSelectedEntries: jest.fn()
}

describe('ContextMenu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not render when not visible', () => {
    const props = { 
      ...defaultProps, 
      contextMenu: { ...defaultProps.contextMenu, visible: false }
    }
    render(<ContextMenu {...props} />)
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders when context menu is visible', () => {
    render(<ContextMenu {...defaultProps} />)
    
    expect(screen.getByText(/View\/Edit Food/)).toBeInTheDocument()
    expect(screen.getByText(/Copy/)).toBeInTheDocument()
    expect(screen.getByText(/Delete/)).toBeInTheDocument()
  })

  it('positions correctly based on provided coordinates', () => {
    const { container } = render(<ContextMenu {...defaultProps} />)
    
    const contextMenu = container.firstChild as HTMLElement
    expect(contextMenu).toHaveStyle({
      left: '100px',
      top: '150px'
    })
  })

  it('calls onEditEntry when Edit is clicked', async () => {
    const user = userEvent.setup()
    render(<ContextMenu {...defaultProps} />)
    
    const editButton = screen.getByText(/View\/Edit Food/)
    await user.click(editButton)
    
    expect(defaultProps.onEditEntry).toHaveBeenCalledTimes(1)
  })

  it('calls onCopyEntries when Copy is clicked', async () => {
    const user = userEvent.setup()
    render(<ContextMenu {...defaultProps} />)
    
    const copyButton = screen.getByText(/Copy/)
    await user.click(copyButton)
    
    expect(defaultProps.onCopyEntries).toHaveBeenCalledTimes(1)
  })

  it('calls onDeleteSelectedEntries when Delete is clicked', async () => {
    const user = userEvent.setup()
    render(<ContextMenu {...defaultProps} />)
    
    const deleteButton = screen.getByText(/Delete/)
    await user.click(deleteButton)
    
    expect(defaultProps.onDeleteSelectedEntries).toHaveBeenCalledTimes(1)
  })

  it('shows paste option when clipboard has entries', () => {
    const propsWithClipboard = {
      ...defaultProps,
      clipboardEntries: [mockFoodEntry]
    }
    
    render(<ContextMenu {...propsWithClipboard} />)
    
    expect(screen.getByText(/Paste/)).toBeInTheDocument()
  })

  it('calls onPasteEntries when Paste is clicked', async () => {
    const user = userEvent.setup()
    const propsWithClipboard = {
      ...defaultProps,
      clipboardEntries: [mockFoodEntry]
    }
    
    render(<ContextMenu {...propsWithClipboard} />)
    
    const pasteButton = screen.getByText(/Paste/)
    await user.click(pasteButton)
    
    expect(defaultProps.onPasteEntries).toHaveBeenCalledTimes(1)
  })

  it('shows correct button count based on clipboard state', () => {
    // Without clipboard entries - includes disabled paste button
    render(<ContextMenu {...defaultProps} />)
    expect(screen.getAllByRole('button')).toHaveLength(4) // Edit, Copy, Paste (disabled), Delete
  })

  it('shows keyboard shortcuts in menu items', () => {
    render(<ContextMenu {...defaultProps} />)
    
    expect(screen.getByText('Ctrl+C')).toBeInTheDocument()
    expect(screen.getByText('Del')).toBeInTheDocument()
  })

  it('disables paste when no clipboard entries', () => {
    render(<ContextMenu {...defaultProps} />)
    
    const pasteButton = screen.getByText(/Paste/).closest('button')
    expect(pasteButton).toBeDisabled()
  })

  it('enables paste when clipboard has entries', () => {
    const propsWithClipboard = {
      ...defaultProps,
      clipboardEntries: [mockFoodEntry]
    }
    
    render(<ContextMenu {...propsWithClipboard} />)
    
    const pasteButton = screen.getByText(/Paste/).closest('button')
    expect(pasteButton).not.toBeDisabled()
  })
})
