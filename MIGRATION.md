# Migrating from v1 to v2

This guide covers every breaking change in `scrapegraph-js` v2 and shows how to
update your code.

## Minimum runtime

v2 requires **Node.js >= 22** (v1 worked on Node 18+).

## Client initialization

v1 passed the API key to every function call. v2 uses a single client instance.

```diff
- import { smartScraper, getCredits } from "scrapegraph-js";
-
- const result = await smartScraper(apiKey, { ... });
- const credits = await getCredits(apiKey);
+ import { scrapegraphai } from "scrapegraph-js";
+
+ const sgai = scrapegraphai({ apiKey: "your-api-key" });
+
+ const result = await sgai.extract("https://example.com", { prompt: "..." });
+ const credits = await sgai.credits();
```

The factory accepts optional settings that used to come from environment
variables:

```ts
const sgai = scrapegraphai({
  apiKey: "your-api-key",
  baseUrl: "https://api.scrapegraphai.com", // was SGAI_API_URL env var
  timeout: 30000,
  maxRetries: 2,
});
```

## Return type

Every method now returns `{ data, requestId }` and **throws** on error.

```diff
- const result = await smartScraper(apiKey, params);
- if (result.status === "error") {
-   console.error(result.error);
- } else {
-   console.log(result.data);
- }
+ try {
+   const { data, requestId } = await sgai.extract(url, { prompt: "..." });
+   console.log(data);
+ } catch (err) {
+   console.error(err.message);
+ }
```

| v1 field | v2 equivalent |
|---|---|
| `result.status` | not needed, errors throw |
| `result.data` | `result.data` |
| `result.error` | caught via `try/catch` |
| `result.elapsedMs` | removed |

## Renamed and replaced functions

| v1 function | v2 method | Notes |
|---|---|---|
| `smartScraper(apiKey, params)` | `sgai.extract(url, { prompt, schema })` | Renamed; takes URL as first arg |
| `searchScraper(apiKey, params)` | `sgai.search(query, options)` | Renamed |
| `markdownify(apiKey, params)` | `sgai.scrape(url, { format: "markdown" })` | Merged into `scrape` |
| `scrape(apiKey, params)` | `sgai.scrape(url, options)` | Same concept, new signature |
| `crawl(apiKey, params, onPoll?)` | `sgai.crawl.start(url, options)` | No built-in polling (see below) |
| `getCredits(apiKey)` | `sgai.credits()` | Renamed |
| `history(apiKey, params)` | `sgai.history(filter)` | Simplified params |
| `createSiteMonitor(apiKey, params)` | `sgai.monitor.create(input)` | Moved under `monitor` namespace |
| `listSiteMonitors(apiKey, params?)` | `sgai.monitor.list()` | Moved under `monitor` namespace |
| `getSiteMonitor(apiKey, id)` | `sgai.monitor.get(id)` | Moved under `monitor` namespace |
| `deleteSiteMonitor(apiKey, id)` | `sgai.monitor.delete(id)` | Moved under `monitor` namespace |

### Removed (no v2 equivalent)

| v1 function | Reason |
|---|---|
| `agenticScraper()` | Removed from the API |
| `generateSchema()` | Removed from the API |
| `sitemap()` | Removed from the API |
| `checkHealth()` | Removed from the API |
| `updateSiteMonitor()` | Use `monitor.pause()` / `monitor.resume()` instead |

## Parameter changes

v1 used `snake_case` parameter names. v2 uses `camelCase`.

### smartScraper -> extract

```diff
- await smartScraper(apiKey, {
-   website_url: "https://example.com",
-   user_prompt: "Extract the title",
-   output_schema: { type: "object", properties: { title: { type: "string" } } },
-   number_of_scrolls: 3,
-   country_code: "US",
-   wait_ms: 2000,
- });
+ await sgai.extract("https://example.com", {
+   prompt: "Extract the title",
+   schema: { type: "object", properties: { title: { type: "string" } } },
+   fetchConfig: {
+     scrolls: 3,
+     country: "US",
+     wait: 2000,
+   },
+ });
```

v2 also accepts Zod schemas directly:

```ts
import { z } from "zod";

await sgai.extract("https://example.com", {
  prompt: "Extract the title",
  schema: z.object({ title: z.string() }),
});
```

### searchScraper -> search

```diff
- await searchScraper(apiKey, {
-   user_prompt: "Latest news about AI",
-   num_results: 5,
-   extraction_mode: true,
-   output_schema: schema,
- });
+ await sgai.search("Latest news about AI", {
+   numResults: 5,
+   schema: schema,
+   prompt: "Extract key points",
+ });
```

### markdownify -> scrape

```diff
- await markdownify(apiKey, {
-   website_url: "https://example.com",
-   wait_ms: 1000,
-   country_code: "US",
- });
+ await sgai.scrape("https://example.com", {
+   format: "markdown",
+   fetchConfig: {
+     wait: 1000,
+     country: "US",
+   },
+ });
```

### scrape

```diff
- await scrape(apiKey, {
-   website_url: "https://example.com",
-   branding: true,
-   country_code: "US",
- });
+ await sgai.scrape("https://example.com", {
+   format: "branding", // or "html", "screenshot"
+   fetchConfig: {
+     country: "US",
+   },
+ });
```

### getCredits -> credits

```diff
- const result = await getCredits(apiKey);
- console.log(result.data.remaining_credits);
+ const { data } = await sgai.credits();
+ console.log(data);
```

### history

```diff
- await history(apiKey, {
-   service: "smartscraper",
-   page: 1,
-   page_size: 10,
- });
+ await sgai.history({
+   service: "extract",  // service names changed too
+   page: 1,
+   limit: 10,           // was page_size
+ });
```

History service names mapping:

| v1 service | v2 service |
|---|---|
| `"smartscraper"` | `"extract"` |
| `"searchscraper"` | `"search"` |
| `"markdownify"` | `"scrape"` |
| `"scrape"` | `"scrape"` |
| `"crawl"` | `"crawl"` |
| `"agentic-scraper"` | removed |
| `"sitemap"` | removed |

## Crawling

v1 had built-in polling that blocked until the crawl finished. v2 separates
crawl lifecycle into discrete calls.

```diff
- const result = await crawl(apiKey, {
-   url: "https://example.com",
-   max_pages: 10,
-   depth: 2,
- }, (status) => console.log(status));
-
- console.log(result.data.pages);
+ // Start the crawl
+ const job = await sgai.crawl.start("https://example.com", {
+   maxPages: 10,
+   maxDepth: 2,
+ });
+
+ // Poll manually
+ const status = await sgai.crawl.status(job.data.id);
+
+ // Control the crawl
+ await sgai.crawl.stop(job.data.id);
+ await sgai.crawl.resume(job.data.id);
```

## Site monitors

Monitor functions moved from top-level to the `monitor` namespace and gained
pause/resume support.

```diff
- import {
-   createSiteMonitor,
-   listSiteMonitors,
-   getSiteMonitor,
-   deleteSiteMonitor,
- } from "scrapegraph-js";
-
- await createSiteMonitor(apiKey, {
-   website_url: "https://example.com",
-   webhook_url: "https://hook.example.com",
-   cron_expression: "0 * * * *",
- });
-
- await listSiteMonitors(apiKey);
- await getSiteMonitor(apiKey, monitorId);
- await deleteSiteMonitor(apiKey, monitorId);
+ await sgai.monitor.create({
+   url: "https://example.com",
+   prompt: "Notify me when the price changes",
+   interval: "1h",
+ });
+
+ await sgai.monitor.list();
+ await sgai.monitor.get(monitorId);
+ await sgai.monitor.delete(monitorId);
+
+ // New in v2
+ await sgai.monitor.pause(monitorId);
+ await sgai.monitor.resume(monitorId);
```

## Authentication header

v1 sent `SGAI-APIKEY` as the header. v2 sends `Authorization: Bearer <key>`.
This is handled internally and requires no code changes if you were using the
SDK functions directly. If you had custom middleware inspecting headers, update
accordingly.

## Type exports

v1 exported many granular types (`SmartScraperParams`, `SmartScraperResponse`,
etc.). v2 exports a smaller, unified set:

```ts
import type {
  ClientConfig,
  RequestOptions,
  ApiScrapeOptions,
  ApiExtractOptions,
  ApiSearchOptions,
  ApiCrawlOptions,
  ApiMonitorCreateInput,
  ApiHistoryService,
} from "scrapegraph-js";
```

## Quick checklist

- [ ] Update to Node.js >= 22
- [ ] Replace individual function imports with `scrapegraphai()` factory
- [ ] Wrap calls in `try/catch` instead of checking `result.status`
- [ ] Rename functions: `smartScraper` -> `extract`, `searchScraper` -> `search`, `markdownify` -> `scrape`
- [ ] Convert `snake_case` params to `camelCase`
- [ ] Replace `crawl()` polling with `crawl.start()` + `crawl.status()`
- [ ] Move site monitor calls to `monitor.*` namespace
- [ ] Update type imports
- [ ] Remove usages of `agenticScraper`, `generateSchema`, `sitemap`, `checkHealth`
