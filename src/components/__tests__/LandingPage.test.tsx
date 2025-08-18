import { render, screen } from '@testing-library/react';
import LandingPage from '../LandingPage';

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Poppins: () => ({
    className: 'mocked-poppins',
  }),
}));

// Mock next/image
jest.mock('next/image', () => {
  return function Image({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  };
});

describe('LandingPage Component', () => {
  it('renders the landing page', () => {
    render(<LandingPage />);
    
    // Check for content that actually exists
    expect(screen.getByText('Smart Tracking')).toBeInTheDocument();
  });

  it('displays Quantro logo', () => {
    render(<LandingPage />);
    
    const logo = screen.getByAltText('Quantro Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/header.svg');
  });

  it('has proper styling', () => {
    const { container } = render(<LandingPage />);
    
    expect(container.firstChild).toHaveClass('h-screen');
  });

  it('displays feature cards', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
  });
});
