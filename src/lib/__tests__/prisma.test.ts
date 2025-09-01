// Mock @prisma/client before any imports
const mockPrismaClient = jest.fn().mockImplementation(() => ({
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  // Add other methods as needed
}));

jest.mock('@prisma/client', () => ({
  PrismaClient: mockPrismaClient,
}));

describe('prisma', () => {
  beforeEach(() => {
    // Clear all mocks but don't reset modules to avoid breaking singleton
    jest.clearAllMocks();
    mockPrismaClient.mockClear();
  });

  it('exports a prisma instance', async () => {
    const { prisma } = await import('../prisma');
    expect(prisma).toBeDefined();
    expect(typeof prisma).toBe('object');
  });

  it('maintains singleton behavior', async () => {
    const { prisma: prisma1 } = await import('../prisma');
    const { prisma: prisma2 } = await import('../prisma');
    expect(prisma1).toBe(prisma2);
  });

  it('works in production environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
    });
    
    const { prisma } = await import('../prisma');
    expect(prisma).toBeDefined();
    
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });

  it('can be used for database operations', async () => {
    const { prisma } = await import('../prisma');
    
    // Test that prisma has the expected methods
    expect(prisma).toHaveProperty('$connect');
    expect(prisma).toHaveProperty('$disconnect');
    expect(typeof prisma.$connect).toBe('function');
    expect(typeof prisma.$disconnect).toBe('function');
  });
});
