# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Before completing any task

Always run these commands before committing or saying a task is done:

```bash
bun run format
bun run lint
bunx tsc --noEmit
bun run build
bun test
```

No exceptions.

## Project Overview

**scrapegraph-js** is the official JavaScript/TypeScript SDK for the ScrapeGraph AI API. It provides a TypeScript client for intelligent web scraping powered by AI.

## Repository Structure

```
scrapegraph-js/
├── src/                    # TypeScript SDK source
├── tests/                  # Test suite
├── examples/               # Usage examples
├── scripts/                # Development utilities
└── .github/workflows/      # CI/CD
```

## Tech Stack

- **Language**: TypeScript (Node.js 22+)
- **Runtime**: Bun
- **Core Dependencies**: zod (validation)
- **Testing**: Bun test
- **Code Quality**: Biome (lint + format)
- **Build**: tsup

## Commands

```bash
# Install
bun install

# Dev (watch mode)
bun run dev

# Test
bun test                    # unit tests
bun run test:integration    # integration tests

# Format
bun run format

# Lint
bun run lint

# Type check
bunx tsc --noEmit

# Build
bun run build

# Playground (loads .env)
bun run playground
```

## Architecture

**Core Components:**

1. **Client** (`src/scrapegraphai.ts`):
   - `ScrapeGraphAI()` - Factory function returning namespaced client
   - Handles all API communication

2. **Types** (`src/types.ts`):
   - Request/response types for all endpoints
   - Zod schema inference

3. **Schemas** (`src/schemas.ts`):
   - Zod validation schemas

4. **Config** (`src/env.ts`):
   - Environment variable handling

## API Methods

| Method | Purpose |
|--------|---------|
| `sgai.scrape()` | AI data extraction from URL |
| `sgai.extract()` | Extract from raw HTML/text |
| `sgai.search()` | Web search + extraction |
| `sgai.crawl.start()` | Start crawl job |
| `sgai.crawl.get()` | Get crawl status |
| `sgai.monitor.create()` | Create monitoring job |
| `sgai.monitor.get()` | Get monitor status |
| `sgai.monitor.update()` | Update monitor config |
| `sgai.monitor.delete()` | Delete monitor |
| `sgai.credits()` | Check API credits |
| `sgai.healthy()` | Health check |
| `sgai.history.list()` | List request history |
| `sgai.history.get()` | Get specific request |

## Adding New Endpoint

1. Add types in `src/types.ts`
2. Add Zod schema in `src/schemas.ts`
3. Add function in `src/scrapegraphai.ts`
4. Wire into `ScrapeGraphAI()` client object
5. Export types in `src/index.ts`
6. Add tests in `tests/`
7. Add example in `examples/`

## Environment Variables

- `SGAI_API_KEY` - API key for authentication
- `SGAI_DEBUG` - Enable debug logging (optional)

## Usage

```typescript
import { ScrapeGraphAI } from "scrapegraph-js";

const sgai = ScrapeGraphAI(); // reads SGAI_API_KEY from env

const res = await sgai.scrape({
  url: "https://example.com",
  prompt: "Extract the main heading",
});

if (res.status === "success") {
  console.log(res.data?.result);
}
```

## Links

- [API Docs](https://docs.scrapegraphai.com)
- [npm](https://www.npmjs.com/package/scrapegraph-js)
