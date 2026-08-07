# Development Authentication Setup

## Overview
Quantro includes a development-only credentials sign-in path so you can test locally without configuring OAuth providers.

## Development Sign-In
When running in development mode (`NODE_ENV=development`), you'll see a **Dev Sign In** button on the landing page.

### How it works:
1. Click the Dev Sign In button
2. Enter an email address with beta access
3. Enter the development password from `DEV_SIGNIN_PASSWORD`
4. You're redirected to the dashboard
5. All API calls work with the resulting session

### Security Features:
- **Password required**: `DEV_SIGNIN_PASSWORD` must be set in `.env.local`
- **Beta access check**: Email must be on the allowlist or have a valid invite
- **Environment restricted**: Only works when `NODE_ENV=development`
- **Rate limited**: Failed attempts are logged

## For Production
In production (`NODE_ENV=production`):
- Only Google, Apple, and Resend magic-link auth are available
- Users must have valid beta access
- No development bypass is active

## Adding Dev Users
Configure a comma-separated allowlist in `.env.local`:

```bash
BETA_ALLOWLIST_EMAILS=dev@quantro.local,another-dev@example.com
```

Or create beta invites through the admin panel / database.

## Environment Setup
Copy the template and fill in values:

```bash
cp .env.example .env.local
```

Minimum for local dev sign-in:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
DEV_SIGNIN_PASSWORD=<choose a strong local-only password>
BETA_ALLOWLIST_EMAILS=dev@quantro.local
```

OAuth credentials are optional in development. Providers without credentials are omitted at startup.
