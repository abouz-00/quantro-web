import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BetaInvitePage from '../BetaInvitePage';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('BetaInvitePage', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should render error when no code is provided', () => {
    render(<BetaInvitePage code={null} />);
    
    expect(screen.getByText('Invalid Invite')).toBeInTheDocument();
    expect(screen.getByText('No invite code provided')).toBeInTheDocument();
    expect(screen.getByText('Go to Homepage')).toBeInTheDocument();
  });

  it('should render loading state initially', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        valid: true,
        email: 'test@example.com',
        code: 'TEST123',
        expiresAt: '2024-12-31T23:59:59.999Z'
      })
    });

    render(<BetaInvitePage code="TEST123" />);
    
    // Should show loading initially (before the fetch resolves)
    expect(screen.getByText('Validating your invite...')).toBeInTheDocument();
  });

  it('should render invite data when valid', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        valid: true,
        email: 'test@example.com',
        code: 'TEST123',
        expiresAt: '2024-12-31T23:59:59.999Z'
      })
    });

    render(<BetaInvitePage code="TEST123" />);
    
    await waitFor(() => {
      expect(screen.getByText('You\'re Invited!')).toBeInTheDocument();
    });

    expect(screen.getByText('You\'ve been invited to join the Quantro beta')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Accept Invite & Join Beta')).toBeInTheDocument();
  });

  it('should handle invalid invite', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        error: 'Invalid invite code'
      })
    });

    render(<BetaInvitePage code="INVALID" />);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid Invite')).toBeInTheDocument();
    });

    expect(screen.getByText('Invalid invite code')).toBeInTheDocument();
  });

  it('should handle network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<BetaInvitePage code="TEST123" />);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid Invite')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to validate invite')).toBeInTheDocument();
  });

  it('should handle accept invite success', async () => {
    // Mock initial validation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        valid: true,
        email: 'test@example.com',
        code: 'TEST123',
        expiresAt: '2024-12-31T23:59:59.999Z'
      })
    });

    render(<BetaInvitePage code="TEST123" />);
    
    await waitFor(() => {
      expect(screen.getByText('Accept Invite & Join Beta')).toBeInTheDocument();
    });

    // Mock accept invite response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    const acceptButton = screen.getByText('Accept Invite & Join Beta');
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(screen.getByText('Welcome to Quantro!')).toBeInTheDocument();
    });

    expect(screen.getByText('Your beta invite has been accepted. You can now sign in to access the app.')).toBeInTheDocument();
    expect(screen.getByText('Sign In Now')).toBeInTheDocument();
  });

  it('should handle accept invite failure', async () => {
    // Mock initial validation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        valid: true,
        email: 'test@example.com',
        code: 'TEST123',
        expiresAt: '2024-12-31T23:59:59.999Z'
      })
    });

    render(<BetaInvitePage code="TEST123" />);
    
    await waitFor(() => {
      expect(screen.getByText('Accept Invite & Join Beta')).toBeInTheDocument();
    });

    // Mock accept invite failure
    mockFetch.mockRejectedValueOnce(new Error('Accept failed'));

    const acceptButton = screen.getByText('Accept Invite & Join Beta');
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to accept invite')).toBeInTheDocument();
    });
  });
});
