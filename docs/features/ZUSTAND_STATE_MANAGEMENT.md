# Zustand State Management Implementation

## Overview

We've implemented **Zustand** as our global state management solution for handling user authentication state and profile information throughout the application.

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    SessionProvider (NextAuth)                │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              AuthSyncWrapper (useAuthSync)             │  │
│  │                                                         │  │
│  │  ┌───────────────────────────────────────────────┐   │  │
│  │  │          Zustand Store (useUserStore)         │   │  │
│  │  │                                                │   │  │
│  │  │  • user: User | null                          │   │  │
│  │  │  • isAuthenticated: boolean                   │   │  │
│  │  │  • status: 'loading' | 'authenticated' | ... │   │  │
│  │  │  • sessionExpiry: string | null               │   │  │
│  │  │                                                │   │  │
│  │  │  Actions:                                      │   │  │
│  │  │  • login(), logout(), updateUser()            │   │  │
│  │  └───────────────────────────────────────────────┘   │  │
│  │                                                         │  │
│  │  ┌───────────────────────────────────────────────┐   │  │
│  │  │              App Components                    │   │  │
│  │  │  (Can access store from anywhere)             │   │  │
│  │  └───────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Files Created

### 1. **Store** (`src/stores/userStore.ts`)

- Main Zustand store for user state
- Includes persist middleware (saves to localStorage)
- Includes devtools middleware (for Redux DevTools)
- Type-safe with TypeScript

### 2. **Sync Hook** (`src/hooks/useAuthSync.ts`)

- Bridges NextAuth session with Zustand store
- Automatically syncs when session changes
- Called once at the app root level

### 3. **Updated SessionWrapper** (`src/components/shared/SessionWrapper.tsx`)

- Now includes `AuthSyncWrapper` component
- Automatically syncs auth state globally

## Usage Examples

### 1. **Access User State in Any Component**

```tsx
import { useUserStore } from '@/stores/userStore';

export default function MyComponent() {
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const status = useUserStore((state) => state.status);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name || user?.email}!</h1>
      <p>User ID: {user?.id}</p>
    </div>
  );
}
```

### 2. **Using Selectors for Better Performance**

```tsx
import { useUserStore, selectUser, selectIsAuthenticated } from '@/stores/userStore';

export default function Header() {
  // Only re-renders when user changes
  const user = useUserStore(selectUser);
  
  // Only re-renders when authentication status changes
  const isAuthenticated = useUserStore(selectIsAuthenticated);

  return (
    <header>
      {isAuthenticated && <span>Hello, {user?.name}!</span>}
    </header>
  );
}
```

### 3. **Using Multiple State Values**

```tsx
import { useUserStore } from '@/stores/userStore';

export default function ProfilePage() {
  const { user, status, updateUser } = useUserStore((state) => ({
    user: state.user,
    status: state.status,
    updateUser: state.updateUser,
  }));

  const handleUpdateName = async (newName: string) => {
    // Update the store
    updateUser({ name: newName });
    
    // Also update on the server
    await fetch('/api/user/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name: newName }),
    });
  };

  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={() => handleUpdateName('New Name')}>
        Update Name
      </button>
    </div>
  );
}
```

### 4. **Access Store Outside React Components**

```tsx
// In a service file or utility
import { useUserStore } from '@/stores/userStore';

export async function makeAuthenticatedRequest(url: string) {
  const user = useUserStore.getState().user;
  const isAuthenticated = useUserStore.getState().isAuthenticated;
  
  if (!isAuthenticated) {
    throw new Error('User not authenticated');
  }
  
  return fetch(url, {
    headers: {
      'X-User-ID': user?.id || '',
    },
  });
}
```

### 5. **Programmatic Login/Logout**

```tsx
import { useUserStore } from '@/stores/userStore';

export default function AuthButton() {
  const { isAuthenticated, logout } = useUserStore();

  const handleLogout = async () => {
    // Clear Zustand store
    logout();
    
    // Also sign out from NextAuth
    await signOut({ callbackUrl: '/' });
  };

  return (
    <button onClick={handleLogout}>
      {isAuthenticated ? 'Logout' : 'Login'}
    </button>
  );
}
```

## Features

### ✅ **Implemented Features**

1. **Persistent State** - User data persists across page refreshes (localStorage)
2. **Type Safety** - Full TypeScript support
3. **DevTools Integration** - Works with Redux DevTools browser extension
4. **Automatic Sync** - NextAuth session automatically syncs with store
5. **Selective Subscriptions** - Components only re-render when their selected state changes
6. **Non-React Access** - Can access store outside React components

### 🎯 **State Management**

The store manages:

- `user`: User profile data (id, email, name, image)
- `isAuthenticated`: Boolean flag for quick auth checks
- `status`: Current authentication status ('loading' | 'authenticated' | 'unauthenticated')
- `sessionExpiry`: When the current session expires

### 🔧 **Actions**

Available actions:

- `setUser(user)`: Manually set user data
- `setStatus(status)`: Update authentication status
- `setSessionExpiry(expiry)`: Update session expiry
- `login(user, expiry)`: Complete login (sets all auth state)
- `logout()`: Clear all user state
- `updateUser(updates)`: Partial update of user data

## Migration Path

### Before (Direct NextAuth usage)

```tsx
import { useSession } from 'next-auth/react';

export default function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Loading...</div>;
  if (!session?.user) return <div>Not authenticated</div>;
  
  return <div>Hello {session.user.name}</div>;
}
```

### After (Zustand store)

```tsx
import { useUserStore } from '@/stores/userStore';

export default function MyComponent() {
  const { user, status } = useUserStore();
  
  if (status === 'loading') return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return <div>Hello {user.name}</div>;
}
```

### Note - Both approaches work

- ✅ You can **gradually migrate** - NextAuth still works as before
- ✅ New components can use Zustand for simpler, cleaner code
- ✅ Old components continue to work with `useSession()`

## Testing

When testing components that use Zustand:

```tsx
import { renderHook, act } from '@testing-library/react';
import { useUserStore } from '@/stores/userStore';

describe('User Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useUserStore.setState({
      user: null,
      isAuthenticated: false,
      status: 'unauthenticated',
      sessionExpiry: null,
    });
  });

  it('should login user', () => {
    const { result } = renderHook(() => useUserStore());
    
    act(() => {
      result.current.login(
        { id: '1', email: 'test@example.com', name: 'Test User' },
        '2025-10-10T00:00:00Z'
      );
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('test@example.com');
  });
});
```

## Benefits Over Direct NextAuth Usage

1. **Single Source of Truth** - One place for all user state
2. **Easier Testing** - Mock Zustand store instead of NextAuth
3. **Better Performance** - Selective subscriptions prevent unnecessary re-renders
4. **More Flexible** - Can add custom user state (preferences, settings, etc.)
5. **Simpler Code** - Less boilerplate in components
6. **Persistent State** - User data survives page refreshes
7. **Non-React Access** - Can access from services, utilities, etc.

## Next Steps

You can now extend the store with additional state:

```tsx
interface UserState {
  // ... existing state
  
  // New additions
  preferences: UserPreferences;
  notifications: Notification[];
  theme: 'light' | 'dark';
  
  // New actions
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  addNotification: (notif: Notification) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

## Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [TypeScript with Zustand](https://github.com/pmndrs/zustand#typescript)
- [Zustand DevTools](https://github.com/pmndrs/zustand#redux-devtools)
