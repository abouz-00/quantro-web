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
  const [suggestions, setSuggestions] = useState<FoodSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (active && query.length > 1) {
      // Check cache first
      const cachedResult = foodSearchCache.get(query);
      if (cachedResult) {
        setSuggestions(cachedResult);
        setLoading(false);
        setError("");
        return;
      }

      setLoading(true);
      setError("");
      const timeoutId = setTimeout(async () => {
        try {
          // Double-check cache in case another request cached it
          const cachedResult = foodSearchCache.get(query);
          if (cachedResult) {
            setSuggestions(cachedResult);
            setLoading(false);
            return;
          }

          // Use the unified food search endpoint
          const data = await apiClient.get<UnifiedSearchResponse>(
            `/food-search-unified?query=${encodeURIComponent(query)}&pageSize=10&source=all`
          );
          
          const transformedFoods = data.results.map(transformApiData);
          
          // Cache the result
          foodSearchCache.set(query, transformedFoods);
          
          setSuggestions(transformedFoods);
          setLoading(false);
        } catch (err: unknown) {
          setSuggestions([]);
          setError(err instanceof Error ? err.message : "Failed to fetch food data.");
          setLoading(false);
        }
      }, 150); // Reduced debounce time for better responsiveness
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setLoading(false);
      setError("");
    }
  }, [query, active, transformApiData]);

  return { suggestions, loading, error };
}
