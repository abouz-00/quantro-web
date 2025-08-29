import { useState } from 'react';
import { ValidationError, CustomFoodFormData } from '../types';

export const useCustomFoodValidation = () => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const validateInputs = (formData: CustomFoodFormData): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (!formData.name.trim()) {
      errors.push({ field: 'name', message: 'Food name is required' });
    }
    
    const calories = parseFloat(formData.calories);
    if (isNaN(calories) || calories < 0) {
      errors.push({ field: 'calories', message: 'Calories must be a positive number' });
    }
    
    const protein = parseFloat(formData.protein);
    if (isNaN(protein) || protein < 0) {
      errors.push({ field: 'protein', message: 'Protein must be a positive number' });
    }
    
    const carbs = parseFloat(formData.carbs);
    if (isNaN(carbs) || carbs < 0) {
      errors.push({ field: 'carbs', message: 'Carbs must be a positive number' });
    }
    
    const fat = parseFloat(formData.fat);
    if (isNaN(fat) || fat < 0) {
      errors.push({ field: 'fat', message: 'Fat must be a positive number' });
    }
    
    return errors;
  };

  const getFieldError = (field: string): string | undefined => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  const hasFieldError = (field: string): boolean => {
    return validationErrors.some(error => error.field === field);
  };

  const clearFieldError = (field: string) => {
    setValidationErrors(prev => prev.filter(error => error.field !== field));
  };

  const validateAndSetErrors = (formData: CustomFoodFormData): boolean => {
    const errors = validateInputs(formData);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  return {
    validationErrors,
    getFieldError,
    hasFieldError,
    clearFieldError,
    validateAndSetErrors,
  };
};
