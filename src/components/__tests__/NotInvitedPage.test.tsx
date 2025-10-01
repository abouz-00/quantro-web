import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotInvitedPage } from '../auth';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Poppins: () => ({
    style: {
      fontFamily: 'Poppins, sans-serif',
    },
  }),
}));

describe('NotInvitedPage', () => {
  const mockProps = {
    betaCode: '',
    setBetaCode: jest.fn(),
    isSubmitting: false,
    error: '',
    onSubmitCode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the not invited page', () => {
    render(<NotInvitedPage {...mockProps} />);
    
    expect(screen.getByText('Beta Access Required')).toBeInTheDocument();
    expect(screen.getByText('Quantro is currently in private beta. Enter your beta access code below or request access.')).toBeInTheDocument();
    expect(screen.getByText('Beta Access Code')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your beta code')).toBeInTheDocument();
  });

  it('should handle beta code input change', () => {
    render(<NotInvitedPage {...mockProps} />);
    
    const input = screen.getByPlaceholderText('Enter your beta code');
    fireEvent.change(input, { target: { value: 'TEST123' } });
    
    expect(mockProps.setBetaCode).toHaveBeenCalledWith('TEST123');
  });

  it('should handle form submission', () => {
    render(<NotInvitedPage {...mockProps} />);
    
    const form = screen.getByRole('button', { name: 'Access Beta' }).closest('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form!);
    
    expect(mockProps.onSubmitCode).toHaveBeenCalled();
  });

  it('should display error message when error prop is provided', () => {
    const propsWithError = {
      ...mockProps,
      error: 'Invalid beta code',
    };
    
    render(<NotInvitedPage {...propsWithError} />);
    
    expect(screen.getByText('Invalid beta code')).toBeInTheDocument();
  });

  it('should show loading state when submitting', () => {
    const propsWithSubmitting = {
      ...mockProps,
      isSubmitting: true,
    };
    
    render(<NotInvitedPage {...propsWithSubmitting} />);
    
    expect(screen.getByText('Checking...')).toBeInTheDocument();
    
    const submitButton = screen.getByRole('button', { name: 'Checking...' });
    expect(submitButton).toBeDisabled();
  });

  it('should show submit button when not submitting', () => {
    const propsWithCode = {
      ...mockProps,
      betaCode: 'TEST123', // Add some content to enable the button
    };
    
    render(<NotInvitedPage {...propsWithCode} />);
    
    const submitButton = screen.getByRole('button', { name: 'Access Beta' });
    expect(submitButton).not.toBeDisabled();
  });

  it('should display the current beta code value', () => {
    const propsWithCode = {
      ...mockProps,
      betaCode: 'MYBETACODE123',
    };
    
    render(<NotInvitedPage {...propsWithCode} />);
    
    const input = screen.getByPlaceholderText('Enter your beta code') as HTMLInputElement;
    expect(input.value).toBe('MYBETACODE123');
  });

  it('should have proper form attributes', () => {
    render(<NotInvitedPage {...mockProps} />);
    
    const form = screen.getByRole('button', { name: 'Access Beta' }).closest('form');
    expect(form).toBeTruthy();
    
    const input = screen.getByPlaceholderText('Enter your beta code');
    expect(input).toHaveAttribute('type', 'text');
  });
});
