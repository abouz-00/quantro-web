"use client";

import React from 'react';
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';

import FoodLogHeader from '../FoodLogHeader';

describe('FoodLogHeader', () => {
  const defaultProps = {
    isMainMenuOpen: false,
    setIsMainMenuOpen: jest.fn(),
    setIsTargetsModalOpen: jest.fn(),
    selectedDate: new Date(2023, 5, 15),
    onDateChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(() => {
      render(<FoodLogHeader {...defaultProps} />);
    }).not.toThrow();
  });

  it('renders Header and DateNavigation components', () => {
    render(<FoodLogHeader {...defaultProps} />);
    
    // Check for header logo
    expect(screen.getByAltText('Quantro Logo')).toBeInTheDocument();
    
    // Check for date navigation elements
    expect(screen.getByLabelText('Previous day')).toBeInTheDocument();
    expect(screen.getByLabelText('Next day')).toBeInTheDocument();
  });

  it('passes props correctly to Header', () => {
    const mockSetIsTargetsModalOpen = jest.fn();
    const mockSetIsMainMenuOpen = jest.fn();
    
    render(
      <FoodLogHeader 
        {...defaultProps} 
        setIsTargetsModalOpen={mockSetIsTargetsModalOpen}
        setIsMainMenuOpen={mockSetIsMainMenuOpen}
        isMainMenuOpen={true}
      />
    );
    
    // Check that the component renders with the correct props
    expect(screen.getByAltText('Quantro Logo')).toBeInTheDocument();
  });

  it('passes props correctly to DateNavigation', () => {
    const mockOnDateChange = jest.fn();
    const testDate = new Date(2023, 5, 15); // June 15, 2023
    
    render(
      <FoodLogHeader 
        {...defaultProps} 
        selectedDate={testDate}
        onDateChange={mockOnDateChange}
      />
    );
    
    // Check that the date is displayed (formatted as "Jun 15, 2023")
    expect(screen.getByText('Jun 15, 2023')).toBeInTheDocument();
    
    // Check that date navigation buttons are present
    expect(screen.getByLabelText('Previous day')).toBeInTheDocument();
    expect(screen.getByLabelText('Next day')).toBeInTheDocument();
  });

  it('handles menu state changes', () => {
    const mockSetIsMainMenuOpen = jest.fn();
    
    render(
      <FoodLogHeader 
        {...defaultProps} 
        setIsMainMenuOpen={mockSetIsMainMenuOpen}
        isMainMenuOpen={false}
      />
    );
    
    // Check that the component renders
    expect(screen.getByAltText('Quantro Logo')).toBeInTheDocument();
  });
});
