# ScrapeGraph JS SDK

[![npm version](https://badge.fury.io/js/scrapegraph-js.svg)](https://badge.fury.io/js/scrapegraph-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<p align="left">
  <img src="https://raw.githubusercontent.com/VinciGit00/Scrapegraph-ai/main/docs/assets/api-banner.png" alt="ScrapeGraph API Banner" style="width: 70%;">
</p>

Official TypeScript SDK for the [ScrapeGraph AI API](https://scrapegraphai.com) v2.

## Install

```bash
npm i scrapegraph-js
# or
bun add scrapegraph-js
```

## Quick Start

```ts
import { scrape } from "scrapegraph-js";

const result = await scrape("your-api-key", {
  url: "https://example.com",
  formats: [{ type: "markdown" }],
});

if (result.status === "success") {
  console.log(result.data?.results.markdown?.data);
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

### scrape

Scrape a webpage in multiple formats (markdown, html, screenshot, json, etc).

```ts
const res = await scrape("key", {
  url: "https://example.com",
  formats: [
    { type: "markdown", mode: "reader" },
    { type: "screenshot", fullPage: true, width: 1440, height: 900 },
    { type: "json", prompt: "Extract product info" },
  ],
  contentType: "text/html",        // optional, auto-detected
  fetchConfig: {                   // optional
    mode: "js",                    // "auto" | "fast" | "js"
    stealth: true,
    timeout: 30000,
    wait: 2000,
    scrolls: 3,
    headers: { "Accept-Language": "en" },
    cookies: { session: "abc" },
    country: "us",
  },
});
```

**Formats:**
- `markdown` — Clean markdown (modes: `normal`, `reader`, `prune`)
- `html` — Raw HTML (modes: `normal`, `reader`, `prune`)
- `links` — All links on the page
- `images` — All image URLs
- `summary` — AI-generated summary
- `json` — Structured extraction with prompt/schema
- `branding` — Brand colors, typography, logos
- `screenshot` — Page screenshot (fullPage, width, height, quality)

### extract

Extract structured data from a URL, HTML, or markdown using AI.

```ts
const res = await extract("key", {
  url: "https://example.com",
  prompt: "Extract product names and prices",
  schema: { /* JSON schema */ },   // optional
  mode: "reader",                  // optional
  fetchConfig: { /* ... */ },      // optional
});
// Or pass html/markdown directly instead of url
```

### search

Search the web and optionally extract structured data.

```ts
const res = await search("key", {
  query: "best programming languages 2024",
  numResults: 5,                   // 1-20, default 3
  format: "markdown",              // "markdown" | "html"
  prompt: "Extract key points",    // optional, for AI extraction
  schema: { /* ... */ },           // optional
  timeRange: "past_week",          // optional
  locationGeoCode: "us",           // optional
  fetchConfig: { /* ... */ },      // optional
});
```

### generateSchema

Generate a JSON schema from a natural language description.

```ts
const res = await generateSchema("key", {
  prompt: "Schema for a product with name, price, and rating",
  existingSchema: { /* ... */ },   // optional, to modify
});
```

### crawl

Crawl a website and its linked pages.

```ts
// Start a crawl
const start = await crawl.start("key", {
  url: "https://example.com",
  formats: [{ type: "markdown" }],
  maxPages: 50,
  maxDepth: 2,
  maxLinksPerPage: 10,
  includePatterns: ["/blog/*"],
  excludePatterns: ["/admin/*"],
  fetchConfig: { /* ... */ },
});

// Check status
const status = await crawl.get("key", start.data?.id!);

// Control crawl by ID
await crawl.stop("key", start.data?.id!);
await crawl.resume("key", start.data?.id!);
await crawl.delete("key", start.data?.id!);
```

### monitor

Monitor a webpage for changes on a schedule.

```ts
// Create a monitor
const mon = await monitor.create("key", {
  url: "https://example.com",
  name: "Price Monitor",
  interval: "0 * * * *",           // cron expression
  formats: [{ type: "markdown" }],
  webhookUrl: "https://...",       // optional
  fetchConfig: { /* ... */ },
});

// Manage monitors
await monitor.list("key");
await monitor.get("key", cronId);
await monitor.update("key", cronId, { interval: "0 */6 * * *" });
await monitor.pause("key", cronId);
await monitor.resume("key", cronId);
await monitor.delete("key", cronId);
```

### history

Fetch request history.

```ts
const list = await history.list("key", {
  service: "scrape",               // optional filter
  page: 1,
  limit: 20,
});

const entry = await history.get("key", "request-id");
```

### getCredits / checkHealth

```ts
const credits = await getCredits("key");
// { remaining: 1000, used: 500, plan: "pro", jobs: { crawl: {...}, monitor: {...} } }

const health = await checkHealth("key");
// { status: "ok", uptime: 12345 }
```

## Examples

| Path | Description |
|------|-------------|
| [`scrape/scrape_basic.ts`](examples/scrape/scrape_basic.ts) | Basic markdown scraping |
| [`scrape/scrape_multi_format.ts`](examples/scrape/scrape_multi_format.ts) | Multiple formats (markdown, links, images, screenshot, summary) |
| [`scrape/scrape_json_extraction.ts`](examples/scrape/scrape_json_extraction.ts) | Structured JSON extraction with schema |
| [`scrape/scrape_pdf.ts`](examples/scrape/scrape_pdf.ts) | PDF document parsing with OCR metadata |
| [`scrape/scrape_with_fetchconfig.ts`](examples/scrape/scrape_with_fetchconfig.ts) | JS rendering, stealth mode, scrolling |
| [`extract/extract_basic.ts`](examples/extract/extract_basic.ts) | AI data extraction from URL |
| [`extract/extract_with_schema.ts`](examples/extract/extract_with_schema.ts) | Extraction with JSON schema |
| [`search/search_basic.ts`](examples/search/search_basic.ts) | Web search with results |
| [`search/search_with_extraction.ts`](examples/search/search_with_extraction.ts) | Search + AI extraction |
| [`crawl/crawl_basic.ts`](examples/crawl/crawl_basic.ts) | Start and monitor a crawl |
| [`crawl/crawl_with_formats.ts`](examples/crawl/crawl_with_formats.ts) | Crawl with screenshots and patterns |
| [`monitor/monitor_basic.ts`](examples/monitor/monitor_basic.ts) | Create a page monitor |
| [`monitor/monitor_with_webhook.ts`](examples/monitor/monitor_with_webhook.ts) | Monitor with webhook notifications |
| [`schema/generate_schema_basic.ts`](examples/schema/generate_schema_basic.ts) | Generate JSON schema from prompt |
| [`schema/modify_existing_schema.ts`](examples/schema/modify_existing_schema.ts) | Modify an existing schema |
| [`utilities/credits.ts`](examples/utilities/credits.ts) | Check account credits and limits |
| [`utilities/health.ts`](examples/utilities/health.ts) | API health check |
| [`utilities/history.ts`](examples/utilities/history.ts) | Request history |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SGAI_API_URL` | Override API base URL | `https://api.scrapegraphai.com/v2` |
| `SGAI_DEBUG` | Enable debug logging (`"1"`) | off |
| `SGAI_TIMEOUT_S` | Request timeout in seconds | `120` |

## Development

```bash
bun install
bun run test              # unit tests
bun run test:integration  # live API tests (requires SGAI_API_KEY)
bun run build             # tsup → dist/
bun run check             # tsc --noEmit + biome
```

## License

MIT - [ScrapeGraph AI](https://scrapegraphai.com)
