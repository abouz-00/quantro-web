// Test script to reproduce the API response error
import { FoodLogService } from './src/services/foodLogService.js';

console.log('=== Testing FoodLogService API Error ===');

async function testApiError() {
  try {
    console.log('Testing loadFoodData with invalid date...');
    const result = await FoodLogService.loadFoodData('invalid-date');
    console.log('Result:', result);
  } catch (error) {
    console.error('Test error:', error);
  }
}

testApiError();
