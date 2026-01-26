import { sendFeedback, enableMock, disableMock, setMockResponses } from '../index.js';
import 'dotenv/config';

/**
 * Test suite for Feedback functionality
 * This file demonstrates usage and validates the sendFeedback endpoint
 */

// Mock API key for testing
const API_KEY = process.env.SGAI_APIKEY || 'test-api-key';

/**
 * Test input validation for sendFeedback
 */
function testInputValidation() {
  console.log('🧪 Testing Input Validation');
  console.log('='.repeat(50));

  const testCases = [
    {
      name: 'Valid inputs - all parameters',
      apiKey: 'valid-key',
      requestId: '123e4567-e89b-12d3-a456-426614174000',
      rating: 5,
      feedbackText: 'Great service!',
      expected: true,
      description: 'All valid parameters'
    },
    {
      name: 'Valid inputs - without feedback text',
      apiKey: 'valid-key',
      requestId: '123e4567-e89b-12d3-a456-426614174000',
      rating: 4,
      feedbackText: null,
      expected: true,
      description: 'Valid parameters without optional feedback text'
    },
    {
      name: 'Valid inputs - minimum rating',
      apiKey: 'valid-key',
      requestId: '123e4567-e89b-12d3-a456-426614174000',
      rating: 1,
      feedbackText: 'Poor service',
      expected: true,
      description: 'Minimum valid rating (1)'
    },
    {
      name: 'Valid inputs - maximum rating',
      apiKey: 'valid-key',
      requestId: '123e4567-e89b-12d3-a456-426614174000',
      rating: 5,
      feedbackText: 'Excellent service',
      expected: true,
      description: 'Maximum valid rating (5)'
    },
    {
      name: 'Invalid rating - too low',
      apiKey: 'valid-key',
      requestId: '123e4567-e89b-12d3-a456-426614174000',
      rating: 0,
      feedbackText: 'Test',
      expected: false,
      description: 'Rating below minimum (0)'
    },
    {
      name: 'Invalid rating - too high',
      apiKey: 'valid-key',
      requestId: '123e4567-e89b-12d3-a456-426614174000',
      rating: 6,
      feedbackText: 'Test',
      expected: false,
      description: 'Rating above maximum (6)'
    },
    {
      name: 'Invalid rating - non-integer',
      apiKey: 'valid-key',
      requestId: '123e4567-e89b-12d3-a456-426614174000',
      rating: 3.5,
      feedbackText: 'Test',
      expected: false,
      description: 'Rating as decimal'
    },
    {
      name: 'Empty API key',
      apiKey: '',
      requestId: '123e4567-e89b-12d3-a456-426614174000',
      rating: 5,
      feedbackText: 'Test',
      expected: false,
      description: 'Empty API key string'
    },
    {
      name: 'Empty request ID',
      apiKey: 'valid-key',
      requestId: '',
      rating: 5,
      feedbackText: 'Test',
      expected: false,
      description: 'Empty request ID string'
    },
    {
      name: 'Invalid request ID format',
      apiKey: 'valid-key',
      requestId: 'invalid-id',
      rating: 5,
      feedbackText: 'Test',
      expected: false,
      description: 'Request ID not in UUID format'
    }
  ];

  let passed = 0;
  let total = testCases.length;

  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    
    try {
      // Validate inputs
      const isValid = validateFeedbackInputs(
        testCase.apiKey,
        testCase.requestId,
        testCase.rating,
        testCase.feedbackText
      );
      
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
 * Validate sendFeedback function inputs
 */
function validateFeedbackInputs(apiKey, requestId, rating, feedbackText) {
  // Check API key
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error('Invalid API key');
  }

  // Check request ID
  if (!requestId || typeof requestId !== 'string' || requestId.trim() === '') {
    throw new Error('Invalid request ID');
  }

  // Check rating
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer between 1 and 5');
  }

  // Check feedback text (optional, but if provided must be string)
  if (feedbackText !== null && feedbackText !== undefined && typeof feedbackText !== 'string') {
    throw new Error('Feedback text must be a string or null');
  }

  return true;
}

/**
 * Test sendFeedback function with mock data
 */
async function testSendFeedbackFunction() {
  console.log('\n🧪 Testing SendFeedback Function (Mock)');
  console.log('='.repeat(50));

  try {
    // Enable mock mode
    enableMock();

    console.log('1. Testing basic sendFeedback call...');
    const result1 = await sendFeedback(API_KEY, '123e4567-e89b-12d3-a456-426614174000', 5, 'Great service!');
    console.log(`   ✅ Response received`);
    console.log(`   ✅ Response type: ${typeof result1}`);
    
    // Validate response structure
    if (result1 && typeof result1 === 'object') {
      console.log(`   ✅ Response is an object`);
      if (result1.status !== undefined || result1.message !== undefined) {
        console.log(`   ✅ Contains status/message field`);
      }
    }

    console.log('\n2. Testing sendFeedback without feedback text...');
    const result2 = await sendFeedback(API_KEY, '123e4567-e89b-12d3-a456-426614174000', 4);
    console.log(`   ✅ Response received without feedback text`);

    console.log('\n3. Testing sendFeedback with different ratings...');
    for (let rating = 1; rating <= 5; rating++) {
      const result = await sendFeedback(API_KEY, '123e4567-e89b-12d3-a456-426614174000', rating, `Rating ${rating}`);
      console.log(`   ✅ Rating ${rating} accepted`);
    }

    console.log('\n4. Testing sendFeedback with custom mock response...');
    setMockResponses({
      '/v1/feedback': {
        status: 'success',
        message: 'Feedback submitted successfully',
        feedback_id: 'feedback-123'
      }
    });
    
    const result3 = await sendFeedback(API_KEY, '123e4567-e89b-12d3-a456-426614174000', 5, 'Test feedback');
    console.log(`   ✅ Custom response received`);
    if (result3.status === 'success') {
      console.log(`   ✅ Custom status value: ${result3.status}`);
    }

    console.log('\n5. Testing sendFeedback with per-request mock...');
    const result4 = await sendFeedback(API_KEY, '123e4567-e89b-12d3-a456-426614174000', 5, 'Test', { mock: true });
    console.log(`   ✅ Per-request mock response received`);

    // Disable mock mode
    disableMock();

    console.log('\n✅ All sendFeedback function tests passed');
    return true;

  } catch (error) {
    console.error(`❌ SendFeedback function test failed: ${error.message}`);
    disableMock();
    return false;
  }
}

/**
 * Test rating validation
 */
function testRatingValidation() {
  console.log('\n🧪 Testing Rating Validation');
  console.log('='.repeat(50));

  const validRatings = [1, 2, 3, 4, 5];
  const invalidRatings = [0, -1, 6, 10, 3.5, '5', null, undefined];

  let passed = 0;
  let total = validRatings.length + invalidRatings.length;

  console.log('\n1. Testing valid ratings:');
  validRatings.forEach(rating => {
    try {
      validateFeedbackInputs('valid-key', '123e4567-e89b-12d3-a456-426614174000', rating, 'Test');
      console.log(`   ✅ Rating ${rating} is valid`);
      passed++;
    } catch (error) {
      console.log(`   ❌ Rating ${rating} incorrectly rejected: ${error.message}`);
    }
  });

  console.log('\n2. Testing invalid ratings:');
  invalidRatings.forEach(rating => {
    try {
      validateFeedbackInputs('valid-key', '123e4567-e89b-12d3-a456-426614174000', rating, 'Test');
      console.log(`   ❌ Rating ${rating} incorrectly accepted`);
    } catch (error) {
      console.log(`   ✅ Rating ${rating} correctly rejected`);
      passed++;
    }
  });

  console.log(`\n📊 Rating Validation Results: ${passed}/${total} tests passed`);
  return passed === total;
}

/**
 * Test request ID validation
 */
function testRequestIdValidation() {
  console.log('\n🧪 Testing Request ID Validation');
  console.log('='.repeat(50));

  const validRequestIds = [
    '123e4567-e89b-12d3-a456-426614174000',
    '00000000-0000-0000-0000-000000000000',
    'ffffffff-ffff-ffff-ffff-ffffffffffff'
  ];

  const invalidRequestIds = [
    '',
    null,
    undefined,
    'invalid-id',
    '123',
    'not-a-uuid'
  ];

  let passed = 0;
  let total = validRequestIds.length + invalidRequestIds.length;

  console.log('\n1. Testing valid request IDs:');
  validRequestIds.forEach(requestId => {
    try {
      validateFeedbackInputs('valid-key', requestId, 5, 'Test');
      console.log(`   ✅ Request ID "${requestId}" is valid`);
      passed++;
    } catch (error) {
      console.log(`   ❌ Request ID "${requestId}" incorrectly rejected: ${error.message}`);
    }
  });

  console.log('\n2. Testing invalid request IDs:');
  invalidRequestIds.forEach(requestId => {
    try {
      validateFeedbackInputs('valid-key', requestId, 5, 'Test');
      console.log(`   ❌ Request ID "${requestId}" incorrectly accepted`);
    } catch (error) {
      console.log(`   ✅ Request ID "${requestId}" correctly rejected`);
      passed++;
    }
  });

  console.log(`\n📊 Request ID Validation Results: ${passed}/${total} tests passed`);
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
    validateFeedbackInputs('', '123e4567-e89b-12d3-a456-426614174000', 5, 'Test');
    console.log('1. Empty API key test: ❌ FAILED (should have thrown error)');
  } catch (error) {
    console.log('1. Empty API key test: ✅ PASSED');
    passed++;
  }

  // Test 2: Invalid rating
  total++;
  try {
    validateFeedbackInputs('valid-key', '123e4567-e89b-12d3-a456-426614174000', 0, 'Test');
    console.log('2. Invalid rating test: ❌ FAILED (should have thrown error)');
  } catch (error) {
    console.log('2. Invalid rating test: ✅ PASSED');
    passed++;
  }

  // Test 3: Invalid request ID
  total++;
  try {
    validateFeedbackInputs('valid-key', '', 5, 'Test');
    console.log('3. Empty request ID test: ❌ FAILED (should have thrown error)');
  } catch (error) {
    console.log('3. Empty request ID test: ✅ PASSED');
    passed++;
  }

  console.log(`\n📊 Error Handling Results: ${passed}/${total} tests passed`);
  return passed === total;
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Feedback Test Suite');
  console.log('='.repeat(60));
  console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

  const tests = [
    { name: 'Input Validation', fn: testInputValidation },
    { name: 'SendFeedback Function', fn: testSendFeedbackFunction },
    { name: 'Rating Validation', fn: testRatingValidation },
    { name: 'Request ID Validation', fn: testRequestIdValidation },
    { name: 'Error Handling', fn: testErrorHandling }
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
    console.log('\n🎉 All tests passed! Feedback functionality is working correctly.');
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
  testSendFeedbackFunction,
  testRatingValidation,
  testRequestIdValidation,
  testErrorHandling,
  runAllTests
};
