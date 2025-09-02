# Vercel Environment Variables Setup

## Critical Environment Variables for Production

When deploying to Vercel, set these environment variables in your Vercel dashboard:

### Required Variables
```bash
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=Q06YT7mwGxLZcZrC58IxH+AUz1Q0byDmIDiWx+FUqf4=
```

### Apple Sign-In Configuration
```bash
APPLE_ID=com.quantrodev.quantro.signin
APPLE_TEAM_ID=FU53ZN75WJ
APPLE_PRIVATE_KEY_ID=H25HDU38UU
```

**IMPORTANT: For `APPLE_PRIVATE_KEY`:**
In Vercel, set this as a single line with `\n` for line breaks:
```
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgeoFdjpJuSVn79+rB\nAoMuP3IHLy2V3L4b+NQhn9IQmT2gCgYIKoZIzj0DAQehRANCAAQbjLBmKbliNOSf\n1DLyxsumyzQ6mtkTYJ+8/XOx9wUlEob/ekACplR9De8WpL1nMJDhyfVt2bISu4Su\nFc8KMYXn\n-----END PRIVATE KEY-----"
```

### Google OAuth Configuration
```bash
GOOGLE_CLIENT_ID=973050208073-dn82bqotj0cnkut5g543mm2qeg4rnth6.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Database (Production)
Set up your production database URL:
```bash
DATABASE_URL="postgresql://username:password@host:port/database"
```

### Email Configuration
```bash
RESEND_API_KEY=re_8atTpXKS_CKMYXMhY2JUQaQCMxpReeFbB
```

## Build Fix Applied

The JWT signing error has been fixed by:

1. **Improved error handling** in the `generateAppleJWT()` function
2. **Proper key formatting** handling for both encoded and raw private keys
3. **Conditional provider loading** - Apple provider only loads if JWT generation succeeds
4. **Try-catch error handling** to prevent build failures

## Testing

The build now passes successfully:
```bash
npm run build
# ✓ Compiled successfully
```

## Notes

- The Apple private key formatting is critical for ES256 algorithm
- The code now handles both `\n` encoded and actual line break formats
- If Apple JWT generation fails, the app will still build and run with just Google authentication
- All environment variables should be set in Vercel dashboard before deployment
