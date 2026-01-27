# 🌐 ScrapeGraph JavaScript SDK

[![npm version](https://badge.fury.io/js/scrapegraph-js.svg)](https://badge.fury.io/js/scrapegraph-js) [![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT) [![Documentation Status](https://img.shields.io/badge/docs-latest-brightgreen.svg)](https://docs.scrapegraphai.com)

<p align="left">
  <img src="https://raw.githubusercontent.com/VinciGit00/Scrapegraph-ai/main/docs/assets/api-banner.png" alt="ScrapeGraph API Banner" style="width: 70%;">
</p>

Official JavaScript/TypeScript SDK for the ScrapeGraph AI API - Smart web scraping powered by AI.

## 🚀 Features

- ✨ Smart web scraping with AI
- 🔄 Fully asynchronous design
- 🔍 Detailed error handling
- ⚡ Automatic retries and logging
- 🔐 Secure API authentication
- 🔧 AI-powered schema generation
- 🤖 Agentic scraping with browser automation
- 📅 Scheduled jobs with cron support
- 🥷 Stealth mode to avoid bot detection
- 🧪 Mock mode for testing and development
- 🎨 Toonify for visual data representation
- 🍪 Cookie support for authenticated scraping
- 📜 Infinite scroll and pagination support
- 🗺️ Sitemap discovery and crawling

## 📦 Installation

Install the package using npm or yarn:

```bash
# Using npm
npm i scrapegraph-js

# Using yarn
yarn add scrapegraph-js
```

## 🔧 Quick Start

> **Note**: Store your API keys securely in environment variables. Use `.env` files and libraries like `dotenv` to load them into your app.

### Basic Example

```javascript
import { smartScraper } from 'scrapegraph-js';
import 'dotenv/config';

// Initialize variables
const apiKey = process.env.SGAI_APIKEY; // Set your API key as an environment variable
const websiteUrl = 'https://example.com';
const prompt = 'What does the company do?';

(async () => {
  try {
    const response = await smartScraper(apiKey, websiteUrl, prompt);
    console.log(response.result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

## 🎯 Examples

### Scrape - Get HTML Content

#### Basic Scrape

```javascript
import { scrape } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const url = 'https://example.com';

(async () => {
  try {
    const response = await scrape(apiKey, url);
    console.log('HTML content:', response.html);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

#### Scrape with Heavy JavaScript Rendering

```javascript
import { scrape } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const url = 'https://example.com';

(async () => {
  try {
    const response = await scrape(apiKey, url, {
      renderHeavyJs: true
    });
    console.log('HTML content with JS rendering:', response.html);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

#### Scrape with Custom Headers

```javascript
import { scrape } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const url = 'https://example.com';

(async () => {
  try {
    const response = await scrape(apiKey, url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': 'session=123'
      }
    });
    console.log('HTML content with custom headers:', response.html);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

#### Get Scrape Request Status

```javascript
import { getScrapeRequest } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const requestId = 'your-request-id';

(async () => {
  try {
    const response = await getScrapeRequest(apiKey, requestId);
    console.log('Request status:', response.status);
    if (response.status === 'completed') {
      console.log('HTML content:', response.html);
    }
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

### Scraping Websites

#### Basic Scraping

```javascript
import { smartScraper } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const url = 'https://example.com';
const prompt = 'Extract the main heading and description.';

(async () => {
  try {
    const response = await smartScraper(apiKey, url, prompt);
    console.log(response.result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

#### Scraping with Custom Output Schema

> [!NOTE]
> To use this feature, it is necessary to employ the [Zod](https://www.npmjs.com/package/zod) package for schema creation.

Here is a real-world example:

```javascript
import { smartScraper } from 'scrapegraph-js';
import { z } from 'zod';

const apiKey = 'your-api-key';
const url = 'https://scrapegraphai.com/';
const prompt = 'What does the company do? and ';

const schema = z.object({
  title: z.string().describe('The title of the webpage'),
  description: z.string().describe('The description of the webpage'),
  summary: z.string().describe('A brief summary of the webpage'),
});

(async () => {
  try {
    const response = await smartScraper(apiKey, url, prompt, schema);
    console.log(response.result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

#### Scraping with Infinite Scrolling

For websites that load content dynamically through infinite scrolling (like social media feeds), you can use the `numberOfScrolls` parameter:

```javascript
import { smartScraper } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const url = 'https://example.com/infinite-scroll-page';
const prompt = 'Extract all the posts from the feed';
const numberOfScrolls = 10; // Will scroll 10 times to load more content

(async () => {
  try {
    const response = await smartScraper(apiKey, url, prompt, null, numberOfScrolls);
    console.log('Extracted data from scrolled page:', response);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

The `numberOfScrolls` parameter accepts values between 0 and 100, allowing you to control how many times the page should be scrolled before extraction.

#### Scraping with Cookies

Use cookies for authentication and session management when scraping websites that require login or have user-specific content:

```javascript
import { smartScraper } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const url = 'https://example.com/dashboard';
const prompt = 'Extract user profile information';

// Define cookies for authentication
const cookies = {
  session_id: '<SESSION_ID>',
  auth_token: '<JWT_TOKEN>',
  user_preferences: '<USER_PREFERENCES>'
};

(async () => {
  try {
    const response = await smartScraper(apiKey, url, prompt, null, null, null, cookies);
    console.log(response.result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

**Common Use Cases:**
- **E-commerce sites**: User authentication, shopping cart persistence
- **Social media**: Session management, user preferences
- **Banking/Financial**: Secure authentication, transaction history
- **News sites**: User preferences, subscription content
- **API endpoints**: Authentication tokens, API keys

#### Advanced Scraping with Cookies, Scrolling, and Pagination

Combine cookies with infinite scrolling and pagination for comprehensive data extraction:

```javascript
import { smartScraper } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const url = 'https://example.com/feed';
const prompt = 'Extract all posts from the feed';
const cookies = { session_token: 'xyz789abc123' };
const numberOfScrolls = 10; // Scroll 10 times
const totalPages = 5; // Scrape 5 pages

(async () => {
  try {
    const response = await smartScraper(apiKey, url, prompt, null, numberOfScrolls, totalPages, cookies);
    console.log('Extracted data:', response);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

### Agentic Scraper

Perform automated browser actions on webpages using step-by-step instructions. Perfect for interacting with dynamic websites, filling forms, clicking buttons, and extracting data after performing actions.

#### Basic Agentic Scraping (No AI Extraction)

```javascript
import { agenticScraper } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const url = 'https://dashboard.example.com/';
const steps = [
  'Type email@gmail.com in email input box',
  'Type password123 in password inputbox',
  'Click on login button'
];

(async () => {
  try {
    const response = await agenticScraper(
      apiKey,
      url,
      steps,
      true,   // useSession
      null,   // userPrompt (not needed for basic scraping)
      null,   // outputSchema (not needed for basic scraping)
      false   // aiExtraction = false
    );
    
    console.log('Request ID:', response.request_id);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

#### Agentic Scraping with AI Extraction

Extract structured data after performing browser actions:

```javascript
import { agenticScraper } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const url = 'https://dashboard.example.com/';
const steps = [
  'Type email@gmail.com in email input box',
  'Type password123 in password inputbox',
  'Click on login button',
  'Wait for dashboard to load completely'
];

const outputSchema = {
  dashboard_info: {
    type: "object",
    properties: {
      username: { type: "string" },
      email: { type: "string" },
      available_sections: { 
        type: "array", 
        items: { type: "string" } 
      },
      credits_remaining: { type: "number" }
    },
    required: ["username", "available_sections"]
  }
};

const userPrompt = "Extract the user's dashboard information including username, email, available dashboard sections, and remaining credits";

(async () => {
  try {
    const response = await agenticScraper(
      apiKey,
      url,
      steps,
      true,        // useSession
      userPrompt,  // userPrompt for AI extraction
      outputSchema, // outputSchema for structured data
      true         // aiExtraction = true
    );
    
    console.log('Request ID:', response.request_id);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

#### Get Agentic Scraper Request Status

```javascript
import { getAgenticScraperRequest } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const requestId = 'your-request-id';

(async () => {
  try {
    const response = await getAgenticScraperRequest(apiKey, requestId);
    console.log('Status:', response.status);
    if (response.status === 'completed') {
      console.log('Result:', response.result);
    }
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

### Search Scraping

Search and extract information from multiple web sources using AI.

```javascript
import { searchScraper } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const prompt = 'What is the latest version of Python and what are its main features?';

(async () => {
  try {
    const response = await searchScraper(apiKey, prompt);
    console.log(response.result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

#### Geo-Targeted Search

Use `locationGeoCode` to target search results from a specific geographic location:

```javascript
import { searchScraper } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const prompt = 'Best restaurants near me';

(async () => {
  try {
    const response = await searchScraper(apiKey, prompt, 5, null, null, {
      locationGeoCode: 'us' // Search results targeted to United States
    });
    console.log(response.result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

### Crawl API

Start a crawl job to extract structured data from a website and its linked pages, using a custom schema.

```javascript
import { crawl, getCrawlRequest } from 'scrapegraph-js';
import 'dotenv/config';

const apiKey = process.env.SGAI_APIKEY;
const url = 'https://scrapegraphai.com/';
const prompt = 'What does the company do? and I need text content from there privacy and terms';

const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ScrapeGraphAI Website Content",
  "type": "object",
  "properties": {
    "company": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "description": { "type": "string" },
        "features": { "type": "array", "items": { "type": "string" } },
        "contact_email": { "type": "string", "format": "email" },
        "social_links": {
          "type": "object",
          "properties": {
            "github": { "type": "string", "format": "uri" },
            "linkedin": { "type": "string", "format": "uri" },
            "twitter": { "type": "string", "format": "uri" }
          },
          "additionalProperties": false
        }
      },
      "required": ["name", "description"]
    },
    "services": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "service_name": { "type": "string" },
          "description": { "type": "string" },
          "features": { "type": "array", "items": { "type": "string" } }
        },
        "required": ["service_name", "description"]
      }
    },
    "legal": {
      "type": "object",
      "properties": {
        "privacy_policy": { "type": "string" },
        "terms_of_service": { "type": "string" }
      },
      "required": ["privacy_policy", "terms_of_service"]
    }
  },
  "required": ["company", "services", "legal"]
};

(async () => {
  try {
    // Start the crawl job
    const crawlResponse = await crawl(apiKey, url, prompt, schema, {
      cacheWebsite: true,
      depth: 2,
      maxPages: 2,
      sameDomainOnly: true,
      sitemap: true, // Use sitemap for better page discovery
      batchSize: 1,
    });
    console.log('Crawl job started. Response:', crawlResponse);

    // If the crawl is asynchronous and returns an ID, fetch the result
    const crawlId = crawlResponse.id || crawlResponse.task_id;
    if (crawlId) {
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const result = await getCrawlRequest(apiKey, crawlId);
        if (result.status === 'success' && result.result) {
          console.log('Crawl completed. Result:', result.result.llm_result);
          break;
        } else if (result.status === 'failed') {
          console.log('Crawl failed. Result:', result);
          break;
        } else {
          console.log(`Status: ${result.status}, waiting...`);
        }
      }
    } else {
      console.log('No crawl ID found in response. Synchronous result:', crawlResponse);
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
})();
```

You can use a plain JSON schema or a [Zod](https://www.npmjs.com/package/zod) schema for the `schema` parameter. The crawl API supports options for crawl depth, max pages, domain restriction, sitemap discovery, and batch size.

**Sitemap Benefits:**
- Better page discovery using sitemap.xml
- More comprehensive website coverage
- Efficient crawling of structured websites
- Perfect for e-commerce, news sites, and content-heavy websites


### Markdownify

Converts a webpage into clean, well-structured markdown format.

```javascript
import { markdownify } from 'scrapegraph-js';

const apiKey = 'your_api_key';
const url = 'https://scrapegraphai.com/';

(async () => {
  try {
    const response = await markdownify(apiKey, url);
    console.log(response);
  } catch (error) {
    console.error(error);
  }
})();
```

### Sitemap

Extract all URLs from a website's sitemap. Automatically discovers sitemap from robots.txt or common sitemap locations.

```javascript
import { sitemap } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const websiteUrl = 'https://example.com';

(async () => {
  try {
    const response = await sitemap(apiKey, websiteUrl);
    console.log('Total URLs found:', response.urls.length);
    console.log('URLs:', response.urls);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

### Checking API Credits

```javascript
import { getCredits } from 'scrapegraph-js';

const apiKey = 'your-api-key';

(async () => {
  try {
    const credits = await getCredits(apiKey);
    console.log('Available credits:', credits);
  } catch (error) {
    console.error('Error fetching credits:', error);
  }
})();
```

### Submitting Feedback

```javascript
import { sendFeedback } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const requestId = '16a63a80-c87f-4cde-b005-e6c3ecda278b';
const rating = 5;
const feedbackText = 'This is a test feedback message.';

(async () => {
  try {
    const response = await sendFeedback(apiKey, requestId, rating, feedbackText);
    console.log('Feedback response:', response);
  } catch (error) {
    console.error('Error sending feedback:', error);
  }
})();
```

### Scheduled Jobs

Create and manage scheduled scraping jobs that run automatically on a cron schedule. Perfect for monitoring websites, collecting data periodically, and automating repetitive scraping tasks.

#### Create a Scheduled Job

```javascript
import { createScheduledJob } from 'scrapegraph-js';

const apiKey = 'your-api-key';

(async () => {
  try {
    const job = await createScheduledJob(
      apiKey,
      'Daily News Scraper',        // jobName
      'smartscraper',               // serviceType
      '0 9 * * *',                  // cronExpression (daily at 9 AM)
      {
        website_url: 'https://news.ycombinator.com',
        user_prompt: 'Extract the top 5 news titles and their URLs',
        render_heavy_js: false
      },
      true                          // isActive
    );
    
    console.log('Job created:', job.id);
    console.log('Job name:', job.job_name);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

#### List All Scheduled Jobs

```javascript
import { getScheduledJobs } from 'scrapegraph-js';

const apiKey = 'your-api-key';

(async () => {
  try {
    const response = await getScheduledJobs(apiKey, { page: 1, pageSize: 10 });
    console.log('Total jobs:', response.total);
    
    response.jobs.forEach(job => {
      console.log(`- ${job.job_name} (${job.service_type}) - Active: ${job.is_active}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

#### Get, Update, Pause, Resume, and Delete Jobs

```javascript
import {
  getScheduledJob,
  updateScheduledJob,
  pauseScheduledJob,
  resumeScheduledJob,
  deleteScheduledJob,
  triggerScheduledJob,
  getJobExecutions
} from 'scrapegraph-js';

const apiKey = 'your-api-key';
const jobId = 'your-job-id';

(async () => {
  try {
    // Get job details
    const job = await getScheduledJob(apiKey, jobId);
    console.log('Job details:', job);
    
    // Update job
    const updated = await updateScheduledJob(apiKey, jobId, {
      jobName: 'Updated Job Name',
      cronExpression: '0 8 * * *' // Change to 8 AM
    });
    console.log('Updated job:', updated);
    
    // Pause job
    await pauseScheduledJob(apiKey, jobId);
    
    // Resume job
    await resumeScheduledJob(apiKey, jobId);
    
    // Manually trigger job
    const triggerResult = await triggerScheduledJob(apiKey, jobId);
    console.log('Execution ID:', triggerResult.execution_id);
    
    // Get execution history
    const executions = await getJobExecutions(apiKey, jobId, { page: 1, pageSize: 10 });
    console.log('Total executions:', executions.total);
    
    // Delete job
    await deleteScheduledJob(apiKey, jobId);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

**Supported Service Types:**
- `smartscraper` - Smart scraping with AI extraction
- `searchscraper` - Search-based scraping
- `crawl` - Website crawling
- `markdownify` - Markdown conversion
- `scrape` - Basic HTML scraping

**Cron Expression Format:**
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

Examples:
- `0 9 * * *` - Daily at 9 AM
- `0 10 * * 1` - Every Monday at 10 AM
- `*/15 * * * *` - Every 15 minutes
- `0 0 1 * *` - First day of every month at midnight

### Toonify

Convert structured data into a visual "toon" format. Useful for creating visual representations of scraped data.

```javascript
import { toonify } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const data = {
  products: [
    { sku: "LAP-001", name: "Gaming Laptop", price: 1299.99 },
    { sku: "MOU-042", name: "Wireless Mouse", price: 29.99 }
  ]
};

(async () => {
  try {
    const result = await toonify(apiKey, data);
    console.log('Toonified result:', result);
  } catch (error) {
    console.error('Error toonifying data:', error);
  }
})();
```

### Stealth Mode

Enable stealth mode to avoid bot detection when scraping websites. Stealth mode uses advanced techniques to make requests appear more like those from a real browser.

#### Using Stealth Mode with SmartScraper

```javascript
import { smartScraper } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const url = 'https://example.com';
const prompt = 'Extract product information';

(async () => {
  try {
    const response = await smartScraper(
      apiKey,
      url,
      prompt,
      null,   // schema
      null,   // numberOfScrolls
      null,   // totalPages
      null,   // cookies
      {},     // options
      false,  // plain_text
      false,  // renderHeavyJs
      true    // stealth - Enable stealth mode
    );
    
    console.log('Result:', response.result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

#### Using Stealth Mode with Other Endpoints

Stealth mode is available for all major endpoints:

```javascript
import { scrape, searchScraper, markdownify, agenticScraper, crawl } from 'scrapegraph-js';

const apiKey = 'your-api-key';

// Scrape with stealth mode
const scrapeResult = await scrape(apiKey, 'https://example.com', {
  stealth: true,
  renderHeavyJs: true
});

// SearchScraper with stealth mode
const searchResult = await searchScraper(apiKey, 'Search query', 5, null, null, {
  stealth: true,
  extractionMode: true
});

// Markdownify with stealth mode
const markdownResult = await markdownify(apiKey, 'https://example.com', {
  stealth: true
});

// AgenticScraper with stealth mode
const agenticResult = await agenticScraper(apiKey, 'https://example.com', ['click button'], true, null, null, false, {
  stealth: true
});

// Crawl with stealth mode
const crawlResult = await crawl(apiKey, 'https://example.com', 'Extract data', schema, {
  stealth: true,
  depth: 2,
  maxPages: 5
});
```

### Mock Mode

Mock mode allows you to test your code without making actual API calls. Perfect for development, testing, and CI/CD pipelines.

#### Enable Mock Mode Globally

```javascript
import { enableMock, disableMock, getCredits, smartScraper } from 'scrapegraph-js';

// Enable mock mode globally
enableMock();

const apiKey = 'mock-api-key';

(async () => {
  try {
    // All API calls will return mock responses
    const credits = await getCredits(apiKey);
    console.log('Mock credits:', credits);
    
    const result = await smartScraper(apiKey, 'https://example.com', 'Extract data');
    console.log('Mock result:', result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Disable mock mode when done
    disableMock();
  }
})();
```

#### Per-Request Mock Mode

```javascript
import { scrape, smartScraper } from 'scrapegraph-js';

const apiKey = 'your-api-key';

(async () => {
  try {
    // Enable mock for specific requests
    const result = await scrape(apiKey, 'https://example.com', { mock: true });
    console.log('Mock scrape result:', result);
    
    const smartResult = await smartScraper(apiKey, 'https://example.com', 'Test', null, null, null, null, { mock: true });
    console.log('Mock smartScraper result:', smartResult);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

#### Custom Mock Responses

```javascript
import { setMockResponses, getCredits, smartScraper, enableMock } from 'scrapegraph-js';

enableMock();

// Set custom mock responses
setMockResponses({
  '/v1/credits': {
    remaining_credits: 1000,
    total_credits_used: 500
  },
  '/v1/smartscraper': () => ({
    request_id: 'custom-mock-id',
    status: 'completed',
    result: { custom_data: 'Generated by custom function' }
  })
});

const apiKey = 'mock-api-key';

(async () => {
  try {
    const credits = await getCredits(apiKey);
    console.log('Custom credits:', credits);
    
    const result = await smartScraper(apiKey, 'https://example.com', 'Test');
    console.log('Custom result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

#### Environment Variable Activation

You can also enable mock mode using the `SGAI_MOCK` environment variable:

```bash
export SGAI_MOCK=1
node your-script.js
```

Or in your `.env` file:
```
SGAI_MOCK=1
```

### AI-Powered Schema Generation

Generate JSON schemas from natural language prompts using AI. This feature helps you create structured data schemas for web scraping and data extraction.

#### Basic Schema Generation

```javascript
import { generateSchema } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const prompt = 'Find laptops with specifications like brand, processor, RAM, storage, and price';

(async () => {
  try {
    const response = await generateSchema(prompt, null, { apiKey });
    console.log('Generated schema:', response.generated_schema);
    console.log('Request ID:', response.request_id);
  } catch (error) {
    console.error('Error generating schema:', error);
  }
})();
```

#### Modifying Existing Schemas

```javascript
import { generateSchema } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const existingSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    price: { type: 'number' }
  },
  required: ['name', 'price']
};

const modificationPrompt = 'Add brand and rating fields to the existing schema';

(async () => {
  try {
    const response = await generateSchema(modificationPrompt, existingSchema, { apiKey });
    console.log('Modified schema:', response.generated_schema);
  } catch (error) {
    console.error('Error modifying schema:', error);
  }
})();
```

#### Checking Schema Generation Status

```javascript
import { getSchemaStatus } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const requestId = '123e4567-e89b-12d3-a456-426614174000';

(async () => {
  try {
    const response = await getSchemaStatus(requestId, { apiKey });
    console.log('Status:', response.status);
    if (response.status === 'completed') {
      console.log('Generated schema:', response.generated_schema);
    }
  } catch (error) {
    console.error('Error checking status:', error);
  }
})();
```

#### Polling for Completion with Progress Tracking

```javascript
import { pollSchemaGeneration } from 'scrapegraph-js';

const apiKey = 'your-api-key';
const requestId = '123e4567-e89b-12d3-a456-426614174000';

(async () => {
  try {
    const finalResult = await pollSchemaGeneration(requestId, {
      apiKey,
      maxAttempts: 15,
      delay: 3000,
      onProgress: ({ attempt, maxAttempts, status, response }) => {
        if (status === 'checking') {
          console.log(`Checking status... (${attempt}/${maxAttempts})`);
        } else {
          console.log(`Status: ${status} (${attempt}/${maxAttempts})`);
        }
      }
    });
    
    console.log('Schema generation completed!');
    console.log('Final schema:', finalResult.generated_schema);
  } catch (error) {
    console.error('Error during polling:', error);
  }
})();
```

## 🔧 Available Functions

### Scrape

#### `scrape(apiKey, url, options)`

Converts a webpage into HTML format with optional JavaScript rendering.

**Parameters:**
- `apiKey` (string): Your ScrapeGraph AI API key
- `url` (string): The URL of the webpage to convert
- `options` (object, optional): Configuration options
  - `renderHeavyJs` (boolean, optional): Whether to render heavy JavaScript (default: false)
  - `headers` (object, optional): Custom headers to send with the request
  - `stealth` (boolean, optional): Enable stealth mode to avoid bot detection (default: false)
  - `mock` (boolean, optional): Override mock mode for this request

**Returns:** Promise that resolves to an object containing:
- `html`: The HTML content of the webpage
- `status`: Request status ('completed', 'processing', 'failed')
- `scrape_request_id`: Unique identifier for the request
- `error`: Error message if the request failed

**Example:**
```javascript
const response = await scrape(apiKey, 'https://example.com', {
  renderHeavyJs: true,
  headers: { 'User-Agent': 'Custom Agent' },
  stealth: true
});
```

#### `getScrapeRequest(apiKey, requestId)`

Retrieves the status or result of a previous scrape request.

**Parameters:**
- `apiKey` (string): Your ScrapeGraph AI API key
- `requestId` (string): The unique identifier for the scrape request

**Returns:** Promise that resolves to the request result object.

**Example:**
```javascript
const result = await getScrapeRequest(apiKey, 'request-id-here');
```

### Smart Scraper

#### `smartScraper(apiKey, url, prompt, schema, numberOfScrolls, totalPages, cookies, options, plainText, renderHeavyJs, stealth)`

Extracts structured data from websites using AI-powered scraping.

**Parameters:**
- `apiKey` (string): Your ScrapeGraph AI API key
- `url` (string): The URL of the website to scrape
- `prompt` (string): Natural language prompt describing what to extract
- `schema` (object, optional): Zod schema for structured output
- `numberOfScrolls` (number, optional): Number of scrolls for infinite scroll pages (0-100)
- `totalPages` (number, optional): Number of pages to scrape
- `cookies` (object, optional): Cookies for authentication
- `options` (object, optional): Additional options
  - `mock` (boolean): Override mock mode for this request
- `plainText` (boolean, optional): Whether to return plain text instead of structured data
- `renderHeavyJs` (boolean, optional): Whether to render heavy JavaScript (default: false)
- `stealth` (boolean, optional): Enable stealth mode to avoid bot detection (default: false)

**Returns:** Promise that resolves to an object containing:
- `result`: Extracted data (structured or plain text)
- `request_id`: Unique identifier for the request
- `status`: Request status

### Search Scraper

#### `searchScraper(apiKey, prompt, numResults, schema, userAgent, options)`

Searches and extracts information from multiple web sources using AI.

**Parameters:**
- `apiKey` (string): Your ScrapeGraph AI API key
- `prompt` (string): Search query or prompt
- `numResults` (number, optional): Number of results to return
- `schema` (object, optional): Schema for structured output
- `userAgent` (string, optional): Custom user agent string
- `options` (object, optional): Additional options
  - `stealth` (boolean): Enable stealth mode
  - `extractionMode` (boolean): Whether to use AI extraction
  - `renderHeavyJs` (boolean): Whether to render heavy JavaScript
  - `locationGeoCode` (string): The geo code of the location to search in (e.g., "us", "gb", "de")
  - `mock` (boolean): Override mock mode for this request

**Returns:** Promise that resolves to an object containing:
- `result`: Extracted search results
- `request_id`: Unique identifier for the request
- `status`: Request status
- `reference_urls`: Array of URLs used for the search

### Crawl API

#### `crawl(apiKey, url, prompt, dataSchema, options)`

Starts a crawl job to extract structured data from a website and its linked pages.

**Parameters:**
- `apiKey` (string): Your ScrapeGraph AI API key
- `url` (string): The starting URL for the crawl
- `prompt` (string): AI prompt to guide data extraction (required for AI mode)
- `dataSchema` (object): JSON schema defining extracted data structure (required for AI mode)
- `options` (object): Optional crawl parameters
  - `extractionMode` (boolean, default: true): true for AI extraction, false for markdown conversion
  - `cacheWebsite` (boolean, default: true): Whether to cache website content
  - `depth` (number, default: 2): Maximum crawl depth (1-10)
  - `maxPages` (number, default: 2): Maximum pages to crawl (1-100)
  - `sameDomainOnly` (boolean, default: true): Only crawl pages from the same domain
  - `sitemap` (boolean, default: false): Use sitemap.xml for better page discovery
  - `batchSize` (number, default: 1): Batch size for processing pages (1-10)
  - `renderHeavyJs` (boolean, default: false): Whether to render heavy JavaScript
  - `stealth` (boolean, default: false): Enable stealth mode to avoid bot detection
  - `mock` (boolean): Override mock mode for this request

**Returns:** Promise that resolves to an object containing:
- `id` or `crawl_id`: Unique identifier for the crawl job
- `status`: Crawl status
- `message`: Status message

**Sitemap Benefits:**
- Better page discovery using sitemap.xml
- More comprehensive website coverage
- Efficient crawling of structured websites
- Perfect for e-commerce, news sites, and content-heavy websites

#### `getCrawlRequest(apiKey, crawlId)`

Retrieves the status or result of a previous crawl request.

**Parameters:**
- `apiKey` (string): Your ScrapeGraph AI API key
- `crawlId` (string): The unique identifier for the crawl request

**Returns:** Promise that resolves to the crawl result object.

### Markdownify

#### `markdownify(apiKey, url, options)`

Converts a webpage into clean, well-structured markdown format.

**Parameters:**
- `apiKey` (string): Your ScrapeGraph AI API key
- `url` (string): The URL of the webpage to convert
- `options` (object, optional): Configuration options
  - `stealth` (boolean): Enable stealth mode
  - `renderHeavyJs` (boolean): Whether to render heavy JavaScript
  - `mock` (boolean): Override mock mode for this request

**Returns:** Promise that resolves to an object containing:
- `result`: Markdown content
- `request_id`: Unique identifier for the request
- `status`: Request status

#### `getMarkdownifyRequest(apiKey, requestId)`

Retrieves the status or result of a previous markdownify request.

### Sitemap

#### `sitemap(apiKey, websiteUrl, options)`

Extracts all URLs from a website's sitemap. Automatically discovers sitemap from robots.txt or common sitemap locations.

**Parameters:**
- `apiKey` (string): Your ScrapeGraph AI API key
- `websiteUrl` (string): The URL of the website to extract sitemap from
- `options` (object, optional): Additional options
  - `mock` (boolean): Override mock mode for this request

**Returns:** Promise resolving to an object containing:
- `urls` (array): List of URLs extracted from the sitemap
- `sitemap_url`: The sitemap URL that was used

### Agentic Scraper

#### `agenticScraper(apiKey, url, steps, useSession, userPrompt, outputSchema, aiExtraction, options)`

Performs automated actions on webpages using step-by-step instructions.

**Parameters:**
- `apiKey` (string): Your ScrapeGraph AI API key
- `url` (string): The URL of the webpage to interact with
- `steps` (string[]): Array of step-by-step instructions (e.g., ["Type email@gmail.com in email input box", "click on login"])
- `useSession` (boolean, optional): Whether to use session for the scraping operations (default: true)
- `userPrompt` (string, optional): Prompt for AI extraction (required when aiExtraction=true)
- `outputSchema` (object, optional): Schema for structured data extraction (used with aiExtraction=true)
- `aiExtraction` (boolean, optional): Whether to use AI for data extraction from the scraped content (default: false)
- `options` (object, optional): Additional options
  - `mock` (boolean): Override mock mode for this request
  - `renderHeavyJs` (boolean): Whether to render heavy JavaScript on the page
  - `stealth` (boolean): Enable stealth mode to avoid bot detection

**Returns:** Promise that resolves to an object containing:
- `request_id`: Unique identifier for the request
- `status`: Request status ('processing', 'completed', 'failed')

**Example:**
```javascript
const response = await agenticScraper(
  apiKey,
  'https://example.com',
  ['Type text in input', 'Click submit'],
  true,
  'Extract form data',
  schema,
  true,
  { stealth: true }
);
```

#### `getAgenticScraperRequest(apiKey, requestId)`

Retrieves the status or result of a previous agentic scraper request.

**Parameters:**
- `apiKey` (string): Your ScrapeGraph AI API key
- `requestId` (string): The unique identifier for the agentic scraper request

**Returns:** Promise that resolves to the request result object.

### Scheduled Jobs

#### `createScheduledJob(apiKey, jobName, serviceType, cronExpression, jobConfig, isActive, options)`

Creates a new scheduled job that runs automatically on a cron schedule.

**Parameters:**
- `apiKey` (string): Your ScrapeGraph AI API key
- `jobName` (string): Name of the scheduled job
- `serviceType` (string): Type of service ('smartscraper', 'searchscraper', 'crawl', 'markdownify', 'scrape')
- `cronExpression` (string): Cron expression for scheduling (e.g., '0 9 * * *' for daily at 9 AM)
- `jobConfig` (object): Configuration for the job (service-specific)
- `isActive` (boolean, optional): Whether the job is active (default: true)
- `options` (object, optional): Additional options
  - `mock` (boolean): Override mock mode for this request

**Returns:** Promise that resolves to the created job object.

#### `getScheduledJobs(apiKey, options)`

Retrieves a list of all scheduled jobs.

**Parameters:**
- `apiKey` (string): Your ScrapeGraph AI API key
- `options` (object, optional): Query options
  - `page` (number): Page number (default: 1)
  - `pageSize` (number): Number of jobs per page (default: 10)

**Returns:** Promise that resolves to an object containing:
- `jobs`: Array of job objects
- `total`: Total number of jobs

#### `getScheduledJob(apiKey, jobId)`

Retrieves details of a specific scheduled job.

#### `updateScheduledJob(apiKey, jobId, updates)`

Updates a scheduled job.

**Parameters:**
- `updates` (object): Fields to update
  - `jobName` (string, optional): New job name
  - `cronExpression` (string, optional): New cron expression
  - `jobConfig` (object, optional): Updated job configuration
  - `isActive` (boolean, optional): Active status

#### `pauseScheduledJob(apiKey, jobId)`

Pauses a scheduled job.

#### `resumeScheduledJob(apiKey, jobId)`

Resumes a paused scheduled job.

#### `triggerScheduledJob(apiKey, jobId)`

Manually triggers a scheduled job execution.

**Returns:** Promise that resolves to an object containing:
- `execution_id`: Unique identifier for the execution
- `message`: Status message

#### `getJobExecutions(apiKey, jobId, options)`

Retrieves execution history for a scheduled job.

**Parameters:**
- `options` (object, optional): Query options
  - `page` (number): Page number (default: 1)
  - `pageSize` (number): Number of executions per page (default: 10)

**Returns:** Promise that resolves to an object containing:
- `executions`: Array of execution objects
- `total`: Total number of executions

#### `deleteScheduledJob(apiKey, jobId)`

Deletes a scheduled job.

### Toonify

#### `toonify(apiKey, data, options)`

Converts structured data into a visual "toon" format.

**Parameters:**
- `apiKey` (string): Your ScrapeGraph AI API key
- `data` (object): The data object to be converted to toon format
- `options` (object, optional): Configuration options
  - `mock` (boolean): Override mock mode for this request

**Returns:** Promise that resolves to the toonified data response.

### Mock Mode Utilities

#### `enableMock()`

Enables mock mode globally. All API calls will return mock responses.

#### `disableMock()`

Disables mock mode globally.

#### `setMockResponses(responses)`

Sets custom mock responses for specific endpoints.

**Parameters:**
- `responses` (object): Object mapping endpoint paths to mock responses or functions that return mock responses

**Example:**
```javascript
setMockResponses({
  '/v1/credits': { remaining_credits: 100 },
  '/v1/smartscraper': () => ({ request_id: 'mock-id', status: 'completed' })
});
```

#### `setMockHandler(handler)`

Sets a custom handler function that overrides all mock responses.

**Parameters:**
- `handler` (function): Function that takes (method, url) and returns a mock response

#### `isMockEnabled()`

Checks if mock mode is currently enabled.

**Returns:** Boolean indicating mock mode status.

### Utility Functions

#### `getCredits(apiKey)`

Retrieves your current credit balance and usage statistics.

**Returns:** Promise that resolves to an object containing:
- `remaining_credits`: Number of credits remaining
- `total_credits_used`: Total credits used

#### `sendFeedback(apiKey, requestId, rating, feedbackText)`

Submits feedback for a specific request.

**Parameters:**
- `apiKey` (string): Your ScrapeGraph AI API key
- `requestId` (string): The request ID to provide feedback for
- `rating` (number): Rating from 1 to 5
- `feedbackText` (string): Optional feedback text

**Returns:** Promise that resolves to the feedback response.

## 📚 Documentation

For detailed documentation, visit [docs.scrapegraphai.com](https://docs.scrapegraphai.com)

## 🛠️ Development

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/ScrapeGraphAI/scrapegraph-sdk.git
   cd scrapegraph-sdk/scrapegraph-js
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run linting and testing:
   ```bash
   npm run lint
   npm test
   ```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🔗 Links

- [Website](https://scrapegraphai.com)
- [Documentation](https://docs.scrapegraphai.com)
- [GitHub](https://github.com/ScrapeGraphAI/scrapegraph-sdk)

## 💬 Support

- 📧 Email: support@scrapegraphai.com
- 💻 GitHub Issues: [Create an issue](https://github.com/ScrapeGraphAI/scrapegraph-sdk/issues)
- 🌟 Feature Requests: [Request a feature](https://github.com/ScrapeGraphAI/scrapegraph-sdk/issues/new)

---

Made with ❤️ by [ScrapeGraph AI](https://scrapegraphai.com)
