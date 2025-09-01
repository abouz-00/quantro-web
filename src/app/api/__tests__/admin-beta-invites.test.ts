/* eslint-disable @typescript-eslint/no-explicit-any */
import './jest-setup.js';
import { NextRequest } from 'next/server';
import { GET, POST, PATCH } from '../admin/beta-invites/route';
import { prisma } from '@/lib/prisma';

// Mock console.error to prevent noise in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock dependencies
jest.mock('@/lib/prisma');
jest.mock('@/lib/betaAccess');
jest.mock('@/lib/email');

// Get the mocked prisma instance
const mockPrisma = prisma as any;

// Import after mocking
import { createBetaInvite, revokeBetaInvite } from '@/lib/betaAccess';
import { sendBetaInviteEmail } from '@/lib/email';

// Create mock functions
const mockCreateBetaInvite = createBetaInvite as jest.MockedFunction<any>;
const mockRevokeBetaInvite = revokeBetaInvite as jest.MockedFunction<any>;
const mockSendBetaInviteEmail = sendBetaInviteEmail as jest.MockedFunction<any>;

// Add proper typing for mock functions
const mockFindMany = mockPrisma.betaInvite.findMany as jest.MockedFunction<any>;
const mockFindUnique = mockPrisma.betaInvite.findUnique as jest.MockedFunction<any>;

describe('Admin Beta Invites API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();

    // Reset all mocks to default behavior
    mockCreateBetaInvite.mockReset();
    mockRevokeBetaInvite.mockReset();
    mockSendBetaInviteEmail.mockReset();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('GET /api/admin/beta-invites', () => {
    it('should return all beta invites successfully', async () => {
      const mockInvites = [
        {
          id: 'invite-1',
          email: 'test1@example.com',
          code: 'code123',
          used: false,
          revoked: false,
          createdAt: new Date('2025-01-01'),
          expiresAt: null,
        },
        {
          id: 'invite-2',
          email: 'test2@example.com',
          code: 'code456',
          used: true,
          revoked: false,
          createdAt: new Date('2025-01-02'),
          expiresAt: new Date('2025-12-31'),
        },
      ];

      mockFindMany.mockResolvedValue(mockInvites);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.invites).toEqual(mockInvites);
      expect(mockFindMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle database errors', async () => {
      mockFindMany.mockRejectedValue(new Error('Database connection failed'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch beta invites');
      // Note: console.error is called in the route, not in the test
    });
  });

  describe('POST /api/admin/beta-invites', () => {
    it('should create a beta invite successfully with email sending', async () => {
      const requestBody = {
        email: 'newuser@example.com',
        expiresInDays: 30,
        sendEmail: true,
      };

      const mockInvite = {
        id: 'invite-123',
        email: 'newuser@example.com',
        code: 'generated-code-123',
        used: false,
        revoked: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      mockCreateBetaInvite.mockResolvedValue('generated-code-123');
      mockFindUnique.mockResolvedValue(mockInvite);
      mockSendBetaInviteEmail.mockResolvedValue({ success: true });

      const request = new NextRequest('http://localhost:3000/api/admin/beta-invites', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.code).toBe('generated-code-123');
      expect(data.emailSent).toBe(true);
      expect(mockCreateBetaInvite).toHaveBeenCalledWith('newuser@example.com', 30);
      expect(mockSendBetaInviteEmail).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        code: 'generated-code-123',
        expiresAt: mockInvite.expiresAt,
      });
    });

    it('should create a beta invite successfully without email sending', async () => {
      const requestBody = {
        email: 'newuser@example.com',
        expiresInDays: 30,
        sendEmail: false,
      };

      mockCreateBetaInvite.mockResolvedValue('generated-code-123');

      const request = new NextRequest('http://localhost:3000/api/admin/beta-invites', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.code).toBe('generated-code-123');
      expect(data.emailSent).toBe(false);
      expect(mockSendBetaInviteEmail).not.toHaveBeenCalled();
    });

    it('should create a beta invite with default email sending', async () => {
      const requestBody = {
        email: 'newuser@example.com',
        expiresInDays: 30,
      };

      const mockInvite = {
        id: 'invite-123',
        email: 'newuser@example.com',
        code: 'generated-code-123',
        used: false,
        revoked: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      mockCreateBetaInvite.mockResolvedValue('generated-code-123');
      mockFindUnique.mockResolvedValue(mockInvite);
      mockSendBetaInviteEmail.mockResolvedValue({ success: true });

      const request = new NextRequest('http://localhost:3000/api/admin/beta-invites', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.emailSent).toBe(true);
      expect(mockSendBetaInviteEmail).toHaveBeenCalled();
    });

    it('should return 400 when email is missing', async () => {
      const requestBody = {
        expiresInDays: 30,
      };

      const request = new NextRequest('http://localhost:3000/api/admin/beta-invites', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email is required');
      expect(mockCreateBetaInvite).not.toHaveBeenCalled();
    });

    it('should handle createBetaInvite errors', async () => {
      const requestBody = {
        email: 'newuser@example.com',
        expiresInDays: 30,
      };

      mockCreateBetaInvite.mockRejectedValue(new Error('Email already has active invite'));

      const request = new NextRequest('http://localhost:3000/api/admin/beta-invites', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create beta invite');
      // Note: console.error is called in the route, not in the test
    });

    it('should handle email sending failures gracefully', async () => {
      const requestBody = {
        email: 'newuser@example.com',
        expiresInDays: 30,
        sendEmail: true,
      };

      mockCreateBetaInvite.mockResolvedValue('generated-code-123');
      mockFindUnique.mockResolvedValue(null); // Simulate invite not found
      mockSendBetaInviteEmail.mockResolvedValue({ success: false });

      const request = new NextRequest('http://localhost:3000/api/admin/beta-invites', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.emailSent).toBe(false);
    });
  });

  describe('PATCH /api/admin/beta-invites', () => {
    it('should revoke a beta invite successfully', async () => {
      const requestBody = {
        id: 'invite-123',
        action: 'revoke',
      };

      mockRevokeBetaInvite.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/admin/beta-invites', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Beta invite revoked successfully');
      expect(mockRevokeBetaInvite).toHaveBeenCalledWith('invite-123');
    });

    it('should return 400 when id is missing', async () => {
      const requestBody = {
        action: 'revoke',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/beta-invites', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ID and action are required');
      expect(mockRevokeBetaInvite).not.toHaveBeenCalled();
    });

    it('should return 400 when action is missing', async () => {
      const requestBody = {
        id: 'invite-123',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/beta-invites', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ID and action are required');
      expect(mockRevokeBetaInvite).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid action', async () => {
      const requestBody = {
        id: 'invite-123',
        action: 'invalid-action',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/beta-invites', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid action');
      expect(mockRevokeBetaInvite).not.toHaveBeenCalled();
    });

    it('should handle revokeBetaInvite errors', async () => {
      const requestBody = {
        id: 'invite-123',
        action: 'revoke',
      };

      mockRevokeBetaInvite.mockRejectedValue(new Error('Invite not found'));

      const request = new NextRequest('http://localhost:3000/api/admin/beta-invites', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Invite not found');
      // Note: console.error is called in the route, not in the test
    });
  });
});
