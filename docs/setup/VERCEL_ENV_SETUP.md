# Vercel Environment Variables Setup

## Critical Environment Variables for Production

When deploying to Vercel, set these environment variables in your Vercel dashboard:

### Required Variables
```bash
NEXTAUTH_URL=https://quantro.fit
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
```

### Apple Sign-In Configuration
```bash
APPLE_ID=<your Apple Services ID>
APPLE_TEAM_ID=<your Apple Team ID>
APPLE_PRIVATE_KEY_ID=<your Apple Private Key ID>
```

**IMPORTANT: For `APPLE_PRIVATE_KEY`:**
In Vercel, set this as a single line with `\n` for line breaks:
```
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n<your key content>\n-----END PRIVATE KEY-----"
```

### Google OAuth Configuration
```bash
GOOGLE_CLIENT_ID=<your Google OAuth Client ID>
GOOGLE_CLIENT_SECRET=<your Google OAuth Client Secret>
```

### Database (Production)
```bash
DATABASE_URL="postgresql://username:password@host:port/database"
```

### Email Configuration
```bash
RESEND_API_KEY=<your Resend API key>
```

### Food Search APIs
```bash
USDA_API_KEY=<your USDA FoodData Central API key>
FATSECRET_CLIENT_ID=<your FatSecret Client ID>
FATSECRET_CLIENT_SECRET=<your FatSecret Client Secret>
```

## Notes

- The Apple private key formatting is critical for ES256 algorithm
- The code handles both `\n` encoded and actual line break formats
- If Apple JWT generation fails, the app will still build and run with just Google authentication
- All environment variables should be set in Vercel dashboard before deployment
- Never commit real secret values to the repository
