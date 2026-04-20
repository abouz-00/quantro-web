import { FoodEntry } from '../types/food';
import { transformApiDataToFoodEntry, transformFoodEntryToApiData } from '../utils/foodEntryUtils';
import { apiClient } from '../lib/apiClient';

// API response type matching backend structure
interface ApiData {
  id: string;
  foodName: string;
  brand?: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  createdAt?: string;
  date?: string;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack" | "other";
  orderIndex?: number;
  // Micronutrients
  vitaminB1?: number;
  vitaminB2?: number;
  vitaminB3?: number;
  vitaminB5?: number;
  vitaminB6?: number;
  vitaminB12?: number;
  biotin?: number;
  folate?: number;
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminK?: number;
  calcium?: number;
  copper?: number;
  iron?: number;
  magnesium?: number;
  manganese?: number;
  phosphorus?: number;
  potassium?: number;
  selenium?: number;
  zinc?: number;
  omega3?: number;
}

/**
 * Food Log API Service
 * Handles all API interactions for food logging with localStorage fallback
 */
export class FoodLogService {
  /**
   * Load food data for a specific date
   */
  static async loadFoodData(dateParam: string): Promise<FoodEntry[]> {
    try {
      console.log('🌐 FoodLogService: About to fetch /food-logs?date=' + dateParam);
      const startTime = performance.now();
      const apiData = await apiClient.get<ApiData[]>('/food-logs', { date: dateParam });
      const fetchTime = performance.now() - startTime;

      console.log(`📋 FoodLogService: API returned ${apiData.length} entries in ${fetchTime.toFixed(0)}ms`);
      const transformStart = performance.now();
      const entries = apiData.map(transformApiDataToFoodEntry);
      const transformTime = performance.now() - transformStart;
      
      console.log(`✅ FoodLogService: Transformation took ${transformTime.toFixed(0)}ms`);
      return entries;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Handle specific HTTP errors
      if (errorMessage.includes('HTTP 401') || errorMessage.includes('HTTP 403')) {
        console.error('Authentication error:', errorMessage);
        console.log('🔄 Falling back to localStorage');
        // Could trigger a re-authentication flow here
      } else if (errorMessage.includes('HTTP 404')) {
        console.log('No food logs found for date:', dateParam);
        return []; // Return empty array for not found
      } else if (errorMessage.includes('HTTP 500') || errorMessage.includes('HTTP 503')) {
        console.error('Server error:', errorMessage);
      } else {
        console.error('API response error:', errorMessage);
      }
      
      // For other errors, throw to let the hook handle it
      throw error;
    }
  }

  /**
   * Add a new food entry
   */
  static async addFoodEntry(entry: FoodEntry): Promise<FoodEntry> {
    try {
      const apiData = transformFoodEntryToApiData(entry);
      const savedEntry = await apiClient.post<ApiData>('/food-logs', apiData);
      return transformApiDataToFoodEntry(savedEntry);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Handle specific HTTP errors
      if (errorMessage.includes('HTTP 401') || errorMessage.includes('HTTP 403')) {
        console.error('Authentication error - cannot save food entry:', errorMessage);
        throw new Error('Authentication required to save food entry');
      } else if (errorMessage.includes('HTTP 400')) {
        console.error('Invalid food entry data:', errorMessage);
        throw new Error('Invalid food entry data');
      } else if (errorMessage.includes('HTTP 500') || errorMessage.includes('HTTP 503')) {
        console.error('Server error:', errorMessage);
      } else {
        console.error('API response error:', errorMessage);
      }
      
      // Throw error to let the hook handle it
      throw error;
    }
  }

  /**
   * Remove a food entry
   */
  static async removeFoodEntry(id: string): Promise<boolean> {
    try {
      await apiClient.delete('/food-logs', { id });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Handle specific HTTP errors
      if (errorMessage.includes('HTTP 401') || errorMessage.includes('HTTP 403')) {
        console.error('Authentication error - cannot delete food entry:', errorMessage);
        throw new Error('Authentication required to delete food entry');
      } else if (errorMessage.includes('HTTP 404')) {
        console.log('Food entry not found (may already be deleted):', id);
        // Still remove from localStorage if it exists there
      } else if (errorMessage.includes('HTTP 500') || errorMessage.includes('HTTP 503')) {
        console.error('Server error:', errorMessage);
      } else {
        console.error('API response error:', errorMessage);
      }
      
      // Throw error to let the hook handle it
      throw error;
    }
  }

  /**
   * Update a food entry
   */
  static async updateFoodEntry(id: string, updates: Partial<FoodEntry>): Promise<boolean> {
    try {
      const updateData = {
        id,
        quantity: updates.amount ? parseFloat(updates.amount) : undefined,
        calories: updates.calories,
        protein: updates.protein,
        carbs: updates.carbs,
        fat: updates.fat,
        mealType: updates.mealType,
        orderIndex: updates.orderIndex,
        vitaminB1: updates.vitaminB1,
        vitaminB2: updates.vitaminB2,
        vitaminB3: updates.vitaminB3,
        vitaminB5: updates.vitaminB5,
        vitaminB6: updates.vitaminB6,
        vitaminB12: updates.vitaminB12,
        biotin: updates.biotin,
        folate: updates.folate,
        vitaminA: updates.vitaminA,
        vitaminC: updates.vitaminC,
        vitaminD: updates.vitaminD,
        vitaminK: updates.vitaminK,
        calcium: updates.calcium,
        copper: updates.copper,
        iron: updates.iron,
        magnesium: updates.magnesium,
        manganese: updates.manganese,
        phosphorus: updates.phosphorus,
        potassium: updates.potassium,
        selenium: updates.selenium,
        zinc: updates.zinc,
        omega3: updates.omega3,
      };
      await apiClient.put('/food-logs', updateData);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Handle specific HTTP errors
      if (errorMessage.includes('HTTP 401') || errorMessage.includes('HTTP 403')) {
        console.error('Authentication error - cannot update food entry:', errorMessage);
        throw new Error('Authentication required to update food entry');
      } else if (errorMessage.includes('HTTP 400')) {
        console.error('Invalid update data:', errorMessage);
        throw new Error('Invalid food entry update data');
      } else if (errorMessage.includes('HTTP 404')) {
        console.error('Food entry not found:', id);
        throw new Error('Food entry not found');
      } else if (errorMessage.includes('HTTP 500') || errorMessage.includes('HTTP 503')) {
        console.error('Server error:', errorMessage);
      } else {
        console.error('API response error:', errorMessage);
      }
      
      // Throw error to let the hook handle it
      throw error;
    }
  }

  /**
   * Retry fetch with exponential backoff for network errors
   */
  private static async retryFetch(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await (globalThis as { fetch: typeof fetch }).fetch(url, options);
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Only retry on network errors, not on HTTP errors
        if (lastError.name === 'TypeError' && lastError.message.includes('fetch')) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
          console.log(`Network error, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // For non-network errors, don't retry
        break;
      }
    }

    throw lastError!;
  }

}
