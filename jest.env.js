// Jest environment setup
// This file sets up environment variables for testing

process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'file:./test.db'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only'
process.env.NEXT_TELEMETRY_DISABLED = '1'

// Mock API keys
process.env.NEXT_PUBLIC_USDA_API_KEY = 'test-api-key'
process.env.RESEND_API_KEY = 'test-resend-key'
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'
process.env.APPLE_ID = 'test-apple-id'
process.env.APPLE_TEAM_ID = 'test-team-id'
process.env.APPLE_PRIVATE_KEY_ID = 'test-key-id'
process.env.APPLE_PRIVATE_KEY = 'test-private-key'
