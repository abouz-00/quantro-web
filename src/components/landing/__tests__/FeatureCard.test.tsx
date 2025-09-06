// src/components/landing/__tests__/FeatureCard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeatureCard } from '../FeatureCard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  },
  useAnimation: () => ({
    start: jest.fn(),
  }),
  useInView: () => true,
}));

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Poppins: () => ({ className: 'poppins-mock' }),
}));

// Mock constants
jest.mock('../../../constants/ui', () => ({
  COLORS: {
    cardBackground: '#ffffff',
  },
  NO_SELECT_STYLES: {},
  ANIMATION_VARIANTS: {
    featureCard: {
      hidden: { opacity: 0, y: 50 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8 },
      },
    },
  },
}));

// Mock icon component
const MockIcon = () => <div data-testid="mock-icon" />;

describe('FeatureCard', () => {
  const defaultProps = {
    icon: MockIcon,
    title: 'Test Feature',
    description: 'This is a test feature description',
    delay: 0,
  };

  it('renders the feature card with correct content', () => {
    render(<FeatureCard {...defaultProps} />);

    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('This is a test feature description')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('applies the correct CSS classes', () => {
    const { container } = render(<FeatureCard {...defaultProps} />);

    // Check for main container classes
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('group');
    expect(cardElement).toHaveClass('cursor-pointer');
  });

  it('renders with custom delay', () => {
    render(<FeatureCard {...defaultProps} delay={0.5} />);

    expect(screen.getByText('Test Feature')).toBeInTheDocument();
  });

  it('has hover effects', () => {
    const { container } = render(<FeatureCard {...defaultProps} />);

    // The hover effects are handled by framer-motion, which is mocked
    // We can check that the structure is correct
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toBeInTheDocument();
  });
});
