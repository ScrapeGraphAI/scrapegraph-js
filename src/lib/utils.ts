import type {
	ApiCrawlOptions,
	ApiExtractOptions,
	ApiGenerateSchemaOptions,
	ApiHistoryFilterInput,
	ApiMonitorCreateInput,
	ApiScrapeFormat,
	ApiScrapeFormatEntry,
	ApiScrapeOptions,
	ApiSearchOptions,
	LegacyApiMonitorCreateInput,
} from "../types/index.js";
import { toJsonSchema } from "../zod.js";

function normalizeSchema(schema: unknown) {
	return schema ? toJsonSchema(schema) : undefined;
}

function normalizeScrapeFormatEntry(format: ApiScrapeFormatEntry): ApiScrapeFormatEntry {
	if (format.type !== "json" || !format.schema) return format;
	return {
		...format,
		schema: normalizeSchema(format.schema),
	};
}

function buildSingleFormatEntry(
	format: ApiScrapeFormat,
	options?: Pick<ApiScrapeOptions, "html" | "json" | "markdown" | "screenshot" | "summary">,
): ApiScrapeFormatEntry {
	switch (format) {
		case "markdown":
			return { type: "markdown", ...(options?.markdown ?? { mode: "normal" }) };
		case "html":
			return { type: "html", ...(options?.html ?? { mode: "normal" }) };
		case "screenshot":
			return {
				type: "screenshot",
				...(options?.screenshot ?? {
					fullPage: false,
					width: 1440,
					height: 900,
					quality: 80,
				}),
			};
		case "links":
			return { type: "links" };
		case "images":
			return { type: "images" };
		case "summary":
			return { type: "summary", ...(options?.summary ?? {}) };
		case "branding":
			return { type: "branding" };
		case "json": {
			if (!options?.json?.prompt) {
				throw new Error("JSON scrape format requires `json.prompt`");
			}
			return {
				type: "json",
				...options.json,
				schema: normalizeSchema(options.json.schema),
			};
		}
	}
}

export function buildScrapeBody(url: string, scrapeOptions?: ApiScrapeOptions) {
	if (scrapeOptions?.formats?.length) {
		return {
			url,
			contentType: scrapeOptions.contentType,
			fetchConfig: scrapeOptions.fetchConfig,
			formats: scrapeOptions.formats.map(normalizeScrapeFormatEntry),
		};
	}

	const format = scrapeOptions?.format ?? "markdown";
	return {
		url,
		contentType: scrapeOptions?.contentType,
		fetchConfig: scrapeOptions?.fetchConfig,
		formats: [
			buildSingleFormatEntry(format, {
				markdown: scrapeOptions?.markdown,
				html: scrapeOptions?.html,
				screenshot: scrapeOptions?.screenshot,
				json: scrapeOptions?.json,
				summary: scrapeOptions?.summary,
			}),
		],
	};
}

export function buildExtractBody(url: string | undefined, extractOptions: ApiExtractOptions) {
	const body: Record<string, unknown> = { prompt: extractOptions.prompt };
	if (url) body.url = url;
	if (extractOptions.html) body.html = extractOptions.html;
	if (extractOptions.markdown) body.markdown = extractOptions.markdown;
	if (extractOptions.schema) body.schema = toJsonSchema(extractOptions.schema);
	if (extractOptions.mode) body.mode = extractOptions.mode;
	if (extractOptions.contentType) body.contentType = extractOptions.contentType;
	if (extractOptions.fetchConfig) body.fetchConfig = extractOptions.fetchConfig;
	return body;
}

export function buildSearchBody(query: string, searchOptions?: ApiSearchOptions) {
	const body: Record<string, unknown> = { query, ...searchOptions };
	if (searchOptions?.schema) body.schema = toJsonSchema(searchOptions.schema);
	return body;
}

export function buildSchemaBody(prompt: string, schemaOptions?: ApiGenerateSchemaOptions) {
	const body: Record<string, unknown> = { prompt };
	if (schemaOptions?.existingSchema) {
		body.existingSchema = toJsonSchema(schemaOptions.existingSchema);
	}
	if (schemaOptions?.model) body.model = schemaOptions.model;
	return body;
}

export function buildHistoryQuery(historyFilter?: ApiHistoryFilterInput) {
	const query = new URLSearchParams();
	if (historyFilter?.page != null) query.set("page", String(historyFilter.page));
	if (historyFilter?.limit != null) query.set("limit", String(historyFilter.limit));
	if (historyFilter?.service) query.set("service", historyFilter.service);
	return query.toString();
}

export function buildMonitorBody(monitorCreateInput: ApiMonitorCreateInput) {
	if ("formats" in monitorCreateInput && monitorCreateInput.formats?.length) {
		return {
			...monitorCreateInput,
			formats: monitorCreateInput.formats.map(normalizeScrapeFormatEntry),
		};
	}

	const legacyMonitorInput = monitorCreateInput as LegacyApiMonitorCreateInput;
	return {
		url: legacyMonitorInput.url,
		name: legacyMonitorInput.name,
		webhookUrl: legacyMonitorInput.webhookUrl,
		interval: legacyMonitorInput.interval,
		fetchConfig: legacyMonitorInput.fetchConfig,
		formats: [
			{
				type: "json" as const,
				prompt: legacyMonitorInput.prompt,
				schema: normalizeSchema(legacyMonitorInput.schema),
				llmConfig: legacyMonitorInput.llmConfig,
				mode: "normal" as const,
			},
		],
	};
}

export function buildCrawlBody(url: string, crawlOptions?: ApiCrawlOptions) {
	if (crawlOptions?.formats?.length) {
		return {
			url,
			...crawlOptions,
			formats: crawlOptions.formats.map(normalizeScrapeFormatEntry),
		};
	}

	const { format, ...rest } = crawlOptions ?? {};
	return {
		url,
		...rest,
		formats: [buildSingleFormatEntry(format ?? "markdown")],
	};
}
