export const VERSION = "2.0.0";
export const DEFAULT_BASE_URL = "https://api.scrapegraphai.com";

export type ApiModelName =
	| "gpt-4o-mini"
	| "gpt-4o-mini-2024-07-18"
	| "llama-3.3-70b-versatile"
	| "llama-3.1-8b-instant"
	| "mixtral-8x7b-32768"
	| "mistral-small-2501"
	| "gpt-oss-120b"
	| "openai/gpt-oss-120b"
	| "claude-haiku-4-5-20251001";

export type ApiHtmlMode = "normal" | "reader" | "prune";
export type ApiFetchContentType =
	| "text/html"
	| "application/pdf"
	| "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	| "application/vnd.openxmlformats-officedocument.presentationml.presentation"
	| "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	| "image/jpeg"
	| "image/png"
	| "image/webp"
	| "image/gif"
	| "image/avif"
	| "image/tiff"
	| "image/heic"
	| "image/bmp"
	| "application/epub+zip"
	| "application/rtf"
	| "application/vnd.oasis.opendocument.text"
	| "text/csv"
	| "text/plain"
	| "application/x-latex";

export type ApiHistoryService = "scrape" | "extract" | "schema" | "search" | "monitor" | "crawl";

export interface ClientConfig {
	apiKey: string;
	baseUrl?: string;
	timeout?: number;
	maxRetries?: number;
}

export interface RequestOptions {
	timeout?: number;
	signal?: AbortSignal;
}

export interface ApiFetchMockConfig {
	minKb?: number;
	maxKb?: number;
	minSleep?: number;
	maxSleep?: number;
	writeToBucket?: boolean;
}

export interface ApiFetchConfig {
	timeout?: number;
	render?: boolean;
	wait?: number;
	headers?: Record<string, string>;
	cookies?: Record<string, string>;
	country?: string;
	stealth?: boolean;
	scrolls?: number;
	mock?: boolean | ApiFetchMockConfig;
}

export interface ApiChunkerConfig {
	size?: number | "dynamic";
	overlap?: number;
}

export interface ApiLlmConfig {
	model?: ApiModelName;
	temperature?: number;
	maxTokens?: number;
	chunker?: ApiChunkerConfig;
}

export interface ApiMarkdownConfig {
	mode?: ApiHtmlMode;
}

export interface ApiHtmlConfig {
	mode?: ApiHtmlMode;
}

export interface ApiScreenshotConfig {
	fullPage?: boolean;
	width?: number;
	height?: number;
	quality?: number;
}

export type ApiScrapeOptions =
	| {
			format?: "markdown";
			contentType?: ApiFetchContentType;
			fetchConfig?: ApiFetchConfig;
			markdown?: ApiMarkdownConfig;
	  }
	| {
			format: "html";
			contentType?: ApiFetchContentType;
			fetchConfig?: ApiFetchConfig;
			html?: ApiHtmlConfig;
	  }
	| {
			format: "screenshot";
			contentType?: ApiFetchContentType;
			fetchConfig?: ApiFetchConfig;
			screenshot?: ApiScreenshotConfig;
	  }
	| {
			format: "branding";
			contentType?: ApiFetchContentType;
			fetchConfig?: ApiFetchConfig;
	  };

export interface ApiExtractRequestBase {
	url?: string;
	html?: string;
	markdown?: string;
	mode?: ApiHtmlMode;
	prompt: string;
	schema?: Record<string, unknown>;
	contentType?: ApiFetchContentType;
	fetchConfig?: ApiFetchConfig;
	llmConfig?: ApiLlmConfig;
}

export type ApiExtractOptions = Omit<ApiExtractRequestBase, "url" | "html" | "markdown">;

export interface ApiGenerateSchemaRequest {
	prompt: string;
	existingSchema?: Record<string, unknown>;
	model?: ApiModelName;
}

export type ApiGenerateSchemaOptions = Omit<ApiGenerateSchemaRequest, "prompt">;

export interface ApiSearchRequest {
	query: string;
	numResults?: number;
	format?: "html" | "markdown";
	mode?: ApiHtmlMode;
	fetchConfig?: ApiFetchConfig;
	prompt?: string;
	schema?: Record<string, unknown>;
	llmConfig?: ApiLlmConfig;
	locationGeoCode?: string;
	timeRange?: "past_hour" | "past_24_hours" | "past_week" | "past_month" | "past_year";
}

export type ApiSearchOptions = Omit<ApiSearchRequest, "query">;

export interface ApiHistoryFilterInput {
	page?: number;
	limit?: number;
	service?: ApiHistoryService;
}

export interface ApiMonitorCreateInput {
	url: string;
	name?: string;
	prompt: string;
	schema?: Record<string, unknown>;
	webhookUrl?: string;
	interval: string;
	fetchConfig?: ApiFetchConfig;
	llmConfig?: ApiLlmConfig;
}

export interface ApiMonitorUpdateInput {
	name?: string;
	prompt?: string;
	schema?: Record<string, unknown>;
	webhookUrl?: string | null;
	interval?: string;
	fetchConfig?: ApiFetchConfig;
	llmConfig?: ApiLlmConfig;
}

export interface ApiCrawlRequest {
	url: string;
	maxDepth?: number;
	maxPages?: number;
	maxLinksPerPage?: number;
	allowExternal?: boolean;
	includePatterns?: string[];
	excludePatterns?: string[];
	contentTypes?: ApiFetchContentType[];
	fetchConfig?: ApiFetchConfig;
}

export type ApiCrawlOptions = Omit<ApiCrawlRequest, "url">;
