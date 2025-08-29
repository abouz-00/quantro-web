export interface CustomFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface CustomFoodFormData {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}
