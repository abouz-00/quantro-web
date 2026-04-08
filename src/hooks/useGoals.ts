import { useState, useEffect, useCallback, useRef } from 'react';
import { Nutrients } from '../types/food';
import { apiClient } from '../lib/apiClient';

const DEFAULT_GOALS: Nutrients = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 70,
};

const LOCAL_STORAGE_KEY = 'customGoals';

interface ProfileResponse {
  dailyCalorieGoal: number | null;
  dailyProteinGoal: number | null;
  dailyCarbGoal: number | null;
  dailyFatGoal: number | null;
  goalsUpdatedAt: string | null;
  firstLoggedAt: string | null;
}

function profileToNutrients(profile: ProfileResponse): Nutrients {
  return {
    calories: profile.dailyCalorieGoal ?? DEFAULT_GOALS.calories,
    protein: profile.dailyProteinGoal ?? DEFAULT_GOALS.protein,
    carbs: profile.dailyCarbGoal ?? DEFAULT_GOALS.carbs,
    fat: profile.dailyFatGoal ?? DEFAULT_GOALS.fat,
  };
}

export const useGoals = () => {
  const [customGoals, setCustomGoals] = useState<Nutrients>(DEFAULT_GOALS);
  const [targetInput, setTargetInput] = useState<Nutrients>(DEFAULT_GOALS);
  const [goalsLoaded, setGoalsLoaded] = useState(false);
  const [hasCustomGoals, setHasCustomGoals] = useState(false);
  const [hasEverLogged, setHasEverLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);

  // Load goals: try DB first, fall back to localStorage, then defaults
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const loadGoals = async () => {
      try {
        const profile = await apiClient.get<ProfileResponse>('/user/profile');
        const goals = profileToNutrients(profile);
        setCustomGoals(goals);
        setTargetInput(goals);
        setHasCustomGoals(profile.goalsUpdatedAt !== null);
        setHasEverLogged(profile.firstLoggedAt !== null);
        // Cache in localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(goals));
      } catch {
        // API failed — use localStorage cache
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setCustomGoals(parsed);
            setTargetInput(parsed);
          } catch {
            // corrupt localStorage, use defaults
          }
        }
      } finally {
        setGoalsLoaded(true);
        setIsLoading(false);
      }
    };

    loadGoals();
  }, []);

  const handleInputChange = useCallback((field: keyof Nutrients, value: number) => {
    setTargetInput(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveTargets = useCallback(async () => {
    const newGoals = { ...targetInput };
    setCustomGoals(newGoals);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newGoals));

    try {
      await apiClient.put('/user/profile', {
        dailyCalorieGoal: newGoals.calories,
        dailyProteinGoal: newGoals.protein,
        dailyCarbGoal: newGoals.carbs,
        dailyFatGoal: newGoals.fat,
      });
      setHasCustomGoals(true);
    } catch (error) {
      console.error('Failed to save goals to server:', error);
      // Goals are already saved locally; will sync on next load
    }
  }, [targetInput]);

  return {
    customGoals,
    targetInput,
    handleInputChange,
    handleSaveTargets,
    hasCustomGoals,
    hasEverLogged,
    isLoading,
    goalsLoaded,
  };
};
