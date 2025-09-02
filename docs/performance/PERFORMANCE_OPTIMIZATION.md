# Performance Optimization for Dev Server Startup

## Issues Identified

1. Heavy component imports with many dependencies
2. Large single file (LogPage.tsx - 1225 lines)
3. Multiple react-icons imports across components
4. No dev-specific optimizations

## Solutions Implemented

### 1. Next.js Configuration Optimizations

- Added `optimizePackageImports` for common libraries
- Enhanced webpack configuration for development
- Added dev-specific settings to skip unnecessary optimizations

### 2. Enhanced Restart Script

- `restart-dev.sh` now kills existing processes properly
- Cleans build cache and regenerates Prisma client
- Added `npm run dev:clean` command for easy access

### 3. Recommendations for Further Optimization

#### A. Code Splitting

Consider splitting LogPage.tsx into smaller components:

```tsx
// Split into separate files
const FoodControls = dynamic(() => import('./components/food-log/controls/FoodControls'))
const FoodStats = dynamic(() => import('./components/food-log/stats/FoodStats'))
const FoodTable = dynamic(() => import('./components/food-log/table/FoodTable'))
```

#### B. Icon Import Optimization

Instead of importing individual icons, create a centralized icon file:

```tsx
// src/components/icons/index.ts
export { 
  FaPencilAlt as EditIcon,
  FaCheck as CheckIcon,
  FaTimes as CloseIcon
} from 'react-icons/fa'
```

#### C. Bundle Analysis

To identify other slow imports, run:

```bash
# Install the analyzer
npm install --save-dev @next/bundle-analyzer

# Update next.config.ts to include analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // your existing config
})

# Then run the analyzer
ANALYZE=true npm run build
```

#### D. Lazy Loading Components

Implement lazy loading for components that aren't needed on initial render:

```tsx
import dynamic from 'next/dynamic'

// Only load when needed
const Modal = dynamic(() => import('@/components/ui/Modal'), {
  loading: () => <p>Loading...</p>,
  ssr: false // If the component uses browser-specific APIs
})
```

## Quick Fixes to Try

1. Use `npm run dev:clean` instead of `npm run dev`
2. Close unused VS Code tabs/extensions
3. Restart VS Code if TypeScript server is slow
4. Check Activity Monitor for other resource-heavy processes
