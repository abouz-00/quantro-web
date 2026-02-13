# Quantro Web

**Track what fuels you.**

Quantro is a full-stack nutrition tracking application built with Next.js. Users log meals, track macros against daily goals, and build healthier eating habits.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **UI**: React 19, Tailwind CSS, shadcn/ui, Framer Motion
- **State**: Zustand with persist middleware
- **Auth**: NextAuth.js v5 (Google + Apple OAuth)
- **Database**: SQLite (dev), PostgreSQL via Supabase (prod)
- **ORM**: Prisma 7
- **Food APIs**: USDA FoodData Central + FatSecret (server-side)
- **Email**: Resend
- **Testing**: Jest 30 + React Testing Library
- **Deployment**: Vercel (serverless)

## Local Setup

### Prerequisites

- Node.js 20+
- npm

### Steps

```bash
git clone https://github.com/quantro-dev/quantro-web.git
cd quantro-web
npm install
```

Copy `.env` and fill in your secrets in `.env.local`:

```bash
cp .env .env.local
# Edit .env.local with your actual API keys and secrets
```

Required variables in `.env.local` (see `.env` for the full list):

- `NEXTAUTH_SECRET` -- generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `APPLE_ID` / `APPLE_TEAM_ID` / `APPLE_PRIVATE_KEY_ID` / `APPLE_PRIVATE_KEY`
- `USDA_API_KEY`
- `FATSECRET_CLIENT_ID` / `FATSECRET_CLIENT_SECRET`

Start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run dev:safe` | Safe start: cleans cache, kills port, regenerates Prisma |
| `npm run dev:clean` | Clean .next cache and restart |
| `npm run build` | Production build |
| `npm run test` | Run test suite (auto-sets up SQLite test DB) |
| `npm run test:fast` | Quick test run (single worker) |
| `npm run test:ci` | CI tests with coverage |
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript type check |

## Project Structure

```
src/
  app/           # Next.js App Router pages and API routes
    api/         # Server-side API routes (food search, food logs, auth, admin)
  components/    # UI components organized by domain
    food-log/    # Food logging (search, table, charts, drag-and-drop)
    ui/          # Shared primitives (shadcn/ui)
    log/         # Log page components
  hooks/         # Custom React hooks
  lib/           # Core utilities (auth, prisma, apiClient, services)
    services/    # Server-side API clients (USDA, FatSecret, unified search)
  services/      # Client-side service layer
  stores/        # Zustand state management
  types/         # TypeScript type definitions
  utils/         # Utility functions
prisma/
  schema.prisma              # Dev schema (SQLite)
  schema.production.prisma   # Prod schema (PostgreSQL)
  schema.test.prisma         # Test schema (SQLite)
scripts/         # Shell scripts for dev, testing, and maintenance
docs/            # Architecture, setup, and feature documentation
```

## Testing

Tests use a separate SQLite database (`test.db`) that is auto-created by the test setup script. Always run tests through npm scripts (never run `jest` directly):

```bash
npm run test          # Full suite
npm run test:fast     # Quick feedback
npm run test:coverage # With coverage report
```

## Deployment

The app deploys to Vercel on push to `main`. Production uses PostgreSQL on Supabase. Environment variables are configured in the Vercel dashboard.

## Documentation

See `docs/` for detailed guides:

- `docs/architecture/` -- System architecture and design patterns
- `docs/setup/` -- Environment, auth, database, and email setup
- `docs/testing/` -- Testing strategy and patterns
- `docs/deployment/` -- Build cache and deployment configuration
- `docs/features/` -- Zustand state management guides
