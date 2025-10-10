# Zustand State Management Architecture

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       App Root (layout.tsx)                      │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              SessionWrapper Component                       │ │
│  │                                                              │ │
│  │  ┌────────────────────────────────────────────────────────┐│ │
│  │  │      NextAuth SessionProvider                           ││ │
│  │  │                                                          ││ │
│  │  │  ┌────────────────────────────────────────────────────┐││ │
│  │  │  │    AuthSyncWrapper                                  │││ │
│  │  │  │    (calls useAuthSync hook)                         │││ │
│  │  │  │                                                      │││ │
│  │  │  │    ┌──────────────────────────────────────────────┐│││ │
│  │  │  │    │  useAuthSync Hook                             ││││ │
│  │  │  │    │  ├─ Watches NextAuth session                 ││││ │
│  │  │  │    │  ├─ Updates Zustand store                    ││││ │
│  │  │  │    │  └─ Keeps both in sync                       ││││ │
│  │  │  │    └──────────────────────────────────────────────┘│││ │
│  │  │  │                                                      │││ │
│  │  │  │    ┌──────────────────────────────────────────────┐│││ │
│  │  │  │    │  Zustand Store (userStore)                   ││││ │
│  │  │  │    │  ┌────────────────────────────────────────┐ ││││ │
│  │  │  │    │  │ State:                                  │ ││││ │
│  │  │  │    │  │  • user: User | null                    │ ││││ │
│  │  │  │    │  │  • isAuthenticated: boolean             │ ││││ │
│  │  │  │    │  │  • status: 'loading' | 'auth...' | ...  │ ││││ │
│  │  │  │    │  │  • sessionExpiry: string | null         │ ││││ │
│  │  │  │    │  └────────────────────────────────────────┘ ││││ │
│  │  │  │    │  ┌────────────────────────────────────────┐ ││││ │
│  │  │  │    │  │ Actions:                                │ ││││ │
│  │  │  │    │  │  • login()                              │ ││││ │
│  │  │  │    │  │  • logout()                             │ ││││ │
│  │  │  │    │  │  • updateUser()                         │ ││││ │
│  │  │  │    │  │  • setStatus()                          │ ││││ │
│  │  │  │    │  └────────────────────────────────────────┘ ││││ │
│  │  │  │    │  ┌────────────────────────────────────────┐ ││││ │
│  │  │  │    │  │ Middleware:                             │ ││││ │
│  │  │  │    │  │  • persist → localStorage               │ ││││ │
│  │  │  │    │  │  • devtools → Redux DevTools            │ ││││ │
│  │  │  │    │  └────────────────────────────────────────┘ ││││ │
│  │  │  │    └──────────────────────────────────────────────┘│││ │
│  │  │  │                                                      │││ │
│  │  │  │    ┌──────────────────────────────────────────────┐│││ │
│  │  │  │    │  Your App Components                         ││││ │
│  │  │  │    │  (Can access store anywhere!)                ││││ │
│  │  │  │    └──────────────────────────────────────────────┘│││ │
│  │  │  └────────────────────────────────────────────────────┘││ │
│  │  └──────────────────────────────────────────────────────────┘│ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

### 1. User Login Flow

```
User clicks "Sign In"
       ↓
NextAuth handles OAuth
       ↓
Session created in NextAuth
       ↓
useAuthSync detects session change
       ↓
Zustand store updated automatically
       ↓
All subscribed components re-render
       ↓
User sees authenticated UI
```

### 2. Component Access Pattern

```typescript
// Any component in your app:

import { useUserStore } from '@/stores/userStore';

function MyComponent() {
  // Subscribe to specific state
  const user = useUserStore(state => state.user);
  const isAuth = useUserStore(state => state.isAuthenticated);
  
  // Component only re-renders when 'user' or 'isAuth' changes
  // Not when other store properties change!
  
  return <div>Welcome {user?.name}</div>;
}
```

### 3. State Update Flow

```
NextAuth session changes (login/logout/refresh)
       ↓
useAuthSync useEffect triggered
       ↓
Calls Zustand store actions
       ↓
Store state updated
       ↓
All components using that state re-render
       ↓
localStorage updated (persist middleware)
       ↓
Redux DevTools notified (devtools middleware)
```

## 🔄 Sync Mechanism

### How NextAuth ↔ Zustand Sync Works

```typescript
// In useAuthSync.ts

useEffect(() => {
  if (status === 'loading') {
    setStatus('loading');
  } 
  else if (status === 'authenticated' && session?.user) {
    // NextAuth has a user → Update Zustand
    setUser({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    });
    setSessionExpiry(session.expires);
    setStatus('authenticated');
  } 
  else if (status === 'unauthenticated') {
    // NextAuth logged out → Clear Zustand
    logout();
  }
}, [session, status]); // Re-run when session changes
```

## 🎯 Component Access Patterns

### Pattern 1: Single Value Subscription

```typescript
// ✅ GOOD - Component only re-renders when user changes
const user = useUserStore(state => state.user);
```

### Pattern 2: Multiple Values Subscription

```typescript
// ✅ GOOD - Component re-renders when any of these change
const { user, status, isAuthenticated } = useUserStore(state => ({
  user: state.user,
  status: state.status,
  isAuthenticated: state.isAuthenticated,
}));
```

### Pattern 3: Using Pre-defined Selectors

```typescript
// ✅ BEST - Reusable, type-safe, optimized
import { selectUser, selectIsAuthenticated } from '@/stores/userStore';

const user = useUserStore(selectUser);
const isAuth = useUserStore(selectIsAuthenticated);
```

### Pattern 4: Getting Actions

```typescript
// ✅ GOOD - Actions don't cause re-renders
const { login, logout, updateUser } = useUserStore(state => ({
  login: state.login,
  logout: state.logout,
  updateUser: state.updateUser,
}));
```

### ❌ Avoid: Subscribing to Entire Store

```typescript
// ❌ BAD - Component re-renders on ANY store change
const store = useUserStore(); // Don't do this!
```

## 💾 Persistence

### What Gets Saved to localStorage

```typescript
{
  "user-storage": {
    "state": {
      "user": {
        "id": "user-123",
        "email": "user@example.com",
        "name": "John Doe",
        "image": null
      },
      "sessionExpiry": "2025-12-31T23:59:59Z"
    },
    "version": 0
  }
}
```

### What Doesn't Get Saved

- `isAuthenticated` - Derived from user presence
- `status` - Derived on mount from session

## 🛠️ DevTools Integration

When Redux DevTools browser extension is installed:

```
Action: login
Payload: {
  user: { id: "...", email: "...", name: "..." },
  expiry: "2025-12-31T23:59:59Z"
}

State after:
{
  user: { ... },
  isAuthenticated: true,
  status: "authenticated",
  sessionExpiry: "2025-12-31T23:59:59Z"
}
```

## 🔍 Debugging

### Check Current State

```typescript
// In browser console or code:
console.log(useUserStore.getState());

// Output:
// {
//   user: { ... },
//   isAuthenticated: true,
//   status: "authenticated",
//   sessionExpiry: "...",
//   setUser: [Function],
//   login: [Function],
//   ...
// }
```

### Subscribe to Changes

```typescript
// Watch all state changes
const unsubscribe = useUserStore.subscribe(
  (state) => console.log('State changed:', state)
);

// Later: unsubscribe()
```

## 📈 Performance Benefits

### Before (Direct NextAuth)

```typescript
// Every component calls useSession()
// Each call = separate subscription to NextAuth
// More overhead, potential duplicate requests
```

### After (With Zustand)

```typescript
// One useSession call in useAuthSync
// All components subscribe to Zustand
// Single source of truth
// Optimized selective subscriptions
// No duplicate session checks
```

## 🎓 Key Concepts

### 1. Single Source of Truth
- User data lives in ONE place (Zustand store)
- NextAuth syncs TO the store (not the other way)
- Components read FROM the store

### 2. Automatic Synchronization
- useAuthSync runs automatically (in SessionWrapper)
- You don't need to manually sync anything
- Login/logout just work™

### 3. Selective Subscriptions
- Components only re-render when their selected state changes
- More efficient than context or prop drilling
- Better performance for large apps

### 4. Type Safety
- Full TypeScript support
- Autocomplete for all state and actions
- Compile-time error checking

---

**Architecture Status:** ✅ **COMPLETE & PRODUCTION READY**
