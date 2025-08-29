import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomTab from '../CustomTab';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  };
});

const mockCustomFood = {
  id: '1',
  name: 'Test Food',
  calories: 100,
  protein: 10,
  carbs: 20,
  fat: 5,
};

const defaultProps = {
  customName: '',
  setCustomName: jest.fn(),
  customCalories: '',
  setCustomCalories: jest.fn(),
  customProtein: '',
  setCustomProtein: jest.fn(),
  customCarbs: '',
  setCustomCarbs: jest.fn(),
  customFat: '',
  setCustomFat: jest.fn(),
  handleAddCustomFood: jest.fn(),
  customFoods: [],
  handleAddFromCustomList: jest.fn(),
};

describe('CustomTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form inputs correctly', () => {
    render(<CustomTab {...defaultProps} />);
    
    expect(screen.getByLabelText(/food name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/calories per 100g/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/protein in grams/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/carbohydrates in grams/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fat in grams/i)).toBeInTheDocument();
  });

  it('displays validation errors for invalid inputs', async () => {
    const user = userEvent.setup();
    render(<CustomTab {...defaultProps} />);
    
    const addButton = screen.getByRole('button', { name: /add custom food/i });
    await user.click(addButton);
    
    expect(screen.getByText('Food name is required')).toBeInTheDocument();
    expect(screen.getByText('Calories must be a positive number')).toBeInTheDocument();
    expect(screen.getByText('Protein must be a positive number')).toBeInTheDocument();
    expect(screen.getByText('Carbs must be a positive number')).toBeInTheDocument();
    expect(screen.getByText('Fat must be a positive number')).toBeInTheDocument();
  });

  it('validates negative numbers', async () => {
    const user = userEvent.setup();
    render(<CustomTab 
      {...defaultProps} 
      customName="Test Food"
      customCalories="-10"
      customProtein="-5"
      customCarbs="-3"
      customFat="-2"
    />);
    
    const addButton = screen.getByRole('button', { name: /add custom food/i });
    await user.click(addButton);
    
    expect(screen.getByText('Calories must be a positive number')).toBeInTheDocument();
    expect(screen.getByText('Protein must be a positive number')).toBeInTheDocument();
    expect(screen.getByText('Carbs must be a positive number')).toBeInTheDocument();
    expect(screen.getByText('Fat must be a positive number')).toBeInTheDocument();
  });

  it('clears validation errors when user starts typing', async () => {
    const user = userEvent.setup();
    const setCustomName = jest.fn();
    
    render(<CustomTab {...defaultProps} setCustomName={setCustomName} />);
    
    const addButton = screen.getByRole('button', { name: /add custom food/i });
    await user.click(addButton);
    
    expect(screen.getByText('Food name is required')).toBeInTheDocument();
    
    const nameInput = screen.getByLabelText(/food name/i);
    await user.type(nameInput, 'T');
    
    expect(setCustomName).toHaveBeenCalledWith('T');
  });

  it('calls handleAddCustomFood when form is valid', async () => {
    const user = userEvent.setup();
    const handleAddCustomFood = jest.fn();
    
    render(<CustomTab 
      {...defaultProps}
      customName="Test Food"
      customCalories="100"
      customProtein="10"
      customCarbs="20"
      customFat="5"
      handleAddCustomFood={handleAddCustomFood}
    />);
    
    const addButton = screen.getByRole('button', { name: /add custom food/i });
    await user.click(addButton);
    
    expect(handleAddCustomFood).toHaveBeenCalled();
  });

  it('handles Enter key on food name input', async () => {
    const user = userEvent.setup();
    const handleAddCustomFood = jest.fn();
    
    render(<CustomTab 
      {...defaultProps}
      customName="Test Food"
      customCalories="100"
      customProtein="10"
      customCarbs="20"
      customFat="5"
      handleAddCustomFood={handleAddCustomFood}
    />);
    
    const nameInput = screen.getByLabelText(/food name/i);
    await user.type(nameInput, '{enter}');
    
    expect(handleAddCustomFood).toHaveBeenCalled();
  });

  it('displays loading state', () => {
    render(<CustomTab {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText('Adding...')).toBeInTheDocument();
    expect(screen.getByText('Loading custom foods...')).toBeInTheDocument();
  });

  it('displays error message', () => {
    const error = 'Failed to add custom food';
    render(<CustomTab {...defaultProps} error={error} />);
    
    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it('displays custom foods list', () => {
    render(<CustomTab {...defaultProps} customFoods={[mockCustomFood]} />);
    
    expect(screen.getByText('Your Custom Foods')).toBeInTheDocument();
    expect(screen.getByText('Test Food')).toBeInTheDocument();
    expect(screen.getByText('100 kcal • 10g protein • 20g carbs • 5g fat')).toBeInTheDocument();
  });

  it('handles clicking on custom food item', async () => {
    const user = userEvent.setup();
    const handleAddFromCustomList = jest.fn();
    
    render(<CustomTab 
      {...defaultProps} 
      customFoods={[mockCustomFood]}
      handleAddFromCustomList={handleAddFromCustomList}
    />);
    
    const foodItem = screen.getByText('Test Food');
    await user.click(foodItem);
    
    expect(handleAddFromCustomList).toHaveBeenCalledWith(mockCustomFood);
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    const handleAddFromCustomList = jest.fn();
    
    render(<CustomTab 
      {...defaultProps} 
      customFoods={[mockCustomFood]}
      handleAddFromCustomList={handleAddFromCustomList}
    />);
    
    const table = screen.getByRole('listbox');
    table.focus();
    
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    
    expect(handleAddFromCustomList).toHaveBeenCalledWith(mockCustomFood);
  });

  it('disables interactions when loading', async () => {
    const user = userEvent.setup();
    const handleAddFromCustomList = jest.fn();
    
    render(<CustomTab 
      {...defaultProps} 
      customFoods={[mockCustomFood]}
      handleAddFromCustomList={handleAddFromCustomList}
      isLoading={true}
    />);
    
    const foodItem = screen.getByText('Test Food');
    await user.click(foodItem);
    
    expect(handleAddFromCustomList).not.toHaveBeenCalled();
  });

  it('removes number input spinners', () => {
    render(<CustomTab {...defaultProps} />);
    
    const caloriesInput = screen.getByLabelText(/calories per 100g/i);
    const proteinInput = screen.getByLabelText(/protein in grams/i);
    const carbsInput = screen.getByLabelText(/carbohydrates in grams/i);
    const fatInput = screen.getByLabelText(/fat in grams/i);
    
    // Check that the spinner-hiding classes are applied
    expect(caloriesInput).toHaveClass('[appearance:textfield]');
    expect(proteinInput).toHaveClass('[appearance:textfield]');
    expect(carbsInput).toHaveClass('[appearance:textfield]');
    expect(fatInput).toHaveClass('[appearance:textfield]');
  });

  it('displays empty state when no custom foods', () => {
    render(<CustomTab {...defaultProps} />);
    
    expect(screen.getByText('No custom foods yet.')).toBeInTheDocument();
    expect(screen.getByText('Create one above to get started!')).toBeInTheDocument();
  });
});
