import '@testing-library/jest-dom'

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
    }
  }
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js server session
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock web globals for Next.js API routes
const mockHeaders = () => {
  const headers: Record<string, string> = {};
  return {
    get: (name: string) => headers[name.toLowerCase()] || null,
    set: (name: string, value: string) => { headers[name.toLowerCase()] = value; },
    has: (name: string) => name.toLowerCase() in headers,
    forEach: (callback: (value: string, name: string) => void) => {
      Object.entries(headers).forEach(([name, value]) => callback(value, name));
    },
    entries: () => Object.entries(headers)[Symbol.iterator](),
    keys: () => Object.keys(headers)[Symbol.iterator](),
    values: () => Object.values(headers)[Symbol.iterator](),
    append: (name: string, value: string) => { headers[name.toLowerCase()] = value; },
    delete: (name: string) => { delete headers[name.toLowerCase()]; },
  };
};

// Mock NextResponse
(global as any).NextResponse = class MockNextResponse {
  private _body: any;
  private _status: number;
  private _headers: any;

  constructor(body?: any, init?: { status?: number; headers?: any }) {
    this._body = body;
    this._status = init?.status || 200;
    this._headers = mockHeaders();
    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this._headers.set(key, value as string);
      });
    }
  }

  get status() { return this._status; }
  get ok() { return this._status >= 200 && this._status < 300; }
  get headers() { return this._headers; }

  async json() {
    return this._body;
  }

  async text() {
    return typeof this._body === 'string' ? this._body : JSON.stringify(this._body);
  }

  static json(data: any, init?: any) {
    return new this(data, init);
  }
};

// Mock Response for global scope
(global as any).Response = class MockResponse {
  private _body: any;
  private _status: number;
  private _headers: any;

  constructor(body?: any, init?: { status?: number; headers?: any }) {
    this._body = body;
    this._status = init?.status || 200;
    this._headers = mockHeaders();
    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this._headers.set(key, value as string);
      });
    }
  }

  get status() { return this._status; }
  get ok() { return this._status >= 200 && this._status < 300; }
  get headers() { return this._headers; }

  async json() {
    return typeof this._body === 'string' ? JSON.parse(this._body) : this._body;
  }

  async text() {
    return typeof this._body === 'string' ? this._body : JSON.stringify(this._body);
  }

  static json(data: any, init?: any) {
    return new this(JSON.stringify(data), {
      ...init,
      headers: { 'content-type': 'application/json', ...(init?.headers || {}) }
    });
  }
};

// Mock Request for global scope  
(global as any).Request = class MockRequest {
  _url: string;
  method: string;
  headers: any;
  body: any;

  constructor(input: string | Request, init?: RequestInit) {
    this._url = typeof input === 'string' ? input : input.url;
    this.method = init?.method || 'GET';
    this.headers = mockHeaders();
    this.body = init?.body;
    
    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key, value as string);
      });
    }
  }

  get url() {
    return this._url;
  }

  async json() {
    return JSON.parse(this.body || '{}');
  }

  async text() {
    return this.body || '';
  }
};

// Mock Headers for global scope
(global as any).Headers = class MockHeaders {
  private headers: Record<string, string> = {};

  constructor(init?: HeadersInit) {
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => {
          this.headers[key.toLowerCase()] = value;
        });
      } else if (init instanceof Headers) {
        // Handle Headers instance
      } else {
        Object.entries(init).forEach(([key, value]) => {
          this.headers[key.toLowerCase()] = value;
        });
      }
    }
  }

  get(name: string) {
    return this.headers[name.toLowerCase()] || null;
  }

  set(name: string, value: string) {
    this.headers[name.toLowerCase()] = value;
  }

  has(name: string) {
    return name.toLowerCase() in this.headers;
  }

  forEach(callback: (value: string, name: string) => void) {
    Object.entries(this.headers).forEach(([name, value]) => callback(value, name));
  }

  entries() {
    return Object.entries(this.headers)[Symbol.iterator]();
  }

  keys() {
    return Object.keys(this.headers)[Symbol.iterator]();
  }

  values() {
    return Object.values(this.headers)[Symbol.iterator]();
  }

  append(name: string, value: string) {
    this.headers[name.toLowerCase()] = value;
  }

  delete(name: string) {
    delete this.headers[name.toLowerCase()];
  }
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = jest.fn();

// Clean up mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated'
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';

// Mock ResizeObserver for Headless UI components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock the environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
