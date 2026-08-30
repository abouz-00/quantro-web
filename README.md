# Quantro

> Nutrition tracking built as a personal learning archive.

**Status: Archived** — Quantro is no longer an active startup. This repo is preserved as a public reference and learning project after closing the LLC.

---

## Screenshots

### Dashboard
![Quantro dashboard](./docs/screenshots/dashboard.png)

### Calendar
![Quantro calendar](./docs/screenshots/calendar.png)

### Nutrition Tracking
![Quantro macro and micronutrient breakdown](./docs/screenshots/nutrition-donuts.png)

## What It Does

Quantro is a full-stack nutrition tracking web app focused on nutrient quality, not just calories.

- Log meals by type: breakfast, lunch, dinner, snack
- Search foods through USDA FoodData Central and FatSecret
- Track macros and 17 micronutrients against daily goals
- Review progress on a dashboard with charts and summaries
- Support invite-only beta access, development sign-in, and optional OAuth

The app was built as a closed beta experience with invite management, admin access, and gated sign-in.

---

## Why I Built It

I built Quantro because mainstream nutrition apps often stop at calories and macros. I wanted a product that treated micronutrients as first-class data while still feeling fast and usable.

This repo captures the full product cycle: from food search and logging UX to auth, access controls, and production-ready deployment patterns.

---

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- React 19
- Tailwind CSS
- Zustand
- Prisma 7
- NextAuth.js v5
- USDA FoodData Central + FatSecret API
- Resend email
- Upstash Redis rate limiting
- Sentry + Vercel Analytics
- Jest + React Testing Library + Playwright

---

## Architecture

Quantro is a single repo full-stack app deployed as serverless on Vercel.

- `src/app/` contains App Router pages and layouts
- `src/app/api/*` contains backend API route handlers
- `src/lib/` contains shared client/server services, auth, and env handling
- `src/server/` contains Prisma-backed business logic
- `src/components/` contains domain UI and reusable primitives
- `prisma/` contains database schemas for dev, production, and tests

Key patterns:
- Centralized Zod-validated environment config
- Thin API routes with reusable auth/validation/error handling
- Unified food search service that normalizes across providers
- Edge middleware for route guards with Node-only auth provider setup
- Beta invite and admin gating built into sign-in flow

---

## Challenges Solved

- Invite-only beta access with allowlist and admin-managed invites
- Unified, resilient food search across two external APIs
- Secure auth split between edge middleware and Node.js runtime
- Rate limiting that works in serverless and local fallback mode
- A logging interface with inline editing, drag-and-drop, and optimistic updates

---

## What I Learned

- Monolith-first is powerful for an MVP when shared logic matters
- Centralizing env definitions makes optional integrations safer
- Edge and Node auth boundaries must be explicit for Vercel deployments
- Real nutrition data requires careful normalization and validation
- Beta launches need tooling around invites and onboarding, not just feature flags

---

## Current Status

**Archived.** This repository is a public learning archive after shutting down the startup. The project is preserved for reference, but it is not actively developed.

---

## Local Development

```bash
npm install
cp .env.example .env.local
# fill in NEXTAUTH_SECRET and any optional keys locally
npm run dev
```

> Never commit `.env.local` or secrets. Use `.env.example` only as a placeholder.

---

## License

Private project. All rights reserved.
