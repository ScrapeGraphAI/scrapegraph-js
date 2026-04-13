import request from "./http.js";
import {
	buildCrawlBody,
	buildExtractBody,
	buildHistoryQuery,
	buildMonitorBody,
	buildSchemaBody,
	buildScrapeBody,
	buildSearchBody,
} from "./lib/utils.js";
import type {
	ApiCrawlOptions,
	ApiExtractOptions,
	ApiGenerateSchemaOptions,
	ApiHistoryFilterInput,
	ApiMonitorCreateInput,
	ApiScrapeOptions,
	ApiSearchOptions,
	ClientConfig,
	RequestOptions,
} from "./types/index.js";
import { DEFAULT_BASE_URL } from "./types/index.js";

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
				buildUrl("/api/v2/scrape"),
				key,
				buildScrapeBody(url, scrapeOptions),
				mergeRequestOptions(requestOptions),
			);
		},

		async extract(
			url: string | undefined,
			extractOptions: ApiExtractOptions,
			requestOptions?: RequestOptions,
		) {
			return request(
				"POST",
				buildUrl("/api/v2/extract"),
				key,
				buildExtractBody(url, extractOptions),
				mergeRequestOptions(requestOptions),
			);
		},

		async search(query: string, searchOptions?: ApiSearchOptions, requestOptions?: RequestOptions) {
			return request(
				"POST",
				buildUrl("/api/v2/search"),
				key,
				buildSearchBody(query, searchOptions),
				mergeRequestOptions(requestOptions),
			);
		},

		async schema(
			prompt: string,
			schemaOptions?: ApiGenerateSchemaOptions,
			requestOptions?: RequestOptions,
		) {
			return request(
				"POST",
				buildUrl("/api/v2/schema"),
				key,
				buildSchemaBody(prompt, schemaOptions),
				mergeRequestOptions(requestOptions),
			);
		},

		async validate(email: string, requestOptions?: RequestOptions) {
			const query = new URLSearchParams({ email }).toString();
			return request(
				"GET",
				buildUrl(`/api/v2/validate?${query}`),
				key,
				undefined,
				mergeRequestOptions(requestOptions),
			);
		},

		async credits(requestOptions?: RequestOptions) {
			return request(
				"GET",
				buildUrl("/api/v2/credits"),
				key,
				undefined,
				mergeRequestOptions(requestOptions),
			);
		},

		async history(historyFilter?: ApiHistoryFilterInput, requestOptions?: RequestOptions) {
			const query = buildHistoryQuery(historyFilter);
			return request(
				"GET",
				buildUrl(`/api/v2/history${query ? `?${query}` : ""}`),
				key,
				undefined,
				mergeRequestOptions(requestOptions),
			);
		},

		crawl: {
			async start(url: string, crawlOptions?: ApiCrawlOptions, requestOptions?: RequestOptions) {
				return request(
					"POST",
					buildUrl("/api/v2/crawl"),
					key,
					buildCrawlBody(url, crawlOptions),
					mergeRequestOptions(requestOptions),
				);
			},

			async status(id: string, requestOptions?: RequestOptions) {
				return request(
					"GET",
					buildUrl(`/api/v2/crawl/${id}`),
					key,
					undefined,
					mergeRequestOptions(requestOptions),
				);
			},

			async stop(id: string, requestOptions?: RequestOptions) {
				return request(
					"POST",
					buildUrl(`/api/v2/crawl/${id}/stop`),
					key,
					{},
					mergeRequestOptions(requestOptions),
				);
			},

			async resume(id: string, requestOptions?: RequestOptions) {
				return request(
					"POST",
					buildUrl(`/api/v2/crawl/${id}/resume`),
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
					buildUrl("/api/v2/monitor"),
					key,
					buildMonitorBody(monitorCreateInput),
					mergeRequestOptions(requestOptions),
				);
			},

			async list(requestOptions?: RequestOptions) {
				return request(
					"GET",
					buildUrl("/api/v2/monitor"),
					key,
					undefined,
					mergeRequestOptions(requestOptions),
				);
			},

			async get(id: string, requestOptions?: RequestOptions) {
				return request(
					"GET",
					buildUrl(`/api/v2/monitor/${id}`),
					key,
					undefined,
					mergeRequestOptions(requestOptions),
				);
			},

			async pause(id: string, requestOptions?: RequestOptions) {
				return request(
					"POST",
					buildUrl(`/api/v2/monitor/${id}/pause`),
					key,
					{},
					mergeRequestOptions(requestOptions),
				);
			},

			async resume(id: string, requestOptions?: RequestOptions) {
				return request(
					"POST",
					buildUrl(`/api/v2/monitor/${id}/resume`),
					key,
					{},
					mergeRequestOptions(requestOptions),
				);
			},

			async delete(id: string, requestOptions?: RequestOptions) {
				return request(
					"DELETE",
					buildUrl(`/api/v2/monitor/${id}`),
					key,
					undefined,
					mergeRequestOptions(requestOptions),
				);
			},
		},
	};
}
