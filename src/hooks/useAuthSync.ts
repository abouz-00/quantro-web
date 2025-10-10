/**
 * Hook to sync NextAuth session with Zustand store
 * This bridges NextAuth's session management with our global Zustand store
 */

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUserStore } from '../stores/userStore';

export const useAuthSync = () => {
  const { data: session, status } = useSession();
  const { setUser, setStatus, setSessionExpiry, logout } = useUserStore();

  useEffect(() => {
    // Sync NextAuth session with Zustand store
    if (status === 'loading') {
      setStatus('loading');
    } else if (status === 'authenticated' && session?.user) {
      // User is authenticated, update store
      setUser({
        id: session.user.id || '',
        email: session.user.email || '',
        name: session.user.name,
        image: session.user.image,
      });
      setSessionExpiry(session.expires || null);
      setStatus('authenticated');
    } else if (status === 'unauthenticated') {
      // User is not authenticated, clear store
      logout();
    }
  }, [session, status, setUser, setStatus, setSessionExpiry, logout]);

  return {
    session,
    status,
  };
};
