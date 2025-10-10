/**
 * User Store - Global state management for user authentication and profile
 * Using Zustand for lightweight, simple state management
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

interface UserState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  sessionExpiry: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setStatus: (status: 'loading' | 'authenticated' | 'unauthenticated') => void;
  setSessionExpiry: (expiry: string | null) => void;
  login: (user: User, expiry: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        status: 'unauthenticated',
        sessionExpiry: null,

        // Actions
        setUser: (user) =>
          set(
            {
              user,
              isAuthenticated: !!user,
              status: user ? 'authenticated' : 'unauthenticated',
            },
            false,
            'setUser'
          ),

        setStatus: (status) =>
          set({ status }, false, 'setStatus'),

        setSessionExpiry: (expiry) =>
          set({ sessionExpiry: expiry }, false, 'setSessionExpiry'),

        login: (user, expiry) =>
          set(
            {
              user,
              isAuthenticated: true,
              status: 'authenticated',
              sessionExpiry: expiry,
            },
            false,
            'login'
          ),

        logout: () =>
          set(
            {
              user: null,
              isAuthenticated: false,
              status: 'unauthenticated',
              sessionExpiry: null,
            },
            false,
            'logout'
          ),

        updateUser: (updates) =>
          set(
            (state) => ({
              user: state.user ? { ...state.user, ...updates } : null,
            }),
            false,
            'updateUser'
          ),
      }),
      {
        name: 'user-storage', // localStorage key
        partialize: (state) => ({
          // Only persist these fields
          user: state.user,
          sessionExpiry: state.sessionExpiry,
        }),
      }
    ),
    { name: 'UserStore' } // DevTools name
  )
);

// Selectors for convenience
export const selectUser = (state: UserState) => state.user;
export const selectIsAuthenticated = (state: UserState) => state.isAuthenticated;
export const selectStatus = (state: UserState) => state.status;
export const selectSessionExpiry = (state: UserState) => state.sessionExpiry;
