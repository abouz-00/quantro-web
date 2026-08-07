# Quantro

> Smart nutrition tracking, reimagined.

**Status: Archived** — This project ran as a closed beta at [quantro.fit](https://quantro.fit). The codebase is preserved for reference; it is not actively developed or accepting new users.

---

## What It Does

Quantro is a full-stack nutrition tracking web app. Users log meals by type (breakfast, lunch, dinner, snack), search foods from USDA and FatSecret, track macros and 17 micronutrients against daily goals, and review progress on a dashboard with Chart.js visualizations.

Access was invite-only: beta invites managed through an admin panel, with Google, Apple, and magic-link sign-in gated behind an allowlist.

---

## Why I Built It

Most nutrition apps optimize for calorie counting and stop at macros. I wanted something that treated micronutrients as first-class data, felt fast to log meals in, and gave honest analytics without the clutter of legacy fitness trackers.

Quantro was my attempt to build that product end-to-end: a polished logging UX (inline editing, drag-and-drop reordering, unified food search), a real auth and beta-launch pipeline, and production infrastructure on day one—not a weekend prototype.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| UI | React 19, Tailwind CSS, DaisyUI, Framer Motion, Radix UI |
| State | Zustand (persisted client state) |
| Auth | NextAuth.js v5 (JWT sessions, Google / Apple / Resend) |
| Database | Prisma 7 — SQLite (dev), PostgreSQL (prod via Supabase) |
| Validation | Zod |
| Food data | USDA FoodData Central + FatSecret Platform API |
| Email | Resend |
| Rate limiting | Upstash Redis (in-memory fallback in dev) |
| Monitoring | Sentry, Vercel Analytics |
| Testing | Jest, React Testing Library, Playwright |
| Deployment | Vercel (serverless) |

---

## Architecture

Quantro is a **Next.js full-stack monolith**: pages, API routes, and server logic live in one repo, deployed as serverless functions on Vercel.

```
Browser
  │
  ├── middleware (edge) ── JWT validation · rate limiting · route guards
  │
  ├── App Router pages
  │     ├── /                 landing + sign-in
  │     ├── /log              food logging (client-heavy, no SSR)
  │     └── /dashboard        analytics + onboarding
  │
  └── API routes (/api/*)
        │
        ├── createHandler()   auth · rate limit · Zod validation · errors
        │
        ├── src/server/       business logic (foodLogs, userProfile)
        │
        └── Prisma ── SQLite (dev) / PostgreSQL (prod)
```

**Key design choices:**

- **`createHandler()`** — Every API route composes a shared wrapper for auth, rate limiting, validation, and consistent error responses instead of duplicating boilerplate.
- **Server service layer** (`src/server/`) — Prisma queries and domain logic live in plain functions; route handlers stay thin.
- **Centralized env** (`src/lib/env.ts`) — All environment variables declared once in a Zod schema with production startup checks.
- **Edge vs Node auth split** — Middleware reads JWTs on the edge; the full NextAuth config (Prisma, Apple JWT generation) runs in Node.js route handlers only.
- **Unified food search** — USDA and FatSecret results merged, deduplicated, and ranked in a single server-side service.

See `docs/architecture/` for deeper write-ups.

---

## Challenges I Solved

**Invite-only beta without friction.** Built a `BetaInvite` model, admin UI, and email onboarding flow so access could be granted/revoked without redeploying. Beta checks run at sign-in via allowlist + database invites.

**Food search across two APIs.** USDA and FatSecret return different shapes and coverage. Wrote a unified search service that normalizes nutrients, handles partial failures gracefully, and keeps API keys server-side.

**Auth on Vercel's edge + Node split.** NextAuth v5 and Prisma don't run on the edge. Split auth config into edge-safe JWT validation (middleware) and Node-only providers (Apple client-secret JWT generation, database session stamping).

**Rate limiting across serverless instances.** In-memory limits don't work when functions scale horizontally. Integrated Upstash Redis with an in-memory fallback for local dev.

**A logging UI that feels like a spreadsheet.** Inline cell editing, meal sections, drag-and-drop reorder with optimistic updates, and a search modal with custom-food creation—without sacrificing type safety or test coverage.

**Production observability from the start.** Structured logging, Sentry integration, client error reporting endpoint, and CSP/security headers configured in `next.config.ts` and `vercel.json`.

---

## What I Learned

- **Monolith-first was the right call for an MVP.** One deploy surface, shared types between client and server, and no premature microservice overhead.
- **Environment configuration is a feature.** Centralizing env vars in Zod caught misconfiguration early and made optional integrations (OAuth providers, email, food APIs) degrade cleanly.
- **Edge middleware has sharp boundaries.** Anything touching the database or crypto (Apple Sign-In) must stay in Node route handlers; planning that split upfront avoids painful refactors.
- **Nutrition data is messy.** Normalizing micronutrients across USDA portions, user-entered custom foods, and third-party APIs required careful schema design and defensive parsing.
- **Beta launches need tooling, not just a flag.** Admin invite management and transactional email onboarding saved time compared to manual database edits.

---

## Current Status

**Archived.** The closed beta has concluded. The app may remain deployed at quantro.fit for existing users, but this repository is not under active development. Pull requests and issues are not monitored.

For historical setup, deployment, and testing docs, see the `docs/` directory.

---

## Local Development (Reference)

```bash
npm install
cp .env.example .env.local   # fill in NEXTAUTH_SECRET, DEV_SIGNIN_PASSWORD, etc.
npm run dev                  # http://localhost:3000
```

| Command | Description |
|---------|-------------|
| `npm run build` | Production build |
| `npm test` | Jest unit/integration tests |
| `npm run test:e2e` | Playwright smoke tests |
| `npm run lint` | ESLint |

**Never commit secrets.** Use `.env.local` for credentials. See `.env.example` for the full variable list.

---

## License

Private project. All rights reserved.
