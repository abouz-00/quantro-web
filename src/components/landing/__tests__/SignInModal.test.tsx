// src/components/landing/__tests__/SignInModal.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignInModal } from '../SignInModal';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Poppins: () => ({ className: 'poppins-mock' }),
}));

const mockOnClose = jest.fn();
const mockOnSubmit = jest.fn();

describe('SignInModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <SignInModal
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSigningIn={false}
      />
    );

    expect(screen.queryByText('Development Sign In')).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <SignInModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSigningIn={false}
      />
    );

    expect(screen.getByText('Development Sign In')).toBeInTheDocument();
    expect(screen.getByText('Enter your email address and development password to sign in for development testing.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Development Password')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <SignInModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSigningIn={false}
      />
    );

    // Find the close button by finding the button with the X icon
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find(button => button.querySelector('svg'));
    expect(closeButton).toBeInTheDocument();
    
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('updates email and password state on input change', () => {
    render(
      <SignInModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSigningIn={false}
      />
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Development Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('calls onSubmit with email and password when form is submitted', async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <SignInModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSigningIn={false}
      />
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Development Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('disables inputs and buttons when isSigningIn is true', () => {
    render(
      <SignInModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSigningIn={true}
      />
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Development Password');
    const submitButton = screen.getByRole('button', { name: 'Signing In...' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('shows loading state when isSigningIn is true', () => {
    render(
      <SignInModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSigningIn={true}
      />
    );

    expect(screen.getByText('Signing In...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Signing In...' })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <SignInModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSigningIn={false}
      />
    );

    // Find the close button by finding the button with the X icon
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find(button => button.querySelector('svg'));
    expect(closeButton).toBeInTheDocument();
    
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <SignInModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSigningIn={false}
      />
    );

    // The backdrop is the div with the modal, clicking it should close
    const modalContainer = screen.getByText('Development Sign In').closest('.fixed');
    if (modalContainer) {
      fireEvent.click(modalContainer);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('updates email and password state on input change', () => {
    render(
      <SignInModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSigningIn={false}
      />
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Development Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('shows alert when submitting with empty password', () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <SignInModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSigningIn={false}
      />
    );

    // Clear the password field
    const passwordInput = screen.getByLabelText('Development Password');
    fireEvent.change(passwordInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitButton);

    expect(alertMock).toHaveBeenCalledWith('Please enter both email and password');

    alertMock.mockRestore();
  });

  it('calls onSubmit with email and password when form is submitted', async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <SignInModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSigningIn={false}
      />
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Development Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('handles Enter key press on inputs', async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <SignInModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSigningIn={false}
      />
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Development Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    fireEvent.keyDown(passwordInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('disables inputs and buttons when isSigningIn is true', () => {
    render(
      <SignInModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSigningIn={true}
      />
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Development Password');
    const submitButton = screen.getByRole('button', { name: 'Signing In...' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('shows loading state when isSigningIn is true', () => {
    render(
      <SignInModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSigningIn={true}
      />
    );

    expect(screen.getByText('Signing In...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Signing In...' })).toBeInTheDocument();
  });
});
