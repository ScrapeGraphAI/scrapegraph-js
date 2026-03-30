import type { RequestOptions } from "./types/index.js";
import { VERSION } from "./types/index.js";

export interface ApiResult<T> {
	data: T;
	requestId: string;
}

export async function request<T = unknown>(
	method: "GET" | "POST" | "DELETE",
	url: string,
	apiKey: string,
	body?: Record<string, unknown>,
	requestOptions?: { maxRetries?: number; timeout?: number } & RequestOptions,
): Promise<ApiResult<T>> {
	const maxRetries = requestOptions?.maxRetries ?? 2;
	const timeout = requestOptions?.timeout ?? 30_000;

	let lastError: Error | null = null;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			const headers: Record<string, string> = {
				Authorization: `Bearer ${apiKey}`,
				"X-SDK-Version": `js@${VERSION}`,
			};
			if (body) headers["Content-Type"] = "application/json";

			const res = await fetch(url, {
				method,
				headers,
				body: body ? JSON.stringify(body) : undefined,
				signal: requestOptions?.signal ?? AbortSignal.timeout(timeout),
			});

			if ((res.status === 502 || res.status === 503) && attempt < maxRetries) {
				await sleep(500 * 2 ** attempt);
				continue;
			}

			if (!res.ok) {
				const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
				throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
			}

			const data = (method === "DELETE" ? null : await res.json()) as T;
			const requestId = res.headers.get("x-request-id") ?? "";

			return { data, requestId };
		} catch (e) {
			lastError = e instanceof Error ? e : new Error(String(e));
			if (e instanceof DOMException && e.name === "TimeoutError") throw lastError;
			// [NOTE] @Claude retry on network errors (fetch failed, connection refused)
			if (e instanceof TypeError && attempt < maxRetries) {
				await sleep(500 * 2 ** attempt);
				continue;
			}
			if (attempt === maxRetries) throw lastError;
		}
	}

	throw lastError ?? new Error("Request failed");
}

function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}
