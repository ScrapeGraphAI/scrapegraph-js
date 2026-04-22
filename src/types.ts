import type { z } from "zod";
import type {
	crawlRequestSchema,
	extractRequestSchema,
	fetchConfigSchema,
	fetchContentTypeSchema,
	fetchModeSchema,
	formatConfigSchema,
	historyFilterSchema,
	htmlModeSchema,
	mockConfigSchema,
	monitorActivityRequestSchema,
	monitorCreateRequestSchema,
	monitorUpdateRequestSchema,
	scrapeRequestSchema,
	searchRequestSchema,
	timeRangeSchema,
} from "./schemas.js";

export type Service = "scrape" | "extract" | "search" | "monitor" | "crawl";
export type HtmlMode = z.infer<typeof htmlModeSchema>;
export type FetchMode = z.infer<typeof fetchModeSchema>;
export type TimeRange = z.infer<typeof timeRangeSchema>;
export type CrawlStatus = "running" | "completed" | "failed" | "paused" | "deleted";
export type CrawlPageStatus = "completed" | "failed" | "skipped";
export type HistoryStatus = "completed" | "failed" | "running" | "paused" | "deleted";
export type MonitorTickStatus = "completed" | "failed" | "paused" | "running";
export type FetchContentType = z.infer<typeof fetchContentTypeSchema>;

export type MockConfig = z.input<typeof mockConfigSchema>;
export type FetchConfig = z.input<typeof fetchConfigSchema>;

export type MarkdownFormatConfig = z.input<typeof formatConfigSchema> & { type: "markdown" };
export type HtmlFormatConfig = z.input<typeof formatConfigSchema> & { type: "html" };
export type ScreenshotFormatConfig = z.input<typeof formatConfigSchema> & { type: "screenshot" };
export type JsonFormatConfig = z.input<typeof formatConfigSchema> & { type: "json" };
export type LinksFormatConfig = z.input<typeof formatConfigSchema> & { type: "links" };
export type ImagesFormatConfig = z.input<typeof formatConfigSchema> & { type: "images" };
export type SummaryFormatConfig = z.input<typeof formatConfigSchema> & { type: "summary" };
export type BrandingFormatConfig = z.input<typeof formatConfigSchema> & { type: "branding" };
export type FormatConfig = z.input<typeof formatConfigSchema>;

export type FormatType =
	| "markdown"
	| "html"
	| "links"
	| "images"
	| "summary"
	| "json"
	| "branding"
	| "screenshot";

export type ScrapeRequest = z.input<typeof scrapeRequestSchema>;
export type ExtractRequest = z.input<typeof extractRequestSchema>;
export type SearchRequest = z.input<typeof searchRequestSchema>;
export type CrawlRequest = z.input<typeof crawlRequestSchema>;
export type MonitorCreateRequest = z.input<typeof monitorCreateRequestSchema>;
export type MonitorUpdateRequest = z.input<typeof monitorUpdateRequestSchema>;
export type MonitorActivityRequest = z.input<typeof monitorActivityRequestSchema>;
export type HistoryFilter = z.input<typeof historyFilterSchema>;

export interface TokenUsage {
	promptTokens: number;
	completionTokens: number;
}

export interface ChunkerMetadata {
	chunks: { size: number }[];
}

export type FetchWarningReason = "too_short" | "empty" | "bot_blocked" | "spa_shell" | "soft_404";

export interface FetchWarning {
	reason: FetchWarningReason;
	provider?: string;
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

export interface ScrapeMetadata {
	provider?: string;
	contentType: string;
	elapsedMs?: number;
	warnings?: FetchWarning[];
	ocr?: {
		model: string;
		pagesProcessed: number;
		pages: ContentPageMetadata[];
	};
}

export interface BrandingColors {
	primary: string;
	accent: string;
	background: string;
	textPrimary: string;
	link: string;
}

export interface BrandingFontEntry {
	family: string;
	fallback: string;
}

export interface BrandingTypography {
	primary: BrandingFontEntry;
	heading: BrandingFontEntry;
	mono: BrandingFontEntry;
	sizes: { h1: string; h2: string; body: string };
}

export interface BrandingImages {
	logo: string;
	favicon: string;
	ogImage: string;
}

export interface BrandingPersonality {
	tone: string;
	energy: "high" | "medium" | "low";
	targetAudience: string;
}

export interface Branding {
	colorScheme: "light" | "dark";
	colors: BrandingColors;
	typography: BrandingTypography;
	images: BrandingImages;
	spacing: { baseUnit: number; borderRadius: string };
	frameworkHints: string[];
	personality: BrandingPersonality;
	confidence: number;
}

export interface BrandingMetadata {
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

export interface ScreenshotData {
	url: string;
	width: number;
	height: number;
}

export interface FormatError {
	code: string;
	error: string;
}

export interface FormatResponseMap {
	markdown: string[];
	html: string[];
	links: string[];
	images: string[];
	summary: string;
	json: Record<string, unknown>;
	branding: Branding;
	screenshot: ScreenshotData;
}

export type ImageContentType = Extract<FetchContentType, `image/${string}`>;

export interface FormatMetadataMap {
	markdown: Record<string, never>;
	html: Record<string, never>;
	links: { count: number };
	images: { count: number };
	summary: { chunker?: ChunkerMetadata };
	json: { chunker: ChunkerMetadata; raw?: string | null };
	branding: { branding: BrandingMetadata };
	screenshot: { contentType: ImageContentType; provider?: string };
}

export type ScrapeResultMap = Partial<{
	[K in FormatType]: {
		data: FormatResponseMap[K];
		metadata?: FormatMetadataMap[K];
	};
}>;

export interface ScrapeResponse {
	results: ScrapeResultMap;
	metadata: ScrapeMetadata;
	errors?: Partial<{ [K in FormatType]: FormatError }>;
}

export interface ExtractResponse {
	raw: string | null;
	json: Record<string, unknown> | null;
	usage: TokenUsage;
	metadata: {
		chunker: ChunkerMetadata;
		fetch?: { provider?: string };
	};
}

export interface SearchResult {
	url: string;
	title: string;
	content: string;
	provider?: string;
}

export interface SearchMetadata {
	search: { provider?: string };
	pages: { requested: number; scraped: number };
	chunker?: ChunkerMetadata;
}

export interface SearchResponse {
	results: SearchResult[];
	json?: Record<string, unknown> | null;
	raw?: string | null;
	usage?: TokenUsage;
	metadata: SearchMetadata;
}

export interface CrawlPage {
	url: string;
	status: CrawlPageStatus;
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

export interface CrawlResult {
	status: CrawlStatus;
	reason?: string;
	total: number;
	finished: number;
	pages: CrawlPage[];
}

export interface CrawlResponse extends CrawlResult {
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

export interface MonitorDiffs {
	markdown?: TextChange[];
	html?: TextChange[];
	json?: JsonChange[];
	screenshot?: ImageChange;
	links?: SetChange;
	images?: SetChange;
	summary?: TextChange[];
	branding?: JsonChange[];
}

export type MonitorRefs = Partial<Record<FormatType, string>>;

export interface WebhookStatus {
	sentAt: string;
	statusCode: number | null;
	error?: string;
}

export interface MonitorResult {
	changed: boolean;
	diffs: MonitorDiffs;
	refs: MonitorRefs;
	webhookStatus?: WebhookStatus;
}

export interface MonitorResponse {
	cronId: string;
	scheduleId: string;
	interval: string;
	status: "active" | "paused";
	config: MonitorCreateRequest;
	createdAt: string;
	updatedAt: string;
}

export interface MonitorTickEntry {
	id: string;
	status: MonitorTickStatus;
	createdAt: string;
	elapsedMs: number;
	changed: boolean;
	diffs: MonitorDiffs;
	error?: string;
}

export interface MonitorActivityResponse {
	ticks: MonitorTickEntry[];
	nextCursor: string | null;
}

interface HistoryBase {
	id: string;
	status: HistoryStatus;
	error: unknown;
	elapsedMs: number;
	createdAt: string;
	requestParentId: string | null;
}

export interface ScrapeHistoryEntry extends HistoryBase {
	service: "scrape";
	params: ScrapeRequest;
	result: ScrapeResponse;
}

export interface ExtractHistoryEntry extends HistoryBase {
	service: "extract";
	params: ExtractRequest;
	result: ExtractResponse;
}

export interface SearchHistoryEntry extends HistoryBase {
	service: "search";
	params: SearchRequest;
	result: SearchResponse;
}

export interface MonitorHistoryEntry extends HistoryBase {
	service: "monitor";
	params: { cronId: string; url: string };
	result: MonitorResult;
}

export interface CrawlHistoryEntry extends HistoryBase {
	service: "crawl";
	params: { url: string; maxPages: number };
	result: CrawlResult;
}

export type HistoryEntry =
	| ScrapeHistoryEntry
	| ExtractHistoryEntry
	| SearchHistoryEntry
	| MonitorHistoryEntry
	| CrawlHistoryEntry;

export interface HistoryPagination {
	page: number;
	limit: number;
	total: number;
}

export interface PageResponse<T> {
	data: T[];
	pagination: HistoryPagination;
}

export type HistoryPage = PageResponse<HistoryEntry>;

export interface JobsStatus {
	used: number;
	limit: number;
}

export interface CreditsJobs {
	crawl: JobsStatus;
	monitor: JobsStatus;
}

export interface CreditsResponse {
	remaining: number;
	used: number;
	plan: string;
	jobs: CreditsJobs;
}

export interface HealthResponse {
	status: "ok" | "degraded";
	uptime: number;
}

export interface ApiResult<T> {
	status: "success" | "error";
	data: T | null;
	error?: string;
	elapsedMs: number;
}
