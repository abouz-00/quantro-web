import { useState, useEffect } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('favoriteFoods');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem('favoriteFoods', JSON.stringify(favorites));
  }, [favorites]);
  const toggleFavorite = (food: any) => {
    setFavorites(prev => {
      const isFav = prev.some(fav => fav.description === food.description);
      if (isFav) return prev.filter(fav => fav.description !== food.description);
      return [...prev, { ...food, isFavorite: true }];
    });
  };
  const isFavorite = (food: any) => favorites.some(fav => fav.description === food.description);
  return { favorites, toggleFavorite, isFavorite };
}
