# Database Setup Guide

This guide explains how to set up and manage databases for the Quantro application.

## Quick Start

### For Testing (Fastest)
```bash
npm run test:db:setup
```
This creates a local SQLite database in `./test.db` - **takes ~40ms instead of 5+ hours!**

### For Local Development
```bash
./scripts/switch-db.sh local
```
This uses a local SQLite database in `./prisma/dev.db`

### For Production
```bash
./scripts/switch-db.sh production
```
This connects to your remote PostgreSQL database (Supabase)

## Database Environments

| Environment | Database Type | Location | Speed | Use Case |
|-------------|---------------|----------|-------|----------|
| **Test** | SQLite | `./test.db` | ⚡ Ultra Fast (~40ms) | Running tests |
| **Development** | SQLite | `./prisma/dev.db` | ⚡ Fast | Local development |
| **Production** | PostgreSQL | Supabase | 🐌 Slow (remote) | Live application |

## Available Commands

### Test Database
```bash
npm run test:db:setup     # Set up test database
npm run test:db:reset     # Reset test database
npm run test             # Run tests (auto-sets up DB)
```

### Database Switching
```bash
./scripts/switch-db.sh local       # Switch to local SQLite
./scripts/switch-db.sh test        # Switch to test SQLite  
./scripts/switch-db.sh production  # Switch to production PostgreSQL
```

### Manual Prisma Commands
```bash
# For main schema (current environment)
npx prisma generate
npx prisma db push

# For test schema specifically
npx prisma generate --schema=./prisma/schema.test.prisma
npx prisma db push --schema=./prisma/schema.test.prisma
```

## Environment Files

- `.env.local` - Main environment (uses `DATABASE_URL`)
- `.env.test` - Test environment (SQLite test database)

## Performance Issues Fixed

**Before:** `npx prisma generate` took 5+ hours connecting to remote PostgreSQL
**After:** `npx prisma generate` takes ~40ms with local SQLite

## Schema Files

- `prisma/schema.prisma` - Main schema (PostgreSQL for production, SQLite for local)
- `prisma/schema.test.prisma` - Test schema (SQLite only)

## Troubleshooting

### Prisma Taking Too Long?
1. Check your `DATABASE_URL` in `.env.local`
2. Use local SQLite: `./scripts/switch-db.sh local`
3. For tests: `npm run test:db:setup`

### Database Connection Issues?
1. Ensure you're using the right environment
2. Check if remote database is accessible
3. Switch to local: `./scripts/switch-db.sh local`

### Test Database Not Working?
1. Reset it: `npm run test:db:reset`
2. Check `jest.env.js` for correct environment variables
3. Ensure `DATABASE_URL=file:./test.db` in test environment
