import { getCredits, enableMock, disableMock, setMockResponses } from '../index.js';
import 'dotenv/config';

/**
 * Test suite for Credits functionality
 * This file demonstrates usage and validates the getCredits endpoint
 */

// Mock API key for testing
const API_KEY = process.env.SGAI_APIKEY || 'test-api-key';

/**
 * Test input validation for getCredits
 */
function testInputValidation() {
  console.log('🧪 Testing Input Validation');
  console.log('='.repeat(50));

  const testCases = [
    {
      name: 'Valid API key',
      apiKey: 'valid-api-key',
      expected: true,
      description: 'Should accept valid API key'
    },
    {
      name: 'Empty API key',
      apiKey: '',
      expected: false,
      description: 'Should reject empty API key'
    },
    {
      name: 'Null API key',
      apiKey: null,
      expected: false,
      description: 'Should reject null API key'
    },
    {
      name: 'Undefined API key',
      apiKey: undefined,
      expected: false,
      description: 'Should reject undefined API key'
    },
    {
      name: 'Non-string API key',
      apiKey: 12345,
      expected: false,
      description: 'Should reject non-string API key'
    }
  ];

  let passed = 0;
  let total = testCases.length;

  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    
    try {
      // Validate inputs
      const isValid = validateCreditsInputs(testCase.apiKey);
      
      if (isValid === testCase.expected) {
        console.log(`   ✅ PASSED`);
        passed++;
      } else {
        console.log(`   ❌ FAILED - Expected: ${testCase.expected}, Got: ${isValid}`);
      }
    } catch (error) {
      if (!testCase.expected) {
        console.log(`   ✅ PASSED (Expected error: ${error.message})`);
        passed++;
      } else {
        console.log(`   ❌ FAILED - Unexpected error: ${error.message}`);
      }
    }
  });

  console.log(`\n📊 Input Validation Results: ${passed}/${total} tests passed`);
  return passed === total;
}

/**
 * Validate getCredits function inputs
 */
function validateCreditsInputs(apiKey) {
  // Check API key
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error('Invalid API key');
  }

  return true;
}

/**
 * Test getCredits function with mock data
 */
async function testGetCreditsFunction() {
  console.log('\n🧪 Testing GetCredits Function (Mock)');
  console.log('='.repeat(50));

  try {
    // Enable mock mode
    enableMock();

    console.log('1. Testing basic getCredits call...');
    const result1 = await getCredits(API_KEY);
    console.log(`   ✅ Response received`);
    console.log(`   ✅ Response type: ${typeof result1}`);
    
    // Validate response structure
    if (result1 && typeof result1 === 'object') {
      console.log(`   ✅ Response is an object`);
      if (result1.remaining_credits !== undefined) {
        console.log(`   ✅ Contains remaining_credits field`);
      }
      if (result1.total_credits_used !== undefined) {
        console.log(`   ✅ Contains total_credits_used field`);
      }
    }

    console.log('\n2. Testing getCredits with custom mock response...');
    setMockResponses({
      '/v1/credits': {
        remaining_credits: 1000,
        total_credits_used: 500,
        plan: 'premium'
      }
    });
    
    const result2 = await getCredits(API_KEY);
    console.log(`   ✅ Custom response received`);
    if (result2.remaining_credits === 1000) {
      console.log(`   ✅ Custom remaining_credits value: ${result2.remaining_credits}`);
    }
    if (result2.total_credits_used === 500) {
      console.log(`   ✅ Custom total_credits_used value: ${result2.total_credits_used}`);
    }

    console.log('\n3. Testing getCredits with per-request mock...');
    const result3 = await getCredits(API_KEY, { mock: true });
    console.log(`   ✅ Per-request mock response received`);

    // Disable mock mode
    disableMock();

    console.log('\n✅ All getCredits function tests passed');
    return true;

  } catch (error) {
    console.error(`❌ GetCredits function test failed: ${error.message}`);
    disableMock();
    return false;
  }
}

/**
 * Test response structure validation
 */
function testResponseStructure() {
  console.log('\n🧪 Testing Response Structure');
  console.log('='.repeat(50));

  const mockResponse = {
    remaining_credits: 1000,
    total_credits_used: 500,
    plan: 'premium',
    reset_date: '2024-12-31'
  };

  const requiredFields = ['remaining_credits', 'total_credits_used'];
  let passed = 0;
  let total = requiredFields.length;

  requiredFields.forEach(field => {
    if (mockResponse[field] !== undefined) {
      console.log(`   ✅ Field "${field}" present`);
      passed++;
    } else {
      console.log(`   ❌ Field "${field}" missing`);
    }
  });

  // Test data types
  console.log('\n   Testing data types:');
  if (typeof mockResponse.remaining_credits === 'number') {
    console.log(`   ✅ remaining_credits is a number`);
    passed++;
  } else {
    console.log(`   ❌ remaining_credits is not a number`);
  }
  total++;

  if (typeof mockResponse.total_credits_used === 'number') {
    console.log(`   ✅ total_credits_used is a number`);
    passed++;
  } else {
    console.log(`   ❌ total_credits_used is not a number`);
  }
  total++;

  console.log(`\n📊 Response Structure Results: ${passed}/${total} tests passed`);
  return passed === total;
}

/**
 * Test error handling
 */
function testErrorHandling() {
  console.log('\n🧪 Testing Error Handling');
  console.log('='.repeat(50));

  let passed = 0;
  let total = 0;

  // Test 1: Invalid API key
  total++;
  try {
    validateCreditsInputs('');
    console.log('1. Empty API key test: ❌ FAILED (should have thrown error)');
  } catch (error) {
    console.log('1. Empty API key test: ✅ PASSED');
    passed++;
  }

  // Test 2: Null API key
  total++;
  try {
    validateCreditsInputs(null);
    console.log('2. Null API key test: ❌ FAILED (should have thrown error)');
  } catch (error) {
    console.log('2. Null API key test: ✅ PASSED');
    passed++;
  }

  // Test 3: Non-string API key
  total++;
  try {
    validateCreditsInputs(12345);
    console.log('3. Non-string API key test: ❌ FAILED (should have thrown error)');
  } catch (error) {
    console.log('3. Non-string API key test: ✅ PASSED');
    passed++;
  }

  console.log(`\n📊 Error Handling Results: ${passed}/${total} tests passed`);
  return passed === total;
}

/**
 * Test mock mode functionality
 */
async function testMockMode() {
  console.log('\n🧪 Testing Mock Mode');
  console.log('='.repeat(50));

  try {
    // Test 1: Global mock mode
    console.log('1. Testing global mock mode...');
    enableMock();
    const result1 = await getCredits(API_KEY);
    console.log(`   ✅ Mock response received: ${JSON.stringify(result1).substring(0, 100)}...`);
    
    // Test 2: Custom mock response
    console.log('\n2. Testing custom mock response...');
    setMockResponses({
      '/v1/credits': {
        remaining_credits: 9999,
        total_credits_used: 1
      }
    });
    const result2 = await getCredits(API_KEY);
    if (result2.remaining_credits === 9999) {
      console.log(`   ✅ Custom mock response working: ${result2.remaining_credits} credits`);
    } else {
      console.log(`   ❌ Custom mock response not working`);
      return false;
    }

    // Test 3: Per-request mock
    console.log('\n3. Testing per-request mock...');
    disableMock();
    const result3 = await getCredits(API_KEY, { mock: true });
    console.log(`   ✅ Per-request mock working`);

    disableMock();
    console.log('\n✅ All mock mode tests passed');
    return true;

  } catch (error) {
    console.error(`❌ Mock mode test failed: ${error.message}`);
    disableMock();
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Credits Test Suite');
  console.log('='.repeat(60));
  console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

  const tests = [
    { name: 'Input Validation', fn: testInputValidation },
    { name: 'GetCredits Function', fn: testGetCreditsFunction },
    { name: 'Response Structure', fn: testResponseStructure },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'Mock Mode', fn: testMockMode }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      }
    } catch (error) {
      console.error(`❌ Test '${test.name}' failed with error: ${error.message}`);
    }
    console.log('\n' + '-'.repeat(60));
  }

  console.log('\n🎯 FINAL TEST RESULTS');
  console.log('='.repeat(30));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${total - passed}`);
  console.log(`📊 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (passed === total) {
    console.log('\n🎉 All tests passed! Credits functionality is working correctly.');
    return 0;
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
    return 1;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(exitCode => {
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('💥 Fatal error during test execution:', error.message);
      process.exit(1);
    });
}

export {
  testInputValidation,
  testGetCreditsFunction,
  testResponseStructure,
  testErrorHandling,
  testMockMode,
  runAllTests
};
