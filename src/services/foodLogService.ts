import { FoodEntry } from '../types/food';
import { transformApiDataToFoodEntry, transformFoodEntryToApiData } from '../utils/foodEntryUtils';
import { apiClient } from '../lib/apiClient';

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
      const apiData = await apiClient.get('/food-logs', { date: dateParam }) as any[];

      console.log('📋 FoodLogService: API returned', apiData.length, 'entries');
      return apiData.map(transformApiDataToFoodEntry);
    } catch (error) {
      console.error('API response error:', error);
      // Fallback to localStorage
      return this.loadFromLocalStorage();
    }
  }

  /**
   * Add a new food entry
   */
  static async addFoodEntry(entry: FoodEntry): Promise<FoodEntry> {
    try {
      const apiData = transformFoodEntryToApiData(entry);
      const savedEntry = await apiClient.post('/food-logs', apiData);
      return transformApiDataToFoodEntry(savedEntry as any);
    } catch (error) {
      console.error('API response error:', error);
      // Fallback to localStorage
      this.saveToLocalStorage(entry);
      return entry;
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
      console.error('API response error:', error);
      // Fallback to localStorage
      this.removeFromLocalStorage(id);
      return true;
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
      };
      await apiClient.put('/food-logs', updateData);
      return true;
    } catch (error) {
      console.error('API response error:', error);
      // Fallback to localStorage
      this.updateInLocalStorage(id, updates);
      return true;
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

  // Private localStorage methods
  private static loadFromLocalStorage(): FoodEntry[] {
    const savedFoodData = localStorage.getItem('foodData');
    if (savedFoodData) {
      const parsedData = JSON.parse(savedFoodData);
      // Note: Date filtering would need to be handled by the calling code
      // since we don't have the selectedDate here
      return parsedData;
    }
    return [];
  }

  private static saveToLocalStorage(entry: FoodEntry): void {
    const allLocalData = JSON.parse(localStorage.getItem('foodData') || '[]');
    localStorage.setItem('foodData', JSON.stringify([...allLocalData, entry]));
  }

  private static removeFromLocalStorage(id: string): void {
    const allLocalData = JSON.parse(localStorage.getItem('foodData') || '[]');
    const updatedData = allLocalData.filter((item: FoodEntry) => item.id !== id);
    localStorage.setItem('foodData', JSON.stringify(updatedData));
  }

  private static updateInLocalStorage(id: string, updates: Partial<FoodEntry>): void {
    const allLocalData = JSON.parse(localStorage.getItem('foodData') || '[]');
    const updatedData = allLocalData.map((item: FoodEntry) => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    });
    localStorage.setItem('foodData', JSON.stringify(updatedData));
  }
}
