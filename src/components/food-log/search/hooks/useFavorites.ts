import { useState, useEffect } from "react";

interface FavoriteFood {
  description: string;
  foodCategory?: string;
  foodNutrients: { nutrientName: string; value: number }[];
  servingSize?: number;
  servingSizeUnit?: string;
  isFavorite?: boolean;
  uniqueId?: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteFood[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('favoriteFoods');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem('favoriteFoods', JSON.stringify(favorites));
  }, [favorites]);
  const toggleFavorite = (food: FavoriteFood) => {
    setFavorites(prev => {
      const isFav = prev.some(fav => fav.description === food.description);
      if (isFav) return prev.filter(fav => fav.description !== food.description);
      return [...prev, { ...food, isFavorite: true }];
    });
  };
  const isFavorite = (food: FavoriteFood) => favorites.some(fav => fav.description === food.description);
  return { favorites, toggleFavorite, isFavorite };
}
