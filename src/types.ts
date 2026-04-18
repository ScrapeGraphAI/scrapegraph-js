import type { z } from "zod";
import type {
	apiCrawlRequestSchema,
	apiExtractRequestBaseSchema,
	apiFetchConfigSchema,
	apiFetchContentTypeSchema,
	apiHistoryFilterSchema,
	apiHtmlModeSchema,
	apiMonitorCreateSchema,
	apiMonitorUpdateSchema,
	apiScrapeFormatEntrySchema,
	apiScrapeRequestSchema,
	apiSearchRequestSchema,
} from "./schemas.js";

export type ApiFetchConfig = z.input<typeof apiFetchConfigSchema>;
export type ApiFetchContentType = z.infer<typeof apiFetchContentTypeSchema>;
export type ApiHtmlMode = z.infer<typeof apiHtmlModeSchema>;
export type ApiScrapeFormatEntry = z.input<typeof apiScrapeFormatEntrySchema>;

export type ApiScrapeRequest = z.input<typeof apiScrapeRequestSchema>;
export type ApiExtractRequest = z.input<typeof apiExtractRequestBaseSchema>;
export type ApiSearchRequest = z.input<typeof apiSearchRequestSchema>;
export type ApiCrawlRequest = z.input<typeof apiCrawlRequestSchema>;
export type ApiMonitorCreateInput = z.input<typeof apiMonitorCreateSchema>;
export type ApiMonitorUpdateInput = z.input<typeof apiMonitorUpdateSchema>;
export type ApiHistoryFilter = z.input<typeof apiHistoryFilterSchema>;

export type ApiScrapeFormat =
	| "markdown"
	| "html"
	| "links"
	| "images"
	| "summary"
	| "json"
	| "branding"
	| "screenshot";

export interface ApiTokenUsage {
	promptTokens: number;
	completionTokens: number;
}

export interface ApiChunkerMetadata {
	chunks: { size: number }[];
}

export interface ApiFetchWarning {
	reason: "too_short" | "empty" | "bot_blocked" | "spa_shell" | "soft_404";
	provider?: string;
}

export interface ScrapeMetadata {
	provider?: string;
	contentType: string;
	elapsedMs?: number;
	warnings?: ApiFetchWarning[];
	ocr?: {
		model: string;
		pagesProcessed: number;
		pages: ContentPageMetadata[];
	};
}

export interface ContentPageMetadata {
	index: number;
	images: Array<{
		id: string;
		topLeftX: number;
		topLeftY: number;
		bottomRightX: number;
		bottomRightY: number;
	}>;
	tables: Array<{ id: string; content: string; format: string }>;
	hyperlinks: string[];
	dimensions: { dpi: number; height: number; width: number };
}

export interface ApiBrandingColors {
	primary: string;
	accent: string;
	background: string;
	textPrimary: string;
	link: string;
}

export interface ApiBrandingFontEntry {
	family: string;
	fallback: string;
}

export interface ApiBrandingTypography {
	primary: ApiBrandingFontEntry;
	heading: ApiBrandingFontEntry;
	mono: ApiBrandingFontEntry;
	sizes: { h1: string; h2: string; body: string };
}

export interface ApiBrandingImages {
	logo: string;
	favicon: string;
	ogImage: string;
}

export interface ApiBrandingPersonality {
	tone: string;
	energy: "high" | "medium" | "low";
	targetAudience: string;
}

export interface ApiBranding {
	colorScheme: "light" | "dark";
	colors: ApiBrandingColors;
	typography: ApiBrandingTypography;
	images: ApiBrandingImages;
	spacing: { baseUnit: number; borderRadius: string };
	frameworkHints: string[];
	personality: ApiBrandingPersonality;
	confidence: number;
}

export interface ApiBrandingMetadata {
	title: string;
	description: string;
	favicon: string;
	language: string;
	themeColor: string;
	ogTitle: string;
	ogDescription: string;
	ogImage: string;
	ogUrl: string;
}

export interface ApiScrapeScreenshotData {
	url: string;
	width: number;
	height: number;
}

export interface ApiScrapeFormatError {
	code: string;
	error: string;
}

export interface ApiScrapeFormatResponseMap {
	markdown: string[];
	html: string[];
	links: string[];
	images: string[];
	summary: string;
	json: Record<string, unknown>;
	branding: ApiBranding;
	screenshot: ApiScrapeScreenshotData;
}

export type ApiImageContentType = Extract<ApiFetchContentType, `image/${string}`>;

export interface ApiScrapeFormatMetadataMap {
	markdown: Record<string, never>;
	html: Record<string, never>;
	links: { count: number };
	images: { count: number };
	summary: { chunker?: ApiChunkerMetadata };
	json: { chunker: ApiChunkerMetadata; raw?: string | null };
	branding: { branding: ApiBrandingMetadata };
	screenshot: { contentType: ApiImageContentType; provider?: string };
}

export type ApiScrapeResultMap = Partial<{
	[K in ApiScrapeFormat]: {
		data: ApiScrapeFormatResponseMap[K];
		metadata?: ApiScrapeFormatMetadataMap[K];
	};
}>;

export interface ApiScrapeResponse {
	results: ApiScrapeResultMap;
	metadata: ScrapeMetadata;
	errors?: Partial<{ [K in ApiScrapeFormat]: ApiScrapeFormatError }>;
}

export interface ApiExtractResponse {
	raw: string | null;
	json: Record<string, unknown> | null;
	usage: ApiTokenUsage;
	metadata: {
		chunker: ApiChunkerMetadata;
		fetch?: { provider?: string };
	};
}

export interface ApiSearchResult {
	url: string;
	title: string;
	content: string;
	provider?: string;
}

export interface ApiSearchMetadata {
	search: { provider?: string };
	pages: { requested: number; scraped: number };
	chunker?: ApiChunkerMetadata;
}

export interface ApiSearchResponse {
	results: ApiSearchResult[];
	json?: Record<string, unknown> | null;
	raw?: string | null;
	usage?: ApiTokenUsage;
	metadata: ApiSearchMetadata;
}

export type ApiCrawlStatus = "running" | "completed" | "failed" | "paused" | "deleted";
export type ApiCrawlPageStatus = "completed" | "failed" | "skipped";

export interface ApiCrawlPage {
	url: string;
	status: ApiCrawlPageStatus;
	depth: number;
	parentUrl: string | null;
	links: string[];
	scrapeRefId: string;
	title: string;
	contentType: string;
	screenshotUrl?: string;
	reason?: string;
	error?: string;
}

export interface ApiCrawlResult {
	status: ApiCrawlStatus;
	reason?: string;
	total: number;
	finished: number;
	pages: ApiCrawlPage[];
}

export interface ApiCrawlResponse extends ApiCrawlResult {
	id: string;
}

export interface TextChange {
	type: "added" | "removed";
	line: number;
	content: string;
}

export interface JsonChange {
	path: string;
	old: unknown;
	new: unknown;
}

export interface SetChange {
	added: string[];
	removed: string[];
}

export interface ImageChange {
	size: number;
	changed: number;
	mask?: string;
}

export interface ApiMonitorDiffs {
	markdown?: TextChange[];
	html?: TextChange[];
	json?: JsonChange[];
	screenshot?: ImageChange;
	links?: SetChange;
	images?: SetChange;
	summary?: TextChange[];
	branding?: JsonChange[];
}

export type ApiMonitorRefs = Partial<Record<ApiScrapeFormat, string>>;

export interface ApiWebhookStatus {
	sentAt: string;
	statusCode: number | null;
	error?: string;
}

export interface ApiMonitorResult {
	changed: boolean;
	diffs: ApiMonitorDiffs;
	refs: ApiMonitorRefs;
	webhookStatus?: ApiWebhookStatus;
}

export interface ApiMonitorResponse {
	cronId: string;
	scheduleId: string;
	interval: string;
	status: "active" | "paused";
	config: ApiMonitorCreateInput;
	createdAt: string;
	updatedAt: string;
}

export type ApiMonitorTickStatus = "completed" | "failed" | "paused" | "running";

export interface ApiMonitorTickEntry {
	id: string;
	status: ApiMonitorTickStatus;
	createdAt: string;
	elapsedMs: number;
	changed: boolean;
	diffs: ApiMonitorDiffs;
	error?: string;
}

export interface ApiMonitorActivityResponse {
	ticks: ApiMonitorTickEntry[];
	nextCursor: string | null;
}

export interface ApiMonitorActivityParams {
	limit?: number;
	cursor?: string;
}

export type ApiHistoryService = "scrape" | "extract" | "search" | "monitor" | "crawl";
export type ApiHistoryStatus = "completed" | "failed" | "running" | "paused" | "deleted";

interface ApiHistoryBase {
	id: string;
	status: ApiHistoryStatus;
	error: unknown;
	elapsedMs: number;
	createdAt: string;
	requestParentId: string | null;
}

export interface ApiScrapeHistoryEntry extends ApiHistoryBase {
	service: "scrape";
	params: ApiScrapeRequest;
	result: ApiScrapeResponse;
}

export interface ApiExtractHistoryEntry extends ApiHistoryBase {
	service: "extract";
	params: ApiExtractRequest;
	result: ApiExtractResponse;
}

export interface ApiSearchHistoryEntry extends ApiHistoryBase {
	service: "search";
	params: ApiSearchRequest;
	result: ApiSearchResponse;
}

export interface ApiMonitorHistoryEntry extends ApiHistoryBase {
	service: "monitor";
	params: { cronId: string; url: string };
	result: ApiMonitorResult;
}

export interface ApiCrawlHistoryEntry extends ApiHistoryBase {
	service: "crawl";
	params: { url: string; maxPages: number };
	result: ApiCrawlResult;
}

export type ApiHistoryEntry =
	| ApiScrapeHistoryEntry
	| ApiExtractHistoryEntry
	| ApiSearchHistoryEntry
	| ApiMonitorHistoryEntry
	| ApiCrawlHistoryEntry;

export interface ApiPageResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
	};
}

export type ApiHistoryPage = ApiPageResponse<ApiHistoryEntry>;

export interface ApiJobsStatus {
	used: number;
	limit: number;
}

export interface ApiCreditsResponse {
	remaining: number;
	used: number;
	plan: string;
	jobs: {
		crawl: ApiJobsStatus;
		monitor: ApiJobsStatus;
	};
}

export interface ApiHealthResponse {
	status: string;
	uptime: number;
	services?: {
		redis: "ok" | "down";
		db: "ok" | "down";
	};
}

export interface ApiResult<T> {
	status: "success" | "error";
	data: T | null;
	error?: string;
	elapsedMs: number;
}
