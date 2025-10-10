/**
 * Tests for User Store (Zustand)
 */

import { renderHook, act } from '@testing-library/react';
import { useUserStore, User } from '../userStore';

describe('User Store', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    // Reset store to initial state before each test
    const { result } = renderHook(() => useUserStore());
    act(() => {
      result.current.logout();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useUserStore());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.status).toBe('unauthenticated');
      expect(result.current.sessionExpiry).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should set user and update authentication state', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.status).toBe('authenticated');
    });

    it('should clear user when set to null', () => {
      const { result } = renderHook(() => useUserStore());

      // First set user
      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then clear
      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.status).toBe('unauthenticated');
    });
  });

  describe('setStatus', () => {
    it('should update status', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setStatus('authenticated');
      });

      expect(result.current.status).toBe('authenticated');

      act(() => {
        result.current.setStatus('loading');
      });

      expect(result.current.status).toBe('loading');
    });
  });

  describe('setSessionExpiry', () => {
    it('should update session expiry', () => {
      const { result } = renderHook(() => useUserStore());
      const expiry = '2025-12-31T23:59:59Z';

      act(() => {
        result.current.setSessionExpiry(expiry);
      });

      expect(result.current.sessionExpiry).toBe(expiry);
    });

    it('should clear session expiry when set to null', () => {
      const { result } = renderHook(() => useUserStore());
      const expiry = '2025-12-31T23:59:59Z';

      act(() => {
        result.current.setSessionExpiry(expiry);
      });

      expect(result.current.sessionExpiry).toBe(expiry);

      act(() => {
        result.current.setSessionExpiry(null);
      });

      expect(result.current.sessionExpiry).toBeNull();
    });
  });

  describe('login', () => {
    it('should set all authentication state', () => {
      const { result } = renderHook(() => useUserStore());
      const expiry = '2025-12-31T23:59:59Z';

      act(() => {
        result.current.login(mockUser, expiry);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.status).toBe('authenticated');
      expect(result.current.sessionExpiry).toBe(expiry);
    });
  });

  describe('logout', () => {
    it('should clear all authentication state', () => {
      const { result } = renderHook(() => useUserStore());
      const expiry = '2025-12-31T23:59:59Z';

      // First login
      act(() => {
        result.current.login(mockUser, expiry);
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.status).toBe('unauthenticated');
      expect(result.current.sessionExpiry).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user with partial data', () => {
      const { result } = renderHook(() => useUserStore());

      // First set user
      act(() => {
        result.current.setUser(mockUser);
      });

      // Then update name
      act(() => {
        result.current.updateUser({ name: 'Updated Name' });
      });

      expect(result.current.user?.name).toBe('Updated Name');
      expect(result.current.user?.email).toBe(mockUser.email); // Other fields unchanged
      expect(result.current.user?.id).toBe(mockUser.id);
    });

    it('should handle multiple field updates', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      act(() => {
        result.current.updateUser({
          name: 'New Name',
          image: 'https://example.com/new-avatar.jpg',
        });
      });

      expect(result.current.user?.name).toBe('New Name');
      expect(result.current.user?.image).toBe('https://example.com/new-avatar.jpg');
      expect(result.current.user?.email).toBe(mockUser.email);
    });

    it('should do nothing if user is null', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.updateUser({ name: 'New Name' });
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('Selectors', () => {
    it('should only trigger re-render for subscribed state', () => {
      const { result, rerender } = renderHook(() => ({
        user: useUserStore((state) => state.user),
        status: useUserStore((state) => state.status),
      }));

      const initialUser = result.current.user;
      const initialStatus = result.current.status;

      // Update only status
      act(() => {
        useUserStore.getState().setStatus('authenticated');
      });

      rerender();

      // User reference should be the same (not re-rendered for this subscription)
      expect(result.current.user).toBe(initialUser);
      // Status should be updated
      expect(result.current.status).toBe('authenticated');
      expect(result.current.status).not.toBe(initialStatus);
    });
  });

  describe('Non-React Access', () => {
    it('should allow accessing store outside React components', () => {
      const store = useUserStore.getState();

      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);

      // Update store
      act(() => {
        store.login(mockUser, '2025-12-31T23:59:59Z');
      });

      // Access updated state
      const updatedStore = useUserStore.getState();
      expect(updatedStore.user).toEqual(mockUser);
      expect(updatedStore.isAuthenticated).toBe(true);
    });
  });
});
