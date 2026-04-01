const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1';

// USDA nutrient IDs to standard names
const NUTRIENT_MAP: Record<number, string> = {
  // Macronutrients
  1008: 'Energy',
  2047: 'Energy',  // Energy (Atwater General Factors)
  2048: 'Energy',  // Energy (Atwater Specific Factors)
  1003: 'Protein',
  1005: 'Carbohydrate, by difference',
  1004: 'Total lipid (fat)',
  1079: 'Fiber, total dietary',
  2000: 'Total Sugars',
  
  // B Vitamins
  1165: 'Thiamin',
  1166: 'Riboflavin',
  1167: 'Niacin',
  1170: 'Pantothenic acid',
  1175: 'Vitamin B-6',
  1178: 'Vitamin B-12',
  1176: 'Biotin',
  1177: 'Folate, total',
  
  // Fat-Soluble Vitamins
  1106: 'Vitamin A, RAE',
  1162: 'Vitamin C, total ascorbic acid',
  1114: 'Vitamin D (D2 + D3)',
  1185: 'Vitamin K (phylloquinone)',
  
  // Minerals
  1087: 'Calcium, Ca',
  1098: 'Copper, Cu',
  1089: 'Iron, Fe',
  1090: 'Magnesium, Mg',
  1101: 'Manganese, Mn',
  1091: 'Phosphorus, P',
  1092: 'Potassium, K',
  1103: 'Selenium, Se',
  1093: 'Sodium, Na',
  1095: 'Zinc, Zn',

  // Omega-3 fatty acids
  1270: 'ALA',   // 18:3 n-3 c,c,c (alpha-linolenic)
  1272: 'DHA',   // 22:6 n-3 (docosahexaenoic)
  1292: 'EPA',   // 20:5 n-3 (eicosapentaenoic)
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
  const calories = getNutrientValue(nutrients, 1008) || getNutrientValue(nutrients, 2047) || getNutrientValue(nutrients, 2048);
  const protein = getNutrientValue(nutrients, 1003);
  const carbs = getNutrientValue(nutrients, 1005);
  const fat = getNutrientValue(nutrients, 1004);
  const fiber = getNutrientValue(nutrients, 1079);
  const sugar = getNutrientValue(nutrients, 2000);
  const sodium = getNutrientValue(nutrients, 1093);

  const foodNutrients: Array<{ nutrientName: string; value: number }> = [];
  const addedNames = new Set<string>();
  for (const nutrient of nutrients) {
    const name = NUTRIENT_MAP[nutrient.nutrientId];
    if (name && nutrient.value > 0 && !addedNames.has(name)) {
      foodNutrients.push({ nutrientName: name, value: nutrient.value });
      addedNames.add(name);
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
  // Filter out foods with no calorie data (e.g. Foundation foods that only have fatty acid profiles)
  const results = (data.foods || []).map(transformFood).filter((food) => food.calories > 0);

  // Cache with LRU eviction
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(cacheKey, { data: results, timestamp: Date.now() });

  return results;
}
