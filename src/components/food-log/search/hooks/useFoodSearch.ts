import { useState, useEffect, useCallback } from "react";

// Move nutrientMapping outside the component to avoid recreating it on every render
const nutrientMapping: { [key: number]: string } = {
  1008: "Energy",
  1003: "Protein",
  1004: "Total lipid (fat)",
  1005: "Carbohydrate, by difference",
  1079: "Fiber, total dietary"
};

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
    if (active && query.length > 2) {
      setLoading(true);
      setError("");
      const timeoutId = setTimeout(async () => {
        try {
          const apiKey = process.env.NEXT_PUBLIC_USDA_API_KEY || 'DEMO_KEY';
          const response = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${apiKey}`
          );
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          const transformedFoods = (data.foods || []).map(transformApiData);
          setSuggestions(transformedFoods);
          setLoading(false);
        } catch (err: unknown) {
          setSuggestions([]);
          setError(err instanceof Error ? err.message : "Failed to fetch food data.");
          setLoading(false);
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setLoading(false);
      setError("");
    }
  }, [query, active, transformApiData]);

  return { suggestions, loading, error };
}
