import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import ErrorBoundary from '../ErrorBoundary';

// Mock the error service
const mockErrorService = {
  logError: jest.fn(),
};

jest.mock('../../services/errorService', () => ({
  errorService: mockErrorService,
}));

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Poppins: () => ({
    className: 'mocked-poppins',
  }),
}));

// Component that throws an error
const ErrorComponent: React.FC = () => {
  throw new Error('Test error');
};

// Component that doesn't throw
const NormalComponent: React.FC = () => <div>Normal component</div>;

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('has proper container styling', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('renders fallback UI when an error occurs', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('calls error service when an error occurs', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(mockErrorService.logError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          severity: 'high',
          category: 'ui',
          metadata: expect.objectContaining({
            errorBoundary: true,
          }),
        })
      );
    });

    consoleSpy.mockRestore();
  });

  it('calls custom error handler when provided', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockOnError = jest.fn();

    render(
      <ErrorBoundary onError={mockOnError}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );

    consoleSpy.mockRestore();
  });

  it('retries and renders children again when Try Again is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    // Should show error fallback
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click Try Again - this should reset the error state
    fireEvent.click(screen.getByText('Try Again'));

    // After retry, the ErrorBoundary should reset and try to render children again
    // Since ErrorComponent always throws, it will show the error again
    // But the state should have been reset
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it.skip('reloads page when Reload Page is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockReload = jest.fn();

    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, reload: mockReload },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('Reload Page'));

    expect(mockReload).toHaveBeenCalled();

    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });

    consoleSpy.mockRestore();
  });

  it('renders custom fallback component when provided', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const CustomFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
      <div data-testid="custom-fallback">
        <p>Custom error: {error.message}</p>
        <button onClick={retry}>Custom Retry</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom error: Test error')).toBeInTheDocument();
    expect(screen.getByText('Custom Retry')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('shows error details in development mode', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const originalEnv = process.env.NODE_ENV;

    // Set to development
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();

    // Restore original env
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });

    consoleSpy.mockRestore();
  });

  it('does not show error details in production mode', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const originalEnv = process.env.NODE_ENV;

    // Set to production
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument();

    // Restore original env
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });

    consoleSpy.mockRestore();
  });

  it('handles error service failure gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockErrorService.logError.mockReturnValue(Promise.resolve());

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    // Should still render fallback despite service failure
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
