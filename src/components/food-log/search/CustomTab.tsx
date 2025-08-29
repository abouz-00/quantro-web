import React from "react";
import { 
  CustomFood, 
  CustomFoodFormData,
  CustomFoodForm,
  CustomFoodList,
  ErrorDisplay,
  LoadingState,
  EmptyState
} from './components/custom-tab';
import { useCustomFoodValidation } from './components/custom-tab/hooks/useCustomFoodValidation';

interface CustomTabProps {
  customName: string;
  setCustomName: (v: string) => void;
  customCalories: string;
  setCustomCalories: (v: string) => void;
  customProtein: string;
  setCustomProtein: (v: string) => void;
  customCarbs: string;
  setCustomCarbs: (v: string) => void;
  customFat: string;
  setCustomFat: (v: string) => void;
  handleAddCustomFood: () => void;
  customFoods: CustomFood[];
  handleAddFromCustomList: (food: CustomFood) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function CustomTab({
  customName,
  setCustomName,
  customCalories,
  setCustomCalories,
  customProtein,
  setCustomProtein,
  customCarbs,
  setCustomCarbs,
  customFat,
  setCustomFat,
  handleAddCustomFood,
  customFoods,
  handleAddFromCustomList,
  isLoading = false,
  error = null,
}: CustomTabProps) {
  // Initialize validation hook
  const {
    getFieldError,
    hasFieldError,
    clearFieldError,
    validateAndSetErrors,
  } = useCustomFoodValidation();

  // Prepare form data for the form component
  const formData: CustomFoodFormData = {
    name: customName,
    calories: customCalories,
    protein: customProtein,
    carbs: customCarbs,
    fat: customFat,
  };

  // Handle form data changes with validation clearing
  const handleFormDataChange = (field: keyof CustomFoodFormData, value: string) => {
    // Clear validation error for this field when user starts typing
    clearFieldError(field);
    
    switch (field) {
      case 'name':
        setCustomName(value);
        break;
      case 'calories':
        setCustomCalories(value);
        break;
      case 'protein':
        setCustomProtein(value);
        break;
      case 'carbs':
        setCustomCarbs(value);
        break;
      case 'fat':
        setCustomFat(value);
        break;
    }
  };

  // Handle form submission with validation
  const handleFormSubmit = () => {
    const isValid = validateAndSetErrors(formData);
    if (isValid) {
      handleAddCustomFood();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ErrorDisplay error={error} />
      
      <CustomFoodForm
        formData={formData}
        onFormDataChange={handleFormDataChange}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        getFieldError={getFieldError}
        hasFieldError={hasFieldError}
      />

      <LoadingState isLoading={isLoading} hasCustomFoods={customFoods.length > 0} />
      
      {customFoods.length === 0 && !isLoading && <EmptyState />}
      
      <CustomFoodList
        customFoods={customFoods}
        onAddFromCustomList={handleAddFromCustomList}
        isLoading={isLoading}
      />
    </div>
  );
}
