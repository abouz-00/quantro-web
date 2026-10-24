// Mock next-auth FIRST
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: jest.fn(),
}));

// Mock Next.js dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: jest.fn(({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => <img src={src} alt={alt} {...props} />),
}));

jest.mock('next/font/google', () => ({
  Poppins: jest.fn(() => ({ className: 'poppins-mock' })),
}));

jest.mock('framer-motion');

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  ChartPieIcon: jest.fn((props: { [key: string]: unknown }) => <div data-testid="chart-pie-icon" {...props} />),
  BeakerIcon: jest.fn((props: { [key: string]: unknown }) => <div data-testid="beaker-icon" {...props} />),
  CursorArrowRaysIcon: jest.fn((props: { [key: string]: unknown }) => <div data-testid="cursor-arrow-rays-icon" {...props} />),
}));

import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { LandingPage } from '../landing';

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock next/image
jest.mock('next/image', () => {
  return function Image({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  };
});

describe('LandingPage Component', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });
  });

  it('renders the landing page', () => {
    // Mock an unauthenticated session
    mockUseSession.mockReturnValue({ 
      data: null, 
      status: 'unauthenticated',
      update: jest.fn()
    });

    render(<LandingPage />);
    
    // Check for content that actually exists (footer)
    expect(screen.getByText('© 2026. All rights reserved.')).toBeInTheDocument();
  });

  it('displays social media icons without links', () => {
    mockUseSession.mockReturnValue({ 
      data: null, 
      status: 'unauthenticated',
      update: jest.fn()
    });

    const { container } = render(<LandingPage />);
    const footer = container.querySelector('footer');

    expect(footer?.querySelectorAll('svg')).toHaveLength(3);
    expect(footer?.querySelectorAll('a')).toHaveLength(0);
  });

  it('has proper styling', () => {
    mockUseSession.mockReturnValue({ 
      data: null, 
      status: 'unauthenticated',
      update: jest.fn()
    });

    const { container } = render(<LandingPage />);
    
    // Check the actual class that exists
    expect(container.firstChild).toHaveClass('min-h-screen');
  });

  it('displays main layout structure', () => {
    mockUseSession.mockReturnValue({ 
      data: null, 
      status: 'unauthenticated',
      update: jest.fn()
    });

    render(<LandingPage />);
    
    // Check for the main structure elements
    const mainElement = document.querySelector('main');
    const footerElement = document.querySelector('footer');
    
    expect(mainElement).toBeInTheDocument();
    expect(footerElement).toBeInTheDocument();
  });
});
