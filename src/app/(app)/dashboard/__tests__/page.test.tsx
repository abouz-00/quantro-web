import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import Dashboard from '../page';

// Mock the InviteHandler component to avoid useSearchParams issues
jest.mock('../invite-handler', () => {
  return function MockInviteHandler() {
    return null;
  };
});

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null),
    has: jest.fn(() => false),
    getAll: jest.fn(() => []),
    toString: jest.fn(() => ''),
    entries: jest.fn(() => []),
    keys: jest.fn(() => []),
    values: jest.fn(() => []),
    forEach: jest.fn(),
  })),
}));

// Mock next/image
jest.mock('next/image', () => {
  return function Image({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  };
});

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when session is not available', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    });

    const { container } = render(<Dashboard />);
    
    expect(container.firstChild).toBeNull();
  });

  it('renders dashboard with authenticated session', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          image: null,
        },
        expires: '2024-01-01',
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    render(<Dashboard />);
    
    // The dashboard shows a greeting with the user's first name
    expect(screen.getByText(/John/)).toBeInTheDocument();
  });

  it('renders nothing when not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    const { container } = render(<Dashboard />);
    
    expect(container.firstChild).toBeNull();
  });

  it('displays Quantro logo', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
        expires: '2025-12-31T23:59:59.999Z',
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    render(<Dashboard />);
    
    expect(screen.getByAltText('Quantro Logo')).toBeInTheDocument();
  });

  it('has sign out functionality', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          image: null,
        },
        expires: '2024-01-01',
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('renders with user image when provided', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          image: 'https://example.com/avatar.jpg',
        },
        expires: '2024-01-01',
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    render(<Dashboard />);
    
    // The dashboard shows a greeting with the user's first name
    expect(screen.getByText(/Jane/)).toBeInTheDocument();
  });
});
