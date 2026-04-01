import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import LogPage from '../page';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

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
}));

// Mock dynamic import
jest.mock('next/dynamic', () => {
  return function dynamic(loader: () => Promise<{ default: React.ComponentType }>, options?: { loading?: () => React.ReactNode }) {
    // If there's a loading component, we can ignore it for testing
    void options;
    const Component = () => <div data-testid="log-page-content">Log Page Content</div>;
    Component.displayName = 'MockedLogPage';
    return Component;
  };
});

// Mock ErrorBoundary
jest.mock('../../../../components/shared/ErrorBoundary', () => {
  return function ErrorBoundary({ children }: { children: React.ReactNode }) {
    return <div data-testid="error-boundary">{children}</div>;
  };
});

describe('Log Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when session is not available', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    });

    const { container } = render(<LogPage />);

    expect(container.querySelector('[data-testid="log-page-content"]')).not.toBeInTheDocument();
  });

  it('renders log page content when user is authenticated', () => {
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

    render(<LogPage />);

    expect(screen.getByTestId('log-page-content')).toBeInTheDocument();
  });

  it('wraps content in ErrorBoundary', () => {
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

    render(<LogPage />);

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });
});
