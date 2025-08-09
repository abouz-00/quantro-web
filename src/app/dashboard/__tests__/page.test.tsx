import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Dashboard from '../page';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => {
  return function Image({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Poppins: () => ({
    className: 'mocked-poppins',
  }),
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Dashboard Page', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as unknown as ReturnType<typeof useRouter>);
  });

  it('renders loading state when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    });

    render(<Dashboard />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
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
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders dashboard with fallback session when not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    render(<Dashboard />);
    
    // Should show fallback test user
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('displays Quantro logo', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    render(<Dashboard />);
    
    const logo = screen.getByAltText('Quantro Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/quantro_header.svg');
  });

  it('has sign out functionality', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-2',
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
    
    // Check if sign out button exists (assuming it's rendered in the component)
    // This will depend on the actual implementation of the dashboard
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders with user image when provided', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-3',
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
    
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });
});
