import { z } from "zod/v4";
import { MODEL_NAMES } from "./models.js";
import * as url from "./url.js";

// shared sub-schemas composed into route request schemas below

export const serviceEnumSchema = z.enum(["scrape", "extract", "search", "monitor", "crawl"]);
export const statusEnumSchema = z.enum(["completed", "failed"]);
export const htmlModeSchema = z.enum(["normal", "reader", "prune"]);
export const fetchContentTypeSchema = z.enum([
	"text/html",
	"application/json",
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

const PUBLIC_DOMAIN_RE =
	/^(?=.{1,253}\.?$)(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.?$/i;
const IPV4_RE = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

export const urlSchema = z
	.string()
	.trim()
	.transform((val) => (/^[a-z][a-z\d+.-]*:\/\//i.test(val) ? val : `https://${val}`))
	.pipe(z.url())
	.check(
		z.refine((val) => {
			try {
				const { protocol, hostname } = new URL(val);
				if (protocol !== "http:" && protocol !== "https:") return false;
				if (
					!PUBLIC_DOMAIN_RE.test(hostname) &&
					!IPV4_RE.test(hostname) &&
					!hostname.includes(":") &&
					!(process.env.NODE_ENV === "development" && hostname === "localhost")
				) {
					return false;
				}
				if (process.env.NODE_ENV === "development") return true;
				return !url.isInternal(hostname);
			} catch {
				return false;
			}
		}, "Private or internal URLs are not allowed"),
	);

export const paginationSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
});

export const uuidParamSchema = z.object({
	id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
});

export const fetchModeSchema = z.enum(["auto", "fast", "js"]);

export const FETCH_CONFIG_DEFAULTS = {
	mode: "auto",
	stealth: false,
	timeout: 30000,
	wait: 0,
	scrolls: 0,
} as const;

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

export const chunkerSchema = z.object({
	size: z.union([z.number().int().min(2048), z.literal("dynamic")]).optional(),
	overlap: z.number().int().min(0).max(512).optional(),
});

export const llmConfigSchema = z.object({
	model: z.enum(MODEL_NAMES).optional(),
	temperature: z.number().min(0).max(1).default(0),
	maxTokens: z.number().int().min(1).max(16384).default(16384),
	chunker: chunkerSchema.optional(),
});

// route request schemas

export const historyFilterSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	service: serviceEnumSchema.optional(),
});

export const scrapeContentFormatSchema = z.enum([
	"markdown",
	"html",
	"links",
	"images",
	"summary",
	"json",
	"branding",
]);
export const scrapeCaptureFormatSchema = z.enum(["screenshot"]);
export const scrapeFormatSchema = z.enum([
	...scrapeContentFormatSchema.options,
	...scrapeCaptureFormatSchema.options,
]);

export const markdownConfigSchema = z.object({
	mode: htmlModeSchema.default("normal"),
});

export const htmlConfigSchema = z.object({
	mode: htmlModeSchema.default("normal"),
});

export const screenshotConfigSchema = z.object({
	fullPage: z.boolean().default(false),
	width: z.number().int().min(320).max(3840).default(1440),
	height: z.number().int().min(200).max(2160).default(900),
	quality: z.number().int().min(1).max(100).default(80),
});

export const scrapeJsonConfigSchema = z.object({
	prompt: z.string().max(10_000).default(""),
	schema: z.record(z.string(), z.unknown()).optional(),
	// llmConfig: llmConfigSchema.optional(),
	mode: htmlModeSchema.default("normal"),
});

export const scrapeSummaryConfigSchema = z.object({
	// llmConfig: llmConfigSchema.optional(),
});

export const scrapeMarkdownFormatSchema = markdownConfigSchema.extend({
	type: z.literal("markdown"),
});

export const scrapeHtmlFormatSchema = htmlConfigSchema.extend({
	type: z.literal("html"),
});

export const scrapeScreenshotFormatSchema = screenshotConfigSchema.extend({
	type: z.literal("screenshot"),
});

export const scrapeJsonFormatSchema = scrapeJsonConfigSchema.extend({
	type: z.literal("json"),
});

export const scrapeLinksFormatSchema = z.object({
	type: z.literal("links"),
});

export const scrapeImagesFormatSchema = z.object({
	type: z.literal("images"),
});

export const scrapeSummaryFormatSchema = scrapeSummaryConfigSchema.extend({
	type: z.literal("summary"),
});

export const scrapeBrandingFormatSchema = z.object({
	type: z.literal("branding"),
});

export const scrapeFormatEntrySchema = z.discriminatedUnion("type", [
	scrapeMarkdownFormatSchema,
	scrapeHtmlFormatSchema,
	scrapeScreenshotFormatSchema,
	scrapeJsonFormatSchema,
	scrapeLinksFormatSchema,
	scrapeImagesFormatSchema,
	scrapeSummaryFormatSchema,
	scrapeBrandingFormatSchema,
]);

export const scrapeRequestSchema = z.object({
	url: urlSchema,
	contentType: fetchContentTypeSchema.optional(),
	fetchConfig: fetchConfigSchema.optional(),
	formats: z
		.array(scrapeFormatEntrySchema)
		.min(1, { message: "Select at least one format" })
		.refine((formats) => new Set(formats.map((format) => format.type)).size === formats.length, {
			message: "duplicate format types not allowed",
		})
		.default([{ type: "markdown", mode: "normal" }]),
});

export const extractRequestBaseSchema = z
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
		timeRange: z
			.enum(["past_hour", "past_24_hours", "past_week", "past_month", "past_year"])
			.optional(),
	})
	.refine((d) => !d.schema || d.prompt, {
		message: "schema requires prompt",
		path: ["prompt"],
	});

// ─── response schemas ───────────────────────────────────────────────────────

export const validateResponseSchema = z.object({
	email: z.email(),
});

export const okResponseSchema = z.object({
	ok: z.literal(true),
});

export const healthResponseSchema = z.object({
	status: z.enum(["ok", "degraded"]),
	uptime: z.number().int().nonnegative(),
	services: z
		.object({
			redis: z.enum(["ok", "down"]),
			db: z.enum(["ok", "down"]),
		})
		.optional(),
});

export const tokenUsageSchema = z.object({
	promptTokens: z.number().int().nonnegative(),
	completionTokens: z.number().int().nonnegative(),
});

export const chunkerMetadataSchema = z.object({
	chunks: z.array(z.object({ size: z.number().int().nonnegative() })),
});

export const jobsStatusSchema = z.object({
	used: z.number().int().nonnegative(),
	limit: z.number().int().nonnegative(),
});

export const creditsResponseSchema = z.object({
	remaining: z.number().int(),
	used: z.number().int(),
	plan: z.string(),
	jobs: z.object({
		crawl: jobsStatusSchema,
		monitor: jobsStatusSchema,
	}),
});

// ─── monitor schemas ────────────────────────────────────────────────────────

export const monitorCreateSchema = z.object({
	url: urlSchema,
	name: z.string().max(200).optional(),
	formats: z
		.array(scrapeFormatEntrySchema)
		.min(1, { message: "Select at least one format" })
		.refine((formats) => new Set(formats.map((f) => f.type)).size === formats.length, {
			message: "duplicate format types not allowed",
		})
		.default([{ type: "markdown", mode: "normal" }]),
	webhookUrl: urlSchema.optional(),
	interval: z.string().min(1).max(100),
	fetchConfig: fetchConfigSchema.optional(),
});

export const monitorUpdateSchema = z
	.object({
		name: z.string().max(200).optional(),
		formats: z
			.array(scrapeFormatEntrySchema)
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

export const monitorActivityQuerySchema = z.object({
	cursor: z.iso.datetime({ offset: true, local: true }).optional(),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── history response schemas ───────────────────────────────────────────────

export const historyStatusSchema = z.enum(["completed", "failed", "running", "paused", "deleted"]);

const historyBase = {
	id: z.string(),
	status: historyStatusSchema,
	error: z.unknown(),
	elapsedMs: z.number(),
	createdAt: z.iso.datetime(),
	requestParentId: z.string().nullable(),
};

export const paginationInfoSchema = z.object({
	page: z.number().int(),
	limit: z.number().int(),
	total: z.number().int(),
});

export const cursorPaginationInfoSchema = z.object({
	limit: z.number().int(),
	nextCursor: z.string().nullable(),
});

export function pageResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
	return z.object({
		data: z.array(itemSchema),
		pagination: paginationInfoSchema,
	});
}

export function cursorPageResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
	return z.object({
		data: z.array(itemSchema),
		pagination: cursorPaginationInfoSchema,
	});
}

// ─── extract / search response schemas ──────────────────────────────────────

export const extractResponseSchema = z.object({
	raw: z.string().nullable(),
	json: z.record(z.string(), z.unknown()).nullable(),
	usage: tokenUsageSchema,
	metadata: z.object({
		chunker: chunkerMetadataSchema,
		fetch: z.object({ provider: z.string().optional() }).optional(),
	}),
});

export const searchResultSchema = z.object({
	url: z.string(),
	title: z.string(),
	content: z.string(),
	provider: z.string().optional(),
});

export const searchMetadataSchema = z.object({
	search: z.object({ provider: z.string().optional() }),
	pages: z.object({ requested: z.number().int(), scraped: z.number().int() }),
	chunker: chunkerMetadataSchema.optional(),
});

export const searchResponseSchema = z.object({
	results: z.array(searchResultSchema),
	json: z.record(z.string(), z.unknown()).nullable().optional(),
	raw: z.string().nullable().optional(),
	usage: tokenUsageSchema.optional(),
	metadata: searchMetadataSchema,
});

// ─── monitor response schemas ───────────────────────────────────────────────

export const textChangeSchema = z.object({
	type: z.enum(["added", "removed"]),
	line: z.number().int(),
	content: z.string(),
});

export const jsonChangeSchema = z.object({
	path: z.string(),
	old: z.unknown(),
	new: z.unknown(),
});

export const setChangeSchema = z.object({
	added: z.array(z.string()),
	removed: z.array(z.string()),
});

export const imageChangeSchema = z.object({
	size: z.number(),
	changed: z.number(),
	mask: z.string().optional(),
});

export const monitorDiffsSchema = z.object({
	markdown: z.array(textChangeSchema).optional(),
	html: z.array(textChangeSchema).optional(),
	json: z.array(jsonChangeSchema).optional(),
	screenshot: imageChangeSchema.optional(),
	links: setChangeSchema.optional(),
	images: setChangeSchema.optional(),
	summary: z.array(textChangeSchema).optional(),
	branding: z.array(jsonChangeSchema).optional(),
});

export const webhookStatusSchema = z.object({
	sentAt: z.iso.datetime(),
	statusCode: z.number().int().nullable(),
	error: z.string().optional(),
});

export const monitorResultSchema = z.object({
	changed: z.boolean(),
	diffs: monitorDiffsSchema,
	refs: z.record(z.string(), z.string()),
	webhookStatus: webhookStatusSchema.optional(),
});

export const monitorResponseSchema = z.object({
	cronId: z.string(),
	scheduleId: z.string(),
	interval: z.string(),
	status: z.enum(["active", "paused"]),
	config: monitorCreateSchema,
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});

export const monitorTickEntrySchema = z.object({
	id: z.string(),
	status: z.enum(["completed", "failed", "paused", "running"]),
	createdAt: z.iso.datetime(),
	elapsedMs: z.number(),
	changed: z.boolean(),
	diffs: monitorDiffsSchema,
	error: z.string().optional(),
});

export const monitorActivityResponseSchema = z.object({
	ticks: z.array(monitorTickEntrySchema),
	nextCursor: z.string().nullable(),
});

// ─── crawl schemas ─────────────────────────────────────────────────────────

export const crawlStatusSchema = z.enum(["running", "completed", "failed", "paused", "deleted"]);

export const crawlPageStatusSchema = z.enum(["completed", "failed", "skipped"]);

export const crawlRequestSchema = z.object({
	url: urlSchema,
	formats: z
		.array(scrapeFormatEntrySchema)
		.min(1, { message: "Select at least one format" })
		.refine((formats) => new Set(formats.map((f) => f.type)).size === formats.length, {
			message: "duplicate format types not allowed",
		})
		.default([{ type: "markdown", mode: "normal" }]),
	maxDepth: z.coerce.number().int().min(0).default(2),
	maxPages: z.coerce.number().int().min(1).max(1000).default(50),
	maxLinksPerPage: z.coerce.number().int().min(1).default(10),
	allowExternal: z.boolean().default(false),
	includePatterns: z
		.array(z.string())
		.optional()
		.describe(
			'Glob-style URL patterns to include. Use "*/<slug>" for first-level paths and "**/<slug>/**" for nested paths.',
		),
	excludePatterns: z
		.array(z.string())
		.optional()
		.describe(
			'Glob-style URL patterns to exclude. Use "*/<slug>" for first-level paths and "**/<slug>/**" for nested paths.',
		),
	contentTypes: z.array(fetchContentTypeSchema).optional(),
	fetchConfig: fetchConfigSchema.optional(),
});

export const crawlPagesQuerySchema = z.object({
	cursor: z.coerce.number().int().min(0).default(0),
	limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ─── scrape response schemas ────────────────────────────────────────────────

export const fetchWarningSchema = z.object({
	reason: z.enum(["too_short", "empty", "bot_blocked", "spa_shell", "soft_404"]),
	provider: z.string().optional(),
});

export const contentPageMetadataSchema = z.object({
	index: z.number().int(),
	images: z.array(
		z.object({
			id: z.string(),
			topLeftX: z.number(),
			topLeftY: z.number(),
			bottomRightX: z.number(),
			bottomRightY: z.number(),
		}),
	),
	tables: z.array(z.object({ id: z.string(), content: z.string(), format: z.string() })),
	hyperlinks: z.array(z.string()),
	dimensions: z.object({ dpi: z.number(), height: z.number(), width: z.number() }),
});

export const scrapeMetadataSchema = z.object({
	provider: z.string().optional(),
	contentType: z.string(),
	elapsedMs: z.number().optional(),
	warnings: z.array(fetchWarningSchema).optional(),
	ocr: z
		.object({
			model: z.string(),
			pagesProcessed: z.number().int(),
			pages: z.array(contentPageMetadataSchema),
		})
		.optional(),
});

export const brandingColorsSchema = z.object({
	primary: z.string(),
	accent: z.string(),
	background: z.string(),
	textPrimary: z.string(),
	link: z.string(),
});

export const brandingFontEntrySchema = z.object({
	family: z.string(),
	role: z.enum(["heading", "body"]),
});

export const brandingTypographySchema = z.object({
	fontFamilies: z.object({ primary: z.string(), heading: z.string() }),
	fontStacks: z.object({
		heading: z.array(z.string()),
		body: z.array(z.string()),
		paragraph: z.array(z.string()),
	}),
	fontSizes: z.record(z.string(), z.string()),
});

export const brandingSpacingSchema = z.object({
	baseUnit: z.number(),
	borderRadius: z.string(),
});

export const brandingInputComponentSchema = z.object({
	borderColor: z.string(),
	borderRadius: z.string(),
});

export const brandingButtonComponentSchema = z.object({
	background: z.string(),
	textColor: z.string(),
	borderRadius: z.string(),
	shadow: z.string(),
});

export const brandingComponentsSchema = z.object({
	input: brandingInputComponentSchema,
	buttonPrimary: brandingButtonComponentSchema,
	buttonSecondary: brandingButtonComponentSchema,
});

export const brandingImagesSchema = z.object({
	logo: z.string(),
	favicon: z.string(),
	ogImage: z.string(),
});

export const brandingPersonalitySchema = z.object({
	tone: z.string(),
	energy: z.enum(["high", "medium", "low"]),
	targetAudience: z.string(),
});

export const brandingDesignSystemSchema = z.object({
	framework: z.string().nullable(),
	componentLibrary: z.string().nullable(),
});

export const brandingButtonPickSchema = z.object({
	index: z.number().int(),
	text: z.string(),
	reasoning: z.string(),
});

export const brandingButtonReasoningSchema = z.object({
	primary: brandingButtonPickSchema,
	secondary: brandingButtonPickSchema,
	confidence: z.number(),
});

export const brandingLogoReasoningSchema = z.object({
	selectedIndex: z.number().int(),
	reasoning: z.string(),
	confidence: z.number(),
});

export const brandingConfidenceSchema = z.object({
	colors: z.number(),
	buttons: z.number(),
	logo: z.number(),
	fonts: z.number(),
	components: z.number(),
	overall: z.number(),
});

export const brandingSchema = z.object({
	colorScheme: z.enum(["light", "dark"]),
	fonts: z.array(brandingFontEntrySchema),
	colors: brandingColorsSchema,
	typography: brandingTypographySchema,
	spacing: brandingSpacingSchema,
	components: brandingComponentsSchema,
	images: brandingImagesSchema,
	frameworkHints: z.array(z.string()),
	buttonReasoning: brandingButtonReasoningSchema,
	logoReasoning: brandingLogoReasoningSchema,
	personality: brandingPersonalitySchema,
	designSystem: brandingDesignSystemSchema,
	confidence: brandingConfidenceSchema,
});

export const brandingMetadataSchema = z.object({
	title: z.string(),
	description: z.string(),
	favicon: z.string(),
	language: z.string(),
	themeColor: z.string(),
	ogTitle: z.string(),
	ogDescription: z.string(),
	ogImage: z.string(),
	ogUrl: z.string(),
});

export const scrapeScreenshotDataSchema = z.object({
	url: z.string(),
	width: z.number().int(),
	height: z.number().int(),
});

export const scrapeFormatErrorSchema = z.object({
	code: z.string(),
	error: z.string(),
});

const emptyObj = z.object({});

export const scrapeResultSectionSchemas = {
	markdown: z.object({ data: z.array(z.string()), metadata: emptyObj.optional() }),
	html: z.object({ data: z.array(z.string()), metadata: emptyObj.optional() }),
	links: z.object({
		data: z.array(z.string()),
		metadata: z.object({ count: z.number().int() }).optional(),
	}),
	images: z.object({
		data: z.array(z.string()),
		metadata: z.object({ count: z.number().int() }).optional(),
	}),
	summary: z.object({
		data: z.string(),
		metadata: z.object({ chunker: chunkerMetadataSchema.optional() }).optional(),
	}),
	json: z.object({
		data: z.unknown(),
		metadata: z
			.object({
				chunker: chunkerMetadataSchema,
				raw: z.string().nullable().optional(),
			})
			.optional(),
	}),
	branding: z.object({
		data: brandingSchema,
		metadata: z.object({ branding: brandingMetadataSchema }).optional(),
	}),
	screenshot: z.object({
		data: scrapeScreenshotDataSchema,
		metadata: z
			.object({
				contentType: z.string(),
				provider: z.string().optional(),
			})
			.optional(),
	}),
} as const;

export const scrapeResultMapSchema = z.object(scrapeResultSectionSchemas).partial();

export const scrapeResponseSchema = z.object({
	results: scrapeResultMapSchema,
	metadata: scrapeMetadataSchema,
	errors: z.record(scrapeFormatSchema, scrapeFormatErrorSchema).optional(),
});

// [NOTE] @Claude legacy cached/historic scrape responses can predate schema changes
// (e.g., the branding pipeline rework). This sanitizer drops `results.*` sections that
// no longer match the current schema so consumers receive a structurally valid response
// instead of crashing on missing fields. Returns the dropped section names for logging.
export function sanitizeScrapeResponse(raw: unknown): {
	data: unknown;
	dropped: string[];
} {
	const parsed = scrapeResponseSchema.safeParse(raw);
	if (parsed.success) return { data: parsed.data, dropped: [] };
	if (!raw || typeof raw !== "object") return { data: raw, dropped: [] };

	const obj = { ...(raw as Record<string, unknown>) };
	const rawResults = obj.results;
	if (!rawResults || typeof rawResults !== "object") return { data: raw, dropped: [] };

	const cleanResults: Record<string, unknown> = {};
	const dropped: string[] = [];
	for (const [key, sectionSchema] of Object.entries(scrapeResultSectionSchemas)) {
		const value = (rawResults as Record<string, unknown>)[key];
		if (value === undefined) continue;
		const check = sectionSchema.safeParse(value);
		if (check.success) cleanResults[key] = check.data;
		else dropped.push(key);
	}
	obj.results = cleanResults;

	const reparsed = scrapeResponseSchema.safeParse(obj);
	return reparsed.success ? { data: reparsed.data, dropped } : { data: obj, dropped };
}

// ─── crawl response schemas ─────────────────────────────────────────────────

export const crawlPageSchema = z.object({
	url: z.string(),
	status: crawlPageStatusSchema,
	depth: z.number().int(),
	parentUrl: z.string().nullable(),
	links: z.array(z.string()),
	scrapeRefId: z.string(),
	title: z.string(),
	contentType: z.string(),
	screenshotUrl: z.string().optional(),
	reason: z.string().optional(),
	error: z.string().optional(),
	scrape: scrapeResponseSchema.optional(),
});

export const crawlResultSchema = z.object({
	status: crawlStatusSchema,
	reason: z.string().optional(),
	total: z.number().int(),
	finished: z.number().int(),
	pages: z.array(crawlPageSchema),
});

export const crawlResponseSchema = crawlResultSchema.extend({
	id: z.string(),
});

export const crawlPagesResponseSchema = cursorPageResponseSchema(crawlPageSchema);

// ─── job payload schemas (internal endpoints) ───────────────────────────────

export const crawlJobPayloadSchema = z.object({
	crawlId: z.string(),
	urls: z.array(z.string()),
	depth: z.number().int(),
	parentUrl: z.string().nullable(),
	config: crawlRequestSchema,
	userId: z.string(),
	keyId: z.string().nullable(),
});

export const monitorJobPayloadSchema = z.object({
	cronId: z.string(),
	prevId: z.string().nullable(),
	userId: z.string(),
	keyId: z.string().nullable(),
	config: monitorCreateSchema,
});

// ─── history entry schemas (discriminated union by service) ─────────────────

export const scrapeHistoryEntrySchema = z.object({
	...historyBase,
	service: z.literal("scrape"),
	params: scrapeRequestSchema,
	result: scrapeResponseSchema,
});

export const extractHistoryEntrySchema = z.object({
	...historyBase,
	service: z.literal("extract"),
	params: extractRequestBaseSchema,
	result: extractResponseSchema,
});

export const searchHistoryEntrySchema = z.object({
	...historyBase,
	service: z.literal("search"),
	params: searchRequestSchema,
	result: searchResponseSchema,
});

export const monitorHistoryEntrySchema = z.object({
	...historyBase,
	service: z.literal("monitor"),
	params: z.object({ cronId: z.string(), url: z.string() }),
	result: monitorResultSchema,
});

export const crawlHistoryEntrySchema = z.object({
	...historyBase,
	service: z.literal("crawl"),
	params: z.object({ url: z.string(), maxPages: z.number().int() }),
	result: crawlResultSchema,
});

export const historyEntrySchema = z.discriminatedUnion("service", [
	scrapeHistoryEntrySchema,
	extractHistoryEntrySchema,
	searchHistoryEntrySchema,
	monitorHistoryEntrySchema,
	crawlHistoryEntrySchema,
]);

export const historyPageSchema = pageResponseSchema(historyEntrySchema);

// [NOTE] @Claude runtime history route returns raw DB rows whose JSONB `params`/`result` columns
// cannot be narrowed at the edge. This loose schema documents the real wire shape (and tolerates
// a "processing" status for entries still buffered in Redis). SDK consumers that need strong
// per-service typing should parse against `historyEntrySchema` themselves.
export const historyRuntimeEntrySchema = z
	.object({
		id: z.string(),
		service: z.string(),
		status: z.enum([...historyStatusSchema.options, "processing"]),
		error: z.any().optional(),
		elapsedMs: z.number().nullable().optional(),
		createdAt: z.string().optional(),
		requestParentId: z.string().nullable().optional(),
		params: z.any().optional(),
		result: z.any().optional(),
	})
	.loose();

export const historyRuntimePageSchema = pageResponseSchema(historyRuntimeEntrySchema);
