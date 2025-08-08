import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Dashboard from '../dashboard/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSession = require('next-auth/react').useSession;

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  it('should render loading state when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(<Dashboard />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render dashboard with session data', () => {
    const mockSession = {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    render(<Dashboard />);

    expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
    expect(screen.getByText('Food Logging')).toBeInTheDocument();
    expect(screen.getByText('Start tracking your meals and nutrition')).toBeInTheDocument();
  });

  it('should render dashboard with fallback session for testing', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Dashboard />);

    // Should render with fallback test user
    expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
  });

  it('should navigate to log page when Start Logging button is clicked', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    });

    render(<Dashboard />);

    const startLoggingButton = screen.getByText('Start Logging');
    fireEvent.click(startLoggingButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/log');
    });
  });

  it('should display user avatar when provided', () => {
    const mockSession = {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    render(<Dashboard />);

    const avatar = screen.getByAltText('Profile');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('should display default avatar when no image provided', () => {
    const mockSession = {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    render(<Dashboard />);

    // Should show user icon when no avatar
    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  it('should render all dashboard cards', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    });

    render(<Dashboard />);

    expect(screen.getByText('Food Logging')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should have correct styling and layout', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    });

    const { container } = render(<Dashboard />);

    // Check for main container with correct background
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('min-h-screen');
  });

  it('should handle missing user name gracefully', () => {
    const mockSession = {
      user: {
        email: 'test@example.com',
        // No name provided
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    render(<Dashboard />);

    // Should show welcome message with fallback
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
  });

  it('should display user email when provided', () => {
    const mockSession = {
      user: {
        name: 'Test User',
        email: 'test@example.com',
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    render(<Dashboard />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
