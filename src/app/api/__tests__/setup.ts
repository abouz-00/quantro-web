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

export {};
