import { useState, useEffect, useCallback, useRef } from "react";
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
  private readonly CACHE_KEY = 'foodSearchCache_v2'; // Bump version to invalidate old cache

  constructor() {
    this.clearLegacyCache();
    this.loadFromStorage();
  }

  private clearLegacyCache() {
    if (typeof window === 'undefined') return;
    // Remove old unversioned cache that had incorrect nutrient name lookups
    localStorage.removeItem('foodSearchCache');
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(this.CACHE_KEY);
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
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheObject));
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

  /**
   * Find cached results from a prefix of the query and filter them.
   * E.g., if "chi" is cached and query is "chicken", return "chi" results
   * filtered to those containing "chicken". Returns null if no prefix match.
   */
  getFromPrefix(query: string): FoodSuggestion[] | null {
    const q = query.toLowerCase();
    // Try progressively shorter prefixes (minimum 2 chars)
    for (let len = q.length - 1; len >= 2; len--) {
      const prefix = q.substring(0, len);
      const entry = this.cache.get(prefix);
      if (entry && Date.now() - entry.timestamp < this.CACHE_DURATION) {
        // Filter cached results to match the full query
        return entry.data.filter(item =>
          item.description.toLowerCase().includes(q)
        );
      }
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
      localStorage.removeItem(this.CACHE_KEY);
    }
  }
}

const foodSearchCache = new FoodSearchCache();

export function useFoodSearch(query: string, active: boolean) {
  const [fetchedSuggestions, setFetchedSuggestions] = useState<FoodSuggestion[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Check cache synchronously - exact match first, then prefix match
  const cachedResult = active && query.length > 1 ? foodSearchCache.get(query) : null;
  const prefixResult = active && query.length > 1 && !cachedResult ? foodSearchCache.getFromPrefix(query) : null;
  
  // Use exact cache > prefix cache > fetched results
  const suggestions = cachedResult ?? prefixResult ?? fetchedSuggestions;
  
  // Loading is false if we have exact cached data or query is too short
  // Show as loading (but with prefix results visible) if only prefix match
  const loading = !cachedResult && active && query.length > 1 ? isFetching : false;

  useEffect(() => {
    // Skip fetch if we have exact cached data or query is too short
    if (cachedResult || !active || query.length <= 1) {
      return;
    }

    // Abort any in-flight request for a previous query
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Use setTimeout to batch all state updates in callback
    const initTimeoutId = setTimeout(() => {
      setIsFetching(true);
      setError("");
    }, 0);

    const controller = new AbortController();
    abortControllerRef.current = controller;

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
          `/food-search-unified?query=${encodeURIComponent(query)}&pageSize=10&source=all`,
          undefined,
          { signal: controller.signal }
        );
        
        // Don't update state if this request was aborted
        if (controller.signal.aborted) return;
        
        const transformedFoods = data.results.map(transformApiData);
        
        // Cache the result
        foodSearchCache.set(query, transformedFoods);
        
        setFetchedSuggestions(transformedFoods);
        setIsFetching(false);
      } catch (err: unknown) {
        // Ignore abort errors
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setFetchedSuggestions([]);
        setError(err instanceof Error ? err.message : "Failed to fetch food data.");
        setIsFetching(false);
      }
    }, 75); // Reduced debounce for faster responsiveness

    return () => {
      clearTimeout(initTimeoutId);
      clearTimeout(fetchTimeoutId);
      controller.abort();
    };
  }, [query, active, transformApiData, cachedResult, prefixResult]);

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
