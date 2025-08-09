// Mock NextAuth to avoid ES module issues
jest.mock('next-auth/next', () => ({
  __esModule: true,
  default: jest.fn(),
  getServerSession: jest.fn(),
}));

jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(),
  getServerSession: jest.fn(),
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
