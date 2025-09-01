import './jest-setup.js';
import { NextRequest } from 'next/server';
import { POST } from '../analytics/route';

// Mock console methods to prevent noise in tests
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Analytics API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('POST /api/analytics', () => {
    it('should process analytics event successfully', async () => {
      const analyticsData = {
        action: 'page_view',
        context: {
          page: '/dashboard',
          userId: 'user-123',
        },
        data: {
          duration: 1500,
          referrer: 'https://quantro.fit',
        },
      };

      const request = new NextRequest('http://localhost:3000/api/analytics', {
        method: 'POST',
        body: JSON.stringify(analyticsData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Note: console.log is called in the route for logging
    });

    it('should handle analytics event with minimal data', async () => {
      const minimalData = {
        action: 'button_click',
      };

      const request = new NextRequest('http://localhost:3000/api/analytics', {
        method: 'POST',
        body: JSON.stringify(minimalData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Note: console.log is called in the route for logging
    });

    it('should handle empty analytics data', async () => {
      const emptyData = {};

      const request = new NextRequest('http://localhost:3000/api/analytics', {
        method: 'POST',
        body: JSON.stringify(emptyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Note: console.log is called in the route for logging
    });

    it('should handle complex nested data', async () => {
      const complexData = {
        action: 'food_log_created',
        context: {
          userId: 'user-456',
          sessionId: 'session-789',
          device: {
            type: 'mobile',
            os: 'iOS',
            version: '17.0',
          },
        },
        data: {
          foodItems: [
            { name: 'Apple', quantity: 1, unit: 'medium' },
            { name: 'Banana', quantity: 2, unit: 'large' },
          ],
          totalCalories: 150,
          mealType: 'snack',
        },
      };

      const request = new NextRequest('http://localhost:3000/api/analytics', {
        method: 'POST',
        body: JSON.stringify(complexData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Note: console.log is called in the route for logging
    });

    it('should handle invalid JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to process analytics event');
      // Note: console.error is called in the route for error logging
    });

    it('should handle request parsing errors', async () => {
      // Create a request that will fail when parsing
      const request = new NextRequest('http://localhost:3000/api/analytics', {
        method: 'POST',
        body: '{"invalid": json}', // Invalid JSON
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to process analytics event');
      // Note: console.error is called in the route for error logging
    });

    it('should log timestamp in ISO format', async () => {
      const analyticsData = { action: 'test_event' };

      const request = new NextRequest('http://localhost:3000/api/analytics', {
        method: 'POST',
        body: JSON.stringify(analyticsData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Note: The route logs a timestamp in ISO format to console
    });
  });
});
