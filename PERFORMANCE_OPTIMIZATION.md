# Performance optimization for dev server startup

## Issues identified:
1. Heavy component imports with many dependencies
2. Large single file (LogPage.tsx - 1225 lines)
3. Multiple react-icons imports across components
4. No dev-specific optimizations

## Solutions implemented:

### 1. Next.js Configuration Optimizations
- Added `optimizePackageImports` for common libraries
- Enhanced webpack configuration for development
- Added dev-specific settings to skip unnecessary optimizations

### 2. Enhanced Restart Script
- `restart-dev.sh` now kills existing processes properly
- Cleans build cache and regenerates Prisma client
- Added `npm run dev:clean` command for easy access

### 3. Recommendations for further optimization:

#### A. Code Splitting
Consider splitting LogPage.tsx into smaller components:
```tsx
// Split into separate files
const FoodControls = dynamic(() => import('./FoodControls'))
const FoodStats = dynamic(() => import('./FoodStats'))
const FoodTable = dynamic(() => import('./FoodTable'))
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
npm install --save-dev @next/bundle-analyzer
```

## Quick fixes to try:
1. Use `npm run dev:clean` instead of `npm run dev`
2. Close unused VS Code tabs/extensions
3. Restart VS Code if TypeScript server is slow
4. Check Activity Monitor for other resource-heavy processes
