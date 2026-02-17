import { env } from "./env.js";
import type {
	AgenticScraperParams,
	AgenticScraperResponse,
	ApiResult,
	CrawlParams,
	CrawlResponse,
	CreditsResponse,
	GenerateSchemaParams,
	GenerateSchemaResponse,
	HealthResponse,
	HistoryParams,
	HistoryResponse,
	MarkdownifyParams,
	MarkdownifyResponse,
	ScrapeParams,
	ScrapeResponse,
	SearchScraperParams,
	SearchScraperResponse,
	SitemapParams,
	SitemapResponse,
	SmartScraperParams,
	SmartScraperResponse,
} from "./types/index.js";

const BASE_URL = process.env.SGAI_API_URL || "https://api.scrapegraphai.com/v1";
const HEALTH_URL = process.env.SGAI_API_URL
	? `${process.env.SGAI_API_URL.replace(/\/v\d+$/, "")}`
	: "https://api.scrapegraphai.com";
const POLL_INTERVAL_MS = 3000;

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

type RequestResult<T> = { data: T; elapsedMs: number };

async function request<T>(
	method: "GET" | "POST",
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
		signal: AbortSignal.timeout(env.timeoutS * 1000),
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
	const elapsedMs = Math.round(performance.now() - start);
	debug(`← ${res.status} (${elapsedMs}ms)`, data);
	return { data, elapsedMs };
}

type PollResponse = {
	status: string;
	error?: string;
	[key: string]: unknown;
};

function isDone(status: string) {
	return status === "completed" || status === "done" || status === "success";
}

async function pollUntilDone(
	path: string,
	id: string,
	apiKey: string,
	onPoll?: (status: string) => void,
): Promise<RequestResult<PollResponse>> {
	const deadline = Date.now() + env.timeoutS * 1000;
	let totalMs = 0;

	while (Date.now() < deadline) {
		const { data, elapsedMs } = await request<PollResponse>("GET", `${path}/${id}`, apiKey);
		totalMs += elapsedMs;
		onPoll?.(data.status);

		if (isDone(data.status)) return { data, elapsedMs: totalMs };
		if (data.status === "failed") throw new Error(data.error ?? "Job failed");

		await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
	}

	throw new Error("Polling timed out");
}

function unwrapResult(data: PollResponse): PollResponse {
	if (data.result && typeof data.result === "object" && !Array.isArray(data.result)) {
		const inner = data.result as Record<string, unknown>;
		if (inner.status || inner.pages || inner.crawled_urls) {
			return { ...inner, status: String(inner.status ?? data.status) } as PollResponse;
		}
	}
	return data;
}

async function submitAndPoll<T>(
	path: string,
	apiKey: string,
	body: object,
	idField: string,
	onPoll?: (status: string) => void,
): Promise<RequestResult<T>> {
	const { data: res, elapsedMs } = await request<PollResponse>("POST", path, apiKey, body);
	if (isDone(res.status)) return { data: unwrapResult(res) as unknown as T, elapsedMs };
	const id = res[idField];
	if (typeof id !== "string") throw new Error(`Missing ${idField} in response`);
	const poll = await pollUntilDone(path, id, apiKey, onPoll);
	return {
		data: unwrapResult(poll.data) as unknown as T,
		elapsedMs: elapsedMs + poll.elapsedMs,
	};
}

export async function smartScraper(
	apiKey: string,
	params: SmartScraperParams,
): Promise<ApiResult<SmartScraperResponse>> {
	try {
		const { data, elapsedMs } = await request<SmartScraperResponse>(
			"POST",
			"/smartscraper",
			apiKey,
			params,
		);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export async function searchScraper(
	apiKey: string,
	params: SearchScraperParams,
): Promise<ApiResult<SearchScraperResponse>> {
	try {
		const { data, elapsedMs } = await request<SearchScraperResponse>(
			"POST",
			"/searchscraper",
			apiKey,
			params,
		);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export async function markdownify(
	apiKey: string,
	params: MarkdownifyParams,
): Promise<ApiResult<MarkdownifyResponse>> {
	try {
		const { data, elapsedMs } = await request<MarkdownifyResponse>(
			"POST",
			"/markdownify",
			apiKey,
			params,
		);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export async function scrape(
	apiKey: string,
	params: ScrapeParams,
): Promise<ApiResult<ScrapeResponse>> {
	try {
		const { data, elapsedMs } = await request<ScrapeResponse>("POST", "/scrape", apiKey, params);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export async function crawl(
	apiKey: string,
	params: CrawlParams,
	onPoll?: (status: string) => void,
): Promise<ApiResult<CrawlResponse>> {
	try {
		const { data, elapsedMs } = await submitAndPoll<CrawlResponse>(
			"/crawl",
			apiKey,
			params,
			"task_id",
			onPoll,
		);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export async function agenticScraper(
	apiKey: string,
	params: AgenticScraperParams,
): Promise<ApiResult<AgenticScraperResponse>> {
	try {
		const { data, elapsedMs } = await request<AgenticScraperResponse>(
			"POST",
			"/agentic-scrapper",
			apiKey,
			params,
		);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export async function generateSchema(
	apiKey: string,
	params: GenerateSchemaParams,
): Promise<ApiResult<GenerateSchemaResponse>> {
	try {
		const { data, elapsedMs } = await request<GenerateSchemaResponse>(
			"POST",
			"/generate_schema",
			apiKey,
			params,
		);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export async function sitemap(
	apiKey: string,
	params: SitemapParams,
): Promise<ApiResult<SitemapResponse>> {
	try {
		const { data, elapsedMs } = await request<SitemapResponse>("POST", "/sitemap", apiKey, params);
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
		const { data, elapsedMs } = await request<HealthResponse>(
			"GET",
			"/healthz",
			apiKey,
			undefined,
			HEALTH_URL,
		);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}

export async function history(
	apiKey: string,
	params: HistoryParams,
): Promise<ApiResult<HistoryResponse>> {
	try {
		const page = params.page ?? 1;
		const pageSize = params.page_size ?? 10;
		const qs = new URLSearchParams();
		qs.set("page", String(page));
		qs.set("page_size", String(pageSize));
		const { data, elapsedMs } = await request<HistoryResponse>(
			"GET",
			`/history/${params.service}?${qs}`,
			apiKey,
		);
		return ok(data, elapsedMs);
	} catch (err) {
		return fail(err);
	}
}
