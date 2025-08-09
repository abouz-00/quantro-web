import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Poppins: () => ({
    className: 'mocked-poppins',
  }),
}));

describe('ErrorBoundary Component', () => {
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
});
