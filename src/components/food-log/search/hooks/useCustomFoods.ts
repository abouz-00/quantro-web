import { useState, useEffect } from "react";

export function useCustomFoods() {
  const [customFoods, setCustomFoods] = useState<any[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('customFoods');
    if (saved) setCustomFoods(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem('customFoods', JSON.stringify(customFoods));
  }, [customFoods]);
  const addCustomFood = (food: any) => setCustomFoods(prev => [...prev, food]);
  return { customFoods, addCustomFood, setCustomFoods };
}
