# Database Environment Persistence Fix

## Problem

Food log entries were not persisting because the application was using the wrong database file.

### Root Cause

The `.env` file was pointing to `test.db` instead of `prisma/dev.db`. This happens when:
1. Test scripts run (`npm run test`, `npm run test:fast`, etc.)
2. The test scripts switch `.env` to point to `test.db` 
3. If the dev server is restarted or Prisma is regenerated, it picks up the test database

## Symptoms

- Food entries appear to save successfully in the UI
- No errors in the console
- Data doesn't persist after page refresh
- `sqlite3 prisma/dev.db "SELECT COUNT(*) FROM FoodLog;"` shows 0 entries
- `cat .env | grep DATABASE_URL` shows `"file:./test.db"`

## Solution

### Immediate Fix

```bash
# 1. Restore the correct environment
cp .env.local .env

# 2. Regenerate Prisma client
npx prisma generate

# 3. Restart the dev server
npm run dev:safe
```

### Verification

```bash
# Check DATABASE_URL is correct
cat .env | grep DATABASE_URL
# Should show: DATABASE_URL="file:./prisma/dev.db"

# Verify dev server is using the right database
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM User;"
# Should show your user count (e.g., 1)
```

## Prevention

### Test Script Improvements

The test setup script (`scripts/setup-test-db.sh`) already has cleanup logic that restores `.env` on exit, but this can fail if:
- The script is interrupted (Ctrl+C)
- The terminal crashes
- The cleanup trap doesn't execute

### Improved Workflow

Always use these commands instead of manually running tests:

```bash
# ✅ CORRECT - Uses scripts with cleanup
npm run test           # Handles .env automatically
npm run test:fast      # Handles .env automatically
npm run test:ci        # Handles .env automatically

# ❌ AVOID - Can leave .env in wrong state
jest                   # Direct jest command
npx jest              # Direct jest command
```

### Manual Test Run Recovery

If you manually run tests and forget to restore `.env`:

```bash
# Quick recovery script
./scripts/restore-dev-env.sh

# Or manually:
cp .env.local .env && npx prisma generate && npm run dev:safe
```

## Architecture Note

This issue highlights the separation between:
- **Development Database**: `prisma/dev.db` - Used by dev server and UI
- **Test Database**: `test.db` - Used only during automated tests
- **Production Database**: PostgreSQL on Vercel

The test database is intentionally separate to:
1. Prevent test data pollution
2. Allow parallel test execution
3. Enable fast test database resets

## Related Files

- `.env` - Current environment (switches between dev/test)
- `.env.local` - Always points to dev database
- `.env.test` - Always points to test database
- `scripts/setup-test-db.sh` - Switches to test environment
- `scripts/safe-dev-start.sh` - Should restore dev environment

## Future Improvements

Consider:
1. Add a pre-dev check that validates `DATABASE_URL` in `.env`
2. Create a `scripts/restore-dev-env.sh` recovery script
3. Add a warning in dev server if test database is detected
4. Use environment variable inheritance instead of swapping `.env`

## Date

October 9, 2025
