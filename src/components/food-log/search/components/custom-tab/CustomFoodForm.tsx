import React from 'react';
import { CustomFoodFormData } from './types';

interface CustomFoodFormProps {
  formData: CustomFoodFormData;
  onFormDataChange: (field: keyof CustomFoodFormData, value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  getFieldError?: (field: string) => string | undefined;
  hasFieldError?: (field: string) => boolean;
}

export const CustomFoodForm: React.FC<CustomFoodFormProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  isLoading = false,
  getFieldError,
  hasFieldError,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formData.name.trim()) {
      onSubmit();
    }
  };

  // Helper function to get error class for input fields
  const getInputErrorClass = (field: string) => {
    const hasError = hasFieldError && hasFieldError(field);
    return hasError 
      ? 'w-full p-2 border rounded-sm border-red-500 bg-red-50'
      : 'w-full p-2 border rounded-sm border-gray-300';
  };

  // Helper function to get number input error class
  const getNumberInputErrorClass = (field: string) => {
    const hasError = hasFieldError && hasFieldError(field);
    return hasError 
      ? 'w-full p-2 border rounded-sm border-red-500 bg-red-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
      : 'w-full p-2 border rounded-sm border-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';
  };

  return (
    <div className="mb-6">
      <h3 className="font-medium mb-3">Create Custom Food</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Food Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onFormDataChange('name', e.target.value)}
            onKeyDown={handleKeyDown}
            className={getInputErrorClass('name')}
            placeholder="e.g., Homemade Pizza"
            aria-label="Custom food name"
            disabled={isLoading}
          />
          {getFieldError && getFieldError('name') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('name')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Calories (per 100g)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={formData.calories}
            onChange={(e) => onFormDataChange('calories', e.target.value)}
            className={getNumberInputErrorClass('calories')}
            placeholder="0"
            aria-label="Calories per 100g"
            disabled={isLoading}
          />
          {getFieldError && getFieldError('calories') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('calories')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Protein (g)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={formData.protein}
            onChange={(e) => onFormDataChange('protein', e.target.value)}
            className={getNumberInputErrorClass('protein')}
            placeholder="0"
            aria-label="Protein in grams"
            disabled={isLoading}
          />
          {getFieldError && getFieldError('protein') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('protein')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Carbs (g)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={formData.carbs}
            onChange={(e) => onFormDataChange('carbs', e.target.value)}
            className={getNumberInputErrorClass('carbs')}
            placeholder="0"
            aria-label="Carbohydrates in grams"
            disabled={isLoading}
          />
          {getFieldError && getFieldError('carbs') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('carbs')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fat (g)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={formData.fat}
            onChange={(e) => onFormDataChange('fat', e.target.value)}
            className={getNumberInputErrorClass('fat')}
            placeholder="0"
            aria-label="Fat in grams"
            disabled={isLoading}
          />
          {getFieldError && getFieldError('fat') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('fat')}</p>
          )}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="mt-4 w-full bg-violet-500 text-white py-2 px-4 rounded-sm hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding...
          </>
        ) : (
          'Add Custom Food'
        )}
      </button>
    </div>
  );
};
