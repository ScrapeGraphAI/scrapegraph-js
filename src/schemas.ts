import { z } from "zod";

export const serviceSchema = z.enum(["scrape", "extract", "search", "monitor", "crawl"]);

export const htmlModeSchema = z.enum(["normal", "reader", "prune"]);

export const fetchModeSchema = z.enum(["auto", "fast", "js"]);

export const timeRangeSchema = z.enum([
	"past_hour",
	"past_24_hours",
	"past_week",
	"past_month",
	"past_year",
]);

export const crawlStatusSchema = z.enum(["running", "completed", "failed", "paused", "deleted"]);

export const crawlPageStatusSchema = z.enum(["completed", "failed", "skipped"]);

export const fetchContentTypeSchema = z.enum([
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

export const userPromptSchema = z.string().min(1).max(10_000);

export const urlSchema = z.string().url();

export const paginationSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
});

export const uuidParamSchema = z.object({
	id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
});

export const FETCH_CONFIG_DEFAULTS = {
	mode: "auto",
	stealth: false,
	timeout: 30000,
	wait: 0,
	scrolls: 0,
} as const;

export const mockConfigSchema = z.object({
	minKb: z.number().int().min(1).max(1000).default(1),
	maxKb: z.number().int().min(1).max(1000).default(5),
	minSleep: z.number().int().min(0).max(30000).default(5),
	maxSleep: z.number().int().min(0).max(30000).default(15),
	writeToBucket: z.boolean().default(false),
});

export const fetchConfigSchema = z.object({
	mode: fetchModeSchema.default(FETCH_CONFIG_DEFAULTS.mode),
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
	mock: z.union([z.boolean(), mockConfigSchema]).default(false),
});

export const historyFilterSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	service: serviceSchema.optional(),
});

export const markdownFormatConfigSchema = z.object({
	type: z.literal("markdown"),
	mode: htmlModeSchema.default("normal"),
});

export const htmlFormatConfigSchema = z.object({
	type: z.literal("html"),
	mode: htmlModeSchema.default("normal"),
});

export const screenshotFormatConfigSchema = z.object({
	type: z.literal("screenshot"),
	fullPage: z.boolean().default(false),
	width: z.number().int().min(320).max(3840).default(1440),
	height: z.number().int().min(200).max(2160).default(900),
	quality: z.number().int().min(1).max(100).default(80),
});

export const jsonFormatConfigSchema = z.object({
	type: z.literal("json"),
	prompt: userPromptSchema,
	schema: z.record(z.string(), z.unknown()).optional(),
	mode: htmlModeSchema.default("normal"),
});

export const linksFormatConfigSchema = z.object({
	type: z.literal("links"),
});

export const imagesFormatConfigSchema = z.object({
	type: z.literal("images"),
});

export const summaryFormatConfigSchema = z.object({
	type: z.literal("summary"),
});

export const brandingFormatConfigSchema = z.object({
	type: z.literal("branding"),
});

export const formatConfigSchema = z.discriminatedUnion("type", [
	markdownFormatConfigSchema,
	htmlFormatConfigSchema,
	screenshotFormatConfigSchema,
	jsonFormatConfigSchema,
	linksFormatConfigSchema,
	imagesFormatConfigSchema,
	summaryFormatConfigSchema,
	brandingFormatConfigSchema,
]);

export const scrapeRequestSchema = z.object({
	url: urlSchema,
	contentType: fetchContentTypeSchema.optional(),
	fetchConfig: fetchConfigSchema.optional(),
	formats: z
		.array(formatConfigSchema)
		.min(1)
		.refine((formats) => new Set(formats.map((format) => format.type)).size === formats.length, {
			message: "duplicate format types not allowed",
		})
		.default([{ type: "markdown", mode: "normal" }]),
});

export const extractRequestSchema = z
	.object({
		url: urlSchema.optional(),
		html: z.string().optional(),
		markdown: z.string().optional(),
		mode: htmlModeSchema.default("normal"),
		prompt: userPromptSchema,
		schema: z.record(z.string(), z.unknown()).optional(),
		contentType: fetchContentTypeSchema.optional(),
		fetchConfig: fetchConfigSchema.optional(),
	})
	.refine((d) => d.url || d.html || d.markdown, {
		message: "Either url, html, or markdown is required",
	});

export const searchRequestSchema = z
	.object({
		query: z.string().min(1).max(500),
		numResults: z.number().int().min(1).max(20).default(3),
		format: z.enum(["html", "markdown"]).default("markdown"),
		mode: htmlModeSchema.default("prune"),
		fetchConfig: fetchConfigSchema.optional(),
		prompt: userPromptSchema.optional(),
		schema: z.record(z.string(), z.unknown()).optional(),
		locationGeoCode: z.string().max(10).optional(),
		timeRange: timeRangeSchema.optional(),
	})
	.refine((d) => !d.schema || d.prompt, {
		message: "schema requires prompt",
	});

export const monitorCreateRequestSchema = z.object({
	url: urlSchema,
	name: z.string().max(200).optional(),
	formats: z
		.array(formatConfigSchema)
		.min(1)
		.refine((formats) => new Set(formats.map((f) => f.type)).size === formats.length, {
			message: "duplicate format types not allowed",
		})
		.default([{ type: "markdown", mode: "normal" }]),
	webhookUrl: urlSchema.optional(),
	interval: z.string().min(1).max(100),
	fetchConfig: fetchConfigSchema.optional(),
});

export const monitorUpdateRequestSchema = z
	.object({
		name: z.string().max(200).optional(),
		formats: z
			.array(formatConfigSchema)
			.min(1)
			.refine((formats) => new Set(formats.map((f) => f.type)).size === formats.length, {
				message: "duplicate format types not allowed",
			})
			.optional(),
		webhookUrl: urlSchema.nullable().optional(),
		interval: z.string().min(1).max(100).optional(),
		fetchConfig: fetchConfigSchema.optional(),
	})
	.partial();

export const monitorActivityRequestSchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(20),
	cursor: z.string().optional(),
});

export const crawlRequestSchema = z.object({
	url: urlSchema,
	formats: z
		.array(formatConfigSchema)
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
	contentTypes: z.array(fetchContentTypeSchema).optional(),
	fetchConfig: fetchConfigSchema.optional(),
});
