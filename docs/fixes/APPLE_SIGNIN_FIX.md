# Apple Sign-In Redirect Issue Fix

## Problem
When users sign in with Apple on quantro.fit, they are redirected to a Vercel login page instead of completing the authentication flow.

## Root Causes
1. **Incorrect NEXTAUTH_URL in production**: The production environment likely has `NEXTAUTH_URL` set to a Vercel URL instead of `https://quantro.fit`
2. **Apple Sign-In redirect URI mismatch**: Apple Developer Console may have Vercel URLs configured instead of the custom domain
3. **Apple Provider Configuration**: Fixed in this update - was using incorrect clientSecret format

## Fixes Applied ✅

### 1. Fixed Apple Provider Configuration in auth.ts
- Added proper JWT token generation for Apple clientSecret
- Installed required `jsonwebtoken` package
- Fixed TypeScript errors and unused parameters

### 2. Apple JWT Token Generation
```typescript
function generateAppleJWT() {
  if (!process.env.APPLE_PRIVATE_KEY || !process.env.APPLE_TEAM_ID || !process.env.APPLE_PRIVATE_KEY_ID || !process.env.APPLE_ID) {
    return null;
  }
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: process.env.APPLE_TEAM_ID,
    iat: now,
    exp: now + 15 * 60, // 15 minutes
    aud: 'https://appleid.apple.com',
    sub: process.env.APPLE_ID,
  };

  return jwt.sign(payload, process.env.APPLE_PRIVATE_KEY, {
    algorithm: 'ES256',
    keyid: process.env.APPLE_PRIVATE_KEY_ID,
  });
}
```

## Required Actions 🚨

### 1. Update Vercel Environment Variables
In your Vercel project settings, set:
```bash
NEXTAUTH_URL=https://quantro.fit
```

### 2. Update Apple Developer Console
1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list/serviceId)
2. Find your Service ID: `com.quantrodev.quantro.signin`
3. Edit the "Sign In with Apple" configuration
4. Update the Return URLs to:
   - `https://quantro.fit/api/auth/callback/apple`
   - Remove any `.vercel.app` URLs
5. Save the changes

### 3. Verify Domain Configuration
Ensure your Apple Service ID has the correct domains configured:
- Primary domain: `quantro.fit`
- Remove any Vercel domains

## Testing
After making these changes:
1. Deploy to Vercel with the new environment variable
2. Test Apple Sign-In on https://quantro.fit
3. Verify the redirect goes to your dashboard, not Vercel login

## Additional Notes
- The Apple private key and other credentials are already correctly configured in your environment
- Google Sign-In should continue working without issues
- The fix maintains compatibility with your existing authentication flow
