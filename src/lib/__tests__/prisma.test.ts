// Mock @prisma/client before any imports
jest.mock('@prisma/client', () => {
  const mockPrismaClient = jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    // Add other methods as needed
  }));

  return {
    PrismaClient: mockPrismaClient,
  };
});

// Import after mocking
import { PrismaClient } from '@prisma/client';
import { prisma } from '../prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

describe('prisma', () => {
  beforeEach(() => {
    // Clear the global prisma instance
    globalForPrisma.prisma = undefined;
    // Clear all mocks
    jest.clearAllMocks();
    // Reset the PrismaClient mock
    (PrismaClient as jest.MockedClass<typeof PrismaClient>).mockClear();
  });

  it('creates a new PrismaClient instance when none exists', async () => {
    // Force recreation by clearing global and re-importing
    const globalForPrisma = globalThis as unknown as {
      prisma: PrismaClient | undefined;
    };
    globalForPrisma.prisma = undefined;
    // Re-import to trigger new instance creation
    jest.resetModules();
    const { prisma: freshPrisma } = await import('../prisma');
    expect(PrismaClient).toHaveBeenCalledTimes(1);
    expect(freshPrisma).toBeDefined();
  });

  it('reuses existing PrismaClient instance', async () => {
    // Force recreation by clearing global and re-importing
    const globalForPrisma = globalThis as unknown as {
      prisma: PrismaClient | undefined;
    };
    globalForPrisma.prisma = undefined;
    jest.resetModules();
    const { prisma: freshPrisma1 } = await import('../prisma');
    const { prisma: freshPrisma2 } = await import('../prisma');
    expect(PrismaClient).toHaveBeenCalledTimes(1);
    expect(freshPrisma1).toBe(freshPrisma2);
  });

  it('sets global prisma in development', async () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });

    const globalForPrisma = globalThis as unknown as {
      prisma: PrismaClient | undefined;
    };
    globalForPrisma.prisma = undefined;
    const { prisma: freshPrisma } = await import('../prisma');
    void freshPrisma; // trigger creation
    expect(globalForPrisma.prisma).toBeDefined();

    // Restore original environment
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });

  it('does not set global prisma in production', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
    });
    globalForPrisma.prisma = undefined; // reset
    void prisma; // trigger creation
    expect(globalForPrisma.prisma).toBeUndefined();
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });
});
