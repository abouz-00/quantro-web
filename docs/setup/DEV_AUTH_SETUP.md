# Development Authentication Setup

## Overview
Quantro now includes secure development authentication that requires a password for local development.

## Development Sign-In
When running in development mode (`NODE_ENV=development`), you'll see a **🚀 Dev Sign In** button on the landing page.

### How it works:
1. Click the yellow "🚀 Dev Sign In" button
2. Enter your email address (must have beta access)
3. Enter the development password
4. You're redirected to the dashboard
5. All API calls will work with proper authentication

### Security Features:
- **Password Required**: Must enter the correct development password
- **Beta Access Check**: Email must be in the approved beta list or have a valid invite
- **Environment Restricted**: Only works in development mode
- **Rate Limited**: Failed attempts are logged

### What happens:
- Validates the development password
- Checks beta access for the provided email
- Creates a mock user session
- Bypasses OAuth requirements
- Works with all API endpoints

## For Production
In production (`NODE_ENV=production`):
- Only Google and Apple OAuth are available
- Users must have valid beta access
- No development bypass is active

## Adding More Dev Users
To add more development emails, edit `src/lib/betaAccess.ts`:

```typescript
const BETA_EMAILS = [
  'hello@quantro.fit',
  'abouzelfane@icloud.com',
  'dev@quantro.local',        // Development email
  'another-dev@example.com',  // Add more here
];
```

## Environment Setup
Make sure your `.env.local` has:
```bash
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
DEV_SIGNIN_PASSWORD=quantro-dev-2024
```

### Development Password
The default development password is `quantro-dev-2024`. You can change this by setting the `DEV_SIGNIN_PASSWORD` environment variable.

The OAuth credentials are already configured for both Google and Apple if you want to test real authentication.
