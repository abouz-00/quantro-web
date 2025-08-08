import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateNavigation } from '../DateNavigation'

// Mock the DatePicker component
jest.mock('../../ui/DatePicker', () => {
  return function MockDatePicker({ selectedDate, onDateChange }: any) {
    return (
      <div data-testid="date-picker">
        <span>Selected: {selectedDate.toISOString().split('T')[0]}</span>
        <button onClick={() => onDateChange(new Date('2023-12-25'))}>
          Change Date
        </button>
      </div>
    )
  }
})

describe('DateNavigation Component', () => {
  const mockOnDateChange = jest.fn()
  const testDate = new Date('2023-01-15')

  const defaultProps = {
    selectedDate: testDate,
    onDateChange: mockOnDateChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the date navigation container', () => {
    render(<DateNavigation {...defaultProps} />)
    
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()
  })

  it('displays the selected date', () => {
    render(<DateNavigation {...defaultProps} />)
    
    expect(screen.getByText('Selected: 2023-01-15')).toBeInTheDocument()
  })

  it('calls onDateChange when date is changed', async () => {
    const user = userEvent.setup()
    render(<DateNavigation {...defaultProps} />)
    
    const changeButton = screen.getByText('Change Date')
    await user.click(changeButton)
    
    expect(mockOnDateChange).toHaveBeenCalledWith(new Date('2023-12-25'))
  })

  it('applies correct styling classes', () => {
    const { container } = render(
      <DateNavigation selectedDate={testDate} onDateChange={mockOnDateChange} />
    )
    
    // Check outer div styling
    const outerDiv = container.firstElementChild
    expect(outerDiv).toHaveClass('flex', 'justify-center', 'mb-8')
    
    // Check inner div styling - the second child div with the background styles
    const innerDiv = outerDiv?.firstElementChild
    expect(innerDiv).toHaveClass('flex', 'items-center', 'space-x-2', 'bg-white', 'rounded-full', 'shadow-lg', 'px-3', 'py-2')
    
    // Check that inner div has the inline styles
    expect(innerDiv).toHaveStyle('background-color: #F8F5F0')
    expect(innerDiv).toHaveStyle('border: 1px solid #EDE6DC')
  })

  it('passes props correctly to DatePicker', () => {
    render(<DateNavigation {...defaultProps} />)
    
    // The mocked DatePicker should receive and display the selectedDate
    expect(screen.getByText('Selected: 2023-01-15')).toBeInTheDocument()
  })
})
