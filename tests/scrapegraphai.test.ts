import { afterEach, describe, expect, spyOn, test } from "bun:test";
import * as sdk from "../src/scrapegraphai.js";

const API_KEY = "test-sgai-key";
const BASE = process.env.SGAI_API_URL || "https://api.scrapegraphai.com/v2";
const HEALTH_BASE = process.env.SGAI_API_URL
	? process.env.SGAI_API_URL.replace(/\/v\d+$/, "")
	: "https://api.scrapegraphai.com";

function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

let fetchSpy: ReturnType<typeof spyOn<typeof globalThis, "fetch">>;

afterEach(() => {
	fetchSpy?.mockRestore();
});

function expectRequest(
	callIndex: number,
	method: string,
	path: string,
	body?: object,
	base = BASE,
) {
	const [url, init] = fetchSpy.mock.calls[callIndex] as [string, RequestInit];
	expect(url).toBe(`${base}${path}`);
	expect(init.method).toBe(method);
	expect((init.headers as Record<string, string>)["SGAI-APIKEY"]).toBe(API_KEY);
	if (body) {
		expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
		expect(JSON.parse(init.body as string)).toEqual(body);
	}
}

describe("scrape", () => {
	const params = { url: "https://example.com" };

	test("success", async () => {
		const body = {
			results: { markdown: { data: ["# Hello"] } },
			metadata: { contentType: "text/html" },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.scrape(API_KEY, params);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expect(res.elapsedMs).toBeGreaterThanOrEqual(0);
		expectRequest(0, "POST", "/scrape", params);
	});

	test("HTTP 401", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(
			json({ detail: "Invalid key" }, 401),
		);
		const res = await sdk.scrape(API_KEY, params);

		expect(res.status).toBe("error");
		expect(res.error).toContain("Invalid or missing API key");
	});

	test("HTTP 402", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json({}, 402));
		const res = await sdk.scrape(API_KEY, params);

		expect(res.status).toBe("error");
		expect(res.error).toContain("Insufficient credits");
	});

	test("HTTP 422", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json({}, 422));
		const res = await sdk.scrape(API_KEY, params);

		expect(res.status).toBe("error");
		expect(res.error).toContain("Invalid parameters");
	});

	test("HTTP 429", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json({}, 429));
		const res = await sdk.scrape(API_KEY, params);

		expect(res.status).toBe("error");
		expect(res.error).toContain("Rate limited");
	});

	test("HTTP 500", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json({}, 500));
		const res = await sdk.scrape(API_KEY, params);

		expect(res.status).toBe("error");
		expect(res.error).toContain("Server error");
	});

	test("timeout", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockRejectedValueOnce(
			new DOMException("The operation was aborted", "TimeoutError"),
		);
		const res = await sdk.scrape(API_KEY, params);

		expect(res.status).toBe("error");
		expect(res.error).toBe("Request timed out");
	});

	test("network error", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("fetch failed"));
		const res = await sdk.scrape(API_KEY, params);

		expect(res.status).toBe("error");
		expect(res.error).toBe("fetch failed");
	});
});

describe("extract", () => {
	const params = { url: "https://example.com", prompt: "Extract prices" };

	test("success", async () => {
		const body = {
			raw: null,
			json: { prices: [10, 20] },
			usage: { promptTokens: 100, completionTokens: 50 },
			metadata: { chunker: { chunks: [{ size: 1000 }] } },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.extract(API_KEY, params);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectRequest(0, "POST", "/extract", params);
	});
});

describe("search", () => {
	const params = { query: "best pizza NYC" };

	test("success", async () => {
		const body = {
			results: [{ url: "https://example.com", title: "Pizza", content: "Great pizza" }],
			metadata: { search: {}, pages: { requested: 3, scraped: 3 } },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.search(API_KEY, params);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectRequest(0, "POST", "/search", params);
	});
});

describe("generateSchema", () => {
	const params = { prompt: "Schema for product listing" };

	test("success", async () => {
		const body = {
			refinedPrompt: "Extract product details",
			schema: { type: "object", properties: {} },
			usage: { promptTokens: 50, completionTokens: 100 },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.generateSchema(API_KEY, params);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectRequest(0, "POST", "/schema", params);
	});
});

describe("getCredits", () => {
	test("success", async () => {
		const body = {
			remaining: 1000,
			used: 500,
			plan: "pro",
			jobs: { crawl: { used: 1, limit: 5 }, monitor: { used: 2, limit: 10 } },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.getCredits(API_KEY);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectRequest(0, "GET", "/credits");
	});
});

describe("checkHealth", () => {
	test("success", async () => {
		const body = { status: "ok", uptime: 12345 };
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.checkHealth(API_KEY);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectRequest(0, "GET", "/healthz", undefined, HEALTH_BASE);
	});
});

describe("getHistory", () => {
	test("success without params", async () => {
		const body = {
			data: [],
			pagination: { page: 1, limit: 20, total: 0 },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.getHistory(API_KEY);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectRequest(0, "GET", "/history");
	});

	test("success with params", async () => {
		const body = {
			data: [],
			pagination: { page: 2, limit: 10, total: 50 },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.getHistory(API_KEY, { page: 2, limit: 10, service: "scrape" });

		expect(res.status).toBe("success");
		const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
		expect(url).toContain("page=2");
		expect(url).toContain("limit=10");
		expect(url).toContain("service=scrape");
	});
});

describe("getHistoryEntry", () => {
	test("success", async () => {
		const body = {
			id: "abc-123",
			service: "scrape",
			status: "completed",
			params: { url: "https://example.com" },
			result: {},
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.getHistoryEntry(API_KEY, "abc-123");

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectRequest(0, "GET", "/history/abc-123");
	});
});

describe("crawl", () => {
	const params = { url: "https://example.com" };

	test("start success", async () => {
		const body = {
			id: "crawl-123",
			status: "running",
			total: 50,
			finished: 0,
			pages: [],
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.crawl.start(API_KEY, params);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectRequest(0, "POST", "/crawl", params);
	});

	test("get success", async () => {
		const body = {
			id: "crawl-123",
			status: "completed",
			total: 10,
			finished: 10,
			pages: [{ url: "https://example.com", status: "completed" }],
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.crawl.get(API_KEY, "crawl-123");

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectRequest(0, "GET", "/crawl/crawl-123");
	});

	test("stop success", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json({ ok: true }));

		const res = await sdk.crawl.stop(API_KEY, "crawl-123");

		expect(res.status).toBe("success");
		expect(res.data).toEqual({ ok: true });
		expectRequest(0, "POST", "/crawl/crawl-123/stop");
	});

	test("resume success", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json({ ok: true }));

		const res = await sdk.crawl.resume(API_KEY, "crawl-123");

		expect(res.status).toBe("success");
		expect(res.data).toEqual({ ok: true });
		expectRequest(0, "POST", "/crawl/crawl-123/resume");
	});

	test("delete success", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json({ ok: true }));

		const res = await sdk.crawl.delete(API_KEY, "crawl-123");

		expect(res.status).toBe("success");
		expect(res.data).toEqual({ ok: true });
		expectRequest(0, "DELETE", "/crawl/crawl-123");
	});
});

describe("monitor", () => {
	const createParams = { url: "https://example.com", interval: "0 * * * *" };

	test("create success", async () => {
		const body = {
			cronId: "mon-123",
			scheduleId: "sched-456",
			interval: "0 * * * *",
			status: "active",
			config: createParams,
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.monitor.create(API_KEY, createParams);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectRequest(0, "POST", "/monitor", createParams);
	});

	test("list success", async () => {
		const body = [
			{
				cronId: "mon-123",
				scheduleId: "sched-456",
				interval: "0 * * * *",
				status: "active",
			},
		];
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.monitor.list(API_KEY);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectRequest(0, "GET", "/monitor");
	});

	test("get success", async () => {
		const body = {
			cronId: "mon-123",
			scheduleId: "sched-456",
			interval: "0 * * * *",
			status: "active",
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.monitor.get(API_KEY, "mon-123");

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectRequest(0, "GET", "/monitor/mon-123");
	});

	test("update success", async () => {
		const updateParams = { interval: "0 0 * * *" };
		const body = {
			cronId: "mon-123",
			scheduleId: "sched-456",
			interval: "0 0 * * *",
			status: "active",
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.monitor.update(API_KEY, "mon-123", updateParams);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectRequest(0, "PATCH", "/monitor/mon-123", updateParams);
	});

	test("delete success", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json({ ok: true }));

		const res = await sdk.monitor.delete(API_KEY, "mon-123");

		expect(res.status).toBe("success");
		expect(res.data).toEqual({ ok: true });
		expectRequest(0, "DELETE", "/monitor/mon-123");
	});

	test("pause success", async () => {
		const body = {
			cronId: "mon-123",
			scheduleId: "sched-456",
			interval: "0 * * * *",
			status: "paused",
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.monitor.pause(API_KEY, "mon-123");

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectRequest(0, "POST", "/monitor/mon-123/pause");
	});

	test("resume success", async () => {
		const body = {
			cronId: "mon-123",
			scheduleId: "sched-456",
			interval: "0 * * * *",
			status: "active",
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.monitor.resume(API_KEY, "mon-123");

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectRequest(0, "POST", "/monitor/mon-123/resume");
	});
});
