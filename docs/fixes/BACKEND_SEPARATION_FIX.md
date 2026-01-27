# Backend Separation - Network Error Fix

## Issue Summary

After separating the backend into its own submodule (`quantro-backend`), the frontend was experiencing network errors when trying to add or load food logs:

```text
NetworkError when attempting to fetch resource.
```

## Root Cause

The issue had multiple layers:

### 1. **Backend Not Running**

- The `.env.local` file had `NEXT_PUBLIC_API_URL=http://localhost:3001` configured
- This pointed to the NestJS backend server
- However, the backend was **not running**, causing network connection failures

### 2. **Authentication Mismatch**

- **Frontend**: Uses NextAuth with session-based authentication (cookies like `next-auth.session-token`)
- **Backend**: Uses JWT authentication with `access_token` httpOnly cookies
- These are **two separate authentication systems** that don't communicate with each other

### 3. **Middleware Redirect Issues**

- The middleware was redirecting unauthenticated API requests to `/api/auth/signin`
- Redirecting POST/PUT/DELETE requests causes NetworkError in browsers
- Fixed by returning proper `401 Unauthorized` JSON responses instead

## Solutions Implemented

### Immediate Fix (Current)

**Use Next.js API Routes** - The quickest solution to get the app working:

1. **Commented out the backend API URL** in `.env.local`:

   ```bash
   # NEXT_PUBLIC_API_URL=http://localhost:3001
   # When not set, defaults to /api (Next.js routes)
   ```

2. **Frontend now uses** `/api/food-logs` routes in Next.js (integrated with NextAuth)

3. **Middleware fixed** to return proper JSON responses instead of redirects:

   ```typescript
   if (!req.auth && req.nextUrl.pathname.startsWith('/api/food-logs')) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   }
   ```

4. **Added comprehensive logging** to `apiClient.ts` and `middleware.ts` for debugging

### Backend Setup (For Future Integration)

The NestJS backend is located in `quantro-backend/` and can be started with:

```bash
cd quantro-backend
npm run start:dev
```

It runs on **port 3001** and includes routes for:

- `/auth` - Authentication (register, login, logout)
- `/food-logs` - Food logging operations
- `/food-search` - USDA food database search
- `/user` - User profile management

## Future Integration Plan

To fully integrate the backend, you'll need to:

### Option A: Sync Authentication

1. Make NextAuth create/validate JWT tokens compatible with the NestJS backend
2. Share the same `JWT_SECRET` between both systems
3. Have NextAuth set the `access_token` cookie that the backend expects

### Option B: Backend as Proxy

1. Keep both authentication systems separate
2. Have Next.js API routes proxy to the backend
3. Transform NextAuth sessions into JWT tokens for backend requests

### Option C: Full Backend Migration

1. Remove Next.js API routes entirely
2. Migrate frontend authentication to use backend's `/auth` endpoints
3. Replace NextAuth with custom authentication that uses backend JWT tokens
4. Update all frontend components to work with new auth flow

## Files Modified

### `/Users/ayman/quantro-web/.env.local`

- Commented out `NEXT_PUBLIC_API_URL` to use Next.js routes
- Created backup in `.env.local.backend` for when backend is ready

### `/Users/ayman/quantro-web/src/lib/apiClient.ts`

- Fixed URL construction for POST, PUT, DELETE methods to match GET
- Added try-catch error handling to all HTTP methods
- Added console logging for debugging requests

### `/Users/ayman/quantro-web/middleware.ts`

- Changed API authentication failures to return JSON instead of redirects
- Added logging to track authentication flow
- Prevents NetworkError on failed auth attempts

## Testing

After the fix, the app should:

- ✅ Load food logs successfully
- ✅ Add new food entries
- ✅ Show proper authentication errors if not signed in
- ✅ Use Next.js API routes with existing NextAuth sessions

## Known Limitations

Current setup:

- Frontend and backend databases are separate (SQLite vs PostgreSQL)
- Backend is running but not being used by frontend
- Two authentication systems coexist but don't sync

## References

- Backend README: `quantro-backend/README.md`
- API Routes: `src/app/api/food-logs/route.ts`
- Auth Middleware: `middleware.ts`
- API Client: `src/lib/apiClient.ts`
