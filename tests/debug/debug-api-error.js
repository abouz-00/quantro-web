// Debug script to test API response error logging
console.log('=== API Response Error Debug Test ===');

// Test 1: Basic object logging
const testObject = {
  status: 401,
  statusText: 'Unauthorized',
  body: '{"error": "Unauthorized"}',
  operation: 'test'
};

console.log('Test 1 - Basic object logging:');
console.error('Test error:', testObject);

// Test 2: Object with undefined values
const testObjectWithUndefined = {
  status: 401,
  statusText: undefined,
  body: '{"error": "Unauthorized"}',
  operation: 'test'
};

console.log('Test 2 - Object with undefined values:');
console.error('Test error with undefined:', testObjectWithUndefined);

// Test 3: Empty object
console.log('Test 3 - Empty object:');
console.error('Empty object error:', {});

// Test 4: Object construction with potential issues
const status = 401;
const statusText = 'Unauthorized';
const body = '{"error": "Unauthorized"}';

const constructedObject = {
  status: status || 'Unknown',
  statusText: statusText || 'Unknown',
  body: body,
  operation: 'constructed'
};

console.log('Test 4 - Constructed object:');
console.error('Constructed error:', constructedObject);

console.log('=== Debug Test Complete ===');
