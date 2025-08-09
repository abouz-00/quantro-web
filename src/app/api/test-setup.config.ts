/**
 * Test setup file for API tests
 * Ensures all external dependencies are properly mocked
 */

// Mock global fetch to prevent real network requests
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock console methods to reduce test noise
const originalConsole = { ...console };
beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

// Export mock functions for use in tests
export { mockFetch };
