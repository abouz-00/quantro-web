 
import './jest-setup.js';
import { POST } from '../food-logs/reorder/route';
import { NextRequest } from 'next/server';

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock dependencies
jest.mock('@/lib/auth');
jest.mock('@/lib/prisma');

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const mockAuth = auth as jest.MockedFunction<any>;
const mockPrisma = prisma as any;

// Add proper typing for mock functions
const mockFindMany = mockPrisma.foodLog.findMany as jest.MockedFunction<any>;
const mockUpdate = mockPrisma.foodLog.update as jest.MockedFunction<any>;

describe('Food Logs Reorder API', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    },
  };

  const mockEntries = [
    {
      id: 'entry-1',
      userId: 'user-123',
      foodName: 'Apple',
      amount: '1',
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      orderIndex: 0,
      createdAt: new Date('2025-01-01'),
    },
    {
      id: 'entry-2',
      userId: 'user-123',
      foodName: 'Banana',
      amount: '1',
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      orderIndex: 1,
      createdAt: new Date('2025-01-01'),
    },
    {
      id: 'entry-3',
      userId: 'user-123',
      foodName: 'Orange',
      amount: '1',
      calories: 62,
      protein: 1.2,
      carbs: 15,
      fat: 0.2,
      orderIndex: 2,
      createdAt: new Date('2025-01-01'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('POST /api/food-logs/reorder', () => {
    it('should successfully reorder food log entries', async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockFindMany.mockResolvedValue(mockEntries);
      mockUpdate.mockResolvedValue({});

      const newOrder = ['entry-3', 'entry-1', 'entry-2'];

      const request = new NextRequest('http://localhost:3000/api/food-logs/reorder', {
        method: 'POST',
        body: JSON.stringify({ entryIds: newOrder }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Order updated successfully');
      expect(mockAuth).toHaveBeenCalled();
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          id: { in: newOrder },
          userId: 'user-123',
        },
      });

      // Verify that update was called for each entry with correct orderIndex
      expect(mockUpdate).toHaveBeenCalledTimes(3);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'entry-3' },
        data: { orderIndex: 0 },
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: { orderIndex: 1 },
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'entry-2' },
        data: { orderIndex: 2 },
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/food-logs/reorder', {
        method: 'POST',
        body: JSON.stringify({ entryIds: ['entry-1', 'entry-2'] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(mockFindMany).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return 401 when session has no user', async () => {
      mockAuth.mockResolvedValue({ user: null });

      const request = new NextRequest('http://localhost:3000/api/food-logs/reorder', {
        method: 'POST',
        body: JSON.stringify({ entryIds: ['entry-1', 'entry-2'] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(mockFindMany).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return 400 when entryIds is not an array', async () => {
      mockAuth.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/food-logs/reorder', {
        method: 'POST',
        body: JSON.stringify({ entryIds: 'not-an-array' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid entry IDs');
      expect(mockFindMany).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return 400 when entryIds is an empty array', async () => {
      mockAuth.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/food-logs/reorder', {
        method: 'POST',
        body: JSON.stringify({ entryIds: [] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid entry IDs');
      expect(mockFindMany).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return 400 when entryIds is missing', async () => {
      mockAuth.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/food-logs/reorder', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid entry IDs');
      expect(mockFindMany).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return 404 when some entries do not exist', async () => {
      mockAuth.mockResolvedValue(mockSession);
      // Return only 2 entries instead of 3
      mockFindMany.mockResolvedValue([mockEntries[0], mockEntries[1]]);

      const request = new NextRequest('http://localhost:3000/api/food-logs/reorder', {
        method: 'POST',
        body: JSON.stringify({ entryIds: ['entry-1', 'entry-2', 'entry-3'] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Some entries not found or unauthorized');
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return 404 when entries belong to different user', async () => {
      mockAuth.mockResolvedValue(mockSession);
      // Return empty array because entries don't belong to this user
      mockFindMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/food-logs/reorder', {
        method: 'POST',
        body: JSON.stringify({ entryIds: ['entry-1', 'entry-2', 'entry-3'] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Some entries not found or unauthorized');
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should handle single entry reordering', async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockFindMany.mockResolvedValue([mockEntries[0]]);
      mockUpdate.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/food-logs/reorder', {
        method: 'POST',
        body: JSON.stringify({ entryIds: ['entry-1'] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Order updated successfully');
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: { orderIndex: 0 },
      });
    });

    it('should handle database errors during findMany', async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockFindMany.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/food-logs/reorder', {
        method: 'POST',
        body: JSON.stringify({ entryIds: ['entry-1', 'entry-2'] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error updating food log order:',
        expect.any(Error)
      );
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should handle database errors during update', async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockFindMany.mockResolvedValue([mockEntries[0], mockEntries[1]]);
      mockUpdate.mockRejectedValue(new Error('Update failed'));

      const request = new NextRequest('http://localhost:3000/api/food-logs/reorder', {
        method: 'POST',
        body: JSON.stringify({ entryIds: ['entry-1', 'entry-2'] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error updating food log order:',
        expect.any(Error)
      );
    });

    it('should handle invalid JSON gracefully', async () => {
      mockAuth.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/food-logs/reorder', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error updating food log order:',
        expect.any(SyntaxError)
      );
    });

    it('should handle auth errors gracefully', async () => {
      mockAuth.mockRejectedValue(new Error('Auth service unavailable'));

      const request = new NextRequest('http://localhost:3000/api/food-logs/reorder', {
        method: 'POST',
        body: JSON.stringify({ entryIds: ['entry-1', 'entry-2'] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error updating food log order:',
        expect.any(Error)
      );
    });
  });
});
