import { useState, useEffect, useCallback } from 'react';
import { Nutrients } from '../types/food';

const DEFAULT_GOALS: Nutrients = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 70,
};

export const useGoals = () => {
  const [customGoals, setCustomGoals] = useState<Nutrients>(DEFAULT_GOALS);
  const [targetInput, setTargetInput] = useState<Nutrients>(DEFAULT_GOALS);
  const [goalsLoaded, setGoalsLoaded] = useState(false);

  // Load goals on component mount
  useEffect(() => {
    const loadGoals = () => {
      const savedGoals = localStorage.getItem('customGoals');
      if (savedGoals) {
        try {
          const parsedGoals = JSON.parse(savedGoals);
          setCustomGoals(parsedGoals);
          setTargetInput(parsedGoals);
        } catch (error) {
          console.warn('Failed to parse saved goals from localStorage:', error);
          // Use default goals if parsing fails
        }
      }
      setGoalsLoaded(true);
    };

    loadGoals();
  }, []);

  // Save goals to localStorage when they change (but skip initial load)
  useEffect(() => {
    if (goalsLoaded) {
      localStorage.setItem('customGoals', JSON.stringify(customGoals));
    }
  }, [customGoals, goalsLoaded]);

  const handleInputChange = useCallback((field: keyof Nutrients, value: number) => {
    setTargetInput(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveTargets = useCallback(() => {
    setCustomGoals({ ...targetInput });
  }, [targetInput]);

  return {
    customGoals,
    targetInput,
    handleInputChange,
    handleSaveTargets
  };
};
