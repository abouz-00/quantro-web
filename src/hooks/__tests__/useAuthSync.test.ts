/**
 * Tests for useAuthSync hook
 */

import { renderHook } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { useAuthSync } from '../useAuthSync';
import { useUserStore } from '../../stores/userStore';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('useAuthSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset store
    useUserStore.setState({
      user: null,
      isAuthenticated: false,
      status: 'unauthenticated',
      sessionExpiry: null,
    });
  });

  it('should set loading status when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    });

    renderHook(() => useAuthSync());

    const store = useUserStore.getState();
    expect(store.status).toBe('loading');
  });

  it('should set user when session is authenticated', () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
      },
      expires: '2025-12-31T23:59:59Z',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn(),
    });

    renderHook(() => useAuthSync());

    const store = useUserStore.getState();
    expect(store.user).toEqual(mockSession.user);
    expect(store.isAuthenticated).toBe(true);
    expect(store.status).toBe('authenticated');
    expect(store.sessionExpiry).toBe(mockSession.expires);
  });

  it('should logout when session is unauthenticated', () => {
    // First set authenticated state
    useUserStore.setState({
      user: { id: 'user-123', email: 'test@example.com' },
      isAuthenticated: true,
      status: 'authenticated',
      sessionExpiry: '2025-12-31T23:59:59Z',
    });

    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    renderHook(() => useAuthSync());

    const store = useUserStore.getState();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.status).toBe('unauthenticated');
    expect(store.sessionExpiry).toBeNull();
  });

  it('should update store when session changes', () => {
    // Start with loading
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    });

    const { rerender } = renderHook(() => useAuthSync());

    expect(useUserStore.getState().status).toBe('loading');

    // Then authenticated
    const mockSession = {
      user: {
        id: 'user-456',
        email: 'user@example.com',
        name: 'Another User',
      },
      expires: '2025-12-31T23:59:59Z',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn(),
    });

    rerender();

    const store = useUserStore.getState();
    expect(store.status).toBe('authenticated');
    expect(store.user?.email).toBe('user@example.com');
  });

  it('should handle session with missing user gracefully', () => {
    mockUseSession.mockReturnValue({
      data: { user: null, expires: '2025-12-31T23:59:59Z' } as unknown as Session,
      status: 'authenticated',
      update: jest.fn(),
    });

    renderHook(() => useAuthSync());

    const store = useUserStore.getState();
    // Should still be in loading state since user is missing
    expect(store.user).toBeNull();
  });

  it('should handle session with partial user data', () => {
    const mockSession = {
      user: {
        id: 'user-789',
        email: 'partial@example.com',
        // name and image are missing
      },
      expires: '2025-12-31T23:59:59Z',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn(),
    });

    renderHook(() => useAuthSync());

    const store = useUserStore.getState();
    expect(store.user).toEqual({
      id: 'user-789',
      email: 'partial@example.com',
      name: undefined,
      image: undefined,
    });
    expect(store.isAuthenticated).toBe(true);
  });

  it('should return session and status from hook', () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
      },
      expires: '2025-12-31T23:59:59Z',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn(),
    });

    const { result } = renderHook(() => useAuthSync());

    expect(result.current.session).toEqual(mockSession);
    expect(result.current.status).toBe('authenticated');
  });
});
