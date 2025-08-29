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
      const response = await fetch(`/api/food-logs?date=${dateParam}`);
      
      if (response.ok) {
        const apiData = await response.json();
        return apiData.map(transformApiDataToFoodEntry);
      } else {
        const errorText = await response.text();
        console.error('API response error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          operation: 'loadFoodData',
          dateParam
        });
        // Fallback to localStorage
        return this.loadFromLocalStorage();
      }
    } catch (error) {
      await errorService.logError(error as Error, {
        severity: 'medium',
        category: 'network',
        metadata: { operation: 'loadFoodData', dateParam },
      });
      console.error('Network error loading food data:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
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
      const response = await fetch('/api/food-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformFoodEntryToApiData(entry)),
      });

      if (response.ok) {
        const savedEntry = await response.json();
        return transformApiDataToFoodEntry(savedEntry);
      } else {
        const errorText = await response.text();
        console.error('API response error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          operation: 'addFoodEntry',
          entryId: entry.id
        });
        // Fallback to localStorage
        this.saveToLocalStorage(entry);
        return entry;
      }
    } catch (error) {
      await errorService.logError(error as Error, {
        severity: 'medium',
        category: 'network',
        metadata: { operation: 'addFoodEntry', entryId: entry.id },
      });
      console.error('Network error saving food entry:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
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
      const response = await fetch(`/api/food-logs?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return true;
      } else {
        const errorText = await response.text();
        console.error('API response error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          operation: 'removeFoodEntry',
          entryId: id
        });
        // Fallback to localStorage
        this.removeFromLocalStorage(id);
        return true;
      }
    } catch (error) {
      await errorService.logError(error as Error, {
        severity: 'medium',
        category: 'network',
        metadata: { operation: 'removeFoodEntry', entryId: id },
      });
      console.error('Network error deleting food entry:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
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
      const response = await fetch('/api/food-logs', {
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
        }),
      });

      if (response.ok) {
        return true;
      } else {
        const errorText = await response.text();
        console.error('API response error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          operation: 'updateFoodEntry',
          entryId: id,
          updates
        });
        // Fallback to localStorage
        this.updateInLocalStorage(id, updates);
        return true;
      }
    } catch (error) {
      await errorService.logError(error as Error, {
        severity: 'medium',
        category: 'network',
        metadata: { operation: 'updateFoodEntry', entryId: id, updates },
      });
      console.error('Network error updating food entry:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        operation: 'updateFoodEntry',
        entryId: id,
        updates
      });
      this.updateInLocalStorage(id, updates);
      return true;
    }
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
