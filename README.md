# Quantro

> **Smart nutrition tracking, reimagined.**

Quantro is a closed-beta nutrition tracking web app. Users log meals, track macros and micronutrients against daily goals, and build healthier eating habits. Access is invite-only; the admin panel manages beta invites and sends onboarding emails.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Authentication](#authentication)
- [Database](#database)
- [Testing](#testing)
- [Scripts](#scripts)
- [Deployment](#deployment)

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript 6 (strict) |
| Runtime | React 19 |
| Database (dev) | SQLite via `better-sqlite3` |
| Database (prod) | PostgreSQL via `pg` |
| ORM | Prisma 7 |
| Auth | NextAuth.js v5 beta (JWT sessions) |
| Validation | Zod 4 |
| Client state | Zustand 5 |
| Styling | Tailwind CSS 3, DaisyUI 5, Framer Motion |
| Component primitives | Radix UI, Headless UI |
| Charts | Chart.js 4 + react-chartjs-2 |
| Drag and drop | @dnd-kit |
| Email | Resend |
| Rate limiting | Upstash Redis (in-memory fallback in dev) |
| Monitoring | Sentry, Vercel Analytics |
| Testing | Jest 30, React Testing Library, Playwright |
| Deployment | Vercel |

---

## Architecture Overview

```
Browser
  │
  ├── Next.js middleware (edge) ─── JWT validation · rate limiting · route guards
  │
  ├── App Router pages
  │     ├── / (landing)
  │     ├── (app)/dashboard   ← server-rendered shell, client components
  │     └── (app)/log         ← primary food logging UI (dynamic import, no SSR)
  │
  └── API routes  ──────────────────────────────────────────────────────────────
        │                                                                       │
        │  createHandler()              ┌─ src/server/foodLogs.ts               │
        │  (auth · rate limit ·         ├─ src/server/userProfile.ts            │
        │   validation · errors)        └─ src/lib/betaAccess.ts                │
        │                                                                       │
        └── Prisma ─── SQLite (dev) / PostgreSQL (prod)
```

### Key design decisions

**`createHandler()` wrapper** (`src/lib/api/handler.ts`) — every API route composes this instead of copy-pasting auth checks, try/catch, and 401 boilerplate. It handles: rate limiting by IP, session/admin auth, Zod body validation, `ApiError` → JSON, uncaught errors → 500 + structured log.

**Server service layer** (`src/server/`) — business logic and Prisma queries live in plain functions, not inside HTTP handlers. Routes are thin adapters; services are testable without HTTP.

**Centralized env config** (`src/lib/env.ts`) — every env var is declared once in a Zod schema (`serverEnv` / `clientEnv`). `checkProductionEnv()` warns at startup about missing critical config.

**Structured logger** (`src/lib/logger.ts`) — uniform `{ level, message, context?, error?, timestamp }` shape from all server code; JSON in production, pretty object in dev.

**Auth split (edge vs Node)** — `src/lib/auth.config.ts` runs in the edge middleware (no Prisma). `src/lib/auth.ts` runs in the Node.js runtime and handles PrismaAdapter, all providers, and JWT enrichment.

---

## Project Structure

```
quantro-web/
├── prisma/
│   ├── schema.prisma               # Dev schema (SQLite)
│   ├── schema.production.prisma    # Prod schema (PostgreSQL)
│   └── schema.test.prisma          # Test schema (SQLite)
├── src/
│   ├── app/
│   │   ├── (app)/                  # Authenticated route group
│   │   │   ├── dashboard/          # Analytics overview
│   │   │   └── log/                # Food logging UI
│   │   ├── admin/beta-invites/     # Admin invite management
│   │   ├── api/                    # API routes (see below)
│   │   ├── auth/                   # error + not-invited pages
│   │   ├── beta-invite/            # Public invite acceptance flow
│   │   └── [legal/unsubscribe/debug pages]
│   ├── components/
│   │   ├── food-log/               # Search, table, charts, drag-and-drop
│   │   ├── log/                    # Log page shell components
│   │   ├── landing/                # Landing page sections and sign-in buttons
│   │   ├── dashboard/              # Dashboard components
│   │   ├── admin/                  # Admin UI
│   │   ├── shared/                 # ErrorBoundary, SessionWrapper, etc.
│   │   └── ui/                     # Radix-based primitives
│   ├── constants/                  # UI constants (colors, animations)
│   ├── hooks/                      # Custom React hooks
│   ├── lib/
│   │   ├── api/                    # createHandler(), ApiError
│   │   ├── schemas/                # Zod request schemas
│   │   ├── services/               # Server-side: USDA, FatSecret, unified search
│   │   ├── emails/                 # Magic link email
│   │   ├── auth.ts                 # Full NextAuth config (Node only)
│   │   ├── auth.config.ts          # Edge-compatible auth config
│   │   ├── betaAccess.ts           # Beta invite CRUD + access check
│   │   ├── email.ts                # Beta invite email sender
│   │   ├── env.ts                  # Centralized env var schema
│   │   ├── logger.ts               # Structured server logger
│   │   ├── prisma.ts               # Prisma singleton
│   │   ├── rateLimit.ts            # Upstash Redis + in-memory rate limiter
│   │   └── validation.ts           # parseOrError() helper
│   ├── server/
│   │   ├── foodLogs.ts             # Food log business logic + Prisma queries
│   │   └── userProfile.ts          # User profile business logic + Prisma queries
│   ├── services/                   # Client-side API wrappers
│   │   ├── foodLogService.ts       # HTTP client → /api/food-logs
│   │   └── errorService.ts         # Batched client error reporting
│   ├── stores/
│   │   └── userStore.ts            # Zustand user state (persisted)
│   ├── types/                      # Shared TypeScript types
│   └── utils/                      # Pure utilities (dates, nutrients, food entries)
├── e2e/                            # Playwright smoke tests
├── scripts/                        # Dev/build/test shell scripts
├── docs/                           # Architecture, setup, feature docs
├── middleware.ts                   # Edge auth guard + rate limiting
├── instrumentation.ts              # Sentry init + production env check
└── vercel.json                     # Deployment config + security headers
```

---

## Local Setup

**Prerequisites:** Node.js 20+, npm.

```bash
git clone https://github.com/quantro-dev/quantro-web.git
cd quantro-web
npm install
```

Copy the env template and fill in your secrets:

```bash
cp .env .env.local
# Edit .env.local with your API keys
```

The minimum needed to run the dev server is `NEXTAUTH_SECRET`. Everything else degrades gracefully — providers without credentials are omitted, food search errors if API keys are missing, emails log to console instead of sending.

```bash
npm run dev
# App at http://localhost:3000
```

The dev server defaults to SQLite (`./prisma/dev.db`), which is created automatically. No database setup required.

---

## Environment Variables

All variables are declared in `src/lib/env.ts`. The app starts without any of them but warns in production about missing critical config.

### Database

| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | Primary DB connection string |
| `POSTGRES_PRISMA_URL` | Alternative (Vercel/Prisma pooled URL) |
| `ALLOW_POSTGRES_IN_DEV` | Set to `"true"` to use Postgres locally |

### Auth

| Variable | Notes |
|----------|-------|
| `NEXTAUTH_SECRET` | Session encryption — **required in production** · generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL for callbacks and email links |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `APPLE_ID` | Apple Services ID |
| `APPLE_TEAM_ID` | Apple Team ID |
| `APPLE_PRIVATE_KEY` | Apple ES256 private key (raw base64 or PEM; Vercel stores as `\n`-escaped) |
| `APPLE_PRIVATE_KEY_ID` | Apple key ID |
| `DEV_SIGNIN_PASSWORD` | Credentials provider password (dev only, default `quantro-dev-2024`) |

### Email

| Variable | Notes |
|----------|-------|
| `RESEND_API_KEY` | Required for magic links and beta invite emails |

### Rate limiting

| Variable | Notes |
|----------|-------|
| `UPSTASH_REDIS_REST_URL` | **Recommended in production** — cross-instance limits |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash auth token |

### External food APIs

| Variable | Notes |
|----------|-------|
| `USDA_API_KEY` | [USDA FoodData Central](https://fdc.nal.usda.gov/api-guide.html) API key |
| `FATSECRET_CLIENT_ID` | FatSecret platform client ID |
| `FATSECRET_CLIENT_SECRET` | FatSecret platform client secret |

### Observability

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (client + server) |
| `ERROR_WEBHOOKS` | Comma-separated webhook URLs for client error reports |

> **Note:** Without Upstash configured in production, rate limiting falls back to per-process in-memory state, which does not work across multiple serverless instances.

---

## API Routes

All routes use `createHandler()` from `src/lib/api/handler.ts` unless noted.

| Route | Methods | Auth | Rate limit |
|-------|---------|------|-----------|
| `/api/auth/[...nextauth]` | GET, POST | — | Middleware (20/60s) |
| `/api/auth/check-email` | POST | None | 5/15min |
| `/api/auth/dev-signin` | POST, OPTIONS | None | — (dev only) |
| `/api/food-logs` | GET, POST, PUT, DELETE | Session | 60–120/60s |
| `/api/food-logs/reorder` | POST | Session | 60/60s |
| `/api/food-search-unified` | GET | Session | 30/60s |
| `/api/user/profile` | GET, PUT | Session | 30–60/60s |
| `/api/beta-invite` | GET, POST | None | 20/60s |
| `/api/mark-invite-used` | POST | Session | 10/60s |
| `/api/admin/beta-invites` | GET, POST, PATCH | Admin | 30/60s |
| `/api/unsubscribe` | POST | None | 10/60s |
| `/api/analytics` | POST | None | 60/60s |
| `/api/errors/log` | POST | Optional | 30/60s |

### `createHandler()` options

```ts
createHandler(
  {
    auth: 'none' | 'optional' | 'session' | 'admin',
    rateLimit: { name, max, windowSeconds },
    schema: ZodSchema,         // validates + types request body
    routeLabel: string,        // used in error logs
    defaultErrorMessage: string,
  },
  async (request, { session, body, params }) => NextResponse
)
```

Throw `new ApiError(status, message, details?)` for expected failures (400, 403, 404). Uncaught errors are logged and return a generic 500.

---

## Authentication

### Sign-in providers

| Provider | Requirement |
|----------|------------|
| Google OAuth | `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` |
| Apple Sign-In | Apple env vars + non-placeholder `APPLE_ID` |
| Resend magic link | `RESEND_API_KEY` |
| Dev credentials | `NODE_ENV=development` only |

Providers without credentials are omitted at startup — no config required for a minimal dev session.

### Beta access gate

Every sign-in attempt passes through `checkBetaAccess(email)` in `src/lib/betaAccess.ts`:

1. Email is in the hardcoded `BETA_EMAILS` allowlist in that file, **or**
2. An active `BetaInvite` row exists (not used, not revoked, not expired)

Blocked users are redirected to `/auth/not-invited`.

### JWT strategy

Sessions use JWTs (30-day expiry). At sign-in, the Node.js `jwt` callback stamps `token.uid` (user ID) and `token.isAdmin` by querying the database. Middleware runs on the edge using only the edge-compatible config — it reads the JWT without Prisma.

Admin routes re-check `isAdmin` in the database on every request. The JWT-cached flag is used only by middleware as a first-pass guard.

### Route protection (middleware)

| Route pattern | Unauthenticated | Non-admin |
|---------------|----------------|-----------|
| `/dashboard/*`, `/log/*` | Redirect to `/` | — |
| `/admin/*` | Redirect to `/` | Redirect to `/` |
| `/api/user/*`, `/api/food-logs/*`, `/api/food-search-unified/*` | 401 | — |
| `/api/admin/*` | 401 | 403 |
| `/api/auth/*` | Rate limited (20/60s) | — |

---

## Database

### Models

| Model | Purpose |
|-------|---------|
| `User` | App users — goals, units, onboarding timestamps, `isAdmin`, `emailUnsubscribed` |
| `FoodLog` | Individual food entries — macros, 17 micronutrient fields, `mealType`, `orderIndex` |
| `BetaInvite` | Invite codes — email, code, used/revoked flags, expiry |
| `Account` | OAuth account links (NextAuth adapter) |
| `Session` | NextAuth sessions |
| `VerificationToken` | Magic link tokens |

### Dev vs production

| Environment | Database | Schema file |
|-------------|---------|-------------|
| Local dev | SQLite (`./prisma/dev.db`, auto-created) | `prisma/schema.prisma` |
| Production | PostgreSQL | `prisma/schema.production.prisma` |

`npm run prisma:generate` detects the database type from `DATABASE_URL`/`POSTGRES_PRISMA_URL` and picks the correct schema automatically.

The Prisma client is a singleton in non-production environments (`globalThis.prisma`) to prevent exhausting connections during hot reloads.

---

## Testing

Tests use a separate SQLite database (`test.db`) auto-created by the setup script. Always run tests via npm scripts — not `jest` directly.

```bash
npm run test           # Full suite (sets up test DB first)
npm run test:fast      # Single worker, no coverage
npm run test:coverage  # With coverage report
npm run test:ci        # CI mode: 2 workers, coverage, force exit
npm run test:e2e       # Playwright end-to-end tests
```

### Unit / integration tests

API routes are tested by directly importing and calling the handler functions with mock `NextRequest` objects. Dependencies (`auth`, `prisma`) are mocked via Jest. Test files live in `src/app/api/__tests__/`.

### Coverage thresholds

| Metric | Threshold |
|--------|-----------|
| Branches | 55% |
| Functions | 55% |
| Lines | 60% |
| Statements | 60% |

### E2E tests

Playwright (`e2e/smoke.spec.ts`) runs against a local dev server on port 3000. Covers: landing page render, sign-in CTA, auth redirects, API 401 responses. Targets Desktop Chrome and Pixel 5.

---

## Scripts

| Script | What it does |
|--------|-------------|
| `npm run dev` | Dev server on port 3000 |
| `npm run dev:clean` | Clean `.next` cache + restart |
| `npm run dev:safe` | Port check + clean start via script |
| `npm run build` | Prisma generate + `next build` |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run type-check` | `tsc --noEmit` |
| `npm run format` | Prettier on `src/**` |
| `npm run test` | Full test suite |
| `npm run test:coverage` | Tests + coverage report |
| `npm run test:ci` | CI test run |
| `npm run test:e2e` | Playwright |
| `npm run test:db:setup` | Create/migrate test SQLite DB |
| `npm run test:db:reset` | Delete and recreate test DB |
| `npm run prisma:generate` | Generate Prisma client (schema auto-detected) |
| `npm run clean` | Remove `.next` build cache |
| `npm run deps:audit` | `npm audit` |
| `npm run deps:update` | `npm update` + audit fix |

---

## Deployment

The app deploys to Vercel. Configuration lives in `vercel.json`:

- Region: `iad1`
- API `maxDuration`: 30s
- Security headers: CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`

`next.config.ts` sets `output: 'standalone'`, enabling containerized deployment if needed.

### Production checklist

- Set `NEXTAUTH_SECRET`, `DATABASE_URL`, `NEXTAUTH_URL`
- Configure Upstash Redis (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`) for cross-instance rate limiting
- Set `RESEND_API_KEY` for email
- Configure at least one auth provider (Google, Apple, or both)
- Set `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` for error tracking
- Set food API keys (`USDA_API_KEY`, `FATSECRET_CLIENT_ID`/`FATSECRET_CLIENT_SECRET`) for food search

---

## Further reading

See `docs/` for in-depth guides:

- `docs/architecture/` — system design and patterns
- `docs/setup/` — environment, auth, database, and email setup
- `docs/testing/` — testing strategy and patterns
- `docs/deployment/` — build cache and deployment configuration
- `docs/features/` — Zustand state management
