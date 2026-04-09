import { z } from "zod/v4";
import { MODEL_NAMES } from "./models.js";
import * as url from "./url.js";

export const apiServiceEnumSchema = z.enum([
	"scrape",
	"extract",
	"search",
	"monitor",
	"crawl",
]);
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
export const apiFetchModeSchema = z.enum(["auto", "fast", "js", "direct+stealth", "js+stealth"]);
export const apiUserPromptSchema = z.string().min(1).max(10_000);

export const apiUrlSchema = z.url().check(
	z.refine((val) => {
		try {
			const { protocol, hostname } = new URL(val);
			if (protocol !== "http:" && protocol !== "https:") return false;
			return !url.isInternal(hostname);
		} catch {
			return false;
		}
	}, "Private or internal URLs are not allowed"),
);

export const apiPaginationSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
});

export const apiUuidParamSchema = z.object({
	id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
});

export const FETCH_CONFIG_DEFAULTS = {
	mode: "auto",
	timeout: 30000,
	wait: 0,
	scrolls: 0,
} as const;

export const apiFetchConfigSchema = z.object({
	mode: apiFetchModeSchema.default(FETCH_CONFIG_DEFAULTS.mode),
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

export const apiChunkerSchema = z.object({
	size: z.union([z.number().int().min(2048), z.literal("dynamic")]).optional(),
	overlap: z.number().int().min(0).max(512).optional(),
});

export const apiLlmConfigSchema = z.object({
	model: z.enum(MODEL_NAMES).optional(),
	temperature: z.number().min(0).max(1).default(0),
	maxTokens: z.number().int().min(1).max(16384).default(4096),
	chunker: apiChunkerSchema.optional(),
});

export const apiHistoryFilterSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	service: apiServiceEnumSchema.optional(),
});

export const apiScrapeFormatSchema = z.enum(["markdown", "html", "screenshot", "branding"]);

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

const scrapeBase = {
	url: apiUrlSchema,
	contentType: apiFetchContentTypeSchema.optional(),
	fetchConfig: apiFetchConfigSchema.optional(),
};

const apiScrapeDiscriminatedSchema = z.discriminatedUnion("format", [
	z.object({
		...scrapeBase,
		format: z.literal("markdown"),
		markdown: apiMarkdownConfigSchema.default({ mode: "normal" }),
	}),
	z.object({
		...scrapeBase,
		format: z.literal("html"),
		html: apiHtmlConfigSchema.default({ mode: "normal" }),
	}),
	z.object({
		...scrapeBase,
		format: z.literal("screenshot"),
		screenshot: apiScreenshotConfigSchema.default({
			fullPage: false,
			width: 1440,
			height: 900,
			quality: 80,
		}),
	}),
	z.object({
		...scrapeBase,
		format: z.literal("branding"),
	}),
]);

// [NOTE] @Claude preprocess injects format:"markdown" when omitted so { url } works as default
export const apiScrapeRequestSchema = z.preprocess((val) => {
	if (typeof val === "object" && val && !("format" in val)) return { ...val, format: "markdown" };
	return val;
}, apiScrapeDiscriminatedSchema);

export const apiExtractRequestBaseSchema = z
	.object({
		url: apiUrlSchema.optional(),
		html: z.string().optional(),
		markdown: z.string().optional(),
		mode: apiHtmlModeSchema.default("normal"),
		prompt: apiUserPromptSchema,
		schema: z.record(z.string(), z.unknown()).optional(),
		contentType: apiFetchContentTypeSchema.optional(),
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
		llmConfig: apiLlmConfigSchema.optional(),
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
	prompt: apiUserPromptSchema,
	schema: z.record(z.string(), z.unknown()).optional(),
	webhookUrl: apiUrlSchema.optional(),
	interval: z.string().min(1).max(100),
	fetchConfig: apiFetchConfigSchema.optional(),
	llmConfig: apiLlmConfigSchema.optional(),
});

export const apiMonitorUpdateSchema = z
	.object({
		name: z.string().max(200).optional(),
		prompt: apiUserPromptSchema.optional(),
		schema: z.record(z.string(), z.unknown()).optional(),
		webhookUrl: apiUrlSchema.nullable().optional(),
		interval: z.string().min(1).max(100).optional(),
		fetchConfig: apiFetchConfigSchema.optional(),
		llmConfig: apiLlmConfigSchema.optional(),
	})
	.partial();

export const apiCrawlStatusSchema = z.enum([
	"running",
	"completed",
	"failed",
	"cancelled",
	"paused",
]);

export const apiCrawlPageStatusSchema = z.enum(["completed", "failed", "skipped"]);

export const apiCrawlRequestSchema = z.object({
	url: apiUrlSchema,
	maxDepth: z.coerce.number().int().min(0).max(10).default(2),
	maxPages: z.coerce.number().int().min(1).max(500).default(50),
	maxLinksPerPage: z.coerce.number().int().min(1).max(50).default(10),
	allowExternal: z.boolean().default(false),
	includePatterns: z.array(z.string()).optional(),
	excludePatterns: z.array(z.string()).optional(),
	contentTypes: z.array(apiFetchContentTypeSchema).optional(),
	fetchConfig: apiFetchConfigSchema.optional(),
});
