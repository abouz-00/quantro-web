import nextJest from 'next/jest.js'

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
    '**/**/__tests__/**/*.(ts|tsx|js)'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/src/app/api/__tests__/jest-setup.js'
  ],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  transformIgnorePatterns: [
    'node_modules/(?!(jose|openid-client|@panva/hkdf|preact-render-to-string|@babel/runtime|uuid|oauth|oidc-token-hash|@auth/prisma-adapter)/)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Test environment setup
  setupFiles: ['<rootDir>/jest.env.js'],
  // Performance optimizations
  maxWorkers: process.env.CI ? 2 : '50%',
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Optimized test timeout and memory settings
  testTimeout: process.env.CI ? 45000 : 30000, // 45s for CI, 30s locally
  maxConcurrency: 5, // Limit concurrent tests to prevent memory issues
  // Bail settings for faster feedback in CI
  bail: process.env.CI ? 1 : false, // Stop on first failure in CI
  verbose: false, // Reduce verbose output to speed up tests
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/styles/**',
    '!src/app/layout.tsx',
    '!src/app/globals.css',
  ],
  coverageThreshold: {
    global: {
      branches: 18,
      functions: 21,
      lines: 25,
      statements: 25,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig)
