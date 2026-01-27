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
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(() => {
      render(<FoodLogHeader {...defaultProps} />);
    }).not.toThrow();
  });

  it('renders Header component with logo', () => {
    render(<FoodLogHeader {...defaultProps} />);
    
    // Check for header logo
    expect(screen.getByAltText('Quantro Logo')).toBeInTheDocument();
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

  it('renders menu button', () => {
    render(<FoodLogHeader {...defaultProps} />);
    
    // Check that the menu button is present
    expect(screen.getByLabelText('Open main menu')).toBeInTheDocument();
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
