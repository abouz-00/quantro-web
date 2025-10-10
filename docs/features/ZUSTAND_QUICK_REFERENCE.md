# Zustand Quick Reference Card

## 📦 Import

```typescript
import { useUserStore } from '@/stores/userStore';
```

## 🎯 Basic Usage

### Get User Data
```typescript
const user = useUserStore(state => state.user);
// { id, email, name, image }
```

### Check Authentication
```typescript
const isAuthenticated = useUserStore(state => state.isAuthenticated);
// true | false
```

### Get Status
```typescript
const status = useUserStore(state => state.status);
// 'loading' | 'authenticated' | 'unauthenticated'
```

### Multiple Values
```typescript
const { user, isAuthenticated, status } = useUserStore(state => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  status: state.status,
}));
```

## 🔧 Actions

### Update User
```typescript
const updateUser = useUserStore(state => state.updateUser);
updateUser({ name: 'New Name' });
```

### Manual Login
```typescript
const login = useUserStore(state => state.login);
login(
  { id: '123', email: 'user@example.com', name: 'User' },
  '2025-12-31T23:59:59Z'
);
```

### Logout
```typescript
const logout = useUserStore(state => state.logout);
logout();
```

## 💡 Common Patterns

### Protected Component
```typescript
function ProtectedComponent() {
  const { user, status } = useUserStore();
  
  if (status === 'loading') return <Loading />;
  if (!user) return <Redirect to="/login" />;
  
  return <div>Welcome {user.name}</div>;
}
```

### Conditional Rendering
```typescript
function Header() {
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  
  return (
    <header>
      {isAuthenticated ? <UserMenu /> : <LoginButton />}
    </header>
  );
}
```

### User Display
```typescript
function UserProfile() {
  const user = useUserStore(state => state.user);
  
  return (
    <div>
      <h1>{user?.name || 'Guest'}</h1>
      <p>{user?.email}</p>
      {user?.image && <img src={user.image} alt="Avatar" />}
    </div>
  );
}
```

## 🚀 Outside React

### In Services
```typescript
// Get current state
const currentUser = useUserStore.getState().user;
const isAuth = useUserStore.getState().isAuthenticated;

// Update state
useUserStore.getState().updateUser({ name: 'New Name' });
```

### In Utilities
```typescript
export function getUserId(): string | null {
  return useUserStore.getState().user?.id || null;
}
```

## 🎨 Using Selectors

### Pre-defined
```typescript
import { selectUser, selectIsAuthenticated } from '@/stores/userStore';

const user = useUserStore(selectUser);
const isAuth = useUserStore(selectIsAuthenticated);
```

### Custom
```typescript
const selectUserName = (state) => state.user?.name || 'Guest';
const userName = useUserStore(selectUserName);
```

## 📊 State Shape

```typescript
{
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  } | null;
  isAuthenticated: boolean;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  sessionExpiry: string | null;
}
```

## ⚡ Performance Tips

### ✅ DO
```typescript
// Subscribe to specific values
const user = useUserStore(state => state.user);
const name = useUserStore(state => state.user?.name);
```

### ❌ DON'T
```typescript
// Subscribe to entire store
const store = useUserStore(); // Re-renders on ANY change!
```

## 🐛 Debugging

### Console
```typescript
// Check current state
console.log(useUserStore.getState());

// Watch changes
const unsub = useUserStore.subscribe(console.log);
// Later: unsub()
```

### Redux DevTools
Install browser extension → Open DevTools → Redux tab

## 🔄 Migration from useSession

### Before
```typescript
const { data: session, status } = useSession();
if (status === 'loading') return <Loading />;
if (!session?.user) return <Login />;
return <div>Hello {session.user.name}</div>;
```

### After
```typescript
const { user, status } = useUserStore();
if (status === 'loading') return <Loading />;
if (!user) return <Login />;
return <div>Hello {user.name}</div>;
```

## 🎯 When to Use What

| Use Case | Solution |
|----------|----------|
| Read user data | `useUserStore(state => state.user)` |
| Check if logged in | `useUserStore(state => state.isAuthenticated)` |
| Update user profile | `useUserStore(state => state.updateUser)` |
| Full logout | `useUserStore(state => state.logout)` |
| Outside React | `useUserStore.getState()` |
| Watch changes | `useUserStore.subscribe(callback)` |

## 📝 Complete Example

```typescript
import { useUserStore } from '@/stores/userStore';

export default function MyComponent() {
  // Get state
  const { user, isAuthenticated, status } = useUserStore(state => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    status: state.status,
  }));
  
  // Get actions
  const { updateUser, logout } = useUserStore(state => ({
    updateUser: state.updateUser,
    logout: state.logout,
  }));
  
  // Loading state
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  // Not authenticated
  if (!isAuthenticated || !user) {
    return <div>Please sign in</div>;
  }
  
  // Authenticated
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      
      <button onClick={() => updateUser({ name: 'New Name' })}>
        Update Name
      </button>
      
      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}
```

---

**Need more help?** See `/docs/features/ZUSTAND_STATE_MANAGEMENT.md`
