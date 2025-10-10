# Quantro Web - AI Coding Agent Instructions

## Project Overview

Quantro is a nutrition tracking web application using **Next.js 15 App Router** + **React 19** + **TypeScript**. This is the **frontend-only** repository that consumes a separate backend API (`quantro-backend`). The app uses feature flagging returned by the API for controlled rollouts.

## Architecture Essentials

### Monorepo Structure with Separate Backend
- **Frontend**: This repo (`quantro-web`) - Next.js UI deployed to Vercel
- **Backend**: Separate repo (`quantro-backend`) - NestJS API on port 3001 (not in this codebase)
- **API Communication**: `src/lib/apiClient.ts` handles all backend calls with cookie-based auth
- **Environment**: Set `NEXT_PUBLIC_API_URL` only when backend is separate (currently commented out to use Next.js API routes)

### State Management (Zustand + NextAuth)
- **Global State**: `src/stores/userStore.ts` - Zustand store with persist + devtools middleware
- **Auth Sync**: `src/hooks/useAuthSync.ts` - Auto-syncs NextAuth session with Zustand store
- **Usage**: Import from `src/stores` or `src/hooks`, NOT directly from files
- **Key Hooks**: `useFoodData`, `useGoals`, `useUserStore` - domain-specific state management

### Component Organization (Domain-Driven)
```
src/components/
├── food-log/        # Food logging domain (core/, charts/, search/, table/, hooks/)
├── ui/              # Shared UI primitives (shadcn/ui components)
├── shared/          # Cross-domain components (SessionWrapper, ErrorBoundary)
├── log/             # Page-specific components
└── [auth|admin|landing|dashboard]/  # Feature-specific components
```

**Pattern**: Components co-locate with domain logic. `food-log/` contains business logic, `ui/` contains presentational components.

## Critical Developer Workflows

### Development Commands
```bash
npm run dev              # Standard dev server on port 3000
npm run dev:safe         # Safe start: cleans cache, kills port, regenerates Prisma
npm run dev:clean        # Quick restart: kills port + cleans .next
npm run build:safe       # Production build with safety checks
npm run test:fast        # Fastest test run (maxWorkers=1, forceExit)
npm run test:ci          # CI-optimized tests with coverage
```

**Always use `dev:safe` if you encounter cache/port issues.** The app uses custom scripts (`scripts/safe-dev-start.sh`, `scripts/clean-build.sh`) that handle common issues.

### Testing Strategy
- **Test DB Setup**: All test commands auto-run `./scripts/setup-test-db.sh` which:
  - Copies `.env.test` → `.env`
  - Uses SQLite test database (`test.db`)
  - Auto-restores original `.env` on exit
- **Mocking**: `__mocks__/@prisma/client.js` - Prisma is mocked globally
- **Config**: `jest.config.js` - Pre-configured with transformIgnorePatterns for Next.js
- **Pattern**: Tests live in `__tests__/` folders next to source files

### Database Management
- **Development**: SQLite (`prisma/dev.db`) via `DATABASE_URL=file:./prisma/dev.db`
- **Testing**: SQLite (`test.db`) via test scripts
- **Production**: PostgreSQL (Vercel deployment)
- **Schema Files**: 
  - `prisma/schema.prisma` - Main development schema (SQLite)
  - `prisma/schema.production.prisma` - Production schema (PostgreSQL)
  - `prisma/schema.test.prisma` - Test schema (SQLite)

**Key Models**: `User`, `FoodLog`, `Account`, `Session` (NextAuth tables)

## Project-Specific Patterns

### Service Layer Pattern
All API calls go through service classes in `src/services/`:
```typescript
// src/services/foodLogService.ts
export class FoodLogService {
  static async loadFoodData(dateParam: string): Promise<FoodEntry[]> {
    const apiData = await apiClient.get<ApiData[]>('/food-logs', { date: dateParam });
    return apiData.map(transformApiDataToFoodEntry);
  }
}
```

**Never call `fetch()` directly.** Use `apiClient` from `src/lib/apiClient.ts` which handles:
- Cookie-based authentication (httpOnly cookies)
- Automatic error handling with HTTP status codes
- Credentials configuration (`credentials: 'include'`)

### Data Transformation Pattern
- **API Format**: Backend uses snake_case/specific structure
- **UI Format**: Frontend uses camelCase/FoodEntry interface
- **Transformers**: `src/utils/foodEntryUtils.ts` - `transformApiDataToFoodEntry()`, `transformFoodEntryToApiData()`
- **Usage**: Transform at service layer boundaries, NOT in components

### Authentication Flow
1. **NextAuth.js**: OAuth (Google/Apple) via `src/lib/auth.ts`
2. **Middleware**: `middleware.ts` - Protects `/dashboard`, `/log`, `/api/user`, `/api/food-logs`
3. **Session Sync**: `SessionWrapper` component auto-syncs session → Zustand store
4. **Access**: Use `useUserStore()` for client-side auth state, `auth()` for server-side

### TypeScript Conventions
- **Types**: `src/types/` - Domain types (e.g., `food.ts` for `FoodEntry`)
- **Interfaces**: Co-locate with components for local types
- **Enums**: Use string literal unions: `type MealType = "breakfast" | "lunch" | "dinner" | "snack"`
- **Config**: `tsconfig.json` - Strict mode enabled, path alias `@/` → `src/`

## Common Gotchas

### Build Cache Issues
If you see weird build errors:
```bash
npm run clean        # Cleans .next cache
npm run clean:all    # Nuclear option: cleans everything + reinstalls
```

The `next.config.ts` disables webpack cache in development to prevent corruption.

### Port 3000 Conflicts
Dev server requires port 3000. If blocked:
```bash
npm run dev:check    # Check port status
npm run dev:safe     # Auto-kills port + starts clean
```

### Test Database Issues
Tests must use SQLite test database:
- **Never** run tests against development database
- **Never** run `jest` directly - always use `npm run test` which handles environment switching
- `npm run test:db:reset` - Recreates test database from scratch
- Check `.env.test` has `DATABASE_URL="file:./test.db"`
- If logs don't persist after tests: `./scripts/restore-dev-env.sh` (restores `.env` to dev database)

### Prisma Client Issues
After schema changes:
```bash
npx prisma generate  # Regenerate client
npm run postinstall  # Runs prisma generate automatically
```

`package.json` has `postinstall` hook that auto-generates on `npm install`.

## External Integrations

### USDA FoodData Central API
- **Backend Proxy**: `/api/food-search` (backend handles API key)
- **Endpoints**: Search foods, get food details by FDC ID
- **Caching**: Backend implements 1-hour cache (max 100 entries)
- **Never** call USDA API directly from frontend

### NextAuth.js Providers
- **Google OAuth**: Configured in `src/lib/auth.ts`
- **Apple Sign In**: Uses private key in `keys/` directory (not in git)
- **Adapter**: `@auth/prisma-adapter` - Stores sessions in database

## Key Files Reference

- `src/lib/apiClient.ts` - API communication layer
- `src/stores/userStore.ts` - Global auth state (Zustand)
- `src/hooks/useFoodData.ts` - Food data management hook
- `src/services/foodLogService.ts` - Food logging service
- `src/utils/foodEntryUtils.ts` - Data transformers
- `middleware.ts` - Route protection
- `next.config.ts` - Next.js config with webpack optimizations
- `jest.config.js` - Test configuration
- `scripts/setup-test-db.sh` - Test database setup

## Documentation

Comprehensive docs in `docs/`:
- `docs/architecture/ARCHITECTURE.md` - System architecture
- `docs/setup/` - Environment setup guides
- `docs/testing/` - Testing strategies
- `API_QUICK_REFERENCE.md` - Backend API reference
- `ZUSTAND_COMPLETE.md` - State management guide

## Quick Wins for AI Agents

1. **Starting work?** Read `IMPLEMENTATION_SUMMARY.md` and `API_QUICK_REFERENCE.md` first
2. **Adding features?** Check `docs/features/` for existing patterns
3. **Debugging?** Look at `docs/fixes/` for known issues and solutions
4. **Testing?** Run `npm run test:fast` for quick feedback, `npm run test:ci` before committing
5. **Stuck?** Check scripts in `scripts/` for maintenance and debugging tools
