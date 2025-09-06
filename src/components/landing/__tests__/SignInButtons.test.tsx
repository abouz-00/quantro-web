// src/components/landing/__tests__/SignInButtons.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SignInButtons } from '../SignInButtons';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => <button {...props}>{children}</button>,
  },
}));

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Poppins: () => ({ className: 'poppins-mock' }),
}));

import { signIn } from 'next-auth/react';

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockOnDevSignIn = jest.fn();

describe('SignInButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Apple and Google sign in buttons', () => {
    render(<SignInButtons onDevSignIn={mockOnDevSignIn} />);

    expect(screen.getByText('Sign in with Apple')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('calls signIn with apple provider when Apple button is clicked', () => {
    render(<SignInButtons onDevSignIn={mockOnDevSignIn} />);

    const appleButton = screen.getByText('Sign in with Apple');
    fireEvent.click(appleButton);

    expect(mockSignIn).toHaveBeenCalledWith('apple', { callbackUrl: '/dashboard' });
  });

  it('calls signIn with google provider when Google button is clicked', () => {
    render(<SignInButtons onDevSignIn={mockOnDevSignIn} />);

    const googleButton = screen.getByText('Sign in with Google');
    fireEvent.click(googleButton);

    expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' });
  });

  it('renders dev sign in button in development environment', () => {
    // Mock process.env.NODE_ENV
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });

    render(<SignInButtons onDevSignIn={mockOnDevSignIn} />);

    expect(screen.getByText('🚀 Dev Sign In')).toBeInTheDocument();

    // Restore original value
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });

  it('does not render dev sign in button in production environment', () => {
    // Mock process.env.NODE_ENV
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
    });

    render(<SignInButtons onDevSignIn={mockOnDevSignIn} />);

    expect(screen.queryByText('🚀 Dev Sign In')).not.toBeInTheDocument();

    // Restore original value
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });

  it('calls onDevSignIn when dev button is clicked', () => {
    // Mock process.env.NODE_ENV
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });

    render(<SignInButtons onDevSignIn={mockOnDevSignIn} />);

    const devButton = screen.getByText('🚀 Dev Sign In');
    fireEvent.click(devButton);

    expect(mockOnDevSignIn).toHaveBeenCalledTimes(1);

    // Restore original value
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });
});
