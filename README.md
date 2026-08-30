# Quantro - Calorie Counter

<img src="./public/favicon.svg" alt="Quantro logo" width="120">

## Status: No longer actively developed
---
## Overview 

I began this project in my final quarter of college to learn modern full-stack development using AI coding tools. While building it, I gained experience with frontend development, backend APIs, databases, cloud deployment, business formation, branding, and product design. Through the process I also discovered that my interests lie more in product strategy and business than day-to-day software engineering.

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

Quantro uses a monolithic Next.js architecture deployed serverlessly on Vercel. The application combines frontend UI, API routes, authentication, database access, and third-party integrations in a single repository.

Key architectural decisions included:

- Unified food-search abstraction across multiple providers
- Centralized validation and environment configuration
- Separate server-side business logic and API layers
- Authentication and route protection across Edge and Node.js runtimes
- Serverless-compatible rate limiting

---

## Engineering Highlights

- Invite-only beta access with allowlist and admin-managed invitations
- Unified food search across two external APIs
- Authentication across Edge and Node.js runtimes
- Serverless-compatible rate limiting with local fallback
- Inline editing, drag-and-drop, and optimistic UI updates

---

## Project Timeline

- **Spring 2025** — Project conceived months before college graduation
- **2025** — Product development and technical experimentation
- **Summer 2025** — LLC formed and brand/trademark developed
- **2025–2026** — Invite-only beta development and testing
- **2026** — Development concluded and repository prepared for public release

---

## What I Learned

- Monolith-first is powerful for an MVP when shared logic matters
- Centralizing env definitions makes optional integrations safer
- Edge and Node auth boundaries must be explicit for Vercel deployments
- Real nutrition data requires careful normalization and validation
- Beta launches need tooling around invites and onboarding, not just feature flags

---

## Disclaimer

Quantro was developed as a software project and is not intended to provide medical or nutritional advice. Nutrition information is sourced from third-party databases and may contain inaccuracies.

---

## License

All rights reserved. This source code is publicly available for viewing and reference only. No permission is granted to copy, modify, distribute, or use the code without prior written permission.
