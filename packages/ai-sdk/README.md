# ScrapeGraphAI AI SDK Tools

[![npm version](https://badge.fury.io/js/%40scrapegraphai%2Fai-sdk.svg)](https://www.npmjs.com/package/@scrapegraphai/ai-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<p align="center">
  <a href="https://scrapegraphai.com">
    <img src="../../media/banner.png" alt="ScrapeGraphAI AI SDK Tools" style="width: 100%;">
  </a>
</p>

Vercel [AI SDK](https://ai-sdk.dev/docs/introduction) tools for the ScrapeGraphAI API.

## Install

```bash
npm i @scrapegraphai/ai-sdk ai
# or
bun add @scrapegraphai/ai-sdk ai
```

`ai` is a peer dependency. Install the model provider package you use, for example:

```bash
npm i @ai-sdk/openai
# or
bun add @ai-sdk/openai
```

## Quick Start

### API key

Log in to the [ScrapeGraphAI dashboard](https://scrapegraphai.com/) to create an API key. The dashboard also shows your request history, usage, credits, and crawl/monitor activity.

Set it in your environment:

```bash
export SGAI_API_KEY=...
```

Minimal scrape-only setup:

```ts
import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs } from "ai";
import { scrapeTool } from "@scrapegraphai/ai-sdk";

const result = await generateText({
  model: openai("gpt-5-nano"),
  prompt: "Find the main headline on https://example.com",
  tools: {
    scrape: scrapeTool(),
  },
  stopWhen: stepCountIs(5),
});

console.log(result.text);
```

Use every ScrapeGraphAI tool group:

```ts
import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs } from "ai";
import {
  crawlTools,
  extractTool,
  monitorTools,
  scrapeTool,
  searchTool,
} from "@scrapegraphai/ai-sdk";

const result = await generateText({
  model: openai("gpt-5-nano"),
  prompt: "Search for ScrapeGraphAI docs, scrape the best page, and summarize it.",
  tools: {
    scrape: scrapeTool(),
    extract: extractTool(),
    search: searchTool(),
    ...crawlTools(),
    ...monitorTools(),
  },
  stopWhen: stepCountIs(10),
});

console.log(result.text);
```

Tools read `SGAI_API_KEY` from the environment by default. You can also pass it explicitly:

```ts
const tools = {
  scrape: scrapeTool({ apiKey: process.env.SGAI_API_KEY }),
};
```

## Tools

### scrapeTool

Scrape a webpage with ScrapeGraphAI. Supports markdown, html, json extraction, links, images, summary, branding, and screenshots.

```ts
import { scrapeTool } from "@scrapegraphai/ai-sdk";

const tools = {
  scrape: scrapeTool(),
};
```

### extractTool

Extract structured JSON from a URL, HTML, or markdown with a natural-language prompt.

```ts
import { extractTool } from "@scrapegraphai/ai-sdk";

const tools = {
  extract: extractTool(),
};
```

### searchTool

Search the web and optionally extract structured data from search results.

```ts
import { searchTool } from "@scrapegraphai/ai-sdk";

const tools = {
  search: searchTool(),
};
```

### crawlTools

Start, poll, page through, stop, resume, and delete ScrapeGraphAI crawl jobs.

```ts
import { crawlTools } from "@scrapegraphai/ai-sdk";

const tools = {
  ...crawlTools(),
};
```

Crawl page retrieval is paginated. Use `getCrawl` for status, then `getCrawlPages` for pages and resolved scrape results.

```ts
const tools = {
  startCrawl: startCrawlTool(),
  getCrawl: getCrawlTool(),
  getCrawlPages: getCrawlPagesTool(),
};
```

### monitorTools

Create, list, update, pause, resume, delete, and fetch activity for ScrapeGraphAI monitors.

```ts
import { monitorTools } from "@scrapegraphai/ai-sdk";

const tools = {
  ...monitorTools(),
};
```

## Examples

| Example | Description |
|---------|-------------|
| [`hacker-news.ts`](examples/hacker-news.ts) | Scrape Hacker News with AI SDK tools |
| [`crawl-blog.ts`](examples/crawl-blog.ts) | Crawl ScrapeGraphAI blog pages, fetch paginated crawl results, and summarize them |

Run an example:

```bash
OPENAI_API_KEY=... SGAI_API_KEY=... bun examples/crawl-blog.ts
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SGAI_API_KEY` | ScrapeGraphAI API key |
| `OPENAI_API_KEY` | Required by the OpenAI provider examples |

## Development

```bash
bun install
bun run build
bun run check
```

## License

MIT - [ScrapeGraphAI](https://scrapegraphai.com)
