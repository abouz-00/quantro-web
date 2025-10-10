# Food Log Persistence Issue - Authentication Required

## Problem

Food log entries are not persisting after page refresh. The entries appear to save but disappear when the page is refreshed.

## Root Cause

The application requires **authentication** to save food logs to the database. Currently:

1. No active session exists (JWT auth)
2. API requests return `401 Unauthorized`
3. Food entries are saved to localStorage
4. On page refresh, the app attempts to load from API (fails)
5. Falls back to localStorage, but the hook may clear it during the failed load

## Solution

You need to **log in** to the application before adding food entries.

### Step 1: Access the Login Page

1. Navigate to `http://localhost:3000/`
2. You should see the landing page with sign-in options

### Step 2: Choose Your Login Method

#### Option A: Google Sign-In (Recommended)
- Click "Sign in with Google"
- Use your Google account: `aymanbouzelfane1@gmail.com`
- This will create a proper session

#### Option B: Apple Sign-In
- Click "Sign in with Apple"
- Use your Apple ID

#### Option C: Development Credentials (If in dev mode)
- Email: `aymanbouzelfane1@gmail.com`  
- Password: Check `.env.local` for `DEV_SIGNIN_PASSWORD` (default: `quantro-dev-2024`)

### Step 3: Verify You're Logged In

After logging in, verify your session:

```bash
# Check if a session exists
sqlite3 prisma/dev.db "SELECT sessionToken, userId, expires FROM Session ORDER BY expires DESC LIMIT 1;"

# Check if you have a user record
sqlite3 prisma/dev.db "SELECT id, email, name FROM User WHERE email='aymanbouzelfane1@gmail.com';"
```

### Step 4: Test Food Log Persistence

1. Go to `/log` page
2. Click "Add Food"
3. Search for and add a food entry
4. **Refresh the page**
5. Your entry should persist! ✅

## Why This Happens

The architecture requires authentication for security:

```typescript
// src/app/api/food-logs/route.ts
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // ❌
  }
  
  // Save to database...
}
```

Without authentication:
- ❌ API returns 401
- ❌ No data saved to database  
- ⚠️ Data saved to localStorage (temporary)
- ❌ Lost on page refresh if localStorage is cleared

With authentication:
- ✅ API accepts requests
- ✅ Data saved to database
- ✅ Persists across sessions
- ✅ Available on any device (once backend syncs)

## Current Authentication Status

```bash
# Check your current auth status
curl -s "http://localhost:3000/api/food-logs?date=2025-10-09"
```

If you see `{"error":"Unauthorized"}`, you need to log in.

## Middleware Protection

The middleware protects these routes:
- `/dashboard` - Requires auth
- `/log` - Requires auth
- `/api/user` - Requires auth
- `/api/food-logs` - Requires auth

See `middleware.ts` for details.

## Quick Fix Commands

```bash
# 1. Verify database is correct
cat .env | grep DATABASE_URL
# Should show: DATABASE_URL="file:./prisma/dev.db"

# 2. Check if dev server is running
lsof -ti:3000
# Should show a process ID

# 3. Open browser and log in
open http://localhost:3000

# 4. After login, test API
curl -s "http://localhost:3000/api/food-logs?date=2025-10-09"
# Should show [] or your food logs, NOT "Unauthorized"
```

## Next Steps

1. **Log in** using one of the methods above
2. **Add a test food entry**
3. **Refresh the page** - entry should persist
4. **Check the database**:
   ```bash
   sqlite3 prisma/dev.db "SELECT id, foodName, quantity, date FROM FoodLog ORDER BY createdAt DESC LIMIT 5;"
   ```

## Related Files

- `src/lib/auth.ts` - Authentication configuration
- `middleware.ts` - Route protection
- `src/app/api/food-logs/route.ts` - API endpoints (now with debug logging)
- `src/hooks/useFoodData.ts` - Data loading logic

## Date

October 9, 2025
