export const VERSION = "2.0.0";
export const DEFAULT_BASE_URL = "https://api.scrapegraphai.com";

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

export interface CrawlOptions {
	maxDepth?: number;
	maxPages?: number;
	maxLinksPerPage?: number;
	allowExternal?: boolean;
	includePatterns?: string[];
	excludePatterns?: string[];
	fetchConfig?: Record<string, unknown>;
}

export interface MonitorCreateOptions {
	url: string;
	prompt: string;
	interval: string;
	webhookUrl?: string;
	fetchConfig?: Record<string, unknown>;
}
