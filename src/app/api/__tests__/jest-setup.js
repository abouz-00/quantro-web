// Mock auth function
const mockAuth = jest.fn();

// Mock NextAuth to avoid ES module issues
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  __esModule: true,
  auth: mockAuth,
  signIn: jest.fn(),
  signOut: jest.fn(),
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
}));

jest.mock('jose', () => ({
  __esModule: true,
  jwtVerify: jest.fn(),
  SignJWT: jest.fn(),
}));

jest.mock('@auth/prisma-adapter', () => ({
  __esModule: true,
  PrismaAdapter: jest.fn(),
}));

// Mock Prisma client to prevent real database calls
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    foodLog: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    betaInvite: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn((args) => {
        // Intelligent mock that respects query conditions
        if (args?.where) {
          const { code, used, revoked, OR } = args.where;
          
          // Mock data for different scenarios
          const mockInvites = {
            'valid-code': {
              id: 'invite-123',
              email: 'test@example.com',
              code: 'valid-code',
              used: false,
              revoked: false,
              createdAt: new Date('2025-01-01'),
              expiresAt: new Date('2025-12-31'),
            },
            'permanent-code': {
              id: 'invite-456',
              email: 'permanent@example.com',
              code: 'permanent-code',
              used: false,
              revoked: false,
              createdAt: new Date('2025-01-01'),
              expiresAt: null,
            },
            'used-code': {
              id: 'invite-789',
              email: 'used@example.com',
              code: 'used-code',
              used: true,
              revoked: false,
              createdAt: new Date('2025-01-01'),
              expiresAt: new Date('2025-12-31'),
            },
            'revoked-code': {
              id: 'invite-101',
              email: 'revoked@example.com',
              code: 'revoked-code',
              used: false,
              revoked: true,
              createdAt: new Date('2025-01-01'),
              expiresAt: new Date('2025-12-31'),
            },
            'expired-code': {
              id: 'invite-202',
              email: 'expired@example.com',
              code: 'expired-code',
              used: false,
              revoked: false,
              createdAt: new Date('2025-01-01'),
              expiresAt: new Date('2024-12-31'), // Expired
            },
          };

          const invite = mockInvites[code];
          
          if (!invite) {
            return Promise.resolve(null);
          }

          // Check conditions
          if (used !== false || revoked !== false) {
            return Promise.resolve(null);
          }

          // Check expiration
          if (OR && OR.length > 0) {
            const now = new Date();
            const isValidExpiration = OR.some(condition => {
              if (condition.expiresAt === null) {
                return invite.expiresAt === null;
              }
              if (condition.expiresAt?.gt) {
                return invite.expiresAt === null || invite.expiresAt > now;
              }
              return true;
            });
            
            if (!isValidExpiration) {
              return Promise.resolve(null);
            }
          }

          return Promise.resolve(invite);
        }
        
        return Promise.resolve(null);
      }),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

// Mock auth options
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
}));

jest.mock('next/server', () => ({
  __esModule: true,
  NextRequest: class MockNextRequest {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init.method || 'GET';
      this.headers = new Map();
      this._body = init.body;
    }
    
    async json() {
      if (typeof this._body === 'string') {
        try {
          return JSON.parse(this._body);
        } catch {
          throw new SyntaxError(`Unexpected token 'i', "${this._body}" is not valid JSON`);
        }
      }
      return this._body || {};
    }
    
    async text() {
      return typeof this._body === 'string' ? this._body : JSON.stringify(this._body || {});
    }
  },
  NextResponse: {
    json: (data, init = {}) => ({
      json: async () => data,
      status: init.status || 200,
      ok: (init.status || 200) >= 200 && (init.status || 200) < 300,
      headers: new Map(),
    }),
  },
}));

// Mock console methods
const mockConsoleError = jest.fn();
const mockConsoleLog = jest.fn();
const mockConsoleWarn = jest.fn();

global.console = {
  ...console,
  error: mockConsoleError,
  log: mockConsoleLog,
  warn: mockConsoleWarn,
};

// Export mocks for use in tests
global.mockConsoleError = mockConsoleError;
global.mockConsoleLog = mockConsoleLog;
global.mockConsoleWarn = mockConsoleWarn;
global.mockAuth = mockAuth;
