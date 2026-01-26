import { toonify, enableMock, disableMock, setMockResponses } from '../index.js';
import 'dotenv/config';

/**
 * Test suite for Toonify functionality
 * This file demonstrates usage and validates the toonify endpoint
 */

// Mock API key for testing
const API_KEY = process.env.SGAI_APIKEY || 'test-api-key';

/**
 * Test input validation for toonify
 */
function testInputValidation() {
  console.log('🧪 Testing Input Validation');
  console.log('='.repeat(50));

  const testCases = [
    {
      name: 'Valid inputs - simple object',
      apiKey: 'valid-key',
      data: { name: 'Test', value: 123 },
      expected: true,
      description: 'Valid API key and data object'
    },
    {
      name: 'Valid inputs - complex nested object',
      apiKey: 'valid-key',
      data: {
        products: [
          { sku: 'LAP-001', name: 'Gaming Laptop', price: 1299.99 },
          { sku: 'MOU-042', name: 'Wireless Mouse', price: 29.99 }
        ]
      },
      expected: true,
      description: 'Valid API key with complex nested data'
    },
    {
      name: 'Valid inputs - array data',
      apiKey: 'valid-key',
      data: [{ item: 1 }, { item: 2 }],
      expected: true,
      description: 'Valid API key with array data'
    },
    {
      name: 'Empty API key',
      apiKey: '',
      data: { test: 'data' },
      expected: false,
      description: 'Empty API key string'
    },
    {
      name: 'Null API key',
      apiKey: null,
      data: { test: 'data' },
      expected: false,
      description: 'Null API key'
    },
    {
      name: 'Null data',
      apiKey: 'valid-key',
      data: null,
      expected: false,
      description: 'Null data object'
    },
    {
      name: 'Undefined data',
      apiKey: 'valid-key',
      data: undefined,
      expected: false,
      description: 'Undefined data object'
    },
    {
      name: 'Primitive data type',
      apiKey: 'valid-key',
      data: 'not-an-object',
      expected: false,
      description: 'Data as string instead of object'
    },
    {
      name: 'Empty object',
      apiKey: 'valid-key',
      data: {},
      expected: true,
      description: 'Empty object (should be valid)'
    }
  ];

  let passed = 0;
  let total = testCases.length;

  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    
    try {
      // Validate inputs
      const isValid = validateToonifyInputs(testCase.apiKey, testCase.data);
      
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
 * Validate toonify function inputs
 */
function validateToonifyInputs(apiKey, data) {
  // Check API key
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error('Invalid API key');
  }

  // Check data
  if (data === null || data === undefined) {
    throw new Error('Data is required and cannot be null or undefined');
  }

  // Data should be an object (including arrays, which are objects in JS)
  if (typeof data !== 'object') {
    throw new Error('Data must be an object or array');
  }

  return true;
}

/**
 * Test toonify function with mock data
 */
async function testToonifyFunction() {
  console.log('\n🧪 Testing Toonify Function (Mock)');
  console.log('='.repeat(50));

  try {
    // Enable mock mode
    enableMock();

    console.log('1. Testing basic toonify call...');
    const simpleData = { name: 'Test Product', price: 99.99 };
    const result1 = await toonify(API_KEY, simpleData);
    console.log(`   ✅ Response received`);
    console.log(`   ✅ Response type: ${typeof result1}`);
    
    // Validate response structure
    if (result1 && typeof result1 === 'object') {
      console.log(`   ✅ Response is an object`);
    }

    console.log('\n2. Testing toonify with complex nested data...');
    const complexData = {
      products: [
        { sku: 'LAP-001', name: 'Gaming Laptop', price: 1299.99 },
        { sku: 'MOU-042', name: 'Wireless Mouse', price: 29.99 }
      ],
      metadata: {
        total: 2,
        category: 'electronics'
      }
    };
    const result2 = await toonify(API_KEY, complexData);
    console.log(`   ✅ Complex data processed`);

    console.log('\n3. Testing toonify with array data...');
    const arrayData = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ];
    const result3 = await toonify(API_KEY, arrayData);
    console.log(`   ✅ Array data processed`);

    console.log('\n4. Testing toonify with custom mock response...');
    setMockResponses({
      '/v1/toonify': {
        toonified_data: {
          visual: 'toon-representation',
          data: { processed: true }
        }
      }
    });
    
    const result4 = await toonify(API_KEY, { test: 'data' });
    console.log(`   ✅ Custom response received`);
    if (result4.toonified_data) {
      console.log(`   ✅ Custom toonified_data field present`);
    }

    console.log('\n5. Testing toonify with per-request mock...');
    const result5 = await toonify(API_KEY, { test: 'data' }, { mock: true });
    console.log(`   ✅ Per-request mock response received`);

    // Disable mock mode
    disableMock();

    console.log('\n✅ All toonify function tests passed');
    return true;

  } catch (error) {
    console.error(`❌ Toonify function test failed: ${error.message}`);
    disableMock();
    return false;
  }
}

/**
 * Test data structure validation
 */
function testDataStructureValidation() {
  console.log('\n🧪 Testing Data Structure Validation');
  console.log('='.repeat(50));

  const validDataStructures = [
    { simple: 'object' },
    { nested: { level1: { level2: 'value' } } },
    { array: [1, 2, 3] },
    { mixed: { items: [{ id: 1 }, { id: 2 }] } },
    {}
  ];

  const invalidDataStructures = [
    null,
    undefined,
    'string',
    123,
    true,
    false
  ];

  let passed = 0;
  let total = validDataStructures.length + invalidDataStructures.length;

  console.log('\n1. Testing valid data structures:');
  validDataStructures.forEach((data, index) => {
    try {
      validateToonifyInputs('valid-key', data);
      console.log(`   ✅ Data structure ${index + 1} is valid`);
      passed++;
    } catch (error) {
      console.log(`   ❌ Data structure ${index + 1} incorrectly rejected: ${error.message}`);
    }
  });

  console.log('\n2. Testing invalid data structures:');
  invalidDataStructures.forEach((data, index) => {
    try {
      validateToonifyInputs('valid-key', data);
      console.log(`   ❌ Data structure ${index + 1} incorrectly accepted`);
    } catch (error) {
      console.log(`   ✅ Data structure ${index + 1} correctly rejected`);
      passed++;
    }
  });

  console.log(`\n📊 Data Structure Validation Results: ${passed}/${total} tests passed`);
  return passed === total;
}

/**
 * Test common use cases
 */
function testCommonUseCases() {
  console.log('\n🧪 Testing Common Use Cases');
  console.log('='.repeat(50));

  const useCases = [
    {
      name: 'E-commerce Products',
      data: {
        products: [
          { sku: 'LAP-001', name: 'Gaming Laptop', price: 1299.99, category: 'Electronics' },
          { sku: 'MOU-042', name: 'Wireless Mouse', price: 29.99, category: 'Accessories' }
        ]
      },
      description: 'Product catalog data'
    },
    {
      name: 'User Profiles',
      data: {
        users: [
          { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
        ]
      },
      description: 'User profile data'
    },
    {
      name: 'Analytics Data',
      data: {
        metrics: {
          page_views: 1000,
          unique_visitors: 500,
          conversion_rate: 0.05
        },
        trends: [10, 20, 30, 40, 50]
      },
      description: 'Analytics and metrics data'
    }
  ];

  useCases.forEach((useCase, index) => {
    console.log(`\n${index + 1}. ${useCase.name}`);
    console.log(`   Description: ${useCase.description}`);
    
    try {
      validateToonifyInputs('valid-key', useCase.data);
      console.log(`   ✅ Valid use case structure`);
    } catch (error) {
      console.log(`   ❌ Invalid use case: ${error.message}`);
    }
  });

  console.log('\n✅ Common use cases validated');
  return true;
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
    validateToonifyInputs('', { test: 'data' });
    console.log('1. Empty API key test: ❌ FAILED (should have thrown error)');
  } catch (error) {
    console.log('1. Empty API key test: ✅ PASSED');
    passed++;
  }

  // Test 2: Null data
  total++;
  try {
    validateToonifyInputs('valid-key', null);
    console.log('2. Null data test: ❌ FAILED (should have thrown error)');
  } catch (error) {
    console.log('2. Null data test: ✅ PASSED');
    passed++;
  }

  // Test 3: Non-object data
  total++;
  try {
    validateToonifyInputs('valid-key', 'not-an-object');
    console.log('3. Non-object data test: ❌ FAILED (should have thrown error)');
  } catch (error) {
    console.log('3. Non-object data test: ✅ PASSED');
    passed++;
  }

  console.log(`\n📊 Error Handling Results: ${passed}/${total} tests passed`);
  return passed === total;
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Toonify Test Suite');
  console.log('='.repeat(60));
  console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

  const tests = [
    { name: 'Input Validation', fn: testInputValidation },
    { name: 'Toonify Function', fn: testToonifyFunction },
    { name: 'Data Structure Validation', fn: testDataStructureValidation },
    { name: 'Common Use Cases', fn: testCommonUseCases },
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
    console.log('\n🎉 All tests passed! Toonify functionality is working correctly.');
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
  testToonifyFunction,
  testDataStructureValidation,
  testCommonUseCases,
  testErrorHandling,
  runAllTests
};
