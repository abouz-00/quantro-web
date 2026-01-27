 
import './jest-setup.js';
import { NextRequest } from 'next/server';
import { GET, POST } from '../beta-invite/route';
import { prisma } from '@/lib/prisma';

// Mock console.error to prevent noise in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock dependencies
jest.mock('@/lib/prisma');

// Get the mocked prisma instance
const mockPrisma = prisma as any;

// Add proper typing for mock functions
const mockFindFirst = mockPrisma.betaInvite.findFirst as jest.MockedFunction<any>;

describe('Beta Invite API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('GET /api/beta-invite', () => {
    it('should validate a valid invite code successfully', async () => {
      const mockInvite = {
        id: 'invite-123',
        email: 'test@example.com',
        code: 'valid-code-123',
        used: false,
        revoked: false,
        createdAt: new Date('2025-01-01'),
        expiresAt: new Date('2025-12-31'),
      };

      mockFindFirst.mockResolvedValue(mockInvite);

      const request = new NextRequest('http://localhost:3000/api/beta-invite?code=valid-code-123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        valid: true,
        email: 'test@example.com',
        code: 'valid-code-123',
        expiresAt: mockInvite.expiresAt,
      });
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          code: 'valid-code-123',
          used: false,
          revoked: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: expect.any(Date) } }
          ]
        }
      });
    });

    it('should validate an invite with no expiration date', async () => {
      const mockInvite = {
        id: 'invite-456',
        email: 'permanent@example.com',
        code: 'permanent-code',
        used: false,
        revoked: false,
        createdAt: new Date('2025-01-01'),
        expiresAt: null,
      };

      mockFindFirst.mockResolvedValue(mockInvite);

      const request = new NextRequest('http://localhost:3000/api/beta-invite?code=permanent-code');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        valid: true,
        email: 'permanent@example.com',
        code: 'permanent-code',
        expiresAt: null,
      });
    });

    it('should return 400 when no code is provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/beta-invite');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid invite code');
      expect(mockFindFirst).not.toHaveBeenCalled();
    });

    it('should return 400 when code is empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/beta-invite?code=');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid invite code');
      expect(mockFindFirst).not.toHaveBeenCalled();
    });

    it('should return 404 for invalid invite code', async () => {
      mockFindFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/beta-invite?code=invalid-code');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invalid, expired, or revoked invite code');
    });

    it('should return 404 for used invite code', async () => {
      // Mock should return null for used invites
      mockFindFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/beta-invite?code=used-code');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invalid, expired, or revoked invite code');
    });

    it('should return 404 for revoked invite code', async () => {
      // Mock should return null for revoked invites
      mockFindFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/beta-invite?code=revoked-code');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invalid, expired, or revoked invite code');
    });

    it('should return 404 for expired invite code', async () => {
      // Mock should return null for expired invites
      mockFindFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/beta-invite?code=expired-code');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invalid, expired, or revoked invite code');
    });

    it('should handle database errors', async () => {
      mockFindFirst.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/beta-invite?code=test-code');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to validate invite');
      expect(mockConsoleError).toHaveBeenCalledWith('Error validating invite:', expect.any(Error));
    });
  });

  describe('POST /api/beta-invite', () => {
    it('should accept a valid invite successfully', async () => {
      const mockInvite = {
        id: 'invite-123',
        email: 'test@example.com',
        code: 'valid-code-123',
        used: false,
        revoked: false,
        createdAt: new Date('2025-01-01'),
        expiresAt: new Date('2025-12-31'),
      };

      mockFindFirst.mockResolvedValue(mockInvite);

      const requestBody = {
        code: 'valid-code-123',
        action: 'accept',
      };

      const request = new NextRequest('http://localhost:3000/api/beta-invite', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: 'Beta invite validated! Redirecting to sign in...',
        email: 'test@example.com',
      });
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          code: 'valid-code-123',
          used: false,
          revoked: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: expect.any(Date) } }
          ]
        }
      });
    });

    it('should return 400 when code is missing', async () => {
      const requestBody = {
        action: 'accept',
      };

      const request = new NextRequest('http://localhost:3000/api/beta-invite', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request');
      expect(mockFindFirst).not.toHaveBeenCalled();
    });

    it('should return 400 when action is not accept', async () => {
      const requestBody = {
        code: 'test-code',
        action: 'reject',
      };

      const request = new NextRequest('http://localhost:3000/api/beta-invite', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request');
      expect(mockFindFirst).not.toHaveBeenCalled();
    });

    it('should return 400 when action is missing', async () => {
      const requestBody = {
        code: 'test-code',
      };

      const request = new NextRequest('http://localhost:3000/api/beta-invite', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request');
      expect(mockFindFirst).not.toHaveBeenCalled();
    });

    it('should return 404 for invalid invite code', async () => {
      mockFindFirst.mockResolvedValue(null);

      const requestBody = {
        code: 'invalid-code',
        action: 'accept',
      };

      const request = new NextRequest('http://localhost:3000/api/beta-invite', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invalid, expired, or revoked invite code');
    });

    it('should return 404 for used invite code', async () => {
      const requestBody = {
        code: 'used-code',
        action: 'accept',
      };

      const request = new NextRequest('http://localhost:3000/api/beta-invite', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invalid, expired, or revoked invite code');
    });

    it('should return 404 for expired invite code', async () => {
      const requestBody = {
        code: 'expired-code',
        action: 'accept',
      };

      const request = new NextRequest('http://localhost:3000/api/beta-invite', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invalid, expired, or revoked invite code');
    });

    it('should handle invalid JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/beta-invite', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to accept invite');
      expect(mockConsoleError).toHaveBeenCalledWith('Error accepting invite:', expect.any(Error));
    });

    it('should handle database errors', async () => {
      mockFindFirst.mockRejectedValue(new Error('Database connection failed'));

      const requestBody = {
        code: 'test-code',
        action: 'accept',
      };

      const request = new NextRequest('http://localhost:3000/api/beta-invite', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to accept invite');
      expect(mockConsoleError).toHaveBeenCalledWith('Error accepting invite:', expect.any(Error));
    });
  });
});
