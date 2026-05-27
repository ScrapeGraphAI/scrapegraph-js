import type { z } from "zod/v4";
import type {
	brandingButtonComponentSchema,
	brandingButtonReasoningSchema,
	brandingColorsSchema,
	brandingComponentsSchema,
	brandingConfidenceSchema,
	brandingDesignSystemSchema,
	brandingFontEntrySchema,
	brandingImagesSchema,
	brandingInputComponentSchema,
	brandingLogoReasoningSchema,
	brandingMetadataSchema,
	brandingPersonalitySchema,
	brandingSchema,
	brandingSpacingSchema,
	brandingTypographySchema,
	chunkerMetadataSchema,
	contentPageMetadataSchema,
	crawlHistoryEntrySchema,
	crawlJobPayloadSchema,
	crawlPageSchema,
	crawlPageStatusSchema,
	crawlPagesQuerySchema,
	crawlPagesResponseSchema,
	crawlRequestSchema,
	crawlResponseSchema,
	crawlResultSchema,
	crawlStatusSchema,
	creditsResponseSchema,
	cursorPaginationInfoSchema,
	extractHistoryEntrySchema,
	extractRequestBaseSchema,
	extractResponseSchema,
	fetchConfigSchema,
	fetchContentTypeSchema,
	fetchModeSchema,
	fetchWarningSchema,
	healthResponseSchema,
	historyEntrySchema,
	historyFilterSchema,
	historyPageSchema,
	historyStatusSchema,
	htmlConfigSchema,
	imageChangeSchema,
	jobsStatusSchema,
	jsonChangeSchema,
	llmConfigSchema,
	markdownConfigSchema,
	monitorActivityQuerySchema,
	monitorActivityResponseSchema,
	monitorCreateSchema,
	monitorDiffsSchema,
	monitorHistoryEntrySchema,
	monitorJobPayloadSchema,
	monitorResponseSchema,
	monitorResultSchema,
	monitorTickEntrySchema,
	monitorUpdateSchema,
	paginationInfoSchema,
	scrapeBrandingFormatSchema,
	scrapeCaptureFormatSchema,
	scrapeContentFormatSchema,
	scrapeFormatEntrySchema,
	scrapeFormatErrorSchema,
	scrapeFormatSchema,
	scrapeHistoryEntrySchema,
	scrapeHtmlFormatSchema,
	scrapeImagesFormatSchema,
	scrapeJsonFormatSchema,
	scrapeLinksFormatSchema,
	scrapeMarkdownFormatSchema,
	scrapeMetadataSchema,
	scrapeRequestSchema,
	scrapeResponseSchema,
	scrapeResultMapSchema,
	scrapeScreenshotDataSchema,
	scrapeScreenshotFormatSchema,
	scrapeSummaryConfigSchema,
	scrapeSummaryFormatSchema,
	searchHistoryEntrySchema,
	searchMetadataSchema,
	searchRequestSchema,
	searchResponseSchema,
	searchResultSchema,
	setChangeSchema,
	textChangeSchema,
	tokenUsageSchema,
	validateResponseSchema,
	webhookStatusSchema,
} from "./schemas.js";

// ─── generic / config ────────────────────────────────────────────────────────

export type { ModelName } from "./models.js";
export type UserRole = "user" | "admin";

export type ErrorType =
	| "auth_missing_key"
	| "internal"
	| "monitor_tick_failed"
	| "not_found"
	| "upstream_failed"
	| "validation";

export interface Error {
	type: ErrorType;
	message: string;
	details?: unknown;
}

export interface ErrorResponse {
	error: Error;
}

export type RateLimitKind = "work" | "poll";

export interface RateLimitConfig {
	work: number;
	poll: number;
}

export interface ServiceConfig {
	rateLimit: RateLimitConfig;
	maxJobs?: number;
}

export type ServicesConfig = Record<string, ServiceConfig>;

export type TokenUsage = z.infer<typeof tokenUsageSchema>;
export type ChunkerMetadata = z.infer<typeof chunkerMetadataSchema>;
export type ValidateResponse = z.infer<typeof validateResponseSchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;

// ─── scrape ──────────────────────────────────────────────────────────────────

export type ScrapeRequest = z.infer<typeof scrapeRequestSchema>;
export type FetchConfig = z.infer<typeof fetchConfigSchema>;
export type FetchMode = z.infer<typeof fetchModeSchema>;
export type FetchContentType = z.infer<typeof fetchContentTypeSchema>;
export type ImageContentType = Extract<FetchContentType, `image/${string}`>;

export type ContentPageMetadata = z.infer<typeof contentPageMetadataSchema>;
export type FetchWarning = z.infer<typeof fetchWarningSchema>;
export type ScrapeMetadata = z.infer<typeof scrapeMetadataSchema>;

export type ScrapeContentFormat = z.infer<typeof scrapeContentFormatSchema>;
export type ScrapeCaptureFormat = z.infer<typeof scrapeCaptureFormatSchema>;
export type ScrapeFormat = z.infer<typeof scrapeFormatSchema>;
export type ScrapeMarkdownConfig = z.infer<typeof markdownConfigSchema>;
export type ScrapeHtmlConfig = z.infer<typeof htmlConfigSchema>;
export type ScrapeSummaryConfig = z.infer<typeof scrapeSummaryConfigSchema>;
export type ScrapeFormatEntry = z.infer<typeof scrapeFormatEntrySchema>;
export type ScrapeMarkdownFormatEntry = z.infer<typeof scrapeMarkdownFormatSchema>;
export type ScrapeHtmlFormatEntry = z.infer<typeof scrapeHtmlFormatSchema>;
export type ScrapeLinksFormatEntry = z.infer<typeof scrapeLinksFormatSchema>;
export type ScrapeImagesFormatEntry = z.infer<typeof scrapeImagesFormatSchema>;
export type ScrapeSummaryFormatEntry = z.infer<typeof scrapeSummaryFormatSchema>;
export type ScrapeJsonFormatEntry = z.infer<typeof scrapeJsonFormatSchema>;
export type ScrapeBrandingFormatEntry = z.infer<typeof scrapeBrandingFormatSchema>;
export type ScrapeScreenshotFormatEntry = z.infer<typeof scrapeScreenshotFormatSchema>;
export type ScrapeContentFormatEntry = Extract<ScrapeFormatEntry, { type: ScrapeContentFormat }>;

export type BrandingColors = z.infer<typeof brandingColorsSchema>;
export type BrandingFontEntry = z.infer<typeof brandingFontEntrySchema>;
export type BrandingTypography = z.infer<typeof brandingTypographySchema>;
export type BrandingSpacing = z.infer<typeof brandingSpacingSchema>;
export type BrandingInputComponent = z.infer<typeof brandingInputComponentSchema>;
export type BrandingButtonComponent = z.infer<typeof brandingButtonComponentSchema>;
export type BrandingComponents = z.infer<typeof brandingComponentsSchema>;
export type BrandingImages = z.infer<typeof brandingImagesSchema>;
export type BrandingPersonality = z.infer<typeof brandingPersonalitySchema>;
export type BrandingDesignSystem = z.infer<typeof brandingDesignSystemSchema>;
export type BrandingButtonReasoning = z.infer<typeof brandingButtonReasoningSchema>;
export type BrandingLogoReasoning = z.infer<typeof brandingLogoReasoningSchema>;
export type BrandingConfidence = z.infer<typeof brandingConfidenceSchema>;
export type Branding = z.infer<typeof brandingSchema>;
export type BrandingMetadata = z.infer<typeof brandingMetadataSchema>;
export type ScrapeFormatError = z.infer<typeof scrapeFormatErrorSchema>;
export type ScrapeScreenshotData = z.infer<typeof scrapeScreenshotDataSchema>;
export type ScrapeResultMap = z.infer<typeof scrapeResultMapSchema>;

export type ScrapeFormatResponseMap = {
	[K in keyof Required<ScrapeResultMap>]: NonNullable<ScrapeResultMap[K]>["data"];
};

export type ScrapeFormatMetadataMap = {
	[K in keyof Required<ScrapeResultMap>]: NonNullable<NonNullable<ScrapeResultMap[K]>["metadata"]>;
};

export type ScrapeResponse = z.infer<typeof scrapeResponseSchema>;

export type ScrapeEvent =
	| { type: "scrape.fetch.started"; url: string }
	| { type: "scrape.fetch.completed"; url: string; elapsedMs: number }
	| { type: "scrape.process.started"; format: ScrapeFormat }
	| { type: "scrape.process.completed"; format: ScrapeFormat; elapsedMs: number }
	| { type: "scrape.process.failed"; format: ScrapeFormat; error: string; code: string }
	| { type: "scrape.result"; data: ScrapeResponse }
	| { type: "scrape.failed"; error: string; code: string }
	| { type: "scrape.completed" };

// ─── extract ─────────────────────────────────────────────────────────────────

export type ExtractRequestBase = z.infer<typeof extractRequestBaseSchema>;
export type LlmConfig = z.infer<typeof llmConfigSchema>;

export type ExtractResponse = z.infer<typeof extractResponseSchema>;

export type ExtractEvent =
	| { type: "extract.fetch.started"; url: string }
	| { type: "extract.fetch.completed"; url: string; elapsedMs: number }
	| { type: "extract.extraction.started" }
	| { type: "extract.extraction.completed"; elapsedMs: number }
	| { type: "extract.failed"; error: string }
	| { type: "extract.completed" };

// ─── search ──────────────────────────────────────────────────────────────────

export type SearchRequest = z.infer<typeof searchRequestSchema>;

export type SearchResult = z.infer<typeof searchResultSchema>;
export type SearchMetadata = z.infer<typeof searchMetadataSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;

export type SearchEvent =
	| { type: "search.query.started" }
	| {
			type: "search.query.completed";
			query: string;
			prompt: string;
			urls: string[];
			totalResults: number;
	  }
	| { type: "search.scrape.started"; url: string; requestId: string }
	| { type: "search.scrape.completed"; url: string; requestId: string; data: unknown }
	| { type: "search.scrape.failed"; url: string; requestId: string; error: string }
	| { type: "search.scrape.done"; total: number; scraped: number }
	| { type: "search.merge.started" }
	| { type: "search.failed"; error: string }
	| { type: "search.completed" };

// ─── monitor ─────────────────────────────────────────────────────────────────

export type MonitorCreateRequest = z.infer<typeof monitorCreateSchema>;
export type MonitorUpdateRequest = z.infer<typeof monitorUpdateSchema>;
export type MonitorActivityQuery = z.input<typeof monitorActivityQuerySchema>;

export type TextChange = z.infer<typeof textChangeSchema>;
export type JsonChange = z.infer<typeof jsonChangeSchema>;
export type SetChange = z.infer<typeof setChangeSchema>;
export type ImageChange = z.infer<typeof imageChangeSchema>;
export type MonitorDiffs = z.infer<typeof monitorDiffsSchema>;
export type MonitorRefs = Partial<Record<ScrapeFormat, string>>;
export type WebhookStatus = z.infer<typeof webhookStatusSchema>;
export type MonitorResult = z.infer<typeof monitorResultSchema>;

export function countMonitorDiffs(diffs?: Partial<MonitorDiffs>): number {
	let count = 0;
	if (diffs?.markdown) count += diffs.markdown.length;
	if (diffs?.html) count += diffs.html.length;
	if (diffs?.json) count += diffs.json.length;
	if (diffs?.summary) count += diffs.summary.length;
	if (diffs?.branding) count += diffs.branding.length;
	if (diffs?.links) count += diffs.links.added.length + diffs.links.removed.length;
	if (diffs?.images) count += diffs.images.added.length + diffs.images.removed.length;
	if (diffs?.screenshot?.changed) count += 1;
	return count;
}

export type MonitorJobPayload = z.infer<typeof monitorJobPayloadSchema>;

export type MonitorResponse = z.infer<typeof monitorResponseSchema>;
export type MonitorTickEntry = z.infer<typeof monitorTickEntrySchema>;
export type MonitorTickStatus = MonitorTickEntry["status"];
export type MonitorActivityResponse = z.infer<typeof monitorActivityResponseSchema>;

export type WebhookPayload =
	| {
			type: "monitor.change.detected";
			data: {
				cronId: string;
				url: string;
				changedAt: string;
				changed: boolean;
				current: ScrapeResultMap;
				previous: ScrapeResultMap | null;
				diffs: MonitorDiffs;
			};
	  }
	| {
			type: "monitor.test";
			data: {
				cronId: string;
				url: string;
				sentAt: string;
			};
	  };

export type MonitorEvent =
	| { type: "monitor.tick.started"; cronId: string; url: string }
	| { type: "monitor.tick.completed"; cronId: string; changed: boolean }
	| {
			type: "monitor.change.detected";
			cronId: string;
			url: string;
			diffs: MonitorDiffs;
	  }
	| { type: "monitor.tick.failed"; cronId: string; url: string; error: string }
	| { type: "monitor.paused"; cronId: string; reason: string }
	| { type: "monitor.webhook.completed"; cronId: string; statusCode: number }
	| { type: "monitor.webhook.failed"; cronId: string; error: string };

// ─── crawl ───────────────────────────────────────────────────────────────────

export type CrawlRequest = z.infer<typeof crawlRequestSchema>;
export type CrawlStatus = z.infer<typeof crawlStatusSchema>;
export type CrawlPageStatus = z.infer<typeof crawlPageStatusSchema>;

export type CrawlPage = z.infer<typeof crawlPageSchema>;
export type CrawlPagesQuery = z.infer<typeof crawlPagesQuerySchema>;
export type CrawlPagesResponse = z.infer<typeof crawlPagesResponseSchema>;
export type CrawlResponse = z.infer<typeof crawlResponseSchema>;

export type CrawlJobPayload = z.infer<typeof crawlJobPayloadSchema>;

export type CrawlEvent =
	| { type: "crawl.started"; crawlId: string; url: string }
	| { type: "crawl.page.completed"; crawlId: string; page: CrawlPage }
	| { type: "crawl.page.skipped"; crawlId: string; page: CrawlPage; reason: string }
	| {
			type: "crawl.page.failed";
			crawlId: string;
			page: CrawlPage;
			error: string;
	  }
	| { type: "crawl.progress"; crawlId: string; total: number; finished: number }
	| { type: "crawl.paused"; crawlId: string; reason: string }
	| { type: "crawl.resumed"; crawlId: string }
	| { type: "crawl.completed"; crawlId: string };

export type Event = ScrapeEvent | ExtractEvent | SearchEvent | MonitorEvent | CrawlEvent;

export type EventType = Event["type"];

export type EventData<T extends EventType> = Extract<Event, { type: T }>;

// ─── history ─────────────────────────────────────────────────────────────────

export type HistoryFilter = z.infer<typeof historyFilterSchema>;
export type HistoryService = "scrape" | "extract" | "search" | "monitor" | "crawl";
export type HistoryStatus = z.infer<typeof historyStatusSchema>;

export type ScrapeHistoryEntry = z.infer<typeof scrapeHistoryEntrySchema>;
export type ExtractHistoryEntry = z.infer<typeof extractHistoryEntrySchema>;
export type SearchHistoryEntry = z.infer<typeof searchHistoryEntrySchema>;
export type MonitorHistoryEntry = z.infer<typeof monitorHistoryEntrySchema>;
export type CrawlHistoryEntry = z.infer<typeof crawlHistoryEntrySchema>;
export type CrawlResult = z.infer<typeof crawlResultSchema>;
export type HistoryEntry = z.infer<typeof historyEntrySchema>;

export interface PageResponse<T> {
	data: T[];
	pagination: z.infer<typeof paginationInfoSchema>;
}

export interface CursorPageResponse<T> {
	data: T[];
	pagination: z.infer<typeof cursorPaginationInfoSchema>;
}

export type HistoryPage = z.infer<typeof historyPageSchema>;

// ─── credits ─────────────────────────────────────────────────────────────────

export type JobsStatus = z.infer<typeof jobsStatusSchema>;
export type CreditsResponse = z.infer<typeof creditsResponseSchema>;

// ─── credit ledger ──────────────────────────────────────────────────────────

// [NOTE] @Claude single-letter keys to minimise Redis memory per entry — flushed to DB with full names
export interface CreditLedgerEntry {
	i: string;
	k: string;
	a: number;
	s: string;
	t: number;
	r?: string;
	ak?: string;
}

export interface TopUpInProcessEntry {
	i: string;
	k: string;
	t: number;
}
// ─── legacy migration ───────────────────────────────────────────────────────

export interface LegacyOnboarding {
	jobRole: string;
	company: string | null;
	companySize: string;
	primaryUseCase: string;
	source: string;
}

export interface LegacyUserData {
	oldUserId: string;
	stripeCustomerId: string | null;
	stripeSubscriptionId: string | null;
	planId: string;
	remainingCredits: number;
	onboarding: LegacyOnboarding;
}

export interface ApiResult<T> {
	status: "success" | "error";
	data: T | null;
	error?: string;
	elapsedMs: number;
}
