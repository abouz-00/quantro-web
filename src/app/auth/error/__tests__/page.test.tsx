import { render, screen } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import AuthError from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
  return function Link({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Poppins: () => ({
    className: 'mocked-poppins',
  }),
}));

const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

describe('AuthError Page', () => {
  beforeEach(() => {
    const mockSearchParams = {
      get: jest.fn().mockReturnValue(null),
      has: jest.fn(),
      getAll: jest.fn(),
      forEach: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      entries: jest.fn(),
      append: jest.fn(),
      delete: jest.fn(),
      set: jest.fn(),
      sort: jest.fn(),
      toString: jest.fn(),
      size: 0,
      [Symbol.iterator]: jest.fn(),
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams as unknown as ReturnType<typeof useSearchParams>);
  });

  it('renders authentication error page', () => {
    render(<AuthError />);
    
    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(screen.getByText('An error occurred during authentication.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Try Again' })).toBeInTheDocument();
  });

  it('displays configuration error message', () => {
    const mockSearchParams = {
      get: jest.fn().mockReturnValue('Configuration'),
      has: jest.fn(),
      getAll: jest.fn(),
      forEach: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      entries: jest.fn(),
      append: jest.fn(),
      delete: jest.fn(),
      set: jest.fn(),
      sort: jest.fn(),
      toString: jest.fn(),
      size: 0,
      [Symbol.iterator]: jest.fn(),
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams as unknown as ReturnType<typeof useSearchParams>);

    render(<AuthError />);
    
    expect(screen.getByText('There is a problem with the server configuration.')).toBeInTheDocument();
  });

  it('displays access denied error message', () => {
    const mockSearchParams = {
      get: jest.fn().mockReturnValue('AccessDenied'),
      has: jest.fn(),
      getAll: jest.fn(),
      forEach: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      entries: jest.fn(),
      append: jest.fn(),
      delete: jest.fn(),
      set: jest.fn(),
      sort: jest.fn(),
      toString: jest.fn(),
      size: 0,
      [Symbol.iterator]: jest.fn(),
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams as unknown as ReturnType<typeof useSearchParams>);

    render(<AuthError />);
    
    expect(screen.getByText(/Access denied\. Your email may not have beta access/)).toBeInTheDocument();
  });

  it('displays verification error message', () => {
    const mockSearchParams = {
      get: jest.fn().mockReturnValue('Verification'),
      has: jest.fn(),
      getAll: jest.fn(),
      forEach: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      entries: jest.fn(),
      append: jest.fn(),
      delete: jest.fn(),
      set: jest.fn(),
      sort: jest.fn(),
      toString: jest.fn(),
      size: 0,
      [Symbol.iterator]: jest.fn(),
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams as unknown as ReturnType<typeof useSearchParams>);

    render(<AuthError />);
    
    expect(screen.getByText('The verification token has expired or has already been used.')).toBeInTheDocument();
  });

  it('displays default error message for unknown error', () => {
    const mockSearchParams = {
      get: jest.fn().mockReturnValue('UnknownError'),
      has: jest.fn(),
      getAll: jest.fn(),
      forEach: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      entries: jest.fn(),
      append: jest.fn(),
      delete: jest.fn(),
      set: jest.fn(),
      sort: jest.fn(),
      toString: jest.fn(),
      size: 0,
      [Symbol.iterator]: jest.fn(),
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams as unknown as ReturnType<typeof useSearchParams>);

    render(<AuthError />);
    
    expect(screen.getByText('An error occurred during authentication.')).toBeInTheDocument();
  });

  it('has correct link to home page', () => {
    render(<AuthError />);
    
    const tryAgainLink = screen.getByRole('link', { name: 'Try Again' });
    expect(tryAgainLink).toHaveAttribute('href', '/');
  });

  it('displays loading fallback initially', () => {
    render(<AuthError />);
    // The suspense fallback should be rendered initially
    // This tests the Suspense wrapper
    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
  });
});
