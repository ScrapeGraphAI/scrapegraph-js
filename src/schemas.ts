import { z } from "zod";

export const apiServiceEnumSchema = z.enum(["scrape", "extract", "search", "monitor", "crawl"]);

export const apiStatusEnumSchema = z.enum(["completed", "failed"]);

export const apiHtmlModeSchema = z.enum(["normal", "reader", "prune"]);

export const apiFetchContentTypeSchema = z.enum([
	"text/html",
	"application/pdf",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"image/avif",
	"image/tiff",
	"image/heic",
	"image/bmp",
	"application/epub+zip",
	"application/rtf",
	"application/vnd.oasis.opendocument.text",
	"text/csv",
	"text/plain",
	"application/x-latex",
]);

export const apiUserPromptSchema = z.string().min(1).max(10_000);

export const apiUrlSchema = z.string().url();

export const apiPaginationSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
});

export const apiUuidParamSchema = z.object({
	id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
});

export const apiFetchModeSchema = z.enum(["auto", "fast", "js"]);

export const FETCH_CONFIG_DEFAULTS = {
	mode: "auto",
	stealth: false,
	timeout: 30000,
	wait: 0,
	scrolls: 0,
} as const;

export const apiFetchConfigSchema = z.object({
	mode: apiFetchModeSchema.default(FETCH_CONFIG_DEFAULTS.mode),
	stealth: z.boolean().default(FETCH_CONFIG_DEFAULTS.stealth),
	timeout: z.number().int().min(1000).max(60000).default(FETCH_CONFIG_DEFAULTS.timeout),
	wait: z.number().int().min(0).max(30000).default(FETCH_CONFIG_DEFAULTS.wait),
	headers: z.record(z.string(), z.string()).optional(),
	cookies: z.record(z.string(), z.string()).optional(),
	country: z
		.string()
		.length(2)
		.transform((v) => v.toLowerCase())
		.optional(),
	scrolls: z.number().int().min(0).max(100).default(FETCH_CONFIG_DEFAULTS.scrolls),
	mock: z
		.union([
			z.boolean(),
			z.object({
				minKb: z.number().int().min(1).max(1000).default(1),
				maxKb: z.number().int().min(1).max(1000).default(5),
				minSleep: z.number().int().min(0).max(30000).default(5),
				maxSleep: z.number().int().min(0).max(30000).default(15),
				writeToBucket: z.boolean().default(false),
			}),
		])
		.default(false),
});

export const apiHistoryFilterSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	service: apiServiceEnumSchema.optional(),
});

export const apiScrapeContentFormatSchema = z.enum([
	"markdown",
	"html",
	"links",
	"images",
	"summary",
	"json",
	"branding",
]);

export const apiScrapeCaptureFormatSchema = z.enum(["screenshot"]);

export const apiScrapeFormatSchema = z.enum([
	...apiScrapeContentFormatSchema.options,
	...apiScrapeCaptureFormatSchema.options,
]);

export const apiMarkdownConfigSchema = z.object({
	mode: apiHtmlModeSchema.default("normal"),
});

export const apiHtmlConfigSchema = z.object({
	mode: apiHtmlModeSchema.default("normal"),
});

export const apiScreenshotConfigSchema = z.object({
	fullPage: z.boolean().default(false),
	width: z.number().int().min(320).max(3840).default(1440),
	height: z.number().int().min(200).max(2160).default(900),
	quality: z.number().int().min(1).max(100).default(80),
});

export const apiScrapeJsonConfigSchema = z.object({
	prompt: apiUserPromptSchema,
	schema: z.record(z.string(), z.unknown()).optional(),
	mode: apiHtmlModeSchema.default("normal"),
});

export const apiScrapeSummaryConfigSchema = z.object({});

export const apiScrapeMarkdownFormatSchema = apiMarkdownConfigSchema.extend({
	type: z.literal("markdown"),
});

export const apiScrapeHtmlFormatSchema = apiHtmlConfigSchema.extend({
	type: z.literal("html"),
});

export const apiScrapeScreenshotFormatSchema = apiScreenshotConfigSchema.extend({
	type: z.literal("screenshot"),
});

export const apiScrapeJsonFormatSchema = apiScrapeJsonConfigSchema.extend({
	type: z.literal("json"),
});

export const apiScrapeLinksFormatSchema = z.object({
	type: z.literal("links"),
});

export const apiScrapeImagesFormatSchema = z.object({
	type: z.literal("images"),
});

export const apiScrapeSummaryFormatSchema = apiScrapeSummaryConfigSchema.extend({
	type: z.literal("summary"),
});

export const apiScrapeBrandingFormatSchema = z.object({
	type: z.literal("branding"),
});

export const apiScrapeFormatEntrySchema = z.discriminatedUnion("type", [
	apiScrapeMarkdownFormatSchema,
	apiScrapeHtmlFormatSchema,
	apiScrapeScreenshotFormatSchema,
	apiScrapeJsonFormatSchema,
	apiScrapeLinksFormatSchema,
	apiScrapeImagesFormatSchema,
	apiScrapeSummaryFormatSchema,
	apiScrapeBrandingFormatSchema,
]);

export const apiScrapeRequestSchema = z.object({
	url: apiUrlSchema,
	contentType: apiFetchContentTypeSchema.optional(),
	fetchConfig: apiFetchConfigSchema.optional(),
	formats: z
		.array(apiScrapeFormatEntrySchema)
		.min(1)
		.refine((formats) => new Set(formats.map((format) => format.type)).size === formats.length, {
			message: "duplicate format types not allowed",
		})
		.default([{ type: "markdown", mode: "normal" }]),
});

export const apiExtractRequestBaseSchema = z
	.object({
		url: apiUrlSchema.optional(),
		html: z.string().optional(),
		markdown: z.string().optional(),
		mode: apiHtmlModeSchema.default("normal"),
		prompt: apiUserPromptSchema,
		schema: z.record(z.string(), z.unknown()).optional(),
		contentType: apiFetchContentTypeSchema.optional(),
		fetchConfig: apiFetchConfigSchema.optional(),
	})
	.refine((d) => d.url || d.html || d.markdown, {
		message: "Either url, html, or markdown is required",
	});

export const apiSearchRequestSchema = z
	.object({
		query: z.string().min(1).max(500),
		numResults: z.number().int().min(1).max(20).default(3),
		format: z.enum(["html", "markdown"]).default("markdown"),
		mode: apiHtmlModeSchema.default("prune"),
		fetchConfig: apiFetchConfigSchema.optional(),
		prompt: apiUserPromptSchema.optional(),
		schema: z.record(z.string(), z.unknown()).optional(),
		locationGeoCode: z.string().max(10).optional(),
		timeRange: z
			.enum(["past_hour", "past_24_hours", "past_week", "past_month", "past_year"])
			.optional(),
	})
	.refine((d) => !d.schema || d.prompt, {
		message: "schema requires prompt",
	});

export const apiMonitorCreateSchema = z.object({
	url: apiUrlSchema,
	name: z.string().max(200).optional(),
	formats: z
		.array(apiScrapeFormatEntrySchema)
		.min(1)
		.refine((formats) => new Set(formats.map((f) => f.type)).size === formats.length, {
			message: "duplicate format types not allowed",
		})
		.default([{ type: "markdown", mode: "normal" }]),
	webhookUrl: apiUrlSchema.optional(),
	interval: z.string().min(1).max(100),
	fetchConfig: apiFetchConfigSchema.optional(),
});

export const apiMonitorUpdateSchema = z
	.object({
		name: z.string().max(200).optional(),
		formats: z
			.array(apiScrapeFormatEntrySchema)
			.min(1)
			.refine((formats) => new Set(formats.map((f) => f.type)).size === formats.length, {
				message: "duplicate format types not allowed",
			})
			.optional(),
		webhookUrl: apiUrlSchema.nullable().optional(),
		interval: z.string().min(1).max(100).optional(),
		fetchConfig: apiFetchConfigSchema.optional(),
	})
	.partial();

export const apiCrawlStatusSchema = z.enum(["running", "completed", "failed", "paused", "deleted"]);

export const apiCrawlPageStatusSchema = z.enum(["completed", "failed", "skipped"]);

export const apiCrawlRequestSchema = z.object({
	url: apiUrlSchema,
	formats: z
		.array(apiScrapeFormatEntrySchema)
		.min(1)
		.refine((formats) => new Set(formats.map((f) => f.type)).size === formats.length, {
			message: "duplicate format types not allowed",
		})
		.default([{ type: "markdown", mode: "normal" }]),
	maxDepth: z.coerce.number().int().min(0).default(2),
	maxPages: z.coerce.number().int().min(1).max(1000).default(50),
	maxLinksPerPage: z.coerce.number().int().min(1).default(10),
	allowExternal: z.boolean().default(false),
	includePatterns: z.array(z.string()).optional(),
	excludePatterns: z.array(z.string()).optional(),
	contentTypes: z.array(apiFetchContentTypeSchema).optional(),
	fetchConfig: apiFetchConfigSchema.optional(),
});
