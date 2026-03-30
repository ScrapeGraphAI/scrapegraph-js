# ScrapeGraph JS SDK

[![npm version](https://badge.fury.io/js/scrapegraph-js.svg)](https://badge.fury.io/js/scrapegraph-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Official JavaScript/TypeScript SDK for the ScrapeGraph AI API v2.

## Install

```bash
npm i scrapegraph-js
# or
bun add scrapegraph-js
```

## Quick Start

```ts
import { scrapegraphai } from "scrapegraph-js";

const sgai = scrapegraphai({ apiKey: "your-api-key" });

const result = await sgai.scrape("https://example.com", { format: "markdown" });

console.log(result.data);
console.log(result._requestId);
```

Every method returns:

```ts
type ApiResult<T> = {
  data: T;
  _requestId: string;
};
```

## API

Create a client once, then call the available v2 endpoints:

```ts
const sgai = scrapegraphai({
  apiKey: "your-api-key",
  baseUrl: "https://api.scrapegraphai.com", // optional
  timeout: 30000, // optional
  maxRetries: 2, // optional
});
```

### scrape

```ts
await sgai.scrape("https://example.com", {
  format: "markdown",
  fetchConfig: {
    mock: false,
  },
});
```

### extract

Raw JSON schema:

```ts
await sgai.extract("https://example.com", {
  prompt: "Extract the page title",
  schema: {
    type: "object",
    properties: {
      title: { type: "string" },
    },
  },
});
```

Zod schema:

```ts
import { z } from "zod";

await sgai.extract("https://example.com", {
  prompt: "Extract the page title",
  schema: z.object({
    title: z.string(),
  }),
});
```

### search

```ts
await sgai.search("What is the capital of France?", {
  numResults: 5,
});
```

### schema

```ts
await sgai.schema("A product with name and price");
```

### credits

```ts
await sgai.credits();
```

### history

```ts
await sgai.history({
  page: 1,
  limit: 10,
  service: "scrape",
});
```

### crawl

```ts
const crawl = await sgai.crawl.start("https://example.com", {
  maxPages: 10,
  maxDepth: 2,
});

await sgai.crawl.status((crawl.data as { id: string }).id);
```

### monitor

```ts
await sgai.monitor.create({
  url: "https://example.com",
  prompt: "Notify me when the price changes",
  interval: "1h",
});
```

## Breaking Changes In v2

- The SDK now uses `scrapegraphai(config)` instead of flat top-level functions.
- Requests target the new `/v2/*` API surface.
- Old helpers like `smartScraper`, `searchScraper`, `markdownify`, `agenticScraper`, `sitemap`, and `generateSchema` are not part of the v2 client.
- `crawl` and `monitor` are now namespaced APIs.

## Development

```bash
bun install
bun test
bun run check
bun run build
```

## License

MIT - [ScrapeGraph AI](https://scrapegraphai.com)
