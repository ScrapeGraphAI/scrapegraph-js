console.warn(
	"[scrapegraph-js] WARNING: This version (1.x) is deprecated and will no longer receive updates. " +
	"Please upgrade to scrapegraph-js v2 for the latest features, bug fixes, and API v2 support. " +
	"See the migration guide: https://docs.scrapegraphai.com/transition-from-v1-to-v2",
);

export {
	smartScraper,
	searchScraper,
	markdownify,
	scrape,
	crawl,
	agenticScraper,
	generateSchema,
	sitemap,
	getCredits,
	checkHealth,
	history,
} from "./scrapegraphai.js";

export type {
	AgenticScraperParams,
	AgenticScraperResponse,
	ApiResult,
	CrawlParams,
	CrawlPage,
	CrawlResponse,
	CreditsResponse,
	GenerateSchemaParams,
	GenerateSchemaResponse,
	HealthResponse,
	HistoryEntry,
	HistoryParams,
	HistoryResponse,
	MarkdownifyParams,
	MarkdownifyResponse,
	ScrapeParams,
	ScrapeResponse,
	SearchScraperParams,
	SearchScraperResponse,
	SitemapParams,
	SitemapResponse,
	SmartScraperParams,
	SmartScraperResponse,
} from "./types/index.js";

export { HISTORY_SERVICES } from "./types/index.js";
