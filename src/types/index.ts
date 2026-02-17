export type SmartScraperParams = {
	website_url?: string;
	website_html?: string;
	website_markdown?: string;
	user_prompt: string;
	output_schema?: Record<string, unknown>;
	number_of_scrolls?: number;
	total_pages?: number;
	stealth?: boolean;
	cookies?: Record<string, string>;
	headers?: Record<string, string>;
	plain_text?: boolean;
	webhook_url?: string;
	mock?: boolean;
	steps?: string[];
	wait_ms?: number;
	country_code?: string;
};

export type SearchScraperParams = {
	user_prompt: string;
	num_results?: number;
	extraction_mode?: boolean;
	output_schema?: Record<string, unknown>;
	stealth?: boolean;
	headers?: Record<string, string>;
	webhook_url?: string;
	mock?: boolean;
	time_range?: "past_hour" | "past_24_hours" | "past_week" | "past_month" | "past_year";
	location_geo_code?: string;
};

export type MarkdownifyParams = {
	website_url: string;
	stealth?: boolean;
	headers?: Record<string, string>;
	webhook_url?: string;
	mock?: boolean;
	wait_ms?: number;
	country_code?: string;
};

type CrawlBase = {
	url: string;
	max_pages?: number;
	depth?: number;
	rules?: Record<string, unknown>;
	sitemap?: boolean;
	stealth?: boolean;
	webhook_url?: string;
	cache_website?: boolean;
	breadth?: number;
	same_domain_only?: boolean;
	batch_size?: number;
	wait_ms?: number;
	headers?: Record<string, string>;
	number_of_scrolls?: number;
	website_html?: string;
};

type CrawlExtraction = CrawlBase & {
	extraction_mode?: true;
	prompt: string;
	schema?: Record<string, unknown>;
};

type CrawlMarkdown = CrawlBase & {
	extraction_mode: false;
	prompt?: never;
	schema?: never;
};

export type CrawlParams = CrawlExtraction | CrawlMarkdown;

export type GenerateSchemaParams = {
	user_prompt: string;
	existing_schema?: Record<string, unknown>;
};

export type SitemapParams = {
	website_url: string;
	headers?: Record<string, string>;
	mock?: boolean;
	stealth?: boolean;
};

export type ScrapeParams = {
	website_url: string;
	stealth?: boolean;
	branding?: boolean;
	country_code?: string;
	wait_ms?: number;
};

export type AgenticScraperParams = {
	url: string;
	steps: string[];
	user_prompt?: string;
	output_schema?: Record<string, unknown>;
	ai_extraction?: boolean;
	use_session?: boolean;
};

export const HISTORY_SERVICES = [
	"markdownify",
	"smartscraper",
	"searchscraper",
	"scrape",
	"crawl",
	"agentic-scraper",
	"sitemap",
] as const;

export type HistoryParams = {
	service: (typeof HISTORY_SERVICES)[number];
	page?: number;
	page_size?: number;
};

export type ApiResult<T> = {
	status: "success" | "error";
	data: T | null;
	error?: string;
	elapsedMs: number;
};

export type SmartScraperResponse = {
	request_id: string;
	status: string;
	website_url: string;
	user_prompt: string;
	result: Record<string, unknown> | null;
	error?: string;
};

export type SearchScraperResponse = {
	request_id: string;
	status: string;
	user_prompt: string;
	num_results?: number;
	result: Record<string, unknown> | null;
	markdown_content?: string | null;
	reference_urls: string[];
	error?: string | null;
};

export type MarkdownifyResponse = {
	request_id: string;
	status: string;
	website_url: string;
	result: string | null;
	error?: string;
};

export type CrawlPage = {
	url: string;
	markdown: string;
};

export type CrawlResponse = {
	task_id: string;
	status: string;
	result?: Record<string, unknown> | null;
	llm_result?: Record<string, unknown> | null;
	crawled_urls?: string[];
	pages?: CrawlPage[];
	credits_used?: number;
	pages_processed?: number;
	elapsed_time?: number;
	error?: string;
};

export type ScrapeResponse = {
	scrape_request_id: string;
	status: string;
	html: string;
	branding?: Record<string, unknown> | null;
	metadata?: Record<string, unknown> | null;
	error?: string;
};

export type AgenticScraperResponse = {
	request_id: string;
	status: string;
	result: Record<string, unknown> | null;
	error?: string;
};

export type GenerateSchemaResponse = {
	request_id: string;
	status: string;
	user_prompt: string;
	refined_prompt?: string | null;
	generated_schema?: Record<string, unknown> | null;
	error?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
};

export type SitemapResponse = {
	request_id: string;
	urls: string[];
	status?: string;
	website_url?: string;
	error?: string;
};

export type CreditsResponse = {
	remaining_credits: number;
	total_credits_used: number;
};

export type HealthResponse = {
	status: string;
};

export type HistoryResponse = {
	requests: HistoryEntry[];
	total_count: number;
	page: number;
	page_size: number;
};

export type HistoryEntry = {
	request_id: string;
	status: string;
	[key: string]: unknown;
};
