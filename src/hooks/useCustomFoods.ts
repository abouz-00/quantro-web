import { useState, useEffect, useCallback } from "react";
import { CustomFood } from "../components/food-log/search/components/custom-tab/types";

export function useCustomFoods() {
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('customFoods');
    if (saved) {
      try {
        setCustomFoods(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse custom foods from localStorage:', error);
        localStorage.removeItem('customFoods');
      }
    }
  }, []);
  
  // Save to localStorage whenever customFoods changes
  useEffect(() => {
    localStorage.setItem('customFoods', JSON.stringify(customFoods));
  }, [customFoods]);
  
  const addCustomFood = useCallback((food: CustomFood) => {
    setCustomFoods(prev => {
      const newFoods = [...prev, food];
      return newFoods;
    });
  }, []);
  
  return { customFoods, addCustomFood, setCustomFoods };
}
