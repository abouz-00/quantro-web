"use client";

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import FoodLogControls from '../FoodLogControls';
import { FoodEntry, Nutrients, ContextMenuState } from '../../../types/food';

// Test data setup
const mockFoodEntry: FoodEntry = {
  id: '1',
  description: 'Test Food',
  calories: 100,
  protein: 10,
  carbs: 20,
  fat: 5,
  date: '2023-06-15T00:00:00.000Z',
  amount: '1',
  unit: 'serving',
  mealType: 'breakfast',
};

const mockContextMenu: ContextMenuState = {
  visible: true,
  x: 100,
  y: 200,
  targetEntryId: '1',
};

const mockTargetInput: Nutrients = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 67,
};

const defaultProps = {
  onAddFood: jest.fn(),
  clipboardEntries: [],
  filteredEntries: [mockFoodEntry],
  selectedEntries: [],
  onCopyPreviousDay: jest.fn(),
  onCopyCurrentDay: jest.fn(),
  onCopySelectedItems: jest.fn(),
  onPasteEntries: jest.fn(),
  onDeleteSelected: jest.fn(),
  onCopyToToday: jest.fn(),
  isToday: false,
  isModalOpen: false,
  setIsModalOpen: jest.fn(),
  isTargetsModalOpen: false,
  setIsTargetsModalOpen: jest.fn(),
  editModalEntry: null,
  setEditModalEntry: jest.fn(),
  selectedDate: new Date('2023-06-15'),
  addFoodEntry: jest.fn(() => Promise.resolve()),
  updateFoodEntry: jest.fn(() => Promise.resolve()),
  foodData: [mockFoodEntry],
  contextMenu: mockContextMenu,
  onEditEntry: jest.fn(),
  onCopyEntries: jest.fn(),
  onDeleteSelectedEntries: jest.fn(),
  showCopyToast: false,
  targetInput: mockTargetInput,
  onInputChange: jest.fn(),
  onSaveTargets: jest.fn(),
};

describe('FoodLogControls - Integration Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      expect(() => {
        render(<FoodLogControls {...defaultProps} />);
      }).not.toThrow();
    });

    it('renders Add Food button', () => {
      render(<FoodLogControls {...defaultProps} />);
      expect(screen.getByText('Add Food')).toBeInTheDocument();
    });

    it('renders ContextMenu when visible', () => {
      render(<FoodLogControls {...defaultProps} />);
      expect(screen.getByText('View/Edit Food')).toBeInTheDocument();
    });

    it('does not render CopyToast by default', () => {
      render(<FoodLogControls {...defaultProps} />);
      expect(screen.queryByText(/Copied/)).not.toBeInTheDocument();
    });
  });

  describe('Modal Management', () => {
    it('renders FoodSearchModal when isModalOpen is true', () => {
      render(<FoodLogControls {...defaultProps} isModalOpen={true} />);
      expect(screen.getByText('Add Food', { selector: 'h2' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search all foods')).toBeInTheDocument();
    });

    it('does not render FoodSearchModal when isModalOpen is false', () => {
      render(<FoodLogControls {...defaultProps} isModalOpen={false} />);
      // FoodSearchModal should not be rendered
      expect(screen.queryByText('Search all foods')).not.toBeInTheDocument();
    });

    it('renders TargetsModal when isTargetsModalOpen is true', () => {
      render(<FoodLogControls {...defaultProps} isTargetsModalOpen={true} />);
      expect(screen.getByText('Set Custom Targets')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders modals with proper ARIA attributes', () => {
      render(<FoodLogControls {...defaultProps} isModalOpen={true} />);
      const searchInput = screen.getByLabelText('Search all foods');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('renders form inputs with proper labels', () => {
      render(<FoodLogControls {...defaultProps} isTargetsModalOpen={true} />);
      expect(screen.getByText('Calories')).toBeInTheDocument();
      expect(screen.getByText('Protein (g)')).toBeInTheDocument();
      expect(screen.getByText('Carbs (g)')).toBeInTheDocument();
      expect(screen.getByText('Fat (g)')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles modal close actions', () => {
      const mockSetIsModalOpen = jest.fn();
      const mockSetIsTargetsModalOpen = jest.fn();
      const mockSetEditModalEntry = jest.fn();

      render(
        <FoodLogControls
          {...defaultProps}
          isModalOpen={true}
          setIsModalOpen={mockSetIsModalOpen}
          isTargetsModalOpen={true}
          setIsTargetsModalOpen={mockSetIsTargetsModalOpen}
          editModalEntry={mockFoodEntry}
          setEditModalEntry={mockSetEditModalEntry}
        />
      );

      // Close buttons should exist
      const closeButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('×') || button.textContent?.includes('Close')
      );
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('handles ActionButtons interactions', () => {
      const mockOnAddFood = jest.fn();

      render(
        <FoodLogControls
          {...defaultProps}
          onAddFood={mockOnAddFood}
        />
      );

      const addButton = screen.getByText('Add Food');
      fireEvent.click(addButton);

      expect(mockOnAddFood).toHaveBeenCalled();
    });

    it('handles ContextMenu interactions', () => {
      const mockOnEditEntry = jest.fn();

      render(
        <FoodLogControls
          {...defaultProps}
          onEditEntry={mockOnEditEntry}
        />
      );

      const editButton = screen.getByText('View/Edit Food');
      fireEvent.click(editButton);

      expect(mockOnEditEntry).toHaveBeenCalled();
    });
  });

  describe('State Indicators', () => {
    it('renders CopyToast with correct item count', () => {
      const clipboardEntries = [mockFoodEntry, mockFoodEntry];
      render(
        <FoodLogControls
          {...defaultProps}
          showCopyToast={true}
          clipboardEntries={clipboardEntries}
        />
      );
      expect(screen.getByText('Copied 2 items to clipboard')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty clipboard gracefully', () => {
      render(<FoodLogControls {...defaultProps} clipboardEntries={[]} />);
      // Should not crash and should render normally
      expect(screen.getByText('Add Food')).toBeInTheDocument();
    });

    it('handles empty filteredEntries gracefully', () => {
      render(<FoodLogControls {...defaultProps} filteredEntries={[]} />);
      // Should not crash and should render normally
      expect(screen.getByText('Add Food')).toBeInTheDocument();
    });

    it('handles null editModalEntry gracefully', () => {
      render(<FoodLogControls {...defaultProps} editModalEntry={null} />);
      expect(screen.queryByText('Edit Food')).not.toBeInTheDocument();
    });

    it('handles hidden context menu gracefully', () => {
      const hiddenContextMenu: ContextMenuState = {
        visible: false,
        x: 0,
        y: 0,
        targetEntryId: null,
      };

      render(<FoodLogControls {...defaultProps} contextMenu={hiddenContextMenu} />);
      expect(screen.queryByText('View/Edit Food')).not.toBeInTheDocument();
    });
  });

  describe('Integration Scenarios', () => {
    it('handles complete add food flow', () => {
      const mockOnAddFood = jest.fn();
      const mockAddFoodEntry = jest.fn(() => Promise.resolve());

      render(
        <FoodLogControls
          {...defaultProps}
          isModalOpen={true}
          onAddFood={mockOnAddFood}
          addFoodEntry={mockAddFoodEntry}
        />
      );

      // Click add food button (the one that's a button, not the h2)
      const addButtons = screen.getAllByText('Add Food');
      const addButton = addButtons.find(button => button.tagName === 'BUTTON');
      expect(addButton).toBeInTheDocument();
      fireEvent.click(addButton!);
      expect(mockOnAddFood).toHaveBeenCalled();
    });

    it('handles targets modal interaction', () => {
      const mockOnInputChange = jest.fn();
      const mockOnSaveTargets = jest.fn();

      render(
        <FoodLogControls
          {...defaultProps}
          isTargetsModalOpen={true}
          onInputChange={mockOnInputChange}
          onSaveTargets={mockOnSaveTargets}
        />
      );

      // Find the calories input by its label
      const caloriesLabel = screen.getByText('Calories');
      const caloriesInput = caloriesLabel.nextElementSibling as HTMLInputElement;
      expect(caloriesInput).toBeInTheDocument();

      fireEvent.change(caloriesInput, { target: { value: '2500' } });
      expect(mockOnInputChange).toHaveBeenCalledWith('calories', 2500);

      const saveButton = screen.getByText('Save Targets');
      fireEvent.click(saveButton);
      expect(mockOnSaveTargets).toHaveBeenCalled();
    });
  });
});
