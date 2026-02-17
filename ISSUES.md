# Issues Found During Example Testing

## SDK Bugs

### ~~1. Health endpoint uses wrong base URL~~ FIXED
- **File**: `src/scrapegraphai.ts` — `checkHealth()`
- **Problem**: The health endpoint lives at `https://api.scrapegraphai.com/healthz` (no `/v1` prefix), but the SDK was sending `GET /v1/healthz` which returned 404.
- **Fix**: `checkHealth()` now uses `HEALTH_URL` (root domain, no `/v1` prefix).

### ~~7. Crawl poll response nested inside `result` wrapper~~ FIXED
- **File**: `src/scrapegraphai.ts` — `submitAndPoll()`
- **Problem**: The crawl poll API returns `{ status: "success", result: { status: "done", pages: [...], crawled_urls: [...] } }`. The SDK was returning the outer wrapper as `data`, so `data.pages` and `data.crawled_urls` were `undefined`.
- **Fix**: Added `unwrapResult()` that detects the nested `result` object and promotes it to the top level. Also added `llm_result`, `credits_used`, `pages_processed`, `elapsed_time` to `CrawlResponse` type.

## API-Side Issues

### 2. Agentic Scraper returns 500
- **Example**: `agenticscraper/agenticscraper_basic.ts`, `agenticscraper/agenticscraper_ai_extraction.ts`
- **Error**: `Server error — try again later` (HTTP 500)
- **Note**: Both basic and AI extraction modes fail. Likely an API deployment issue.

### 3. Generate Schema — modify existing returns empty schema
- **Example**: `schema/modify_existing_schema.ts`
- **Error**: `generated_schema` comes back as `{}`
- **Note**: Basic generation works fine. Modifying an existing schema returns empty. May be async and needs polling, or the API doesn't fully support modification yet.

### 4. Crawl markdown mode returns 0 pages
- **Example**: `crawl/crawl_markdown.ts`
- **Error**: `extraction_mode: false` returns `{ pages: [] }` despite status `success`
- **Note**: Extraction mode crawls (with prompt) work fine and return pages. Markdown-only mode seems broken on the API side.

### 5. Scrape endpoint rejects uppercase country codes
- **Example**: `scrape/scrape_stealth.ts`
- **Error**: `Invalid country code` when sending `"US"` — must be lowercase `"us"`
- **Note**: Fixed in the example. SDK could validate/lowercase this automatically.

### 6. SearchScraper markdown mode returns empty result
- **Example**: `searchscraper/searchscraper_markdown.ts`
- **Error**: `result` is `{}` when `extraction_mode: false`, though `reference_urls` are populated
- **Note**: The markdown content may be in a different response field, or the API doesn't support this mode correctly.
