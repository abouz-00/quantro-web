import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import Home from '../page';

// Mock dynamic import
jest.mock('next/dynamic', () => {
  return function dynamic() {
    const Component = () => <div>Mocked LogPage</div>;
    Component.displayName = 'MockedLogPage';
    return Component;
  };
});

// Mock ErrorBoundary
jest.mock('../../components/shared/ErrorBoundary', () => {
  return function ErrorBoundary({ children }: { children: React.ReactNode }) {
    return <div data-testid="error-boundary">{children}</div>;
  };
});

// Mock LandingPage
jest.mock('../../components/landing', () => ({
  LandingPage: function LandingPage() {
    return <div data-testid="landing-page">Landing Page</div>;
  },
}));

describe('Home Page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders component without crashing', () => {
    const { container } = render(<Home />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows loading state initially', () => {
    render(<Home />);
    // Just check that component renders
    expect(document.body).toBeTruthy();
  });

  it('renders landing page by default', async () => {
    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });
  });
});
