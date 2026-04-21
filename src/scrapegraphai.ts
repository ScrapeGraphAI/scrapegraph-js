import { env } from "./env.js";
import type {
	ApiResult,
	CrawlRequest,
	CrawlResponse,
	CreditsResponse,
	ExtractRequest,
	ExtractResponse,
	HealthResponse,
	HistoryEntry,
	HistoryFilter,
	HistoryPage,
	MonitorActivityRequest,
	MonitorActivityResponse,
	MonitorCreateRequest,
	MonitorResponse,
	MonitorUpdateRequest,
	ScrapeRequest,
	ScrapeResponse,
	SearchRequest,
	SearchResponse,
} from "./types.js";

const BASE_URL = process.env.SGAI_API_URL || "https://v2-api.scrapegraphai.com/api";

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
	params: ScrapeRequest,
): Promise<ApiResult<ScrapeResponse>> {
	try {
		const { data, elapsedMs } = await request<ScrapeResponse>("POST", "/scrape", apiKey, params);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export async function extract(
	apiKey: string,
	params: ExtractRequest,
): Promise<ApiResult<ExtractResponse>> {
	try {
		const { data, elapsedMs } = await request<ExtractResponse>("POST", "/extract", apiKey, params);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export async function search(
	apiKey: string,
	params: SearchRequest,
): Promise<ApiResult<SearchResponse>> {
	try {
		const { data, elapsedMs } = await request<SearchResponse>("POST", "/search", apiKey, params);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export async function getCredits(apiKey: string): Promise<ApiResult<CreditsResponse>> {
	try {
		const { data, elapsedMs } = await request<CreditsResponse>("GET", "/credits", apiKey);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export async function checkHealth(apiKey: string): Promise<ApiResult<HealthResponse>> {
	try {
		const { data, elapsedMs } = await request<HealthResponse>("GET", "/health", apiKey);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export const history = {
	async list(apiKey: string, params?: HistoryFilter): Promise<ApiResult<HistoryPage>> {
		try {
			const qs = new URLSearchParams();
			if (params?.page) qs.set("page", String(params.page));
			if (params?.limit) qs.set("limit", String(params.limit));
			if (params?.service) qs.set("service", params.service);
			const query = qs.toString();
			const path = query ? `/history?${query}` : "/history";
			const { data, elapsedMs } = await request<HistoryPage>("GET", path, apiKey);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async get(apiKey: string, id: string): Promise<ApiResult<HistoryEntry>> {
		try {
			const { data, elapsedMs } = await request<HistoryEntry>("GET", `/history/${id}`, apiKey);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},
};

export const crawl = {
	async start(apiKey: string, params: CrawlRequest): Promise<ApiResult<CrawlResponse>> {
		try {
			const { data, elapsedMs } = await request<CrawlResponse>("POST", "/crawl", apiKey, params);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async get(apiKey: string, id: string): Promise<ApiResult<CrawlResponse>> {
		try {
			const { data, elapsedMs } = await request<CrawlResponse>("GET", `/crawl/${id}`, apiKey);
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
	async create(apiKey: string, params: MonitorCreateRequest): Promise<ApiResult<MonitorResponse>> {
		try {
			const { data, elapsedMs } = await request<MonitorResponse>(
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

	async list(apiKey: string): Promise<ApiResult<MonitorResponse[]>> {
		try {
			const { data, elapsedMs } = await request<MonitorResponse[]>("GET", "/monitor", apiKey);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async get(apiKey: string, id: string): Promise<ApiResult<MonitorResponse>> {
		try {
			const { data, elapsedMs } = await request<MonitorResponse>("GET", `/monitor/${id}`, apiKey);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async update(
		apiKey: string,
		id: string,
		params: MonitorUpdateRequest,
	): Promise<ApiResult<MonitorResponse>> {
		try {
			const { data, elapsedMs } = await request<MonitorResponse>(
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

	async pause(apiKey: string, id: string): Promise<ApiResult<MonitorResponse>> {
		try {
			const { data, elapsedMs } = await request<MonitorResponse>(
				"POST",
				`/monitor/${id}/pause`,
				apiKey,
			);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async resume(apiKey: string, id: string): Promise<ApiResult<MonitorResponse>> {
		try {
			const { data, elapsedMs } = await request<MonitorResponse>(
				"POST",
				`/monitor/${id}/resume`,
				apiKey,
			);
			return ok(data, elapsedMs);
		} catch (err) {
			return fail(err);
		}
	},

	async activity(
		apiKey: string,
		id: string,
		params?: MonitorActivityRequest,
	): Promise<ApiResult<MonitorActivityResponse>> {
		try {
			const qs = new URLSearchParams();
			if (params?.limit) qs.set("limit", String(params.limit));
			if (params?.cursor) qs.set("cursor", params.cursor);
			const query = qs.toString();
			const path = query ? `/monitor/${id}/activity?${query}` : `/monitor/${id}/activity`;
			const { data, elapsedMs } = await request<MonitorActivityResponse>("GET", path, apiKey);
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
		scrape: (params: ScrapeRequest) => scrape(key, params),
		extract: (params: ExtractRequest) => extract(key, params),
		search: (params: SearchRequest) => search(key, params),
		credits: () => getCredits(key),
		healthy: () => checkHealth(key),
		history: {
			list: (params?: HistoryFilter) => history.list(key, params),
			get: (id: string) => history.get(key, id),
		},
		crawl: {
			start: (params: CrawlRequest) => crawl.start(key, params),
			get: (id: string) => crawl.get(key, id),
			stop: (id: string) => crawl.stop(key, id),
			resume: (id: string) => crawl.resume(key, id),
			delete: (id: string) => crawl.delete(key, id),
		},
		monitor: {
			create: (params: MonitorCreateRequest) => monitor.create(key, params),
			list: () => monitor.list(key),
			get: (id: string) => monitor.get(key, id),
			update: (id: string, params: MonitorUpdateRequest) => monitor.update(key, id, params),
			delete: (id: string) => monitor.delete(key, id),
			pause: (id: string) => monitor.pause(key, id),
			resume: (id: string) => monitor.resume(key, id),
			activity: (id: string, params?: MonitorActivityRequest) => monitor.activity(key, id, params),
		},
	};
}

export type ScrapeGraphAIClient = ReturnType<typeof ScrapeGraphAI>;
