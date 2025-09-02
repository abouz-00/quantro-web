const { NextRequest, NextResponse } = require('next/server');

// Mock Next.js API route
const originalRoute = require('../src/app/api/food-logs/route.ts');

// Simple test of error logging
async function testErrorLogging() {
  console.log('🧪 Testing improved error logging...');
  
  // Test with invalid request data to trigger error
  const mockRequest = {
    url: 'http://localhost:3000/api/food-logs?date=invalid-date',
    json: async () => ({
      invalidData: 'this should cause an error'
    })
  };

  try {
    // This should fail and show our improved error logging
    await originalRoute.GET(mockRequest);
  } catch (error) {
    console.log('✅ Error caught and should be logged with improved format');
  }
}

testErrorLogging().catch(console.error);
