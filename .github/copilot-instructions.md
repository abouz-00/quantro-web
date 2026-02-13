# Quantro Web - AI Coding Agent Instructions

## Project Overview

Quantro is a nutrition tracking web application using **Next.js 16 App Router** + **React 19** + **TypeScript**. This is a **full-stack monolith** -- all API routes, server-side logic, and the UI live in this single repository. Deployed to Vercel as a serverless application.

## Architecture

### Full-Stack Next.js (No Separate Backend)
- **Frontend + API**: Everything is in this repo -- UI pages and server-side API routes
- **API Routes**: `src/app/api/` handles all server-side logic (food search, food logs, auth, admin)
- **API Client**: `src/lib/apiClient.ts` calls `/api/*` routes with cookie-based auth
- **Food Search**: `src/lib/services/` contains USDA and FatSecret API clients, unified search merges results

### State Management (Zustand + NextAuth)
- **Global State**: `src/stores/userStore.ts` -- Zustand store with persist + devtools middleware
- **Auth Sync**: `src/hooks/useAuthSync.ts` -- Auto-syncs NextAuth session with Zustand store
- **Usage**: Import from `src/stores` or `src/hooks`, NOT directly from files
- **Key Hooks**: `useFoodData`, `useGoals`, `useUserStore` -- domain-specific state management

### Component Organization (Domain-Driven)
```
src/components/
  food-log/        # Food logging domain (core/, charts/, search/, table/, hooks/)
  ui/              # Shared UI primitives (shadcn/ui components)
  shared/          # Cross-domain components (SessionWrapper, ErrorBoundary)
  log/             # Page-specific components
  [auth|admin|landing|dashboard]/  # Feature-specific components
```

Components co-locate with domain logic. `food-log/` contains business logic, `ui/` contains presentational components.

## Development Commands

```bash
npm run dev              # Standard dev server on port 3000
npm run dev:safe         # Safe start: cleans cache, kills port, regenerates Prisma
npm run dev:clean        # Clean .next cache and restart
npm run build            # Production build
npm run test             # Full test suite (auto-sets up test DB)
npm run test:fast        # Quick test run (maxWorkers=1, forceExit)
npm run test:ci          # CI tests with coverage
```

Use `dev:safe` if you encounter cache or port issues.

## Testing

- **Test DB Setup**: All test commands auto-run `./scripts/setup-test-db.sh` which uses SQLite (`test.db`) and auto-restores `.env` on exit
- **Mocking**: `__mocks__/@prisma/client.js` -- Prisma is mocked globally
- **Config**: `jest.config.js` -- Pre-configured with transformIgnorePatterns for Next.js
- **Pattern**: Tests live in `__tests__/` folders next to source files
- **Never** run `jest` directly -- always use `npm run test` which handles environment switching

## Database

- **Development**: SQLite (`prisma/dev.db`) via `DATABASE_URL=file:./prisma/dev.db`
- **Testing**: SQLite (`test.db`) via test scripts
- **Production**: PostgreSQL on Supabase (Vercel deployment)
- **Prisma Config**: `prisma.config.ts` provides the datasource URL (required by Prisma 7.x)
- **Schema Files**:
  - `prisma/schema.prisma` -- Dev schema (SQLite)
  - `prisma/schema.production.prisma` -- Prod schema (PostgreSQL)
  - `prisma/schema.test.prisma` -- Test schema (SQLite)
- **Key Models**: `User`, `FoodLog`, `Account`, `Session`, `BetaInvite`

## Project Patterns

### Service Layer
API calls go through service classes in `src/services/`. Never call `fetch()` directly -- use `apiClient` from `src/lib/apiClient.ts` which handles cookie-based auth, error handling, and credentials.

### Data Transformation
- API format uses specific structure from server
- UI format uses camelCase `FoodEntry` interface
- Transformers in `src/utils/foodEntryUtils.ts`
- Transform at service layer boundaries, not in components

### Authentication Flow
1. **NextAuth.js**: OAuth (Google/Apple) via `src/lib/auth.ts`
2. **Middleware**: `middleware.ts` protects `/dashboard`, `/log`, `/api/user`, `/api/food-logs`, `/api/food-search-unified`
3. **Session Sync**: `SessionWrapper` component auto-syncs session to Zustand store
4. **Access**: Use `useUserStore()` client-side, `auth()` server-side

### Food Search (Server-Side)
- **Unified endpoint**: `/api/food-search-unified` merges USDA + FatSecret results
- **USDA client**: `src/lib/services/usda.ts` -- API key auth, nutrient ID mapping, 1hr cache
- **FatSecret client**: `src/lib/services/fatsecret.ts` -- OAuth 2.0 Client Credentials, token caching
- **Merge logic**: `src/lib/services/unified-food-search.ts` -- parallel fetch, relevance sorting

### TypeScript Conventions
- **Types**: `src/types/` for domain types (e.g., `food.ts` for `FoodEntry`)
- **Interfaces**: Co-locate with components for local types
- **Enums**: Use string literal unions: `type MealType = "breakfast" | "lunch" | "dinner" | "snack"`
- **Config**: `tsconfig.json` -- Strict mode, path alias `@/` maps to `src/`

## Common Gotchas

### Build Cache Issues
```bash
npm run clean        # Cleans .next cache
npm run clean:all    # Nuclear option: cleans everything + reinstalls
```

### Port 3000 Conflicts
```bash
npm run dev:check    # Check port status
npm run dev:safe     # Auto-kills port + starts clean
```

### Test Database Issues
- Never run tests against development database
- `npm run test:db:reset` recreates test database from scratch
- Check `.env.test` has `DATABASE_URL="file:./test.db"`

### Prisma Client Issues
After schema changes:
```bash
npx prisma generate  # Regenerate client
npm run postinstall  # Runs prisma generate automatically
```

## External Integrations

### Food Search APIs
- **USDA FoodData Central**: Server-side via `src/lib/services/usda.ts`, uses `USDA_API_KEY`
- **FatSecret Platform**: Server-side via `src/lib/services/fatsecret.ts`, OAuth 2.0, uses `FATSECRET_CLIENT_ID` / `FATSECRET_CLIENT_SECRET`

### Auth Providers
- **Google OAuth**: Configured in `src/lib/auth.ts`
- **Apple Sign In**: Uses private key from env vars (not files)
- **Adapter**: `@auth/prisma-adapter` stores sessions in database

## Key Files

- `src/lib/apiClient.ts` -- API communication layer
- `src/lib/auth.ts` -- NextAuth configuration
- `src/lib/services/unified-food-search.ts` -- Food search orchestration
- `src/stores/userStore.ts` -- Global auth state (Zustand)
- `src/hooks/useFoodData.ts` -- Food data management hook
- `src/services/foodLogService.ts` -- Food logging service
- `src/utils/foodEntryUtils.ts` -- Data transformers
- `middleware.ts` -- Route protection
- `prisma.config.ts` -- Prisma 7.x datasource config
- `next.config.ts` -- Next.js config
- `jest.config.js` -- Test configuration
