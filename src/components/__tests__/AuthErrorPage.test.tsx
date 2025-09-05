import { render, screen } from '@testing-library/react';
import AuthErrorPage from '../../app/auth/error/page';

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
    expect(screen.getByText('Error: Callback')).toBeInTheDocument();
    expect(screen.getByText('Return to Home')).toBeInTheDocument();
  });

  it('should render error page with unknown error when no error param', () => {
    jest.doMock('next/navigation', () => ({
      useSearchParams: () => ({
        get: jest.fn(() => null),
      }),
    }));

    render(<AuthErrorPage />);
    
    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(screen.getByText('Error: Unknown')).toBeInTheDocument();
  });

  it('should have a link back to home', () => {
    render(<AuthErrorPage />);
    
    const homeLink = screen.getByRole('link', { name: 'Return to Home' });
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
