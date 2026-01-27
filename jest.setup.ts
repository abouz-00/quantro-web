/// <reference types="jest" />
import '@testing-library/jest-dom'
import React from 'react'

// Mock react-calendar globally to avoid ES module issues
jest.mock('react-calendar', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => null),
}));

// Mock react-calendar CSS
jest.mock('react-calendar/dist/Calendar.css', () => ({}));

// Mock uuid to avoid ES module issues
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

// Mock Chart.js and react-chartjs-2 to avoid canvas issues
const mockChartJS = {
  register: jest.fn(),
};

jest.mock('chart.js', () => ({
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
  })),
  ChartJS: mockChartJS,
  register: jest.fn(),
  ArcElement: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  BarElement: jest.fn(),
  // Export ChartJS as both named and default export
  __esModule: true,
  default: mockChartJS,
}));

jest.mock('react-chartjs-2', () => ({
  Line: jest.fn().mockReturnValue(null),
  Bar: jest.fn().mockReturnValue(null),
  Doughnut: jest.fn().mockReturnValue(null),
  Pie: jest.fn().mockReturnValue(null),
}));

// Mock fetch globally
const mockFetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
    text: () => Promise.resolve(''),
    status: 200,
  } as Response));

global.fetch = mockFetch;

// Also mock globalThis.fetch for consistency
if (typeof globalThis !== 'undefined') {
  globalThis.fetch = mockFetch;
}

// Mock HTMLCanvasElement.getContext to avoid Chart.js canvas issues
HTMLCanvasElement.prototype.getContext = jest.fn(() => null);

// Mock DragEvent for drag and drop testing
global.DragEvent = class MockDragEvent extends Event {
  constructor(type: string, eventInitDict?: DragEventInit) {
    super(type, eventInitDict);
    this.dataTransfer = (eventInitDict?.dataTransfer || {
      dropEffect: 'none',
      effectAllowed: 'all',
      files: [],
      items: [],
      types: [],
      clearData: jest.fn(),
      getData: jest.fn(),
      setData: jest.fn(),
      setDragImage: jest.fn(),
    }) as unknown as DataTransfer;
  }
  dataTransfer: DataTransfer;
} as unknown as typeof DragEvent;

// Type definitions for mocks
interface MockHeaders {
  get(name: string): string | null
  set(name: string, value: string): void
  has(name: string): boolean
  forEach(callback: (value: string, name: string) => void): void
  entries(): IterableIterator<[string, string]>
  keys(): IterableIterator<string>
  values(): IterableIterator<string>
  append(name: string, value: string): void
  delete(name: string): void
}

interface MockResponseInit {
  status?: number
  headers?: Record<string, string>
}

interface MockRequestInit {
  method?: string
  headers?: Record<string, string>
  body?: string
}

 
// Extend Jest matchers with global declaration
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
  useSearchParams: () => ({
    get: jest.fn(() => null),
    has: jest.fn(() => false),
    toString: jest.fn(() => ''),
  }),
}));

// Mock Next.js server session
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock web globals for Next.js API routes
const mockHeaders = (): MockHeaders => {
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
class MockNextResponse {
  private _body: unknown;
  private _status: number;
  private _headers: MockHeaders;

  constructor(body?: unknown, init?: MockResponseInit) {
    this._body = body;
    this._status = init?.status || 200;
    this._headers = mockHeaders();
    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this._headers.set(key, value);
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

  static json(data: unknown, init?: MockResponseInit) {
    return new this(data, init);
  }
}

(globalThis as typeof globalThis & { NextResponse: typeof MockNextResponse }).NextResponse = MockNextResponse;

// Mock Response for global scope
class MockResponse {
  private _body: unknown;
  private _status: number;
  private _headers: MockHeaders;

  constructor(body?: unknown, init?: MockResponseInit) {
    this._body = body;
    this._status = init?.status || 200;
    this._headers = mockHeaders();
    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this._headers.set(key, value);
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

  static json(data: unknown, init?: MockResponseInit) {
    return new this(JSON.stringify(data), {
      ...init,
      headers: { 'content-type': 'application/json', ...(init?.headers || {}) }
    });
  }
}

(globalThis as unknown as { Response: typeof MockResponse }).Response = MockResponse;

// Mock Request for global scope  
class MockRequest {
  private _url: string;
  method: string;
  headers: MockHeaders;
  body: string | null;

  constructor(input: string | Request, init?: MockRequestInit) {
    this._url = typeof input === 'string' ? input : input.url;
    this.method = init?.method || 'GET';
    this.headers = mockHeaders();
    this.body = init?.body || null;
    
    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key, value);
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
}

(globalThis as unknown as { Request: typeof MockRequest }).Request = MockRequest;

// Mock Headers for global scope
class MockHeadersClass implements MockHeaders {
  private headers: Record<string, string> = {};

  constructor(init?: HeadersInit) {
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => {
          this.headers[key.toLowerCase()] = value;
        });
      } else if (init instanceof Headers) {
        // Handle Headers instance - iterate through entries
        init.forEach((value, key) => {
          this.headers[key.toLowerCase()] = value;
        });
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
}

(globalThis as unknown as { Headers: typeof MockHeadersClass }).Headers = MockHeadersClass;

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
// Already mocked above, no need for conditional

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

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
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

// Mock error service to prevent real error logging
jest.mock('@/services/errorService', () => ({
  errorService: {
    logError: jest.fn().mockResolvedValue(undefined),
    reportError: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';

// Mock ResizeObserver for Headless UI components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Also mock on globalThis for consistency
if (typeof globalThis !== 'undefined') {
  globalThis.ResizeObserver = global.ResizeObserver;
}

// Mock IntersectionObserver for Headless UI components and Next.js
const MockIntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Override the constructor completely
Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Also mock on globalThis for consistency
if (typeof globalThis !== 'undefined') {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
}

// Mock @dnd-kit modules globally to avoid ResizeObserver issues
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  useSensor: jest.fn(),
  useSensors: jest.fn(),
  PointerSensor: jest.fn(),
  KeyboardSensor: jest.fn(),
  closestCenter: jest.fn(),
  DragOverlay: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    isDragging: false,
  }),
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  verticalListSortingStrategy: jest.fn(),
  sortableKeyboardCoordinates: jest.fn(),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => ''),
    },
  },
  rectIntersection: jest.fn(),
  rectSortingStrategy: jest.fn(),
}));

jest.mock('@dnd-kit/modifiers', () => ({
  restrictToVerticalAxis: jest.fn(),
}));

// Mock @headlessui/react to avoid IntersectionObserver issues
jest.mock('@headlessui/react', () => ({
  Disclosure: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  DisclosureButton: ({ children }: { children: React.ReactNode }) => React.createElement('button', null, children),
  DisclosurePanel: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Menu: Object.assign(
    ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    {
      Button: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: unknown }) => React.createElement('button', { className, ...props }, children),
      Items: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: unknown }) => React.createElement('div', { className, ...props }, children),
      Item: ({ children, ...props }: { children?: React.ReactNode | (({ active }: { active: boolean }) => React.ReactNode); [key: string]: unknown }) => {
        if (typeof children === 'function') {
          return children({ active: false });
        }
        return React.createElement('div', props, children);
      },
    }
  ),
  MenuButton: ({ children }: { children: React.ReactNode }) => React.createElement('button', null, children),
  MenuItems: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  MenuItem: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Transition: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Dialog: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  DialogPanel: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  DialogTitle: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  DialogBackdrop: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
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

// Mock scrollIntoView for keyboard navigation tests
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: jest.fn(),
});
