/* eslint-disable @typescript-eslint/no-explicit-any */
import './jest-setup.js';
import { POST } from '../mark-invite-used/route';
import { NextRequest } from 'next/server';

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock dependencies
jest.mock('@/lib/prisma');

import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as any;

// Add proper typing for mock functions
const mockFindFirst = mockPrisma.betaInvite.findFirst as jest.MockedFunction<any>;
const mockUpdate = mockPrisma.betaInvite.update as jest.MockedFunction<any>;

describe('Mark Invite Used API', () => {
  const mockInvite = {
    id: 'invite-123',
    code: 'test-code-123',
    email: 'test@example.com',
    used: false,
    revoked: false,
    createdAt: new Date('2025-01-01'),
    expiresAt: new Date('2025-12-31'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('POST /api/mark-invite-used', () => {
    it('should successfully mark invite as used', async () => {
      mockFindFirst.mockResolvedValue(mockInvite);
      mockUpdate.mockResolvedValue({ ...mockInvite, used: true, usedAt: new Date() });

      const request = new NextRequest('http://localhost:3000/api/mark-invite-used', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code-123',
          email: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          code: 'test-code-123',
          email: 'test@example.com',
          used: false,
          revoked: false,
        },
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'invite-123' },
        data: {
          used: true,
          usedAt: expect.any(Date),
        },
      });
    });

    it('should handle case-insensitive email matching', async () => {
      mockFindFirst.mockResolvedValue(mockInvite);
      mockUpdate.mockResolvedValue({ ...mockInvite, used: true, usedAt: new Date() });

      const request = new NextRequest('http://localhost:3000/api/mark-invite-used', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code-123',
          email: 'TEST@EXAMPLE.COM', // Uppercase email
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          code: 'test-code-123',
          email: 'test@example.com', // Should be lowercased
          used: false,
          revoked: false,
        },
      });
    });

    it('should return 400 when code is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/mark-invite-used', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing code or email');
      expect(mockFindFirst).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return 400 when email is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/mark-invite-used', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing code or email');
      expect(mockFindFirst).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return 400 when both code and email are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/mark-invite-used', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing code or email');
      expect(mockFindFirst).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return 400 when code is empty string', async () => {
      const request = new NextRequest('http://localhost:3000/api/mark-invite-used', {
        method: 'POST',
        body: JSON.stringify({
          code: '',
          email: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing code or email');
      expect(mockFindFirst).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return 400 when email is empty string', async () => {
      const request = new NextRequest('http://localhost:3000/api/mark-invite-used', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code-123',
          email: '',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing code or email');
      expect(mockFindFirst).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return 404 when invite is not found', async () => {
      mockFindFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/mark-invite-used', {
        method: 'POST',
        body: JSON.stringify({
          code: 'non-existent-code',
          email: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invite not found or already used');
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return 404 when invite is already used', async () => {
      // Mock should return null because the query filters for used: false
      mockFindFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/mark-invite-used', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code-123',
          email: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invite not found or already used');
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return 404 when invite is revoked', async () => {
      // Mock should return null because the query filters for revoked: false
      mockFindFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/mark-invite-used', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code-123',
          email: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invite not found or already used');
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should handle database errors during findFirst', async () => {
      mockFindFirst.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/mark-invite-used', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code-123',
          email: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to mark invite as used');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error marking invite as used:',
        expect.any(Error)
      );
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should handle database errors during update', async () => {
      mockFindFirst.mockResolvedValue(mockInvite);
      mockUpdate.mockRejectedValue(new Error('Update failed'));

      const request = new NextRequest('http://localhost:3000/api/mark-invite-used', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code-123',
          email: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to mark invite as used');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error marking invite as used:',
        expect.any(Error)
      );
    });

    it('should handle invalid JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/mark-invite-used', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to mark invite as used');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error marking invite as used:',
        expect.any(SyntaxError)
      );
      expect(mockFindFirst).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should handle email with different case than stored', async () => {
      // Mock should return null because email case doesn't match
      mockFindFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/mark-invite-used', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code-123',
          email: 'Test@Example.Com', // Mixed case
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invite not found or already used');
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
