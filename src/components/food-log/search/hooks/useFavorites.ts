import { useState, useEffect } from "react";

interface FavoriteFood {
  description: string;
  foodCategory?: string;
  foodNutrients: { nutrientName: string; value: number }[];
  servingSize?: number;
  servingSizeUnit?: string;
  isFavorite?: boolean;
  uniqueId?: string;
  fdcId?: number;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteFood[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('favoriteFoods');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFavorites(parsed);
        console.log('✅ Loaded', parsed.length, 'favorites from localStorage');
      } else {
        console.log('📦 No favorites found in localStorage');
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);
  
  // Save to localStorage whenever favorites change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('favoriteFoods', JSON.stringify(favorites));
        console.log('💾 Saved', favorites.length, 'favorites to localStorage');
      } catch (error) {
        console.error('Failed to save favorites to localStorage:', error);
      }
    }
  }, [favorites, isLoaded]);
  
  // Helper function to get a unique identifier for a food item
  const getFoodIdentifier = (food: FavoriteFood): string => {
    // Prefer fdcId for USDA foods, fall back to uniqueId, then description as last resort
    if (food.fdcId) return `fdc_${food.fdcId}`;
    if (food.uniqueId) return food.uniqueId;
    return `desc_${food.description}`;
  };
  
  const toggleFavorite = (food: FavoriteFood) => {
    setFavorites(prev => {
      const foodId = getFoodIdentifier(food);
      const isFav = prev.some(fav => getFoodIdentifier(fav) === foodId);
      if (isFav) return prev.filter(fav => getFoodIdentifier(fav) !== foodId);
      return [...prev, { ...food, isFavorite: true }];
    });
  };
  const isFavorite = (food: FavoriteFood) => {
    const foodId = getFoodIdentifier(food);
    return favorites.some(fav => getFoodIdentifier(fav) === foodId);
  };
  return { favorites, toggleFavorite, isFavorite };
}
