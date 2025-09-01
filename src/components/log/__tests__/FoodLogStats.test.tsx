"use client";

import React from 'react';
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import { FoodEntry, Nutrients } from '../../../types/food';

import FoodLogStats from '../FoodLogStats';

describe('FoodLogStats', () => {
  const mockTotals: Nutrients = {
    calories: 1500,
    protein: 75,
    carbs: 200,
    fat: 50,
  };

  const mockGoals: Nutrients = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67,
  };

  const mockEntries: FoodEntry[] = [
    {
      id: '1',
      description: 'Test Food 1',
      calories: 500,
      protein: 25,
      carbs: 60,
      fat: 15,
      date: '2023-06-15T00:00:00.000Z',
      amount: '1',
      unit: 'serving',
      mealType: 'breakfast',
    },
    {
      id: '2',
      description: 'Test Food 2',
      calories: 300,
      protein: 15,
      carbs: 40,
      fat: 10,
      date: '2023-06-15T00:00:00.000Z',
      amount: '1',
      unit: 'serving',
      mealType: 'lunch',
    },
  ];

  const defaultProps = {
    displayTotals: mockTotals,
    customGoals: mockGoals,
    selectedEntries: [],
    filteredEntries: mockEntries,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(() => {
      render(<FoodLogStats {...defaultProps} />);
    }).not.toThrow();
  });

  it('renders EnergySummary and MicronutrientsSection', () => {
    render(<FoodLogStats {...defaultProps} />);
    
    expect(screen.getByText('Daily Summary')).toBeInTheDocument();
    expect(screen.getByText('Micronutrients')).toBeInTheDocument();
  });

  it('renders with default props', () => {
    render(<FoodLogStats {...defaultProps} />);
    
    expect(screen.getByText('Daily Summary')).toBeInTheDocument();
    expect(screen.getByText('Micronutrients')).toBeInTheDocument();
  });

  it('displays macronutrient values correctly', () => {
    render(<FoodLogStats {...defaultProps} />);
    
    // Check that macronutrient values are displayed
    expect(screen.getByText('1500')).toBeInTheDocument(); // calories
    expect(screen.getByText('75')).toBeInTheDocument(); // protein
    expect(screen.getByText('200')).toBeInTheDocument(); // carbs
    expect(screen.getByText('50')).toBeInTheDocument(); // fat
  });

  it('shows selected entries count when entries are selected', () => {
    const selectedIds = ['1'];
    
    render(
      <FoodLogStats 
        {...defaultProps} 
        selectedEntries={selectedIds}
      />
    );
    
    expect(screen.getByText('Selected Entry (1)')).toBeInTheDocument();
  });

  it('shows multiple selected entries count', () => {
    const selectedIds = ['1', '2'];
    
    render(
      <FoodLogStats 
        {...defaultProps} 
        selectedEntries={selectedIds}
      />
    );
    
    expect(screen.getByText('Selected Entries (2)')).toBeInTheDocument();
  });

  it('handles empty filteredEntries array', () => {
    render(
      <FoodLogStats 
        {...defaultProps} 
        filteredEntries={[]}
      />
    );
    
    expect(screen.getByText('Daily Summary')).toBeInTheDocument();
    expect(screen.getByText('Micronutrients')).toBeInTheDocument();
  });
});
