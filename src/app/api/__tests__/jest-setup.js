// Mock NextAuth to avoid ES module issues
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  __esModule: true,
  auth: jest.fn(),
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
      return typeof this._body === 'string' ? JSON.parse(this._body) : this._body || {};
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

export {};
