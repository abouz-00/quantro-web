// Food Log Components - Clean Modular Structure

// Core components
export * from './core';

// Chart components
export * from './charts';

// Search components
export * from './search';

// Modal components
export * from './modals';

// Table components (main exports)
export * from './table';

// Hooks
export * from './hooks';

// Clean aliases - all point to our enhanced table
export { default as FoodTable } from './table/FoodLogTable';
export { default as FoodTableModular } from './table/FoodLogTable';
export { default as FoodLogTable } from './table/FoodLogTable';
