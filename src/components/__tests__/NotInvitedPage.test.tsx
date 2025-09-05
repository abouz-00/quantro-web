import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotInvitedPage from '../NotInvitedPage';

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
    
    expect(screen.getByText('Quantro')).toBeInTheDocument();
    expect(screen.getByText('Beta Access Required')).toBeInTheDocument();
    expect(screen.getByText('This application is currently in private beta.')).toBeInTheDocument();
    expect(screen.getByText('Enter Beta Code')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your beta invitation code')).toBeInTheDocument();
  });

  it('should handle beta code input change', () => {
    render(<NotInvitedPage {...mockProps} />);
    
    const input = screen.getByPlaceholderText('Enter your beta invitation code');
    fireEvent.change(input, { target: { value: 'TEST123' } });
    
    expect(mockProps.setBetaCode).toHaveBeenCalledWith('TEST123');
  });

  it('should handle form submission', () => {
    render(<NotInvitedPage {...mockProps} />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
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
    
    expect(screen.getByText('Validating...')).toBeInTheDocument();
    
    const submitButton = screen.getByRole('button', { name: 'Validating...' });
    expect(submitButton).toBeDisabled();
  });

  it('should show submit button when not submitting', () => {
    render(<NotInvitedPage {...mockProps} />);
    
    const submitButton = screen.getByRole('button', { name: 'Submit Code' });
    expect(submitButton).not.toBeDisabled();
  });

  it('should display the current beta code value', () => {
    const propsWithCode = {
      ...mockProps,
      betaCode: 'MYBETACODE123',
    };
    
    render(<NotInvitedPage {...propsWithCode} />);
    
    const input = screen.getByPlaceholderText('Enter your beta invitation code') as HTMLInputElement;
    expect(input.value).toBe('MYBETACODE123');
  });

  it('should have proper form attributes', () => {
    render(<NotInvitedPage {...mockProps} />);
    
    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('onSubmit');
    
    const input = screen.getByPlaceholderText('Enter your beta invitation code');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('required');
  });
});
