import { useState, useEffect } from "react";

interface CustomFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export function useCustomFoods() {
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('customFoods');
    if (saved) setCustomFoods(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem('customFoods', JSON.stringify(customFoods));
  }, [customFoods]);
  const addCustomFood = (food: CustomFood) => setCustomFoods(prev => [...prev, food]);
  return { customFoods, addCustomFood, setCustomFoods };
}
