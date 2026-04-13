import type { z } from "zod/v4";
import type {
	apiCrawlRequestSchema,
	apiExtractRequestBaseSchema,
	apiFetchConfigSchema,
	apiFetchModeSchema,
	apiGenerateSchemaRequestSchema,
	apiHistoryFilterSchema,
	apiHtmlConfigSchema,
	apiHtmlModeSchema,
	apiMarkdownConfigSchema,
	apiMonitorCreateSchema,
	apiMonitorUpdateSchema,
	apiScrapeFormatEntrySchema,
	apiScrapeFormatSchema,
	apiScrapeJsonFormatSchema,
	apiScrapeRequestSchema,
	apiScrapeSummaryFormatSchema,
	apiScreenshotConfigSchema,
	apiSearchRequestSchema,
} from "../schemas.js";

export const VERSION = "2.0.0";
export const DEFAULT_BASE_URL = "https://api.scrapegraphai.com";

export type { ApiModelName } from "../models.js";

export type ApiHtmlMode = z.infer<typeof apiHtmlModeSchema>;
export type ApiFetchMode = z.infer<typeof apiFetchModeSchema>;

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

export type ApiFetchConfig = z.infer<typeof apiFetchConfigSchema>;
export type ApiScrapeFormat = z.infer<typeof apiScrapeFormatSchema>;
export type ApiScrapeFormatEntry = z.infer<typeof apiScrapeFormatEntrySchema>;
export type ApiScrapeRequest = z.infer<typeof apiScrapeRequestSchema>;
export type ApiExtractRequestBase = z.infer<typeof apiExtractRequestBaseSchema>;
export type ApiGenerateSchemaRequest = z.infer<typeof apiGenerateSchemaRequestSchema>;
export type ApiSearchRequest = z.infer<typeof apiSearchRequestSchema>;
export type ApiHistoryFilterInput = z.infer<typeof apiHistoryFilterSchema>;
export type ApiHistoryService = Exclude<ApiHistoryFilterInput["service"], undefined>;
export type ApiMonitorCreateRequest = z.infer<typeof apiMonitorCreateSchema>;
export type ApiMonitorUpdateInput = z.infer<typeof apiMonitorUpdateSchema>;
export type ApiCrawlRequest = z.infer<typeof apiCrawlRequestSchema>;

export type ApiScrapeOptions = Partial<Omit<ApiScrapeRequest, "url">> & {
	format?: ApiScrapeFormat;
	markdown?: z.infer<typeof apiMarkdownConfigSchema>;
	html?: z.infer<typeof apiHtmlConfigSchema>;
	screenshot?: z.infer<typeof apiScreenshotConfigSchema>;
	json?: Omit<z.infer<typeof apiScrapeJsonFormatSchema>, "type" | "schema"> & { schema?: unknown };
	summary?: Omit<z.infer<typeof apiScrapeSummaryFormatSchema>, "type">;
};
export type ApiExtractOptions = Omit<ApiExtractRequestBase, "url" | "schema"> & {
	schema?: unknown;
};
export type ApiGenerateSchemaOptions = Omit<ApiGenerateSchemaRequest, "prompt"> & {
	existingSchema?: unknown;
};
export type ApiSearchOptions = Omit<ApiSearchRequest, "query" | "schema"> & { schema?: unknown };
export type LegacyApiMonitorCreateInput = {
	url: string;
	name?: string;
	prompt: string;
	schema?: unknown;
	webhookUrl?: string;
	interval: string;
	fetchConfig?: ApiFetchConfig;
};
export type ApiMonitorCreateInput = ApiMonitorCreateRequest | LegacyApiMonitorCreateInput;
export type ApiCrawlOptions = Partial<Omit<ApiCrawlRequest, "url">> & {
	format?: ApiScrapeFormat;
};
