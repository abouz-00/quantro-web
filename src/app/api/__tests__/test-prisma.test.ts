/* eslint-disable @typescript-eslint/no-explicit-any */
import './jest-setup.js';
import { GET } from '@/app/api/test-prisma/route';
import { prisma } from '@/lib/prisma';

// Mock console methods to prevent noise in tests
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Get the mocked prisma instance
const mockPrisma = prisma as any;

// Add proper typing for mock functions
const mockFindFirst = mockPrisma.betaInvite.findFirst as jest.MockedFunction<any>;
const mockUpdate = mockPrisma.betaInvite.update as jest.MockedFunction<any>;

describe('/api/test-prisma', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('GET - Successful update', () => {
    it('should successfully update an invite when one exists', async () => {
      const mockInvite = {
        id: 'test-invite-id',
        email: 'test@example.com',
        token: 'test-token',
        createdAt: new Date(),
        used: false,
        usedAt: null,
        revoked: false,
        revokedAt: null,
      };

      const mockUpdatedInvite = {
        ...mockInvite,
        revoked: true,
        revokedAt: new Date(),
      };

      mockFindFirst.mockResolvedValue(mockInvite);
      mockUpdate.mockResolvedValue(mockUpdatedInvite);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: 'Update worked!',
        updatedInvite: mockUpdatedInvite,
      });

      expect(mockFindFirst).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: mockInvite.id },
        data: {
          revoked: true,
          revokedAt: expect.any(Date),
        },
      });

      expect(mockConsoleLog).toHaveBeenCalledWith('Found invite:', mockInvite.id);
      expect(mockConsoleLog).toHaveBeenCalledWith('Has revoked field:', true);
      expect(mockConsoleLog).toHaveBeenCalledWith('Invite object keys:', Object.keys(mockInvite));
    });

    it('should handle invite with existing revoked field properly', async () => {
      const mockInvite = {
        id: 'test-invite-id',
        email: 'test@example.com',
        token: 'test-token',
        createdAt: new Date(),
        used: true,
        usedAt: new Date(),
        revoked: false,
        revokedAt: null,
      };

      const mockUpdatedInvite = {
        ...mockInvite,
        revoked: true,
        revokedAt: new Date(),
      };

      mockFindFirst.mockResolvedValue(mockInvite);
      mockUpdate.mockResolvedValue(mockUpdatedInvite);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.updatedInvite.revoked).toBe(true);
      expect(data.updatedInvite.revokedAt).toBeInstanceOf(Date);
    });
  });

  describe('GET - No invite found', () => {
    it('should return 404 when no invite exists', async () => {
      mockFindFirst.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'No invite found',
      });

      expect(mockFindFirst).toHaveBeenCalledTimes(1);
      expect(mockUpdate).not.toHaveBeenCalled();

      expect(mockConsoleLog).not.toHaveBeenCalled();
    });
  });

  describe('GET - Database errors', () => {
    it('should handle database error during findFirst', async () => {
      const dbError = new Error('Database connection failed');
      mockFindFirst.mockRejectedValue(dbError);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Database connection failed',
        stack: dbError.stack,
      });

      expect(mockFindFirst).toHaveBeenCalledTimes(1);
      expect(mockUpdate).not.toHaveBeenCalled();

      expect(mockConsoleError).toHaveBeenCalledWith('API Test Error:', dbError);
    });

    it('should handle database error during update', async () => {
      const mockInvite = {
        id: 'test-invite-id',
        email: 'test@example.com',
        token: 'test-token',
        createdAt: new Date(),
        used: false,
        usedAt: null,
        revoked: false,
        revokedAt: null,
      };

      const dbError = new Error('Update failed due to constraint violation');
      mockFindFirst.mockResolvedValue(mockInvite);
      mockUpdate.mockRejectedValue(dbError);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Update failed due to constraint violation',
        stack: dbError.stack,
      });

      expect(mockFindFirst).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledTimes(1);

      expect(mockConsoleLog).toHaveBeenCalledWith('Found invite:', mockInvite.id);
      expect(mockConsoleLog).toHaveBeenCalledWith('Has revoked field:', true);
      expect(mockConsoleLog).toHaveBeenCalledWith('Invite object keys:', Object.keys(mockInvite));
      expect(mockConsoleError).toHaveBeenCalledWith('API Test Error:', dbError);
    });

    it('should handle non-Error database exceptions', async () => {
      mockFindFirst.mockRejectedValue('String error');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Unknown error occurred',
        stack: undefined,
      });

      expect(mockConsoleError).toHaveBeenCalledWith('API Test Error:', 'String error');
    });
  });

  describe('GET - Logging behavior', () => {
    it('should log correct information when invite is found', async () => {
      const mockInvite = {
        id: 'test-invite-id',
        email: 'test@example.com',
        token: 'test-token',
        createdAt: new Date(),
        used: false,
        usedAt: null,
        revoked: false,
        revokedAt: null,
      };

      mockFindFirst.mockResolvedValue(mockInvite);
      mockUpdate.mockResolvedValue({
        ...mockInvite,
        revoked: true,
        revokedAt: new Date(),
      });

      await GET();

      expect(mockConsoleLog).toHaveBeenCalledTimes(3);
      expect(mockConsoleLog).toHaveBeenNthCalledWith(1, 'Found invite:', mockInvite.id);
      expect(mockConsoleLog).toHaveBeenNthCalledWith(2, 'Has revoked field:', true);
      expect(mockConsoleLog).toHaveBeenNthCalledWith(3, 'Invite object keys:', Object.keys(mockInvite));
    });

    it('should not log when no invite is found', async () => {
      mockFindFirst.mockResolvedValue(null);

      await GET();

      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should log errors correctly', async () => {
      const dbError = new Error('Test error');
      mockFindFirst.mockRejectedValue(dbError);

      await GET();

      expect(mockConsoleError).toHaveBeenCalledWith('API Test Error:', dbError);
    });
  });

  describe('GET - Update operation', () => {
    it('should update invite with correct data structure', async () => {
      const mockInvite = {
        id: 'test-invite-id',
        email: 'test@example.com',
        token: 'test-token',
        createdAt: new Date(),
        used: false,
        usedAt: null,
        revoked: false,
        revokedAt: null,
      };

      mockFindFirst.mockResolvedValue(mockInvite);
      mockUpdate.mockResolvedValue({
        ...mockInvite,
        revoked: true,
        revokedAt: new Date(),
      });

      await GET();

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: mockInvite.id },
        data: {
          revoked: true,
          revokedAt: expect.any(Date),
        },
      });
    });

    it('should preserve other invite fields during update', async () => {
      const mockInvite = {
        id: 'test-invite-id',
        email: 'test@example.com',
        token: 'test-token',
        createdAt: new Date(),
        used: true,
        usedAt: new Date(),
        revoked: false,
        revokedAt: null,
      };

      const expectedUpdatedInvite = {
        ...mockInvite,
        revoked: true,
        revokedAt: expect.any(Date),
      };

      mockFindFirst.mockResolvedValue(mockInvite);
      mockUpdate.mockResolvedValue(expectedUpdatedInvite);

      const response = await GET();
      const data = await response.json();

      expect(data.updatedInvite).toMatchObject({
        id: mockInvite.id,
        email: mockInvite.email,
        token: mockInvite.token,
        createdAt: mockInvite.createdAt,
        used: mockInvite.used,
        usedAt: mockInvite.usedAt,
        revoked: true,
        revokedAt: expect.any(Date),
      });
    });
  });
});
