import { serverEnv } from '@/lib/env';

const TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';
const API_URL = 'https://platform.fatsecret.com/rest/server.api';

// Token cache
let cachedToken: { token: string; expiresAt: number } | null = null;

interface FatSecretServing {
  serving_id: string;
  serving_description: string;
  metric_serving_amount?: string;
  metric_serving_unit?: string;
  calories?: string;
  carbohydrate?: string;
  protein?: string;
  fat?: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
  saturated_fat?: string;
  cholesterol?: string;
  potassium?: string;
  vitamin_a?: string;
  vitamin_c?: string;
  calcium?: string;
  iron?: string;
}

interface FatSecretFood {
  food_id: string;
  food_name: string;
  food_type: string;
  brand_name?: string;
  food_description?: string;
  servings?: {
    serving: FatSecretServing | FatSecretServing[];
  };
}

interface FatSecretSearchResponse {
  foods?: {
    food: FatSecretFood | FatSecretFood[];
    total_results: string;
  };
}

export interface TransformedFatSecretItem {
  id: string;
  source: 'fatsecret';
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
  fatSecretId: string;
}

// In-memory cache
const cache = new Map<string, { data: TransformedFatSecretItem[]; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_SIZE = 100;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const clientId = serverEnv.FATSECRET_CLIENT_ID;
  const clientSecret = serverEnv.FATSECRET_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('FatSecret credentials not configured');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=basic',
  });

  if (!response.ok) {
    throw new Error(`FatSecret token error: ${response.status}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

async function makeRequest(method: string, params: Record<string, string>): Promise<unknown> {
  const token = await getAccessToken();
  const queryParams = new URLSearchParams({
    method,
    format: 'json',
    ...params,
  });

  const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    // Token expired, clear cache and retry once
    cachedToken = null;
    const newToken = await getAccessToken();
    const retryResponse = await fetch(`${API_URL}?${queryParams.toString()}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${newToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!retryResponse.ok) {
      throw new Error(`FatSecret API error: ${retryResponse.status}`);
    }
    return retryResponse.json();
  }

  if (!response.ok) {
    throw new Error(`FatSecret API error: ${response.status}`);
  }

  return response.json();
}

function parseDescription(desc: string): { calories: number; protein: number; carbs: number; fat: number; servingSize?: number; servingSizeUnit?: string } {
  const result = { calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: undefined as number | undefined, servingSizeUnit: undefined as string | undefined };

  // Parse "Per 101g" or "Per 1 cup"
  const servingMatch = desc.match(/Per\s+([\d.]+)\s*(\w+)/i);
  if (servingMatch) {
    result.servingSize = parseFloat(servingMatch[1]);
    result.servingSizeUnit = servingMatch[2];
  }

  const calMatch = desc.match(/Calories:\s*([\d.]+)/i);
  if (calMatch) result.calories = parseFloat(calMatch[1]);

  const fatMatch = desc.match(/Fat:\s*([\d.]+)/i);
  if (fatMatch) result.fat = parseFloat(fatMatch[1]);

  const carbMatch = desc.match(/Carbs:\s*([\d.]+)/i);
  if (carbMatch) result.carbs = parseFloat(carbMatch[1]);

  const protMatch = desc.match(/Protein:\s*([\d.]+)/i);
  if (protMatch) result.protein = parseFloat(protMatch[1]);

  return result;
}

function transformFood(food: FatSecretFood): TransformedFatSecretItem {
  const servings = food.servings?.serving;
  const serving: FatSecretServing | undefined = Array.isArray(servings) ? servings[0] : servings;

  let calories: number, protein: number, carbs: number, fat: number;
  let fiber: number, sugar: number, sodium: number;
  let servingSize: number | undefined;
  let servingSizeUnit: string | undefined;

  if (serving) {
    // Use full serving data when available
    calories = parseFloat(serving.calories || '0');
    protein = parseFloat(serving.protein || '0');
    carbs = parseFloat(serving.carbohydrate || '0');
    fat = parseFloat(serving.fat || '0');
    fiber = parseFloat(serving.fiber || '0');
    sugar = parseFloat(serving.sugar || '0');
    sodium = parseFloat(serving.sodium || '0');
    servingSize = serving.metric_serving_amount ? parseFloat(serving.metric_serving_amount) : undefined;
    servingSizeUnit = serving.metric_serving_unit;
  } else if (food.food_description) {
    // Fall back to parsing the description string from search results
    const parsed = parseDescription(food.food_description);
    calories = parsed.calories;
    protein = parsed.protein;
    carbs = parsed.carbs;
    fat = parsed.fat;
    fiber = 0;
    sugar = 0;
    sodium = 0;
    servingSize = parsed.servingSize;
    servingSizeUnit = parsed.servingSizeUnit;
  } else {
    calories = 0; protein = 0; carbs = 0; fat = 0;
    fiber = 0; sugar = 0; sodium = 0;
  }

  // Build nutrient array
  const foodNutrients: Array<{ nutrientName: string; value: number }> = [
    { nutrientName: 'Energy', value: calories },
    { nutrientName: 'Protein', value: protein },
    { nutrientName: 'Carbohydrate, by difference', value: carbs },
    { nutrientName: 'Total lipid (fat)', value: fat },
    { nutrientName: 'Fiber, total dietary', value: fiber },
    { nutrientName: 'Total Sugars', value: sugar },
    { nutrientName: 'Sodium, Na', value: sodium },
  ];

  // Add conditional nutrients
  if (serving?.saturated_fat) {
    foodNutrients.push({ nutrientName: 'Fatty acids, total saturated', value: parseFloat(serving.saturated_fat) });
  }
  if (serving?.cholesterol) {
    foodNutrients.push({ nutrientName: 'Cholesterol', value: parseFloat(serving.cholesterol) });
  }
  if (serving?.potassium) {
    foodNutrients.push({ nutrientName: 'Potassium, K', value: parseFloat(serving.potassium) });
  }
  if (serving?.vitamin_a) {
    foodNutrients.push({ nutrientName: 'Vitamin A', value: parseFloat(serving.vitamin_a) });
  }
  if (serving?.vitamin_c) {
    foodNutrients.push({ nutrientName: 'Vitamin C', value: parseFloat(serving.vitamin_c) });
  }
  if (serving?.calcium) {
    foodNutrients.push({ nutrientName: 'Calcium, Ca', value: parseFloat(serving.calcium) });
  }
  if (serving?.iron) {
    foodNutrients.push({ nutrientName: 'Iron, Fe', value: parseFloat(serving.iron) });
  }

  return {
    id: `fatsecret_${food.food_id}`,
    source: 'fatsecret',
    name: food.food_name,
    brand: food.brand_name,
    description: food.food_description,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    sodium,
    servingSize,
    servingSizeUnit,
    foodNutrients,
    fatSecretId: food.food_id,
  };
}

export async function searchFatSecret(query: string, maxResults: number = 10): Promise<TransformedFatSecretItem[]> {
  const cacheKey = `fatsecret_${query.toLowerCase()}_${maxResults}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const response = (await makeRequest('foods.search', {
    search_expression: query,
    max_results: maxResults.toString(),
    page_number: '0',
  })) as FatSecretSearchResponse;

  if (!response.foods?.food) {
    return [];
  }

  const foods = Array.isArray(response.foods.food)
    ? response.foods.food
    : [response.foods.food];

  const results = foods.map(transformFood);

  // Cache with LRU eviction
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(cacheKey, { data: results, timestamp: Date.now() });

  return results;
}
