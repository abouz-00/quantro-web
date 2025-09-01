/* eslint-disable @typescript-eslint/no-explicit-any */
import './jest-setup.js';
import { POST } from '../errors/log/route';
import { NextRequest } from 'next/server';

// Mock the auth function directly
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

import { auth } from '@/lib/auth';

const mockAuth = auth as any;

// Mock fetch for webhook testing
global.fetch = jest.fn();

// Mock fetch for webhook testing
const mockFetch = jest.fn();

global.fetch = mockFetch;

describe('Error Log API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.ERROR_WEBHOOKS;
    // Mock NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      writable: true,
    });
  });

  describe('POST /api/errors/log', () => {
    it('should successfully log an error with authenticated user', async () => {
      // Mock authenticated user
      mockAuth.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      });

      const errorLog = {
        message: 'Test error message',
        stack: 'Error: Test error\n    at testFunction (test.js:1:1)',
        context: {
          url: 'https://example.com/page',
          userAgent: 'Mozilla/5.0...',
          timestamp: Date.now(),
          severity: 'high',
          category: 'javascript',
          tags: { component: 'TestComponent' },
          metadata: { additionalData: 'test' },
        },
        fingerprint: 'abc123',
      };

      const request = new NextRequest('http://localhost:3000/api/errors/log', {
        method: 'POST',
        body: JSON.stringify(errorLog),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockAuth).toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith(
        '🚨 Client Error Report:',
        expect.stringContaining('"message": "Test error message"')
      );
    });

    it('should successfully log an error with unauthenticated user', async () => {
      // Mock unauthenticated user
      mockAuth.mockResolvedValue(null);

      const errorLog = {
        message: 'Test error message',
        context: {
          url: 'https://example.com/page',
        },
      };

      const request = new NextRequest('http://localhost:3000/api/errors/log', {
        method: 'POST',
        body: JSON.stringify(errorLog),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should handle minimal error log data', async () => {
      mockAuth.mockResolvedValue(null);

      const errorLog = {
        message: 'Minimal error',
      };

      const request = new NextRequest('http://localhost:3000/api/errors/log', {
        method: 'POST',
        body: JSON.stringify(errorLog),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
    });

    it('should handle invalid JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/errors/log', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to process error log');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to process error log:',
        expect.any(SyntaxError)
      );
    });

    it('should handle auth errors gracefully', async () => {
      mockAuth.mockRejectedValue(new Error('Auth service unavailable'));

      const errorLog = {
        message: 'Test error',
      };

      const request = new NextRequest('http://localhost:3000/api/errors/log', {
        method: 'POST',
        body: JSON.stringify(errorLog),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to process error log');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to process error log:',
        expect.any(Error)
      );
    });

    it('should send error logs to configured webhooks', async () => {
      process.env.ERROR_WEBHOOKS = 'https://webhook1.com, https://webhook2.com';
      mockAuth.mockResolvedValue(null);
      mockFetch.mockResolvedValue({ ok: true });

      const errorLog = {
        message: 'Webhook test error',
      };

      const request = new NextRequest('http://localhost:3000/api/errors/log', {
        method: 'POST',
        body: JSON.stringify(errorLog),
      });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      
      // Check that webhook1 was called
      const webhook1Call = mockFetch.mock.calls.find(call => call[0] === 'https://webhook1.com');
      expect(webhook1Call).toBeTruthy();
      expect(webhook1Call[1]).toMatchObject({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(webhook1Call[1].body).toContain('"message":"Webhook test error"');
      
      // Check that webhook2 was called
      const webhook2Call = mockFetch.mock.calls.find(call => call[0] === 'https://webhook2.com');
      expect(webhook2Call).toBeTruthy();
      expect(webhook2Call[1].body).toContain('"message":"Webhook test error"');
    });

    it('should handle webhook failures gracefully', async () => {
      process.env.ERROR_WEBHOOKS = 'https://failing-webhook.com';
      mockAuth.mockResolvedValue(null);
      mockFetch.mockRejectedValue(new Error('Webhook failed'));

      const errorLog = {
        message: 'Webhook failure test',
      };

      const request = new NextRequest('http://localhost:3000/api/errors/log', {
        method: 'POST',
        body: JSON.stringify(errorLog),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to send to webhook https://failing-webhook.com:',
        expect.any(Error)
      );
    });

    it('should enrich error logs with server context', async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: 'user-456',
          email: 'user@example.com',
        },
      });

      const errorLog = {
        message: 'Context enrichment test',
        context: {
          url: 'https://example.com/test',
        },
      };

      const request = new NextRequest('http://localhost:3000/api/errors/log', {
        method: 'POST',
        body: JSON.stringify(errorLog),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);

      // Check that console.error was called with enriched data
      const consoleCall = mockConsoleError.mock.calls.find((call: any) =>
        call[0] === '🚨 Client Error Report:'
      );

      expect(consoleCall).toBeTruthy();
      const loggedData = JSON.parse(consoleCall[1]);

      expect(loggedData.context.userId).toBe('user-456');
      expect(loggedData.context.sessionId).toBe('user@example.com');
      expect(loggedData.context.serverTimestamp).toBeDefined();
      expect(loggedData.context.environment).toBe('test');
      expect(loggedData.context.url).toBe('https://example.com/test');
    });

    it('should handle empty webhook configuration', async () => {
      delete process.env.ERROR_WEBHOOKS; // Remove the env var entirely
      mockAuth.mockResolvedValue(null);

      const errorLog = {
        message: 'Empty webhooks test',
      };

      const request = new NextRequest('http://localhost:3000/api/errors/log', {
        method: 'POST',
        body: JSON.stringify(errorLog),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
