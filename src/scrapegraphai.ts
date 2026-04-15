import { env } from "./env.js";
import type {
	ApiCrawlRequest,
	ApiCrawlResponse,
	ApiCreditsResponse,
	ApiExtractRequest,
	ApiExtractResponse,
	ApiHealthResponse,
	ApiHistoryEntry,
	ApiHistoryFilter,
	ApiHistoryPage,
	ApiMonitorCreateInput,
	ApiMonitorResponse,
	ApiMonitorUpdateInput,
	ApiResult,
	ApiScrapeRequest,
	ApiScrapeResponse,
	ApiSearchRequest,
	ApiSearchResponse,
} from "./types.js";

const BASE_URL = process.env.SGAI_API_URL || "https://api.scrapegraphai.com/api/v2";

function debug(label: string, data?: unknown) {
	if (!env.debug) return;
	const ts = new Date().toISOString();
	if (data !== undefined) console.error(`[${ts}] ${label}`, JSON.stringify(data, null, 2));
	else console.error(`[${ts}] ${label}`);
}

function ok<T>(data: T, elapsedMs: number): ApiResult<T> {
	return { status: "success", data, elapsedMs };
}

function fail(err: unknown): ApiResult<never> {
	if (err instanceof DOMException && err.name === "TimeoutError")
		return { status: "error", data: null, error: "Request timed out", elapsedMs: 0 };
	const message =
		err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";
	return { status: "error", data: null, error: message, elapsedMs: 0 };
}

function mapHttpError(status: number): string {
	switch (status) {
		case 401:
			return "Invalid or missing API key";
		case 402:
			return "Insufficient credits — purchase more at https://dashboard.scrapegraphai.com";
		case 422:
			return "Invalid parameters — check your request";
		case 429:
			return "Rate limited — slow down and retry";
		case 500:
			return "Server error — try again later";
		default:
			return `HTTP ${status}`;
	}
}

function parseServerTiming(header: string | null): number | null {
	if (!header) return null;
	const match = header.match(/dur=(\d+(?:\.\d+)?)/);
	return match ? Math.round(Number.parseFloat(match[1])) : null;
}

type RequestResult<T> = { data: T; elapsedMs: number };

async function request<T>(
	method: "GET" | "POST" | "PATCH" | "DELETE",
	path: string,
	apiKey: string,
	body?: object,
	baseUrl?: string,
): Promise<RequestResult<T>> {
	const url = `${baseUrl ?? BASE_URL}${path}`;
	debug(`→ ${method} ${url}`, body);

	const start = performance.now();
	const res = await fetch(url, {
		method,
		headers: {
			"SGAI-APIKEY": apiKey,
			...(body ? { "Content-Type": "application/json" } : {}),
		},
		body: body ? JSON.stringify(body) : undefined,
		signal: AbortSignal.timeout(env.timeout * 1000),
	});

	if (!res.ok) {
		let detail = mapHttpError(res.status);
		try {
			const errBody = await res.json();
			debug(`← ${res.status}`, errBody);
			if (errBody?.detail) {
				const d = errBody.detail;
				detail = `${detail}: ${typeof d === "string" ? d : JSON.stringify(d)}`;
			}
		} catch {}
		throw new Error(detail);
	}

	const data = (await res.json()) as T;
	const serverTiming = parseServerTiming(res.headers.get("Server-Timing"));
	const elapsedMs = serverTiming ?? Math.round(performance.now() - start);
	debug(`← ${res.status} (${elapsedMs}ms)`, data);
	return { data, elapsedMs };
}

export async function scrape(
	apiKey: string,
	params: ApiScrapeRequest,
): Promise<ApiResult<ApiScrapeResponse>> {
	try {
		const { data, elapsedMs } = await request<ApiScrapeResponse>("POST", "/scrape", apiKey, params);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export async function extract(
	apiKey: string,
	params: ApiExtractRequest,
): Promise<ApiResult<ApiExtractResponse>> {
	try {
		const { data, elapsedMs } = await request<ApiExtractResponse>(
			"POST",
			"/extract",
			apiKey,
			params,
		);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export async function search(
	apiKey: string,
	params: ApiSearchRequest,
): Promise<ApiResult<ApiSearchResponse>> {
	try {
		const { data, elapsedMs } = await request<ApiSearchResponse>("POST", "/search", apiKey, params);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export async function getCredits(apiKey: string): Promise<ApiResult<ApiCreditsResponse>> {
	try {
		const { data, elapsedMs } = await request<ApiCreditsResponse>("GET", "/credits", apiKey);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export async function checkHealth(apiKey: string): Promise<ApiResult<ApiHealthResponse>> {
	try {
		const { data, elapsedMs } = await request<ApiHealthResponse>("GET", "/health", apiKey);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export const history = {
	async list(apiKey: string, params?: ApiHistoryFilter): Promise<ApiResult<ApiHistoryPage>> {
		try {
			const qs = new URLSearchParams();
			if (params?.page) qs.set("page", String(params.page));
			if (params?.limit) qs.set("limit", String(params.limit));
			if (params?.service) qs.set("service", params.service);
			const query = qs.toString();
			const path = query ? `/history?${query}` : "/history";
			const { data, elapsedMs } = await request<ApiHistoryPage>("GET", path, apiKey);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async get(apiKey: string, id: string): Promise<ApiResult<ApiHistoryEntry>> {
		try {
			const { data, elapsedMs } = await request<ApiHistoryEntry>("GET", `/history/${id}`, apiKey);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},
};

export const crawl = {
	async start(apiKey: string, params: ApiCrawlRequest): Promise<ApiResult<ApiCrawlResponse>> {
		try {
			const { data, elapsedMs } = await request<ApiCrawlResponse>("POST", "/crawl", apiKey, params);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async get(apiKey: string, id: string): Promise<ApiResult<ApiCrawlResponse>> {
		try {
			const { data, elapsedMs } = await request<ApiCrawlResponse>("GET", `/crawl/${id}`, apiKey);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async stop(apiKey: string, id: string): Promise<ApiResult<{ ok: boolean }>> {
		try {
			const { data, elapsedMs } = await request<{ ok: boolean }>(
				"POST",
				`/crawl/${id}/stop`,
				apiKey,
			);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async resume(apiKey: string, id: string): Promise<ApiResult<{ ok: boolean }>> {
		try {
			const { data, elapsedMs } = await request<{ ok: boolean }>(
				"POST",
				`/crawl/${id}/resume`,
				apiKey,
			);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async delete(apiKey: string, id: string): Promise<ApiResult<{ ok: boolean }>> {
		try {
			const { data, elapsedMs } = await request<{ ok: boolean }>("DELETE", `/crawl/${id}`, apiKey);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},
};

export const monitor = {
	async create(
		apiKey: string,
		params: ApiMonitorCreateInput,
	): Promise<ApiResult<ApiMonitorResponse>> {
		try {
			const { data, elapsedMs } = await request<ApiMonitorResponse>(
				"POST",
				"/monitor",
				apiKey,
				params,
			);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async list(apiKey: string): Promise<ApiResult<ApiMonitorResponse[]>> {
		try {
			const { data, elapsedMs } = await request<ApiMonitorResponse[]>("GET", "/monitor", apiKey);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async get(apiKey: string, id: string): Promise<ApiResult<ApiMonitorResponse>> {
		try {
			const { data, elapsedMs } = await request<ApiMonitorResponse>(
				"GET",
				`/monitor/${id}`,
				apiKey,
			);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async update(
		apiKey: string,
		id: string,
		params: ApiMonitorUpdateInput,
	): Promise<ApiResult<ApiMonitorResponse>> {
		try {
			const { data, elapsedMs } = await request<ApiMonitorResponse>(
				"PATCH",
				`/monitor/${id}`,
				apiKey,
				params,
			);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async delete(apiKey: string, id: string): Promise<ApiResult<{ ok: boolean }>> {
		try {
			const { data, elapsedMs } = await request<{ ok: boolean }>(
				"DELETE",
				`/monitor/${id}`,
				apiKey,
			);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async pause(apiKey: string, id: string): Promise<ApiResult<ApiMonitorResponse>> {
		try {
			const { data, elapsedMs } = await request<ApiMonitorResponse>(
				"POST",
				`/monitor/${id}/pause`,
				apiKey,
			);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async resume(apiKey: string, id: string): Promise<ApiResult<ApiMonitorResponse>> {
		try {
			const { data, elapsedMs } = await request<ApiMonitorResponse>(
				"POST",
				`/monitor/${id}/resume`,
				apiKey,
			);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},
};

export interface ScrapeGraphAIInput {
	apiKey?: string;
}

function resolveApiKey(opts?: ScrapeGraphAIInput): string {
	const key = opts?.apiKey ?? process.env.SGAI_API_KEY;
	if (!key) throw new Error("API key required: pass { apiKey } or set SGAI_API_KEY env var");
	return key;
}

export function ScrapeGraphAI(opts?: ScrapeGraphAIInput) {
	const key = resolveApiKey(opts);
	return {
		scrape: (params: ApiScrapeRequest) => scrape(key, params),
		extract: (params: ApiExtractRequest) => extract(key, params),
		search: (params: ApiSearchRequest) => search(key, params),
		credits: () => getCredits(key),
		healthy: () => checkHealth(key),
		history: {
			list: (params?: ApiHistoryFilter) => history.list(key, params),
			get: (id: string) => history.get(key, id),
		},
		crawl: {
			start: (params: ApiCrawlRequest) => crawl.start(key, params),
			get: (id: string) => crawl.get(key, id),
			stop: (id: string) => crawl.stop(key, id),
			resume: (id: string) => crawl.resume(key, id),
			delete: (id: string) => crawl.delete(key, id),
		},
		monitor: {
			create: (params: ApiMonitorCreateInput) => monitor.create(key, params),
			list: () => monitor.list(key),
			get: (id: string) => monitor.get(key, id),
			update: (id: string, params: ApiMonitorUpdateInput) => monitor.update(key, id, params),
			delete: (id: string) => monitor.delete(key, id),
			pause: (id: string) => monitor.pause(key, id),
			resume: (id: string) => monitor.resume(key, id),
		},
	};
}

export type ScrapeGraphAIClient = ReturnType<typeof ScrapeGraphAI>;
