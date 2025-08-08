# 🚀 Deployment & Setup Guide

## 📋 Overview

This guide covers the complete setup, development, and deployment process for Quantro, from local development to production deployment on Vercel.

## 🛠️ Prerequisites

### **Required Software**

- **Node.js**: Version 18.x or 20.x (recommended: 20.x)
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: Latest version
- **VS Code**: Recommended IDE with extensions

### **Recommended VS Code Extensions**

- TypeScript and JavaScript Language Features
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prisma (for database schema)
- GitLens

### **External Services**

- **Google OAuth**: For Google Sign-In authentication
- **Apple Developer Account**: For Apple Sign-In authentication
- **Vercel Account**: For deployment and hosting
- **PostgreSQL Database**: For production (optional: use Vercel Postgres)

## 🏗️ Local Development Setup

### **1. Clone and Install**

```bash
# Clone the repository
git clone https://github.com/quantrodev/quantro.git
cd quantro

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### **2. Environment Configuration**

Create `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (Development)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Apple OAuth (Development)
APPLE_ID="your-apple-id"
APPLE_TEAM_ID="your-apple-team-id"
APPLE_PRIVATE_KEY="your-apple-private-key"
APPLE_KEY_ID="your-apple-key-id"

# USDA API (Optional)
USDA_API_KEY="your-usda-api-key"

# Development Settings
NODE_ENV="development"
```

### **3. Database Setup**

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed

# (Optional) Open Prisma Studio
npx prisma studio
```

### **4. Start Development Server**

```bash
# Start the development server
npm run dev

# Or use the custom restart script (clears cache)
./restart-dev.sh

# Or use the npm script
npm run dev:clean
```

### **5. Available Scripts**

```bash
# Development
npm run dev          # Start development server
npm run dev:clean    # Clean start (clears cache)

# Building
npm run build        # Build for production
npm run start        # Start production server locally

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint        # Lint code
npm run lint:fix    # Fix linting issues

# Database
npm run db:generate # Generate Prisma client
npm run db:migrate  # Run migrations
npm run db:studio   # Open Prisma Studio
npm run db:reset    # Reset database
```

## 🔧 Development Workflow

### **Project Structure**

```text
quantro/
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── services/          # API service layer
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions
├── prisma/               # Database schema and migrations
├── public/              # Static assets
├── docs/               # Documentation
└── tests/              # Test files
```

### **Development Best Practices**

1. **Component Development**
   - Create components in appropriate domain folders
   - Write TypeScript interfaces for all props
   - Include proper JSDoc comments
   - Add unit tests for complex logic

2. **State Management**
   - Use custom hooks for shared logic
   - Keep local state close to where it's used
   - Use Context sparingly for truly global state

3. **API Development**
   - All API routes in `src/app/api/`
   - Use proper HTTP status codes
   - Implement error handling and validation
   - Add rate limiting for security

4. **Database Changes**
   - Always create migrations for schema changes
   - Test migrations in development first
   - Use descriptive migration names

## 🧪 Testing Strategy

### **Test Types**

1. **Unit Tests**
   - Individual functions and hooks
   - Located in `__tests__` folders
   - Run with: `npm test`

2. **Component Tests**
   - React component rendering and interactions
   - Use React Testing Library
   - Mock external dependencies

3. **Integration Tests**
   - API endpoints and database operations
   - Test complete user workflows

### **Running Tests**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- Header.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"
```

### **Test Coverage Requirements**

- **Minimum Coverage**: 70% overall
- **Critical Paths**: 90%+ coverage (auth, data operations)
- **Components**: Focus on user interactions and edge cases
- **Utilities**: 100% coverage for pure functions

## 🚀 Production Deployment

### **Deployment Architecture**

```text
Developer → GitHub → GitHub Actions → Vercel → Production
    ↓         ↓           ↓            ↓         ↓
  Commit → Trigger → Build/Test → Deploy → Live Site
```

### **1. Environment Setup**

**Production Environment Variables** (Vercel Dashboard):

```bash
# Database (Production)
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth.js (Production)
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"

# OAuth (Production Keys)
GOOGLE_CLIENT_ID="production-google-client-id"
GOOGLE_CLIENT_SECRET="production-google-client-secret"
APPLE_ID="production-apple-id"
APPLE_TEAM_ID="production-apple-team-id"
APPLE_PRIVATE_KEY="production-apple-private-key"
APPLE_KEY_ID="production-apple-key-id"

# Production Settings
NODE_ENV="production"
```

### **2. Vercel Deployment**

#### **Method 1: GitHub Integration (Recommended)**

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

#### **Method 2: Manual Deployment**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### **3. Database Migration (Production)**

```bash
# Run production migrations
npx prisma migrate deploy

# Generate production client
npx prisma generate
```

### **4. Domain Configuration**

1. **Custom Domain**: Configure in Vercel dashboard
2. **SSL Certificate**: Automatically provided by Vercel
3. **DNS Records**: Point to Vercel's servers

## 🔒 Security Checklist

### **Environment Security**

- [ ] All secrets in environment variables (never in code)
- [ ] Different OAuth keys for development/production
- [ ] Strong NEXTAUTH_SECRET (32+ characters)
- [ ] Database credentials properly secured

### **Application Security**

- [ ] Rate limiting enabled on API routes
- [ ] Input validation on all forms
- [ ] XSS protection with proper sanitization
- [ ] CSRF protection with NextAuth.js

### **Deployment Security**

- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Environment variables encrypted at rest
- [ ] Database connections encrypted
- [ ] Regular dependency updates

## 📊 Monitoring & Maintenance

### **Performance Monitoring**

**Vercel Analytics** (Built-in):

- Core Web Vitals tracking
- Real User Monitoring (RUM)
- Performance insights

**Custom Monitoring**:

```tsx
// Add performance tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### **Error Monitoring**

**Error Boundaries**:

```tsx
// Already implemented in src/components/ErrorBoundary.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**API Error Logging**:

```tsx
// Add to API routes
catch (error) {
  console.error('API Error:', error);
  // Send to error tracking service (e.g., Sentry)
}
```

### **Database Maintenance**

**Regular Tasks**:

```bash
# Backup database (production)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Analyze query performance
npx prisma studio

# Check database size
SELECT pg_size_pretty(pg_database_size('quantro'));
```

## 🔄 CI/CD Pipeline

### **GitHub Actions Workflow**

Current pipeline (`.github/workflows/ci-cd.yml`):

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Build application
        run: npm run build
      
      - name: Run security audit
        run: npm audit
```

### **Deployment Triggers**

- **Automatic**: Push to `main` branch
- **Preview**: Pull requests and feature branches
- **Manual**: Vercel CLI deployment

## 🚧 Troubleshooting

### **Common Development Issues**

**Database Connection Issues**:

```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate

# Check database status
npx prisma db pull
```

**Build Errors**:

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules && npm install

# Check TypeScript errors
npx tsc --noEmit
```

**Port Already in Use**:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### **Production Issues**

**Environment Variables Not Loading**:

- Check Vercel dashboard environment variables
- Ensure variables are set for correct environment (development/preview/production)
- Redeploy after adding new environment variables

**Database Migration Failures**:

```bash
# Check migration status
npx prisma migrate status

# Reset to specific migration
npx prisma migrate reset --force

# Apply specific migration
npx prisma migrate resolve --applied "migration-name"
```

## 📈 Performance Optimization

### **Build Optimization**

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer .next/static/chunks/*.js

# Check for unused dependencies
npx depcheck
```

### **Runtime Optimization**

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Dynamic imports for large components
3. **Caching**: Implement proper cache headers
4. **Database**: Optimize Prisma queries

### **Monitoring Performance**

```tsx
// Add performance metrics to your app
export function reportWebVitals(metric) {
  console.log(metric);
  // Send to analytics service
}
```

## 🎯 Future Scaling Considerations

### **Database Scaling**

- **Read Replicas**: For high-read workloads
- **Connection Pooling**: PgBouncer for PostgreSQL
- **Query Optimization**: Regular performance analysis

### **Application Scaling**

- **CDN**: For static assets (automatic with Vercel)
- **Edge Functions**: For geo-distributed compute
- **Microservices**: Split into smaller services as needed

### **Team Scaling**

- **Feature Branches**: GitFlow workflow
- **Code Reviews**: Required PR approvals
- **Documentation**: Keep this guide updated

---

This deployment guide ensures reliable, secure, and scalable deployment of the Quantro application from development to production.
