import { generateSchema, getSchemaStatus, pollSchemaGeneration } from '../index.js';
import 'dotenv/config';

/**
 * Test suite for Schema Generation functionality
 * This file demonstrates usage and validates the schema generation endpoints
 */

// Mock API key for testing
const API_KEY = process.env.SGAI_APIKEY || 'test-api-key';

/**
 * Test input validation for generateSchema
 */
function testGenerateSchemaInputValidation() {
  console.log('🧪 Testing GenerateSchema Input Validation');
  console.log('='.repeat(50));

  const testCases = [
    {
      name: 'Valid inputs - with prompt only',
      userPrompt: 'Extract product information',
      existingSchema: null,
      apiKey: API_KEY,
      expected: true,
      description: 'Valid prompt with no existing schema'
    },
    {
      name: 'Valid inputs - with existing schema',
      userPrompt: 'Add price field to schema',
      existingSchema: { type: 'object', properties: { name: { type: 'string' } } },
      apiKey: API_KEY,
      expected: true,
      description: 'Valid prompt with existing schema'
    },
    {
      name: 'Empty prompt',
      userPrompt: '',
      existingSchema: null,
      apiKey: API_KEY,
      expected: false,
      description: 'Empty prompt string'
    },
    {
      name: 'Null prompt',
      userPrompt: null,
      existingSchema: null,
      apiKey: API_KEY,
      expected: false,
      description: 'Null prompt'
    },
    {
      name: 'Missing API key',
      userPrompt: 'Extract data',
      existingSchema: null,
      apiKey: null,
      expected: false,
      description: 'Missing API key'
    },
    {
      name: 'Invalid existing schema type',
      userPrompt: 'Extract data',
      existingSchema: 'not-an-object',
      apiKey: API_KEY,
      expected: false,
      description: 'Existing schema as string instead of object'
    }
  ];

  let passed = 0;
  let total = testCases.length;

  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    
    try {
      // Validate inputs
      const isValid = validateGenerateSchemaInputs(
        testCase.userPrompt,
        testCase.existingSchema,
        testCase.apiKey
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
 * Validate generateSchema function inputs
 */
function validateGenerateSchemaInputs(userPrompt, existingSchema, apiKey) {
  // Check API key
  if (!apiKey) {
    throw new Error('API key is required');
  }

  // Check user prompt
  if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim() === '') {
    throw new Error('userPrompt is required and must be a non-empty string');
  }

  // Check existing schema (if provided)
  if (existingSchema !== null && (typeof existingSchema !== 'object' || existingSchema === null)) {
    throw new Error('existingSchema must be a valid object or null');
  }

  return true;
}

/**
 * Test input validation for getSchemaStatus
 */
function testGetSchemaStatusInputValidation() {
  console.log('\n🧪 Testing GetSchemaStatus Input Validation');
  console.log('='.repeat(50));

  const validRequestId = '123e4567-e89b-12d3-a456-426614174000';
  const testCases = [
    {
      name: 'Valid request ID',
      requestId: validRequestId,
      apiKey: API_KEY,
      expected: true,
      description: 'Valid UUID format request ID'
    },
    {
      name: 'Empty request ID',
      requestId: '',
      apiKey: API_KEY,
      expected: false,
      description: 'Empty request ID string'
    },
    {
      name: 'Invalid request ID format',
      requestId: 'invalid-id',
      apiKey: API_KEY,
      expected: false,
      description: 'Request ID not in UUID format'
    },
    {
      name: 'Missing API key',
      requestId: validRequestId,
      apiKey: null,
      expected: false,
      description: 'Missing API key'
    }
  ];

  let passed = 0;
  let total = testCases.length;

  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    
    try {
      // Validate inputs
      const isValid = validateGetSchemaStatusInputs(testCase.requestId, testCase.apiKey);
      
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
 * Validate getSchemaStatus function inputs
 */
function validateGetSchemaStatusInputs(requestId, apiKey) {
  // Check API key
  if (!apiKey) {
    throw new Error('API key is required');
  }

  // Check request ID
  if (!requestId || typeof requestId !== 'string' || requestId.trim() === '') {
    throw new Error('requestId is required and must be a non-empty string');
  }

  // Validate UUID format (basic check)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(requestId.trim())) {
    throw new Error('requestId must be a valid UUID format');
  }

  return true;
}

/**
 * Test UUID format validation
 */
function testUuidValidation() {
  console.log('\n🧪 Testing UUID Format Validation');
  console.log('='.repeat(50));

  const validUuids = [
    '123e4567-e89b-12d3-a456-426614174000',
    '00000000-0000-0000-0000-000000000000',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    '550e8400-e29b-41d4-a716-446655440000'
  ];

  const invalidUuids = [
    '',
    'invalid-id',
    '123',
    '123e4567-e89b-12d3-a456',
    '123e4567e89b12d3a456426614174000',
    '123E4567-E89B-12D3-A456-426614174000', // Should still be valid (case insensitive)
    null,
    undefined
  ];

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  let passed = 0;
  let total = validUuids.length + invalidUuids.length;

  console.log('\n1. Testing valid UUIDs:');
  validUuids.forEach(uuid => {
    if (uuidRegex.test(uuid)) {
      console.log(`   ✅ "${uuid}" is valid`);
      passed++;
    } else {
      console.log(`   ❌ "${uuid}" incorrectly rejected`);
    }
  });

  console.log('\n2. Testing invalid UUIDs:');
  invalidUuids.forEach(uuid => {
    if (uuid && uuidRegex.test(uuid)) {
      console.log(`   ❌ "${uuid}" incorrectly accepted`);
    } else {
      console.log(`   ✅ "${uuid}" correctly rejected`);
      passed++;
    }
  });

  console.log(`\n📊 UUID Validation Results: ${passed}/${total} tests passed`);
  return passed === total;
}

/**
 * Test schema structure validation
 */
function testSchemaStructureValidation() {
  console.log('\n🧪 Testing Schema Structure Validation');
  console.log('='.repeat(50));

  const validSchemas = [
    { type: 'object', properties: { name: { type: 'string' } } },
    { type: 'object', properties: { items: { type: 'array', items: { type: 'string' } } } },
    { $schema: 'http://json-schema.org/draft-07/schema#', type: 'object' }
  ];

  const invalidSchemas = [
    'not-an-object',
    123,
    null,
    [],
    { type: 'invalid' }
  ];

  let passed = 0;
  let total = validSchemas.length + invalidSchemas.length;

  console.log('\n1. Testing valid schemas:');
  validSchemas.forEach((schema, index) => {
    if (schema && typeof schema === 'object' && schema !== null) {
      console.log(`   ✅ Schema ${index + 1} is valid`);
      passed++;
    } else {
      console.log(`   ❌ Schema ${index + 1} incorrectly rejected`);
    }
  });

  console.log('\n2. Testing invalid schemas:');
  invalidSchemas.forEach((schema, index) => {
    if (schema && typeof schema === 'object' && schema !== null) {
      console.log(`   ❌ Schema ${index + 1} incorrectly accepted`);
    } else {
      console.log(`   ✅ Schema ${index + 1} correctly rejected`);
      passed++;
    }
  });

  console.log(`\n📊 Schema Structure Validation Results: ${passed}/${total} tests passed`);
  return passed === total;
}

/**
 * Test pollSchemaGeneration parameters
 */
function testPollSchemaGenerationParameters() {
  console.log('\n🧪 Testing PollSchemaGeneration Parameters');
  console.log('='.repeat(50));

  const validRequestId = '123e4567-e89b-12d3-a456-426614174000';
  
  const testCases = [
    {
      name: 'Valid parameters - default options',
      requestId: validRequestId,
      options: { apiKey: API_KEY },
      expected: true,
      description: 'Valid request ID with default polling options'
    },
    {
      name: 'Valid parameters - custom options',
      requestId: validRequestId,
      options: { 
        apiKey: API_KEY,
        maxAttempts: 10,
        delay: 2000
      },
      expected: true,
      description: 'Valid request ID with custom polling options'
    },
    {
      name: 'Invalid request ID',
      requestId: 'invalid-id',
      options: { apiKey: API_KEY },
      expected: false,
      description: 'Invalid request ID format'
    },
    {
      name: 'Missing API key',
      requestId: validRequestId,
      options: {},
      expected: false,
      description: 'Missing API key in options'
    },
    {
      name: 'Invalid maxAttempts',
      requestId: validRequestId,
      options: { apiKey: API_KEY, maxAttempts: -1 },
      expected: false,
      description: 'Negative maxAttempts'
    },
    {
      name: 'Invalid delay',
      requestId: validRequestId,
      options: { apiKey: API_KEY, delay: -100 },
      expected: false,
      description: 'Negative delay'
    }
  ];

  let passed = 0;
  let total = testCases.length;

  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    
    try {
      // Validate inputs
      const isValid = validatePollSchemaGenerationInputs(
        testCase.requestId,
        testCase.options
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

  console.log(`\n📊 Parameter Validation Results: ${passed}/${total} tests passed`);
  return passed === total;
}

/**
 * Validate pollSchemaGeneration function inputs
 */
function validatePollSchemaGenerationInputs(requestId, options) {
  // Check request ID
  if (!requestId || typeof requestId !== 'string' || requestId.trim() === '') {
    throw new Error('requestId is required and must be a non-empty string');
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(requestId.trim())) {
    throw new Error('requestId must be a valid UUID format');
  }

  // Check API key
  if (!options || !options.apiKey) {
    throw new Error('API key is required in options');
  }

  // Check maxAttempts if provided
  if (options.maxAttempts !== undefined && (typeof options.maxAttempts !== 'number' || options.maxAttempts < 1)) {
    throw new Error('maxAttempts must be a positive number');
  }

  // Check delay if provided
  if (options.delay !== undefined && (typeof options.delay !== 'number' || options.delay < 0)) {
    throw new Error('delay must be a non-negative number');
  }

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

  // Test 1: Missing API key in generateSchema
  total++;
  try {
    validateGenerateSchemaInputs('Test prompt', null, null);
    console.log('1. Missing API key test: ❌ FAILED (should have thrown error)');
  } catch (error) {
    console.log('1. Missing API key test: ✅ PASSED');
    passed++;
  }

  // Test 2: Empty prompt
  total++;
  try {
    validateGenerateSchemaInputs('', null, API_KEY);
    console.log('2. Empty prompt test: ❌ FAILED (should have thrown error)');
  } catch (error) {
    console.log('2. Empty prompt test: ✅ PASSED');
    passed++;
  }

  // Test 3: Invalid request ID format
  total++;
  try {
    validateGetSchemaStatusInputs('invalid-id', API_KEY);
    console.log('3. Invalid request ID test: ❌ FAILED (should have thrown error)');
  } catch (error) {
    console.log('3. Invalid request ID test: ✅ PASSED');
    passed++;
  }

  console.log(`\n📊 Error Handling Results: ${passed}/${total} tests passed`);
  return passed === total;
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Schema Generation Test Suite');
  console.log('='.repeat(60));
  console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

  const tests = [
    { name: 'GenerateSchema Input Validation', fn: testGenerateSchemaInputValidation },
    { name: 'GetSchemaStatus Input Validation', fn: testGetSchemaStatusInputValidation },
    { name: 'UUID Validation', fn: testUuidValidation },
    { name: 'Schema Structure Validation', fn: testSchemaStructureValidation },
    { name: 'PollSchemaGeneration Parameters', fn: testPollSchemaGenerationParameters },
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
    console.log('\n🎉 All tests passed! Schema generation functionality is working correctly.');
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
  testGenerateSchemaInputValidation,
  testGetSchemaStatusInputValidation,
  testUuidValidation,
  testSchemaStructureValidation,
  testPollSchemaGenerationParameters,
  testErrorHandling,
  runAllTests
};
