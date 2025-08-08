# Testing Guide

## Overview

Quantro uses Jest and React Testing Library for comprehensive testing. Our test suite includes unit tests, integration tests, and component tests.

## Setup

Tests are configured with:

- **Jest** - Testing framework
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers
- **@testing-library/user-event** - User interaction simulation

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

## Test Structure

### Component Tests

Located in `src/components/**/__tests__/`

Example: `Header.test.tsx`

- Tests component rendering
- Tests user interactions
- Tests props handling
- Mocks external dependencies

### Hook Tests

Located in `src/hooks/__tests__/`

Example: `useClipboard.test.tsx`

- Tests custom hook behavior
- Tests state management
- Tests side effects

### Utility Tests

Located in `src/utils/__tests__/`

Example: `dateUtils.test.ts`

- Tests pure functions
- Tests edge cases
- Tests input validation

## Testing Patterns

### Mocking Next.js Router

```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    // ... other router methods
  })
}))
```

### Mocking NextAuth

```typescript
jest.mock('next-auth/react', () => ({
  signOut: jest.fn().mockResolvedValue(undefined),
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated'
  }))
}))
```

### Testing User Interactions

```typescript
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()
await user.click(button)
```

### Testing Async Operations

```typescript
await act(async () => {
  await user.click(button)
})
```

## Coverage Goals

Current coverage thresholds:

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on user interactions and outcomes
   - Avoid testing internal component state

2. **Use Descriptive Test Names**

   ```typescript
   it('navigates to dashboard when logo is clicked', () => {
     // test implementation
   })
   ```

3. **Mock External Dependencies**
   - Always mock API calls
   - Mock third-party libraries
   - Mock Next.js specific features

4. **Test Edge Cases**
   - Empty states
   - Error conditions
   - Invalid inputs

5. **Keep Tests Independent**
   - Each test should be able to run in isolation
   - Use `beforeEach` for setup
   - Clean up after tests

## Adding New Tests

1. Create test file next to component: `Component.test.tsx`
2. Import testing utilities
3. Mock external dependencies
4. Write descriptive test cases
5. Ensure good coverage

## Continuous Integration

Tests run automatically on:

- Push to main/develop branches
- Pull requests
- Before deployment

See `.github/workflows/ci-cd.yml` for CI configuration.
