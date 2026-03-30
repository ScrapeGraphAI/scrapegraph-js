import { request } from "./http.js";
import type {
	ApiCrawlOptions,
	ApiExtractOptions,
	ApiHistoryFilterInput,
	ApiMonitorCreateInput,
	ApiScrapeOptions,
	ApiSearchOptions,
	ClientConfig,
	RequestOptions,
} from "./types/index.js";
import { DEFAULT_BASE_URL } from "./types/index.js";
import { toJsonSchema } from "./zod.js";

/** Create a ScrapeGraphAI client. All methods return `{ data, requestId }`. */
export function scrapegraphai(config: ClientConfig) {
	const base = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
	const key = config.apiKey;
	const defaults = { maxRetries: config.maxRetries, timeout: config.timeout };

	function buildUrl(path: string) {
		return `${base}${path}`;
	}

	function mergeRequestOptions(requestOptions?: RequestOptions) {
		return { ...defaults, ...requestOptions };
	}

	return {
		async scrape(url: string, scrapeOptions?: ApiScrapeOptions, requestOptions?: RequestOptions) {
			return request(
				"POST",
				buildUrl("/v2/scrape"),
				key,
				{ url, ...scrapeOptions },
				mergeRequestOptions(requestOptions),
			);
		},

		async extract(url: string, extractOptions: ApiExtractOptions, requestOptions?: RequestOptions) {
			const body: Record<string, unknown> = { url, prompt: extractOptions.prompt };
			if (extractOptions.schema) body.schema = toJsonSchema(extractOptions.schema);
			if (extractOptions.llmConfig) body.llmConfig = extractOptions.llmConfig;
			if (extractOptions.mode) body.mode = extractOptions.mode;
			if (extractOptions.contentType) body.contentType = extractOptions.contentType;
			if (extractOptions.fetchConfig) body.fetchConfig = extractOptions.fetchConfig;
			return request(
				"POST",
				buildUrl("/v2/extract"),
				key,
				body,
				mergeRequestOptions(requestOptions),
			);
		},

		async search(query: string, searchOptions?: ApiSearchOptions, requestOptions?: RequestOptions) {
			return request(
				"POST",
				buildUrl("/v2/search"),
				key,
				{ query, ...searchOptions },
				mergeRequestOptions(requestOptions),
			);
		},

		async credits(requestOptions?: RequestOptions) {
			return request(
				"GET",
				buildUrl("/v2/credits"),
				key,
				undefined,
				mergeRequestOptions(requestOptions),
			);
		},

		async history(historyFilter?: ApiHistoryFilterInput, requestOptions?: RequestOptions) {
			const qs = new URLSearchParams();
			if (historyFilter?.page != null) qs.set("page", String(historyFilter.page));
			if (historyFilter?.limit != null) qs.set("limit", String(historyFilter.limit));
			if (historyFilter?.service) qs.set("service", historyFilter.service);
			const query = qs.toString();
			return request(
				"GET",
				buildUrl(`/v2/history${query ? `?${query}` : ""}`),
				key,
				undefined,
				mergeRequestOptions(requestOptions),
			);
		},

		crawl: {
			async start(url: string, crawlOptions?: ApiCrawlOptions, requestOptions?: RequestOptions) {
				return request(
					"POST",
					buildUrl("/v2/crawl"),
					key,
					{ url, ...crawlOptions },
					mergeRequestOptions(requestOptions),
				);
			},

			async status(id: string, requestOptions?: RequestOptions) {
				return request(
					"GET",
					buildUrl(`/v2/crawl/${id}`),
					key,
					undefined,
					mergeRequestOptions(requestOptions),
				);
			},

			async stop(id: string, requestOptions?: RequestOptions) {
				return request(
					"POST",
					buildUrl(`/v2/crawl/${id}/stop`),
					key,
					{},
					mergeRequestOptions(requestOptions),
				);
			},

			async resume(id: string, requestOptions?: RequestOptions) {
				return request(
					"POST",
					buildUrl(`/v2/crawl/${id}/resume`),
					key,
					{},
					mergeRequestOptions(requestOptions),
				);
			},
		},

		monitor: {
			async create(monitorCreateInput: ApiMonitorCreateInput, requestOptions?: RequestOptions) {
				return request(
					"POST",
					buildUrl("/v2/monitor"),
					key,
					{ ...monitorCreateInput },
					mergeRequestOptions(requestOptions),
				);
			},

			async list(requestOptions?: RequestOptions) {
				return request(
					"GET",
					buildUrl("/v2/monitor"),
					key,
					undefined,
					mergeRequestOptions(requestOptions),
				);
			},

			async get(id: string, requestOptions?: RequestOptions) {
				return request(
					"GET",
					buildUrl(`/v2/monitor/${id}`),
					key,
					undefined,
					mergeRequestOptions(requestOptions),
				);
			},

			async pause(id: string, requestOptions?: RequestOptions) {
				return request(
					"POST",
					buildUrl(`/v2/monitor/${id}/pause`),
					key,
					{},
					mergeRequestOptions(requestOptions),
				);
			},

			async resume(id: string, requestOptions?: RequestOptions) {
				return request(
					"POST",
					buildUrl(`/v2/monitor/${id}/resume`),
					key,
					{},
					mergeRequestOptions(requestOptions),
				);
			},

			async delete(id: string, requestOptions?: RequestOptions) {
				return request(
					"DELETE",
					buildUrl(`/v2/monitor/${id}`),
					key,
					undefined,
					mergeRequestOptions(requestOptions),
				);
			},
		},
	};
}
