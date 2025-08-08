import { FoodEntry } from '../types/food';
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
        // Fallback to localStorage
        return this.loadFromLocalStorage(dateParam);
      }
    } catch (error) {
      console.error('Error loading food data:', error);
      return this.loadFromLocalStorage(dateParam);
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
        // Fallback to localStorage
        this.saveToLocalStorage(entry);
        return entry;
      }
    } catch (error) {
      console.error('Error saving food entry:', error);
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
        // Fallback to localStorage
        this.removeFromLocalStorage(id);
        return true;
      }
    } catch (error) {
      console.error('Error deleting food entry:', error);
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
        // Fallback to localStorage
        this.updateInLocalStorage(id, updates);
        return true;
      }
    } catch (error) {
      console.error('Error updating food entry:', error);
      this.updateInLocalStorage(id, updates);
      return true;
    }
  }

  // Private localStorage methods
  private static loadFromLocalStorage(dateParam: string): FoodEntry[] {
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
