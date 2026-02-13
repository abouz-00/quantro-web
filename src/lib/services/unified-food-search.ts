import { searchUSDA, type TransformedFoodItem as USDAItem } from './usda';
import { searchFatSecret, type TransformedFatSecretItem } from './fatsecret';

export interface UnifiedFoodItem {
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

export interface UnifiedSearchResponse {
  query: string;
  totalResults: number;
  results: UnifiedFoodItem[];
  sources: {
    usda: { count: number; available: boolean };
    fatsecret: { count: number; available: boolean };
  };
}

function toUnified(item: USDAItem | TransformedFatSecretItem): UnifiedFoodItem {
  if (item.source === 'usda') {
    const usda = item as USDAItem;
    return { ...usda, fdcId: usda.fdcId };
  }
  const fs = item as TransformedFatSecretItem;
  return { ...fs, fatSecretId: fs.fatSecretId };
}

export async function unifiedFoodSearch(
  query: string,
  pageSize: number = 10,
  source: 'all' | 'usda' | 'fatsecret' = 'all',
): Promise<UnifiedSearchResponse> {
  const resultsPerSource = source === 'all' ? Math.ceil(pageSize / 2) : pageSize;

  let usdaResults: USDAItem[] = [];
  let fatsecretResults: TransformedFatSecretItem[] = [];
  let usdaAvailable = true;
  let fatsecretAvailable = true;

  const promises: Promise<void>[] = [];

  if (source === 'all' || source === 'usda') {
    promises.push(
      searchUSDA(query, resultsPerSource)
        .then((r) => { usdaResults = r; })
        .catch((err) => {
          console.error('USDA search failed:', err);
          usdaAvailable = false;
        }),
    );
  }

  if (source === 'all' || source === 'fatsecret') {
    promises.push(
      searchFatSecret(query, resultsPerSource)
        .then((r) => { fatsecretResults = r; })
        .catch((err) => {
          console.error('FatSecret search failed:', err);
          fatsecretAvailable = false;
        }),
    );
  }

  await Promise.all(promises);

  // Merge and sort by relevance
  const results: UnifiedFoodItem[] = [
    ...usdaResults.map(toUnified),
    ...fatsecretResults.map(toUnified),
  ];

  const queryLower = query.toLowerCase();
  results.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();

    // Exact match first
    const aExact = aName === queryLower ? 0 : 1;
    const bExact = bName === queryLower ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;

    // Starts with query
    const aStarts = aName.startsWith(queryLower) ? 0 : 1;
    const bStarts = bName.startsWith(queryLower) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;

    // Shorter names first (more specific)
    return a.name.length - b.name.length;
  });

  // Limit to requested pageSize
  const trimmed = results.slice(0, pageSize);

  return {
    query,
    totalResults: trimmed.length,
    results: trimmed,
    sources: {
      usda: { count: usdaResults.length, available: usdaAvailable },
      fatsecret: { count: fatsecretResults.length, available: fatsecretAvailable },
    },
  };
}
