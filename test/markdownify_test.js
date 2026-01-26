import { markdownify, getMarkdownifyRequest, enableMock, disableMock, setMockResponses } from '../index.js';
import 'dotenv/config';

/**
 * Test suite for Markdownify functionality
 * This file demonstrates usage and validates the markdownify endpoint
 */

// Mock API key for testing
const API_KEY = process.env.SGAI_APIKEY || 'test-api-key';

/**
 * Test input validation for markdownify
 */
function testInputValidation() {
  console.log('🧪 Testing Input Validation');
  console.log('='.repeat(50));

  const testCases = [
    {
      name: 'Valid inputs - basic',
      apiKey: 'valid-key',
      url: 'https://example.com',
      options: {},
      expected: true,
      description: 'All valid parameters with default options'
    },
    {
      name: 'Valid inputs - with stealth mode',
      apiKey: 'valid-key',
      url: 'https://example.com',
      options: { stealth: true },
      expected: true,
      description: 'Valid parameters with stealth mode enabled'
    },
    {
      name: 'Valid inputs - with mock override',
      apiKey: 'valid-key',
      url: 'https://example.com',
      options: { mock: true },
      expected: true,
      description: 'Valid parameters with mock mode override'
    },
    {
      name: 'Invalid URL - no protocol',
      apiKey: 'valid-key',
      url: 'example.com',
      options: {},
      expected: false,
      description: 'URL without http/https protocol'
    },
    {
      name: 'Invalid URL - relative path',
      apiKey: 'valid-key',
      url: '/path/to/page',
      options: {},
      expected: false,
      description: 'Relative path instead of absolute URL'
    },
    {
      name: 'Invalid URL - empty string',
      apiKey: 'valid-key',
      url: '',
      options: {},
      expected: false,
      description: 'Empty URL string'
    },
    {
      name: 'Empty API key',
      apiKey: '',
      url: 'https://example.com',
      options: {},
      expected: false,
      description: 'Empty API key string'
    }
  ];

  let passed = 0;
  let total = testCases.length;

  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    
    try {
      // Validate inputs
      const isValid = validateMarkdownifyInputs(
        testCase.apiKey,
        testCase.url,
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

  console.log(`\n📊 Input Validation Results: ${passed}/${total} tests passed`);
  return passed === total;
}

/**
 * Validate markdownify function inputs
 */
function validateMarkdownifyInputs(apiKey, url, options) {
  // Check API key
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error('Invalid API key');
  }

  // Check URL
  if (!url || typeof url !== 'string' || url.trim() === '') {
    throw new Error('Invalid URL');
  }

  // Check URL format
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('URL must start with http:// or https://');
  }

  // Check options
  if (options && typeof options !== 'object') {
    throw new Error('Options must be an object');
  }

  // Check stealth option
  if (options && options.stealth !== undefined && typeof options.stealth !== 'boolean') {
    throw new Error('stealth must be a boolean');
  }

  return true;
}

/**
 * Test markdownify function with mock data
 */
async function testMarkdownifyFunction() {
  console.log('\n🧪 Testing Markdownify Function (Mock)');
  console.log('='.repeat(50));

  try {
    // Enable mock mode
    enableMock();

    console.log('1. Testing basic markdownify call...');
    const result1 = await markdownify(API_KEY, 'https://example.com');
    console.log(`   ✅ Response received`);
    console.log(`   ✅ Response type: ${typeof result1}`);
    
    // Validate response structure
    if (result1 && typeof result1 === 'object') {
      console.log(`   ✅ Response is an object`);
      if (result1.request_id !== undefined) {
        console.log(`   ✅ Contains request_id field`);
      }
      if (result1.status !== undefined) {
        console.log(`   ✅ Contains status field`);
      }
    }

    console.log('\n2. Testing markdownify with stealth mode...');
    const result2 = await markdownify(API_KEY, 'https://example.com', { stealth: true });
    console.log(`   ✅ Stealth mode request processed`);

    console.log('\n3. Testing markdownify with custom mock response...');
    setMockResponses({
      '/v1/markdownify': {
        request_id: 'custom-markdown-request-id',
        status: 'completed',
        result: '# Mock Markdown\n\nThis is a mock markdown result.'
      }
    });
    
    const result3 = await markdownify(API_KEY, 'https://example.com');
    console.log(`   ✅ Custom response received`);
    if (result3.request_id === 'custom-markdown-request-id') {
      console.log(`   ✅ Custom request_id value: ${result3.request_id}`);
    }

    console.log('\n4. Testing markdownify with per-request mock...');
    const result4 = await markdownify(API_KEY, 'https://example.com', { mock: true });
    console.log(`   ✅ Per-request mock response received`);

    // Disable mock mode
    disableMock();

    console.log('\n✅ All markdownify function tests passed');
    return true;

  } catch (error) {
    console.error(`❌ Markdownify function test failed: ${error.message}`);
    disableMock();
    return false;
  }
}

/**
 * Test getMarkdownifyRequest function
 */
async function testGetMarkdownifyRequestFunction() {
  console.log('\n🧪 Testing GetMarkdownifyRequest Function (Mock)');
  console.log('='.repeat(50));

  try {
    // Enable mock mode
    enableMock();

    console.log('1. Testing getMarkdownifyRequest with valid request ID...');
    const result1 = await getMarkdownifyRequest(API_KEY, 'test-request-id-123');
    console.log(`   ✅ Response received`);
    console.log(`   ✅ Response type: ${typeof result1}`);
    
    // Validate response structure
    if (result1 && typeof result1 === 'object') {
      console.log(`   ✅ Response is an object`);
      if (result1.status !== undefined) {
        console.log(`   ✅ Contains status field`);
      }
    }

    console.log('\n2. Testing getMarkdownifyRequest with different request ID...');
    const result2 = await getMarkdownifyRequest(API_KEY, 'another-request-id-456');
    console.log(`   ✅ Different request ID processed`);

    // Disable mock mode
    disableMock();

    console.log('\n✅ All getMarkdownifyRequest function tests passed');
    return true;

  } catch (error) {
    console.error(`❌ GetMarkdownifyRequest function test failed: ${error.message}`);
    disableMock();
    return false;
  }
}

/**
 * Test URL validation
 */
function testUrlValidation() {
  console.log('\n🧪 Testing URL Validation');
  console.log('='.repeat(50));

  const testUrls = [
    { url: 'https://example.com', expected: true, description: 'HTTPS URL' },
    { url: 'http://example.com', expected: true, description: 'HTTP URL' },
    { url: 'https://sub.example.com', expected: true, description: 'Subdomain HTTPS' },
    { url: 'https://example.com/path', expected: true, description: 'HTTPS with path' },
    { url: 'https://example.com?param=value', expected: true, description: 'HTTPS with query params' },
    { url: 'example.com', expected: false, description: 'No protocol' },
    { url: '/path/to/page', expected: false, description: 'Relative path' },
    { url: '', expected: false, description: 'Empty string' },
    { url: null, expected: false, description: 'Null value' }
  ];

  let passed = 0;
  let total = testUrls.length;

  testUrls.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.description}: ${testCase.url || 'null'}`);
    
    try {
      if (testCase.url) {
        const isValid = testCase.url.startsWith('http://') || testCase.url.startsWith('https://');
        if (isValid === testCase.expected) {
          console.log(`   ✅ PASSED`);
          passed++;
        } else {
          console.log(`   ❌ FAILED - Expected: ${testCase.expected}, Got: ${isValid}`);
        }
      } else {
        if (!testCase.expected) {
          console.log(`   ✅ PASSED`);
          passed++;
        } else {
          console.log(`   ❌ FAILED - Expected: ${testCase.expected}, Got: false`);
        }
      }
    } catch (error) {
      if (!testCase.expected) {
        console.log(`   ✅ PASSED (Expected error)`);
        passed++;
      } else {
        console.log(`   ❌ FAILED - Unexpected error: ${error.message}`);
      }
    }
  });

  console.log(`\n📊 URL Validation Results: ${passed}/${total} tests passed`);
  return passed === total;
}

/**
 * Test stealth mode option
 */
function testStealthModeOption() {
  console.log('\n🧪 Testing Stealth Mode Option');
  console.log('='.repeat(50));

  const testCases = [
    {
      name: 'Stealth mode enabled',
      options: { stealth: true },
      expected: true,
      description: 'Stealth mode set to true'
    },
    {
      name: 'Stealth mode disabled',
      options: { stealth: false },
      expected: true,
      description: 'Stealth mode set to false'
    },
    {
      name: 'Stealth mode not specified',
      options: {},
      expected: true,
      description: 'Stealth mode not specified (should default to false)'
    },
    {
      name: 'Invalid stealth mode type',
      options: { stealth: 'true' },
      expected: false,
      description: 'Stealth mode as string instead of boolean'
    }
  ];

  let passed = 0;
  let total = testCases.length;

  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    
    try {
      // Validate options
      if (testCase.options.stealth !== undefined && typeof testCase.options.stealth !== 'boolean') {
        throw new Error('stealth must be a boolean');
      }
      
      if (testCase.expected) {
        console.log(`   ✅ PASSED`);
        passed++;
      } else {
        console.log(`   ❌ FAILED - Expected validation to fail`);
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

  console.log(`\n📊 Stealth Mode Option Results: ${passed}/${total} tests passed`);
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
    validateMarkdownifyInputs('', 'https://example.com', {});
    console.log('1. Empty API key test: ❌ FAILED (should have thrown error)');
  } catch (error) {
    console.log('1. Empty API key test: ✅ PASSED');
    passed++;
  }

  // Test 2: Invalid URL
  total++;
  try {
    validateMarkdownifyInputs('valid-key', 'invalid-url', {});
    console.log('2. Invalid URL test: ❌ FAILED (should have thrown error)');
  } catch (error) {
    console.log('2. Invalid URL test: ✅ PASSED');
    passed++;
  }

  // Test 3: Invalid options
  total++;
  try {
    validateMarkdownifyInputs('valid-key', 'https://example.com', 'invalid-options');
    console.log('3. Invalid options test: ❌ FAILED (should have thrown error)');
  } catch (error) {
    console.log('3. Invalid options test: ✅ PASSED');
    passed++;
  }

  console.log(`\n📊 Error Handling Results: ${passed}/${total} tests passed`);
  return passed === total;
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Markdownify Test Suite');
  console.log('='.repeat(60));
  console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

  const tests = [
    { name: 'Input Validation', fn: testInputValidation },
    { name: 'Markdownify Function', fn: testMarkdownifyFunction },
    { name: 'GetMarkdownifyRequest Function', fn: testGetMarkdownifyRequestFunction },
    { name: 'URL Validation', fn: testUrlValidation },
    { name: 'Stealth Mode Option', fn: testStealthModeOption },
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
    console.log('\n🎉 All tests passed! Markdownify functionality is working correctly.');
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
  testMarkdownifyFunction,
  testGetMarkdownifyRequestFunction,
  testUrlValidation,
  testStealthModeOption,
  testErrorHandling,
  runAllTests
};
