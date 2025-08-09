/* eslint-disable @typescript-eslint/no-explicit-any */
import './jest-setup.js';
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '../food-logs/route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Mock console.error to prevent noise in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock dependencies
jest.mock('@/lib/auth');
jest.mock('@/lib/prisma');

const mockAuth = auth as jest.MockedFunction<any>;

// Get the mocked prisma instance - using any for complex mocks
const mockPrisma = prisma as any;

// Add proper typing for mock functions
const mockFindMany = mockPrisma.foodLog.findMany as jest.MockedFunction<any>;
const mockCreate = mockPrisma.foodLog.create as jest.MockedFunction<any>;
const mockFindFirst = mockPrisma.foodLog.findFirst as jest.MockedFunction<any>;
const mockUpdate = mockPrisma.foodLog.update as jest.MockedFunction<any>;
const mockDelete = mockPrisma.foodLog.delete as jest.MockedFunction<any>;

describe('Food Logs API', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('GET /api/food-logs', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/food-logs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return food logs for authenticated user', async () => {
      mockAuth.mockResolvedValue(mockSession);
      const mockFoodLogs = [
        {
          id: 'log-1',
          userId: 'user-123',
          foodName: 'Apple',
          calories: 95,
          date: new Date(),
        },
      ];
      mockFindMany.mockResolvedValue(mockFoodLogs);

      const request = new NextRequest('http://localhost:3000/api/food-logs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockFoodLogs);
      expect(mockPrisma.foodLog.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { date: 'desc' },
      });
    });

    it('should filter food logs by date when date parameter is provided', async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockFindMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/food-logs?date=2023-12-25');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.foodLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          date: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        orderBy: { date: 'desc' },
      });
    });

    it('should handle database errors', async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockFindMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/food-logs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST /api/food-logs', () => {
    const mockFoodEntry = {
      foodName: 'Banana',
      brand: 'Dole',
      quantity: 1,
      unit: 'medium',
      mealType: 'breakfast',
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      fiber: 3.1,
    };

    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/food-logs', {
        method: 'POST',
        body: JSON.stringify(mockFoodEntry),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should create food log for authenticated user', async () => {
      mockAuth.mockResolvedValue(mockSession);
      const createdFoodLog = { id: 'log-1', userId: 'user-123', ...mockFoodEntry };
      mockCreate.mockResolvedValue(createdFoodLog);

      const request = new NextRequest('http://localhost:3000/api/food-logs', {
        method: 'POST',
        body: JSON.stringify(mockFoodEntry),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdFoodLog);
      expect(mockPrisma.foodLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          ...mockFoodEntry,
        },
      });
    });

    it('should handle database errors during creation', async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockCreate.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/food-logs', {
        method: 'POST',
        body: JSON.stringify(mockFoodEntry),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('PUT /api/food-logs', () => {
    const updateData = {
      id: 'log-1',
      quantity: 2,
      calories: 200,
      protein: 2.6,
      carbs: 54,
      fat: 0.8,
    };

    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/food-logs', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when ID is missing', async () => {
      mockAuth.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/food-logs', {
        method: 'PUT',
        body: JSON.stringify({ quantity: 2 }),
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Food log ID is required');
    });

    it('should return 404 when food log not found', async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockFindFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/food-logs', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Food log not found');
    });

    it('should update food log successfully', async () => {
      mockAuth.mockResolvedValue(mockSession);
      const existingLog = { id: 'log-1', userId: 'user-123', foodName: 'Banana' };
      const updatedLog = { ...existingLog, ...updateData };
      
      mockFindFirst.mockResolvedValue(existingLog);
      mockUpdate.mockResolvedValue(updatedLog);

      const request = new NextRequest('http://localhost:3000/api/food-logs', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedLog);
      expect(mockPrisma.foodLog.update).toHaveBeenCalledWith({
        where: { id: 'log-1' },
        data: {
          quantity: 2,
          calories: 200,
          protein: 2.6,
          carbs: 54,
          fat: 0.8,
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe('DELETE /api/food-logs', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/food-logs?id=log-1');
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when ID is missing', async () => {
      mockAuth.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/food-logs');
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Food log ID is required');
    });

    it('should return 404 when food log not found', async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockFindFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/food-logs?id=log-1');
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Food log not found');
    });

    it('should delete food log successfully', async () => {
      mockAuth.mockResolvedValue(mockSession);
      const existingLog = { id: 'log-1', userId: 'user-123', foodName: 'Banana' };
      
      mockFindFirst.mockResolvedValue(existingLog);
      mockDelete.mockResolvedValue(existingLog);

      const request = new NextRequest('http://localhost:3000/api/food-logs?id=log-1');
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Food log deleted successfully');
      expect(mockPrisma.foodLog.delete).toHaveBeenCalledWith({
        where: { id: 'log-1' },
      });
    });
  });
});
