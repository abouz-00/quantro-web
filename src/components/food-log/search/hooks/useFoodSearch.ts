import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../../lib/apiClient";

// Comprehensive nutrient name mapping for display
const nutrientDisplayNames: { [key: string]: string } = {
  // Macronutrients
  "Energy": "Calories",
  "Protein": "Protein", 
  "Total lipid (fat)": "Fat",
  "Carbohydrate, by difference": "Carbs",
  "Fiber, total dietary": "Fiber",
  "Total Sugars": "Sugar",
  
  // B Vitamins
  "Thiamine": "Vitamin B1",
  "Riboflavin": "Vitamin B2",  
  "Niacin": "Vitamin B3",
  "Pantothenic acid": "Vitamin B5",
  "Vitamin B-6": "Vitamin B6",
  "Vitamin B-12": "Vitamin B12",
  "Biotin": "Biotin",
  "Folate, total": "Folate",
  
  // Fat-Soluble Vitamins
  "Vitamin A, RAE": "Vitamin A",
  "Vitamin C, total ascorbic acid": "Vitamin C",
  "Vitamin D (D2 + D3)": "Vitamin D",
  "Vitamin K (phylloquinone)": "Vitamin K",
  
  // Minerals
  "Calcium, Ca": "Calcium",
  "Copper, Cu": "Copper", 
  "Iron, Fe": "Iron",
  "Magnesium, Mg": "Magnesium",
  "Manganese, Mn": "Manganese",
  "Phosphorus, P": "Phosphorus",
  "Potassium, K": "Potassium",
  "Selenium, Se": "Selenium",
  "Sodium, Na": "Sodium",
  "Zinc, Zn": "Zinc",
  
  // Essential Fatty Acids
  "EPA": "EPA",
  "DHA": "DHA",
  "ALA": "ALA",
};

// Cache interface
interface CacheEntry {
  data: FoodSuggestion[];
  timestamp: number;
}

interface FoodSuggestion {
  fdcId?: number;
  fatSecretId?: string;
  source: 'usda' | 'fatsecret';
  description: string;
  foodNutrients: {
    nutrientName: string;
    value: number;
  }[];
  foodCategory?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  uniqueId?: string;
  brand?: string;
}

interface UnifiedFoodItem {
  id: string;
  source: 'usda' | 'fatsecret';
  name: string;
  brand?: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: Array<{ nutrientName: string; value: number }>;
  fdcId?: number;
  fatSecretId?: string;
}

interface UnifiedSearchResponse {
  query: string;
  totalResults: number;
  results: UnifiedFoodItem[];
  sources: {
    usda: { count: number; available: boolean };
    fatsecret: { count: number; available: boolean };
  };
}

// Simple in-memory cache with localStorage persistence
class FoodSearchCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly MAX_CACHE_SIZE = 200;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('foodSearchCache');
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, CacheEntry>;
        // Only load recent entries
        Object.entries(parsed).forEach(([key, entry]) => {
          if (Date.now() - entry.timestamp < this.CACHE_DURATION) {
            this.cache.set(key, entry);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load food search cache:', error);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      // Convert Map to object for JSON serialization
      const cacheObject: Record<string, CacheEntry> = {};
      this.cache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      localStorage.setItem('foodSearchCache', JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Failed to save food search cache:', error);
    }
  }

  get(query: string): FoodSuggestion[] | null {
    const entry = this.cache.get(query.toLowerCase());
    if (entry && Date.now() - entry.timestamp < this.CACHE_DURATION) {
      return entry.data;
    }
    // Remove expired entry
    if (entry) {
      this.cache.delete(query.toLowerCase());
    }
    return null;
  }

  set(query: string, data: FoodSuggestion[]) {
    // Limit cache size
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(query.toLowerCase(), {
      data,
      timestamp: Date.now()
    });
    this.saveToStorage();
  }

  clear() {
    this.cache.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('foodSearchCache');
    }
  }
}

const foodSearchCache = new FoodSearchCache();

export function useFoodSearch(query: string, active: boolean) {
  const [fetchedSuggestions, setFetchedSuggestions] = useState<FoodSuggestion[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");

  const transformApiData = useCallback((item: UnifiedFoodItem): FoodSuggestion => {
    return {
      fdcId: item.fdcId,
      fatSecretId: item.fatSecretId,
      source: item.source,
      description: item.name,
      foodCategory: item.brand,
      servingSize: item.servingSize,
      servingSizeUnit: item.servingSizeUnit,
      uniqueId: item.id,
      brand: item.brand,
      foodNutrients: item.foodNutrients.map((nutrient) => ({
        nutrientName: nutrientDisplayNames[nutrient.nutrientName] || nutrient.nutrientName,
        value: nutrient.value
      }))
    };
  }, []);

  // Check cache synchronously - derive suggestions from cache or fetched state
  const cachedResult = active && query.length > 1 ? foodSearchCache.get(query) : null;
  
  // Use cached result if available, otherwise use fetched suggestions
  const suggestions = cachedResult ?? fetchedSuggestions;
  
  // Loading is false if we have cached data or query is too short
  const loading = !cachedResult && active && query.length > 1 ? isFetching : false;

  useEffect(() => {
    // Skip fetch if we have cached data or query is too short
    if (cachedResult || !active || query.length <= 1) {
      return;
    }

    // Use setTimeout to batch all state updates in callback
    const initTimeoutId = setTimeout(() => {
      setIsFetching(true);
      setError("");
    }, 0);

    const fetchTimeoutId = setTimeout(async () => {
      try {
        // Double-check cache in case another request cached it
        const freshCachedResult = foodSearchCache.get(query);
        if (freshCachedResult) {
          setFetchedSuggestions(freshCachedResult);
          setIsFetching(false);
          return;
        }

        // Use the unified food search endpoint
        const data = await apiClient.get<UnifiedSearchResponse>(
          `/food-search-unified?query=${encodeURIComponent(query)}&pageSize=10&source=all`
        );
        
        const transformedFoods = data.results.map(transformApiData);
        
        // Cache the result
        foodSearchCache.set(query, transformedFoods);
        
        setFetchedSuggestions(transformedFoods);
        setIsFetching(false);
      } catch (err: unknown) {
        setFetchedSuggestions([]);
        setError(err instanceof Error ? err.message : "Failed to fetch food data.");
        setIsFetching(false);
      }
    }, 150); // Debounce time for better responsiveness

    return () => {
      clearTimeout(initTimeoutId);
      clearTimeout(fetchTimeoutId);
    };
  }, [query, active, transformApiData, cachedResult]);

  // Reset state when query becomes inactive or too short
  useEffect(() => {
    if (!active || query.length <= 1) {
      const resetTimeoutId = setTimeout(() => {
        setFetchedSuggestions([]);
        setIsFetching(false);
        setError("");
      }, 0);
      return () => clearTimeout(resetTimeoutId);
    }
  }, [active, query.length]);

  return { suggestions, loading, error };
}
