# ScrapeGraph JS SDK

[![npm version](https://badge.fury.io/js/scrapegraph-js.svg)](https://badge.fury.io/js/scrapegraph-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<p align="left">
  <img src="https://raw.githubusercontent.com/VinciGit00/Scrapegraph-ai/main/docs/assets/api-banner.png" alt="ScrapeGraph API Banner" style="width: 70%;">
</p>

Official TypeScript SDK for the [ScrapeGraph AI API](https://scrapegraphai.com). Zero dependencies.

## Install

```bash
npm i scrapegraph-js
# or
bun add scrapegraph-js
```

## Quick Start

```ts
import { smartScraper } from "scrapegraph-js";

const result = await smartScraper("your-api-key", {
  user_prompt: "Extract the page title and description",
  website_url: "https://example.com",
});

if (result.status === "success") {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

Every function returns `ApiResult<T>` — no exceptions to catch:

```ts
type ApiResult<T> = {
  status: "success" | "error";
  data: T | null;
  error?: string;
  elapsedMs: number;
};
```

## API

All functions take `(apiKey, params)` where `params` is a typed object.

### smartScraper

Extract structured data from a webpage using AI.

```ts
const res = await smartScraper("key", {
  user_prompt: "Extract product names and prices",
  website_url: "https://example.com",
  output_schema: { /* JSON schema */ },  // optional
  number_of_scrolls: 5,                  // optional, 0-50
  total_pages: 3,                        // optional, 1-100
  stealth: true,                         // optional, +4 credits
  cookies: { session: "abc" },           // optional
  headers: { "Accept-Language": "en" },  // optional
  steps: ["Click 'Load More'"],          // optional, browser actions
  wait_ms: 5000,                         // optional, default 3000
  country_code: "us",                    // optional, proxy routing
  mock: true,                            // optional, testing mode
});
```

### searchScraper

Search the web and extract structured results.

```ts
const res = await searchScraper("key", {
  user_prompt: "Latest TypeScript release features",
  num_results: 5,                  // optional, 3-20
  extraction_mode: true,           // optional, false for markdown
  output_schema: { /* */ },        // optional
  stealth: true,                   // optional, +4 credits
  time_range: "past_week",        // optional, past_hour|past_24_hours|past_week|past_month|past_year
  location_geo_code: "us",        // optional, geographic targeting
  mock: true,                      // optional, testing mode
});
// res.data.result (extraction mode) or res.data.markdown_content (markdown mode)
```

### markdownify

Convert a webpage to clean markdown.

```ts
const res = await markdownify("key", {
  website_url: "https://example.com",
  stealth: true,         // optional, +4 credits
  wait_ms: 5000,         // optional, default 3000
  country_code: "us",    // optional, proxy routing
  mock: true,            // optional, testing mode
});
// res.data.result is the markdown string
```

### scrape

Get raw HTML from a webpage.

```ts
const res = await scrape("key", {
  website_url: "https://example.com",
  stealth: true,       // optional, +4 credits
  branding: true,      // optional, extract brand design
  country_code: "us",  // optional, proxy routing
  wait_ms: 5000,       // optional, default 3000
});
// res.data.html is the HTML string
// res.data.scrape_request_id is the request identifier
```

### crawl

Crawl a website and its linked pages. Async — polls until completion.

```ts
const res = await crawl(
  "key",
  {
    url: "https://example.com",
    prompt: "Extract company info",       // required when extraction_mode=true
    max_pages: 10,                        // optional, default 10
    depth: 2,                             // optional, default 1
    breadth: 5,                           // optional, max links per depth
    schema: { /* JSON schema */ },        // optional
    sitemap: true,                        // optional
    stealth: true,                        // optional, +4 credits
    wait_ms: 5000,                        // optional, default 3000
    batch_size: 3,                        // optional, default 1
    same_domain_only: true,               // optional, default true
    cache_website: true,                  // optional
    headers: { "Accept-Language": "en" }, // optional
  },
  (status) => console.log(status),        // optional poll callback
);
```

### agenticScraper

Automate browser actions (click, type, navigate) then extract data.

```ts
const res = await agenticScraper("key", {
  url: "https://example.com/login",
  steps: ["Type user@example.com in email", "Click login button"],  // required
  user_prompt: "Extract dashboard data",  // required when ai_extraction=true
  output_schema: { /* */ },               // required when ai_extraction=true
  ai_extraction: true,                    // optional
  use_session: true,                      // optional
});
```

### generateSchema

Generate a JSON schema from a natural language description.

```ts
const res = await generateSchema("key", {
  user_prompt: "Schema for a product with name, price, and rating",
  existing_schema: { /* modify this */ }, // optional
});
```

### sitemap

Extract all URLs from a website's sitemap.

```ts
const res = await sitemap("key", {
  website_url: "https://example.com",
  headers: { /* */ },  // optional
  stealth: true,       // optional, +4 credits
  mock: true,          // optional, testing mode
});
// res.data.urls is string[]
```

### getCredits / checkHealth

```ts
const credits = await getCredits("key");
// { remaining_credits: 420, total_credits_used: 69 }

const health = await checkHealth("key");
// { status: "healthy" }
```

### history

Fetch request history for any service.

```ts
const res = await history("key", {
  service: "smartscraper",
  page: 1,       // optional, default 1
  page_size: 10, // optional, default 10
});
```

## Examples

Find complete working examples in the [`examples/`](https://github.com/ScrapeGraphAI/scrapegraph-js/tree/main/examples) directory:

| Service | Examples |
|---|---|
| [SmartScraper](https://github.com/ScrapeGraphAI/scrapegraph-js/tree/main/examples/smartscraper) | basic, cookies, html input, infinite scroll, markdown input, pagination, stealth, with schema |
| [SearchScraper](https://github.com/ScrapeGraphAI/scrapegraph-js/tree/main/examples/searchscraper) | basic, markdown mode, with schema |
| [Markdownify](https://github.com/ScrapeGraphAI/scrapegraph-js/tree/main/examples/markdownify) | basic, stealth |
| [Scrape](https://github.com/ScrapeGraphAI/scrapegraph-js/tree/main/examples/scrape) | basic, stealth, with branding |
| [Crawl](https://github.com/ScrapeGraphAI/scrapegraph-js/tree/main/examples/crawl) | basic, markdown mode, with schema |
| [Agentic Scraper](https://github.com/ScrapeGraphAI/scrapegraph-js/tree/main/examples/agenticscraper) | basic, AI extraction |
| [Schema Generation](https://github.com/ScrapeGraphAI/scrapegraph-js/tree/main/examples/schema) | basic, modify existing |
| [Sitemap](https://github.com/ScrapeGraphAI/scrapegraph-js/tree/main/examples/sitemap) | basic, with smartscraper |
| [Utilities](https://github.com/ScrapeGraphAI/scrapegraph-js/tree/main/examples/utilities) | credits, health, history |

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `SGAI_API_URL` | Override API base URL | `https://api.scrapegraphai.com/v1` |
| `SGAI_DEBUG` | Enable debug logging (`"1"`) | off |
| `SGAI_TIMEOUT_S` | Request timeout in seconds | `120` |

## Development

```bash
bun install
bun test          # 21 tests
bun run build     # tsup → dist/
bun run check     # tsc --noEmit + biome
```

## License

MIT - [ScrapeGraph AI](https://scrapegraphai.com)
