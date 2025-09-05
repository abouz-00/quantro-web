import { FoodEntry } from '../types/food';
import { errorService } from './errorService';
import { transformApiDataToFoodEntry, transformFoodEntryToApiData } from '../utils/foodEntryUtils';

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
      console.log('🌐 FoodLogService: About to fetch /api/food-logs?date=' + dateParam);
      const response = await this.retryFetch(`/api/food-logs?date=${dateParam}`, {});
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      console.log('📡 FoodLogService: Got response status:', response.status, 'ok:', response.ok);
      
      if (response.ok) {
        const apiData = await response.json();
        console.log('📋 FoodLogService: API returned', apiData.length, 'entries');
        return apiData.map(transformApiDataToFoodEntry);
      } else {
        let errorText = 'Unknown error';
        try {
          // Safely attempt to get error text
          errorText = response.text ? await response.text() : `HTTP ${response.status}`;
        } catch {
          errorText = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`;
        }
        
        // Safely log error details with fallbacks
        const errorDetails = {
          status: response.status,
          statusText: response.statusText || 'Unknown',
          body: errorText,
          operation: 'loadFoodData',
          dateParam,
          url: response.url || 'Unknown',
          ok: response.ok
        };
        
        console.error('API response error:', errorDetails);
        // Fallback to localStorage
        return this.loadFromLocalStorage();
      }
    } catch (error) {
      // Ensure we have an Error object for logging
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      
      await errorService.logError(errorInstance, {
        severity: 'medium',
        category: 'network',
        metadata: { operation: 'loadFoodData', dateParam },
      });
      console.error('Network error loading food data:', {
        message: errorInstance.message,
        stack: errorInstance.stack,
        operation: 'loadFoodData',
        dateParam
      });
      return this.loadFromLocalStorage();
    }
  }

  /**
   * Add a new food entry
   */
  static async addFoodEntry(entry: FoodEntry): Promise<FoodEntry> {
    try {
      const response = await this.retryFetch('/api/food-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformFoodEntryToApiData(entry)),
      });

      if (!response) {
        throw new Error('No response received from server');
      }

      if (response.ok) {
        const savedEntry = await response.json();
        return transformApiDataToFoodEntry(savedEntry);
      } else {
        let errorText = 'Unknown error';
        try {
          // Safely attempt to get error text
          errorText = response.text ? await response.text() : `HTTP ${response.status}`;
        } catch {
          errorText = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`;
        }
        
        // Safely log error details with fallbacks
        const errorDetails = {
          status: response.status,
          statusText: response.statusText || 'Unknown',
          body: errorText,
          operation: 'addFoodEntry',
          entryId: entry.id,
          url: response.url || 'Unknown',
          ok: response.ok
        };
        
        console.error('API response error:', errorDetails);
        // Fallback to localStorage
        this.saveToLocalStorage(entry);
        return entry;
      }
    } catch (error) {
      // Ensure we have an Error object for logging
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      
      await errorService.logError(errorInstance, {
        severity: 'medium',
        category: 'network',
        metadata: { operation: 'addFoodEntry', entryId: entry.id },
      });
      console.error('Network error saving food entry:', {
        message: errorInstance.message,
        stack: errorInstance.stack,
        operation: 'addFoodEntry',
        entryId: entry.id
      });
      this.saveToLocalStorage(entry);
      return entry;
    }
  }

  /**
   * Remove a food entry
   */
  static async removeFoodEntry(id: string): Promise<boolean> {
    try {
      const response = await this.retryFetch(`/api/food-logs?id=${id}`, {
        method: 'DELETE',
      });

      if (!response) {
        throw new Error('No response received from server');
      }

      if (response.ok) {
        return true;
      } else {
        let errorText = 'Unknown error';
        try {
          // Safely attempt to get error text
          errorText = response.text ? await response.text() : `HTTP ${response.status}`;
        } catch {
          errorText = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`;
        }
        
        // Safely log error details with fallbacks
        const errorDetails = {
          status: response.status,
          statusText: response.statusText || 'Unknown',
          body: errorText,
          operation: 'removeFoodEntry',
          entryId: id,
          url: response.url || 'Unknown',
          ok: response.ok
        };
        
        console.error('API response error:', errorDetails);
        // Fallback to localStorage
        this.removeFromLocalStorage(id);
        return true;
      }
    } catch (error) {
      // Ensure we have an Error object for logging
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      
      await errorService.logError(errorInstance, {
        severity: 'medium',
        category: 'network',
        metadata: { operation: 'removeFoodEntry', entryId: id },
      });
      console.error('Network error deleting food entry:', {
        message: errorInstance.message,
        stack: errorInstance.stack,
        operation: 'removeFoodEntry',
        entryId: id
      });
      this.removeFromLocalStorage(id);
      return true;
    }
  }

  /**
   * Update a food entry
   */
  static async updateFoodEntry(id: string, updates: Partial<FoodEntry>): Promise<boolean> {
    try {
      const response = await this.retryFetch('/api/food-logs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          quantity: updates.amount ? parseFloat(updates.amount) : undefined,
          calories: updates.calories,
          protein: updates.protein,
          carbs: updates.carbs,
          fat: updates.fat,
          mealType: updates.mealType,
        }),
      });

      if (!response) {
        throw new Error('No response received from server');
      }

      if (response.ok) {
        return true;
      } else {
        let errorText = 'Unknown error';
        try {
          // Safely attempt to get error text
          errorText = response.text ? await response.text() : `HTTP ${response.status}`;
        } catch {
          errorText = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`;
        }
        
        // Safely log error details with fallbacks
        const errorDetails = {
          status: response.status,
          statusText: response.statusText || 'Unknown',
          body: errorText,
          operation: 'updateFoodEntry',
          entryId: id,
          updates,
          url: response.url || 'Unknown',
          ok: response.ok
        };
        
        console.error('API response error:', errorDetails);
        // Fallback to localStorage
        this.updateInLocalStorage(id, updates);
        return true;
      }
    } catch (error) {
      // Ensure we have an Error object for logging
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      
      await errorService.logError(errorInstance, {
        severity: 'medium',
        category: 'network',
        metadata: { operation: 'updateFoodEntry', entryId: id, updates },
      });
      console.error('Network error updating food entry:', {
        message: errorInstance.message,
        stack: errorInstance.stack,
        operation: 'updateFoodEntry',
        entryId: id,
        updates
      });
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
