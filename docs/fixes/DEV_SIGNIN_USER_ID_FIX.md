# Dev Sign-In User ID Mismatch Fix

## Problem

Food log entries were not persisting even when signed in with dev credentials. The root cause was that the dev sign-in was creating sessions with a **mock user ID** (`dev-aymanbouzelfane1@gmail.com`) that didn't match the **actual user ID** in the database (`cmebw3oxf0000itxmiq2es02u`).

## Root Cause Analysis

### Before Fix

```typescript
// In Credentials provider authorize function
const user = {
  id: `dev-${email}`,  // ❌ Creates: "dev-aymanbouzelfane1@gmail.com"
  email: email,
  name: "Development User",
  image: null,
};
```

**Flow:**
1. User signs in with dev password
2. Auth creates session with user ID: `dev-aymanbouzelfane1@gmail.com`
3. User tries to add food entry
4. API receives request with session user ID: `dev-aymanbouzelfane1@gmail.com`
5. API tries to create FoodLog for user: `dev-aymanbouzelfane1@gmail.com`
6. Database has user: `cmebw3oxf0000itxmiq2es02u`
7. **Mismatch** → Food logs saved for wrong user ID → Not visible when loading

### After Fix

```typescript
// Get or create user in database
let dbUser = await prisma.user.findUnique({
  where: { email: email },
});

if (!dbUser) {
  dbUser = await prisma.user.create({
    data: {
      email: email,
      name: "Development User",
      isApproved: true,
    },
  });
}

// Return user with actual database ID
const user = {
  id: dbUser.id,  // ✅ Uses actual ID: "cmebw3oxf0000itxmiq2es02u"
  email: dbUser.email,
  name: dbUser.name || "Development User",
  image: dbUser.image,
};
```

**Flow:**
1. User signs in with dev password
2. Auth queries database for user by email
3. Finds existing user with ID: `cmebw3oxf0000itxmiq2es02u`
4. Creates session with **actual database user ID**
5. User tries to add food entry
6. API receives request with session user ID: `cmebw3oxf0000itxmiq2es02u`
7. API creates FoodLog for user: `cmebw3oxf0000itxmiq2es02u`
8. **Match!** → Food logs saved correctly → Visible when loading ✅

## Changes Made

### File: `src/lib/auth.ts`

**Lines 111-129** (in Credentials provider authorize function)

**Removed:**
- Mock user ID generation: `id: \`dev-${email}\``

**Added:**
- Database user lookup: `prisma.user.findUnique()`
- User creation if not exists: `prisma.user.create()`
- Return actual database user with real ID

## Testing Steps

### 1. Sign Out and Sign In Again

You need to sign out and sign in again for the fix to take effect:

```bash
# Open browser and go to:
open http://localhost:3000/

# Click "Sign Out" (if signed in)
# Then sign in with dev credentials:
# Email: aymanbouzelfane1@gmail.com
# Password: quantro-dev-2024
```

### 2. Verify Session Has Correct User ID

After signing in, check the browser console:

```javascript
// In browser console
console.log(window.__foodDataDebug);
```

Look for logs like:
```
Found existing user: cmebw3oxf0000itxmiq2es02u
Dev sign-in successful for: aymanbouzelfane1@gmail.com with ID: cmebw3oxf0000itxmiq2es02u
```

### 3. Test Food Entry Persistence

1. Go to `/log` page
2. Click "Add Food"
3. Add a test food entry (e.g., search for "chicken")
4. Entry appears in the list
5. **Refresh the page** (Cmd+R / Ctrl+R)
6. Entry should **still be there**! ✅

### 4. Verify in Database

```bash
# Check food logs in database
sqlite3 prisma/dev.db "SELECT id, foodName, quantity, userId FROM FoodLog ORDER BY createdAt DESC LIMIT 5;"

# Should show entries with userId: cmebw3oxf0000itxmiq2es02u
```

### 5. Check API Response

```bash
# Test API (should work if signed in)
curl -s "http://localhost:3000/api/food-logs?date=2025-10-09" | jq '.'

# Should return food logs array, NOT {"error":"Unauthorized"}
```

## Why This Happened

The original dev sign-in implementation was designed to be **stateless** - it created mock user IDs without querying the database. This worked for basic authentication but broke when trying to persist user-specific data (like food logs) because:

1. **JWT Strategy**: Uses tokens, not database sessions
2. **Mock IDs**: Dev sign-in created `dev-${email}` IDs
3. **Database Mismatch**: Actual users had different IDs (e.g., `cmebw3oxf0000itxmiq2es02u`)
4. **Data Isolation**: Food logs are tied to user IDs via foreign key

## Additional Notes

### Why JWT Strategy?

The app uses JWT strategy (line 186 in auth.ts):
```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

This is because:
- SQLite doesn't support concurrent writes well
- JWT tokens are stored in cookies, not database
- Better for development with file-based database
- Production uses PostgreSQL with proper session support

### OAuth vs Dev Sign-In

- **Google/Apple OAuth**: Already uses actual database IDs (handled by PrismaAdapter)
- **Dev Credentials**: Now also uses actual database IDs (with this fix)

## Files Modified

- `src/lib/auth.ts` - Credentials provider authorize function

## Files Added

- `src/app/api/food-logs/route.ts` - Added debug logging (separate change)
- `docs/fixes/DEV_SIGNIN_USER_ID_FIX.md` - This documentation

## Related Issues

- Database environment persistence fix (earlier)
- Favorites tab add food fix (earlier)
- Food log auth persistence issue (earlier)

## Date

October 9, 2025
