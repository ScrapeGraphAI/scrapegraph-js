import { request } from "./http.js";
import type {
	ClientConfig,
	CrawlOptions,
	MonitorCreateOptions,
	RequestOptions,
} from "./types/index.js";
import { DEFAULT_BASE_URL } from "./types/index.js";
import { toJsonSchema } from "./zod.js";

/** Create a ScrapeGraphAI client. All methods return `{ data, _requestId }`. */
export function scrapegraphai(config: ClientConfig) {
	const base = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
	const key = config.apiKey;
	const defaults = { maxRetries: config.maxRetries, timeout: config.timeout };

	function url(path: string) {
		return `${base}${path}`;
	}

	function opts(ro?: RequestOptions) {
		return { ...defaults, ...ro };
	}

	return {
		async scrape(
			targetUrl: string,
			options?: { format?: string; fetchConfig?: Record<string, unknown> },
			ro?: RequestOptions,
		) {
			return request("POST", url("/v2/scrape"), key, { url: targetUrl, ...options }, opts(ro));
		},

		async extract(
			targetUrl: string,
			options: { prompt: string; schema?: unknown; llmConfig?: Record<string, unknown> },
			ro?: RequestOptions,
		) {
			const body: Record<string, unknown> = { url: targetUrl, prompt: options.prompt };
			if (options.schema) body.schema = toJsonSchema(options.schema);
			if (options.llmConfig) body.llmConfig = options.llmConfig;
			return request("POST", url("/v2/extract"), key, body, opts(ro));
		},

		async search(query: string, options?: { numResults?: number }, ro?: RequestOptions) {
			return request("POST", url("/v2/search"), key, { query, ...options }, opts(ro));
		},

		async schema(
			prompt: string,
			options?: { existingSchema?: Record<string, unknown> },
			ro?: RequestOptions,
		) {
			return request("POST", url("/v2/schema"), key, { prompt, ...options }, opts(ro));
		},

		async credits(ro?: RequestOptions) {
			return request("GET", url("/v2/credits"), key, undefined, opts(ro));
		},

		async history(
			options?: { page?: number; limit?: number; service?: string },
			ro?: RequestOptions,
		) {
			const qs = new URLSearchParams();
			if (options?.page != null) qs.set("page", String(options.page));
			if (options?.limit != null) qs.set("limit", String(options.limit));
			if (options?.service) qs.set("service", options.service);
			const query = qs.toString();
			return request(
				"GET",
				url(`/v2/history${query ? `?${query}` : ""}`),
				key,
				undefined,
				opts(ro),
			);
		},

		crawl: {
			async start(targetUrl: string, options?: CrawlOptions, ro?: RequestOptions) {
				return request("POST", url("/v2/crawl"), key, { url: targetUrl, ...options }, opts(ro));
			},

			async status(id: string, ro?: RequestOptions) {
				return request("GET", url(`/v2/crawl/${id}`), key, undefined, opts(ro));
			},

			async stop(id: string, ro?: RequestOptions) {
				return request("POST", url(`/v2/crawl/${id}/stop`), key, {}, opts(ro));
			},

			async resume(id: string, ro?: RequestOptions) {
				return request("POST", url(`/v2/crawl/${id}/resume`), key, {}, opts(ro));
			},
		},

		monitor: {
			async create(options: MonitorCreateOptions, ro?: RequestOptions) {
				return request("POST", url("/v2/monitor"), key, { ...options }, opts(ro));
			},

			async list(ro?: RequestOptions) {
				return request("GET", url("/v2/monitor"), key, undefined, opts(ro));
			},

			async get(id: string, ro?: RequestOptions) {
				return request("GET", url(`/v2/monitor/${id}`), key, undefined, opts(ro));
			},

			async pause(id: string, ro?: RequestOptions) {
				return request("POST", url(`/v2/monitor/${id}/pause`), key, {}, opts(ro));
			},

			async resume(id: string, ro?: RequestOptions) {
				return request("POST", url(`/v2/monitor/${id}/resume`), key, {}, opts(ro));
			},

			async delete(id: string, ro?: RequestOptions) {
				return request("DELETE", url(`/v2/monitor/${id}`), key, undefined, opts(ro));
			},
		},
	};
}
