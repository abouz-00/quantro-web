const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1';

// USDA nutrient IDs to standard names
const NUTRIENT_MAP: Record<number, string> = {
  1008: 'Energy',
  1003: 'Protein',
  1005: 'Carbohydrate, by difference',
  1004: 'Total lipid (fat)',
  1079: 'Fiber, total dietary',
  2000: 'Total Sugars',
  1093: 'Sodium, Na',
};

interface USDAFoodNutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
}

interface USDAFoodItem {
  fdcId: number;
  description: string;
  brandOwner?: string;
  foodNutrients: USDAFoodNutrient[];
}

interface USDASearchResponse {
  totalHits: number;
  foods: USDAFoodItem[];
}

export interface TransformedFoodItem {
  id: string;
  source: 'usda';
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  foodNutrients: Array<{ nutrientName: string; value: number }>;
  fdcId: number;
}

// In-memory cache
const cache = new Map<string, { data: TransformedFoodItem[]; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_SIZE = 100;

function getNutrientValue(nutrients: USDAFoodNutrient[], nutrientId: number): number {
  return nutrients.find((n) => n.nutrientId === nutrientId)?.value ?? 0;
}

function transformFood(food: USDAFoodItem): TransformedFoodItem {
  const nutrients = food.foodNutrients;
  const calories = getNutrientValue(nutrients, 1008);
  const protein = getNutrientValue(nutrients, 1003);
  const carbs = getNutrientValue(nutrients, 1005);
  const fat = getNutrientValue(nutrients, 1004);
  const fiber = getNutrientValue(nutrients, 1079);
  const sugar = getNutrientValue(nutrients, 2000);
  const sodium = getNutrientValue(nutrients, 1093);

  const foodNutrients: Array<{ nutrientName: string; value: number }> = [];
  for (const nutrient of nutrients) {
    const name = NUTRIENT_MAP[nutrient.nutrientId];
    if (name && nutrient.value > 0) {
      foodNutrients.push({ nutrientName: name, value: nutrient.value });
    }
  }

  return {
    id: `usda_${food.fdcId}`,
    source: 'usda',
    name: food.description,
    brand: food.brandOwner,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    sodium,
    foodNutrients,
    fdcId: food.fdcId,
  };
}

export async function searchUSDA(query: string, pageSize: number = 10): Promise<TransformedFoodItem[]> {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    throw new Error('USDA_API_KEY not configured');
  }

  const cacheKey = `${query.toLowerCase()}_${pageSize}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const url = `${USDA_API_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&api_key=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`USDA API error: ${response.status}`);
  }

  const data = (await response.json()) as USDASearchResponse;
  const results = (data.foods || []).map(transformFood);

  // Cache with LRU eviction
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(cacheKey, { data: results, timestamp: Date.now() });

  return results;
}
