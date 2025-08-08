import { NextRequest } from 'next/server';
import { GET, PUT } from '../user/profile/route';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('next-auth/next');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('/api/user/profile', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    },
  };

  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
    createdAt: new Date(),
    dailyCalorieGoal: 2000,
    dailyProteinGoal: 150,
    dailyCarbGoal: 200,
    dailyFatGoal: 70,
    weightUnit: 'kg',
    heightUnit: 'cm',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Temporarily skip these tests until Next.js API testing environment is properly configured
describe('User Profile API', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return user profile for authenticated user', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          dailyCalorieGoal: true,
          dailyProteinGoal: true,
          dailyCarbGoal: true,
          dailyFatGoal: true,
          weightUnit: true,
          heightUnit: true,
        },
      });
    });

    it('should return 404 when user not found', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should handle database errors', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('PUT /api/user/profile', () => {
    const updateData = {
      dailyCalorieGoal: 2200,
      dailyProteinGoal: 160,
      dailyCarbGoal: 220,
      dailyFatGoal: 75,
      weightUnit: 'lbs',
      heightUnit: 'ft',
    };

    it('should return 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should update user profile successfully', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const updatedUser = { ...mockUser, ...updateData };
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          dailyCalorieGoal: true,
          dailyProteinGoal: true,
          dailyCarbGoal: true,
          dailyFatGoal: true,
          weightUnit: true,
          heightUnit: true,
        },
      });
    });

    it('should handle database errors during update', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.user.update.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle partial updates', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const partialUpdate = { dailyCalorieGoal: 2500 };
      const updatedUser = { ...mockUser, ...partialUpdate };
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(partialUpdate),
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.dailyCalorieGoal).toBe(2500);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: partialUpdate,
        select: expect.any(Object),
      });
    });
  });
});
