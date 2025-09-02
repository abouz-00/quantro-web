import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LogPage from '../page';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock dynamic import
jest.mock('next/dynamic', () => {
  return function dynamic() {
    const Component = () => <div data-testid="log-page-content">Log Page Content</div>;
    Component.displayName = 'MockedLogPage';
    return Component;
  };
});

// Mock ErrorBoundary
jest.mock('../../../components/shared/ErrorBoundary', () => {
  return function ErrorBoundary({ children }: { children: React.ReactNode }) {
    return <div data-testid="error-boundary">{children}</div>;
  };
});

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Log Page', () => {
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
    
    // Default mock for useSession
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });
  });

  it('redirects to home when user is unauthenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    render(<LogPage />);

    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('shows loading state when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    });

    render(<LogPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
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

  it('does not redirect when user is authenticated', () => {
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

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('handles session status changes properly', () => {
    const { rerender } = render(<LogPage />);

    // Initially loading
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    });

    rerender(<LogPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Then unauthenticated
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    rerender(<LogPage />);
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
});
