# Build & Cache Management Scripts

This project includes several scripts to prevent and resolve build cache issues that can cause module loading errors.

## Scripts Available

### 🧹 Clean Build (`npm run clean`)
```bash
./scripts/clean-build.sh
```
- Kills processes on port 3000
- Removes `.next` directory
- Clears `node_modules/.cache`
- Removes TypeScript build info
- Clears Jest, ESLint, and Prettier caches

### 🚀 Safe Dev Start (`npm run dev:safe`)
```bash
./scripts/safe-dev-start.sh
```
- Runs clean build first
- Ensures port 3000 is available
- Reinstalls dependencies if needed
- Generates Prisma client
- Starts development server

### 🏗️ Safe Build (`npm run build:safe`)
```bash
./scripts/safe-build.sh
```
- Cleans previous build artifacts
- Verifies dependencies
- Generates Prisma client
- Runs production build

## Automatic Prevention

### Git Hooks
- **Post-checkout hook**: Automatically cleans build artifacts when switching branches

### Next.js Configuration
- Disabled webpack caching in development mode
- Enhanced file watching configuration
- Optimized chunk splitting

### VS Code Tasks
Available in Command Palette (`Cmd+Shift+P`):
- `Tasks: Run Task` → `Clean Build`
- `Tasks: Run Task` → `Safe Dev Start`
- `Tasks: Run Task` → `Safe Build`

## Usage Recommendations

### Daily Development
Use the safe dev start instead of regular dev:
```bash
npm run dev:safe
```

### When Experiencing Issues
1. First try cleaning: `npm run clean`
2. Then restart dev: `npm run dev`
3. For persistent issues, use: `npm run dev:safe`

### Before Important Builds
Always use the safe build:
```bash
npm run build:safe
```

## Common Issues Prevented

- ❌ `Cannot find module './[number].js'`
- ❌ `Module not found` errors
- ❌ Corrupted webpack chunks
- ❌ Stale TypeScript compilation
- ❌ Port conflicts
- ❌ Cache inconsistencies

## Files Cleaned Automatically

- `.next/` - Next.js build output
- `node_modules/.cache/` - Package manager caches
- `tsconfig.tsbuildinfo` - TypeScript incremental build info
- `.eslintcache` - ESLint cache files
- Various tool-specific cache directories
