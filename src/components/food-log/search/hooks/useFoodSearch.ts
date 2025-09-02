import { useState, useEffect, useCallback } from "react";

// Move nutrientMapping outside the component to avoid recreating it on every render
// Comprehensive USDA nutrient ID mapping for micronutrients
const nutrientMapping: { [key: number]: string } = {
  // Macronutrients
  1008: "Energy",
  1003: "Protein", 
  1004: "Total lipid (fat)",
  1005: "Carbohydrate, by difference",
  1079: "Fiber, total dietary",
  
  // B Vitamins
  1165: "Thiamine", // B1
  1166: "Riboflavin", // B2  
  1167: "Niacin", // B3
  1170: "Pantothenic acid", // B5
  1175: "Vitamin B-6", // B6
  1178: "Vitamin B-12", // B12
  1176: "Biotin",
  1177: "Folate, total", // Folate
  
  // Fat-Soluble Vitamins
  1106: "Vitamin A, RAE", // Vitamin A (Retinol Activity Equivalents)
  1162: "Vitamin C, total ascorbic acid", // Vitamin C
  1114: "Vitamin D (D2 + D3)", // Vitamin D
  1185: "Vitamin K (phylloquinone)", // Vitamin K
  
  // Minerals
  1087: "Calcium, Ca",
  1098: "Copper, Cu", 
  1089: "Iron, Fe",
  1090: "Magnesium, Mg",
  1101: "Manganese, Mn",
  1091: "Phosphorus, P",
  1092: "Potassium, K",
  1103: "Selenium, Se",
  1093: "Sodium, Na",
  1095: "Zinc, Zn",
  
  // Essential Fatty Acids
  1404: "EPA", // Eicosapentaenoic acid
  1405: "DHA", // Docosahexaenoic acid
  1456: "ALA", // Alpha-linolenic acid
};

// Cache interface
interface CacheEntry {
  data: FoodSuggestion[];
  timestamp: number;
}

interface FoodNutrient {
  nutrientId: number;
  value: number;
}

interface ApiFood {
  fdcId: number;
  description: string;
  foodCategory?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients?: FoodNutrient[];
}

interface FoodSuggestion {
  fdcId: number;
  description: string;
  foodNutrients: {
    nutrientName: string;
    value: number;
  }[];
  foodCategory?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  uniqueId?: string;
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

  const transformApiData = useCallback((apiFood: ApiFood): FoodSuggestion => {
    return {
      fdcId: apiFood.fdcId,
      description: apiFood.description,
      foodCategory: apiFood.foodCategory,
      servingSize: apiFood.servingSize,
      servingSizeUnit: apiFood.servingSizeUnit,
      uniqueId: `${apiFood.fdcId}`,
      foodNutrients: (apiFood.foodNutrients || []).map((nutrient: FoodNutrient) => ({
        nutrientName: nutrientMapping[nutrient.nutrientId] || `Nutrient ${nutrient.nutrientId}`,
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

          const apiKey = process.env.NEXT_PUBLIC_USDA_API_KEY || 'DEMO_KEY';
          const response = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=5&api_key=${apiKey}`
          );
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          const transformedFoods = (data.foods || []).map(transformApiData);
          
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
