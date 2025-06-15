# Quantro Authentication Setup

## Overview
Quantro now includes complete Apple and Google Sign-In authentication using NextAuth.js with a SQLite database for development.

## What's Implemented

### ✅ Complete Authentication System
1. **Apple Sign-In Integration** - Users can sign in with their Apple ID
2. **Google Sign-In Integration** - Users can sign in with their Google account
3. **Database Schema** - Complete user management with Prisma and SQLite
4. **User Account Creation** - Automatic account creation on first sign-in
5. **Session Management** - Secure session handling with NextAuth
6. **Protected Routes** - Middleware to protect authenticated pages
7. **API Endpoints** - User profile and food logging APIs

### ✅ Database Schema
- **Users** - Profile information and nutrition preferences
- **Accounts** - OAuth account linking
- **Sessions** - Session management
- **Food Logs** - Nutrition tracking data
- **Verification Tokens** - Security tokens

### ✅ Pages Created
- **Landing Page** - Updated with working sign-in buttons
- **Dashboard** - Post-authentication welcome page
- **Auth Error Page** - Handles authentication errors gracefully

### ✅ API Endpoints
- `/api/auth/[...nextauth]` - NextAuth authentication
- `/api/user/profile` - User profile management
- `/api/food-logs` - Food logging API

## Setup Instructions

### 1. Environment Variables
Update your `.env.local` file with your provider credentials:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production

# Apple Sign In Configuration (Required for Apple Sign-In)
APPLE_ID=your-apple-service-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_PRIVATE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your-apple-private-key-content
-----END PRIVATE KEY-----"

# Google OAuth Configuration (Required for Google Sign-In)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL="file:./dev.db"
```

### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URI: `http://localhost:3001/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env.local`

### 3. Apple Sign-In Setup
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create a new Service ID in "Certificates, Identifiers & Profiles"
3. Configure Sign In with Apple
4. Add redirect URI: `http://localhost:3001/api/auth/callback/apple`
5. Create a private key for Sign In with Apple
6. Add all credentials to `.env.local`

### 4. Database Setup
The SQLite database is already configured and ready. The schema includes:
- User profiles with nutrition preferences
- OAuth account linking
- Session management
- Food logging capabilities

## Usage

### 1. Development Server
```bash
npm run dev
```
The app will run on `http://localhost:3001`

### 2. User Flow
1. User visits landing page
2. Clicks "Sign in with Apple" or "Sign in with Google"
3. Completes OAuth flow with provider
4. Account is automatically created in database
5. User is redirected to dashboard
6. User can access food logging and other authenticated features

### 3. Authentication Status
The app automatically:
- Redirects authenticated users from landing page to dashboard
- Redirects unauthenticated users from protected pages to landing page
- Shows loading states during authentication checks
- Handles authentication errors gracefully

## Database Management

### View Database
```bash
npx prisma studio
```

### Reset Database
```bash
npx prisma db push --force-reset
```

### Generate Prisma Client
```bash
npx prisma generate
```

## Security Features

### ✅ Implemented
- Secure session management with NextAuth
- CSRF protection
- JWT tokens for session handling
- OAuth provider validation
- Protected API routes
- Middleware for route protection

### 🔒 Production Considerations
- Use strong `NEXTAUTH_SECRET` in production
- Enable HTTPS for production deployment
- Configure proper CORS settings
- Set up proper error logging
- Use environment-specific database (PostgreSQL recommended)

## Next Steps

1. **Configure OAuth Providers** - Add your actual Google and Apple credentials
2. **Test Authentication** - Verify sign-in flows work correctly
3. **Customize User Onboarding** - Add welcome flow for new users
4. **Integrate with Food Logging** - Connect authentication with existing food tracking features
5. **Deploy to Production** - Set up production environment variables

## Troubleshooting

### Build Errors Fixed ✅

#### Prisma Client Generation Error
**Error**: `Prisma has detected that this project was built on Vercel, which caches dependencies...`

**Solution**: Added `prisma generate` to the build process:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

#### useSearchParams Suspense Boundary Error
**Error**: `useSearchParams() should be wrapped in a suspense boundary`

**Solution**: Wrapped the component using `useSearchParams()` with a Suspense boundary.

### Common Issues
1. **Port 3000 in use** - App automatically uses port 3001
2. **Missing environment variables** - Check `.env.local` configuration
3. **OAuth errors** - Verify redirect URIs match provider configuration
4. **Database errors** - Run `npx prisma db push` to sync schema

### Debug Mode
Set environment variable for debugging:
```bash
NEXTAUTH_DEBUG=true
```
