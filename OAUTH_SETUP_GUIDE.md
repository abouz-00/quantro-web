# OAuth Setup Guide for Quantro

## 🔐 Complete OAuth Implementation for Beta Release

### Step 1: Google OAuth Setup

#### A. Google Cloud Console Configuration

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create/Select Project**
   - Create new project: "Quantro" or select existing
   - Note the Project ID

3. **Enable Required APIs**
   ```
   Navigation: APIs & Services > Library
   Enable: Google+ API (or Google Identity API)
   ```

4. **Create OAuth 2.0 Credentials**
   ```
   Navigation: APIs & Services > Credentials
   Click: Create Credentials > OAuth 2.0 Client IDs
   Application type: Web application
   Name: Quantro Web App
   ```

5. **Configure Authorized URLs**
   ```
   Authorized JavaScript origins:
   - http://localhost:3000
   - https://yourdomain.com (for production)
   
   Authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google
   - https://yourdomain.com/api/auth/callback/google (for production)
   ```

6. **Get Credentials**
   - Copy Client ID and Client Secret
   - Update your `.env.local` file

#### B. Update .env.local with Google Credentials

```bash
# Replace these with your actual Google OAuth credentials
GOOGLE_CLIENT_ID=your-actual-google-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-here
```

### Step 2: Apple Sign-In Setup (Optional for Beta)

#### A. Apple Developer Account Requirements
- **Paid Apple Developer Program membership required ($99/year)**
- Apple Sign-In setup is more complex than Google

#### B. Apple Developer Portal Configuration

1. **Create App ID**
   ```
   Navigation: Certificates, Identifiers & Profiles > Identifiers
   Create: App ID
   Bundle ID: com.yourcompany.quantro
   Enable: Sign In with Apple
   ```

2. **Create Service ID**
   ```
   Navigation: Certificates, Identifiers & Profiles > Identifiers
   Create: Services ID
   Identifier: com.yourcompany.quantro.signin
   Enable: Sign In with Apple
   Configure:
     - Primary App ID: com.yourcompany.quantro
     - Domains: localhost:3000, yourdomain.com
     - Return URLs: http://localhost:3000/api/auth/callback/apple
   ```

3. **Create Private Key**
   ```
   Navigation: Certificates, Identifiers & Profiles > Keys
   Create: Sign In with Apple key
   Download and save the .p8 file securely
   Note the Key ID
   ```

4. **Get Team ID**
   ```
   Available in: Apple Developer Account > Membership details
   ```

#### C. Update .env.local with Apple Credentials

```bash
# Apple Sign In Configuration
APPLE_ID=com.yourcompany.quantro.signin
APPLE_TEAM_ID=your-10-character-team-id
APPLE_PRIVATE_KEY_ID=your-10-character-key-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
[paste your private key content from the .p8 file here]
-----END PRIVATE KEY-----"
```

## 🚀 Recommended Beta Launch Strategy

### Phase 1: Google OAuth Only (Recommended for Beta)
- **Faster setup** - No Apple Developer account needed
- **99% coverage** - Most users have Google accounts
- **Lower complexity** - Simpler implementation and testing

### Phase 2: Add Apple Sign-In (Post-Beta)
- Implement after validating user demand
- Add when you have Apple Developer account
- Better for iOS app later

## ✅ Testing Your OAuth Setup

### 1. Test Google Sign-In
```bash
cd /Users/ayman/quantro
npm run dev
```

1. Visit http://localhost:3000
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Verify you're redirected to dashboard
5. Check database for user creation

### 2. Test Database Integration
```bash
# View users in database
npx prisma studio
```

### 3. Test Protected Routes
- Try accessing `/dashboard` without authentication
- Should redirect to landing page
- After sign-in, should access dashboard successfully

## 🔒 Security Checklist for Beta

- [ ] Updated NEXTAUTH_SECRET with secure random value
- [ ] Google OAuth configured with correct redirect URIs
- [ ] Test sign-in/sign-out flow completely
- [ ] Verify user data is stored correctly in database
- [ ] Test protected route middleware
- [ ] Check error handling for failed authentication

## 📋 Next Steps After OAuth

1. **User Onboarding Flow**
   - Welcome screen for new users
   - Basic profile setup (name, goals)
   - Privacy policy acceptance

2. **Enhanced User Experience**
   - Profile management page
   - Account deletion option
   - Data export functionality

3. **Beta Tester Management**
   - Admin dashboard to view users
   - Usage analytics
   - Feedback collection system

## 🚨 Production Deployment Notes

- Use HTTPS URLs for production redirect URIs
- Update NEXTAUTH_URL to production domain
- Use PostgreSQL instead of SQLite for production
- Set up proper error monitoring (Sentry)
- Configure CORS properly
- Enable rate limiting on auth endpoints
