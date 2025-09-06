import { render, screen } from '@testing-library/react';
import AuthErrorPage from '../../app/auth/error/page';

// Mock Next.js Link to avoid intersection observer issues
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock the useSearchParams hook
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: jest.fn((param) => {
      if (param === 'error') return 'Callback';
      return null;
    }),
  }),
}));

describe('AuthErrorPage', () => {
  it('should render error page with callback error', () => {
    render(<AuthErrorPage />);
    
    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(screen.getByText(/An error occurred during authentication/)).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should render error page with unknown error when no error param', () => {
    jest.doMock('next/navigation', () => ({
      useSearchParams: () => ({
        get: jest.fn(() => null),
      }),
    }));

    render(<AuthErrorPage />);
    
    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(screen.getByText(/An error occurred during authentication/)).toBeInTheDocument();
  });

  it('should have a link back to home', () => {
    render(<AuthErrorPage />);
    
    const homeLink = screen.getByRole('link', { name: 'Try Again' });
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
