import type { z } from "zod/v4";
import type {
	apiCrawlRequestSchema,
	apiExtractRequestBaseSchema,
	apiFetchConfigSchema,
	apiGenerateSchemaRequestSchema,
	apiHistoryFilterSchema,
	apiHtmlModeSchema,
	apiLlmConfigSchema,
	apiMonitorCreateSchema,
	apiMonitorUpdateSchema,
	apiScrapeRequestSchema,
	apiSearchRequestSchema,
} from "../schemas.js";

export const VERSION = "2.0.0";
export const DEFAULT_BASE_URL = "https://api.scrapegraphai.com";

export type { ApiModelName } from "../models.js";

export type ApiHtmlMode = z.infer<typeof apiHtmlModeSchema>;

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
export type ApiLlmConfig = z.infer<typeof apiLlmConfigSchema>;
export type ApiScrapeRequest = z.infer<typeof apiScrapeRequestSchema>;
export type ApiExtractRequestBase = z.infer<typeof apiExtractRequestBaseSchema>;
export type ApiGenerateSchemaRequest = z.infer<typeof apiGenerateSchemaRequestSchema>;
export type ApiSearchRequest = z.infer<typeof apiSearchRequestSchema>;
export type ApiHistoryFilterInput = z.infer<typeof apiHistoryFilterSchema>;
export type ApiHistoryService = Exclude<ApiHistoryFilterInput["service"], undefined>;
export type ApiMonitorCreateInput = z.infer<typeof apiMonitorCreateSchema>;
export type ApiMonitorUpdateInput = z.infer<typeof apiMonitorUpdateSchema>;
export type ApiCrawlRequest = z.infer<typeof apiCrawlRequestSchema>;

export type ApiScrapeOptions = Omit<ApiScrapeRequest, "url">;
export type ApiExtractOptions = Omit<ApiExtractRequestBase, "url" | "html" | "markdown"> & {
	schema?: unknown;
};
export type ApiGenerateSchemaOptions = Omit<ApiGenerateSchemaRequest, "prompt">;
export type ApiSearchOptions = Omit<ApiSearchRequest, "query">;
export type ApiCrawlOptions = Omit<ApiCrawlRequest, "url">;
