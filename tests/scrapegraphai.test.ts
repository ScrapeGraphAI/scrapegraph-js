import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";

mock.module("../src/env.js", () => ({
	env: { debug: false, timeoutS: 120 },
}));

import * as scrapegraphai from "../src/scrapegraphai.js";

const API_KEY = "test-sgai-key-abc123";
const BASE = "https://api.scrapegraphai.com/v1";

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

function expectPost(callIndex: number, path: string, body?: object) {
	const [url, init] = fetchSpy.mock.calls[callIndex] as [string, RequestInit];
	expect(url).toBe(`${BASE}${path}`);
	expect(init.method).toBe("POST");
	expect((init.headers as Record<string, string>)["SGAI-APIKEY"]).toBe(API_KEY);
	expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
	if (body) expect(JSON.parse(init.body as string)).toEqual(body);
}

function expectGet(callIndex: number, path: string) {
	const [url, init] = fetchSpy.mock.calls[callIndex] as [string, RequestInit];
	expect(url).toBe(`${BASE}${path}`);
	expect(init.method).toBe("GET");
	expect((init.headers as Record<string, string>)["SGAI-APIKEY"]).toBe(API_KEY);
}

describe("smartScraper", () => {
	const params = { user_prompt: "Extract prices", website_url: "https://example.com" };

	test("success", async () => {
		const body = {
			request_id: "abc-123",
			status: "completed",
			website_url: "https://example.com",
			user_prompt: "Extract prices",
			result: { prices: [10, 20] },
			error: "",
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await scrapegraphai.smartScraper(API_KEY, params);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expect(res.elapsedMs).toBeGreaterThanOrEqual(0);
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expectPost(0, "/smartscraper", params);
	});

	test("HTTP 401", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(
			json({ detail: "Invalid key" }, 401),
		);
		const res = await scrapegraphai.smartScraper(API_KEY, params);

		expect(res.status).toBe("error");
		expect(res.error).toContain("Invalid or missing API key");
	});

	test("HTTP 402", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json({}, 402));
		const res = await scrapegraphai.smartScraper(API_KEY, params);

		expect(res.status).toBe("error");
		expect(res.error).toContain("Insufficient credits");
	});

	test("HTTP 422", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json({}, 422));
		const res = await scrapegraphai.smartScraper(API_KEY, params);

		expect(res.status).toBe("error");
		expect(res.error).toContain("Invalid parameters");
	});

	test("HTTP 429", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json({}, 429));
		const res = await scrapegraphai.smartScraper(API_KEY, params);

		expect(res.status).toBe("error");
		expect(res.error).toContain("Rate limited");
	});

	test("HTTP 500", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json({}, 500));
		const res = await scrapegraphai.smartScraper(API_KEY, params);

		expect(res.status).toBe("error");
		expect(res.error).toContain("Server error");
	});

	test("HTTP error with detail", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(
			json({ detail: "quota exceeded" }, 402),
		);
		const res = await scrapegraphai.smartScraper(API_KEY, params);

		expect(res.status).toBe("error");
		expect(res.error).toContain("quota exceeded");
	});

	test("timeout", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockRejectedValueOnce(
			new DOMException("The operation was aborted", "TimeoutError"),
		);
		const res = await scrapegraphai.smartScraper(API_KEY, params);

		expect(res.status).toBe("error");
		expect(res.error).toBe("Request timed out");
	});

	test("network error", async () => {
		fetchSpy = spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("fetch failed"));
		const res = await scrapegraphai.smartScraper(API_KEY, params);

		expect(res.status).toBe("error");
		expect(res.error).toBe("fetch failed");
	});
});

describe("searchScraper", () => {
	const params = { user_prompt: "Best pizza in NYC" };

	test("success", async () => {
		const body = {
			request_id: "abc-123",
			status: "completed",
			user_prompt: "Best pizza in NYC",
			num_results: 3,
			result: { answer: "Joe's Pizza" },
			markdown_content: null,
			reference_urls: ["https://example.com"],
			error: null,
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await scrapegraphai.searchScraper(API_KEY, params);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectPost(0, "/searchscraper", params);
	});
});

describe("markdownify", () => {
	const params = { website_url: "https://example.com" };

	test("success", async () => {
		const body = {
			request_id: "abc-123",
			status: "completed",
			website_url: "https://example.com",
			result: "# Hello",
			error: "",
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await scrapegraphai.markdownify(API_KEY, params);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectPost(0, "/markdownify", params);
	});
});

describe("scrape", () => {
	const params = { website_url: "https://example.com" };

	test("success", async () => {
		const body = {
			scrape_request_id: "abc-123",
			status: "completed",
			html: "<html>...</html>",
			branding: null,
			metadata: null,
			error: "",
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await scrapegraphai.scrape(API_KEY, params);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectPost(0, "/scrape", params);
	});
});

describe("crawl", () => {
	const params = { url: "https://example.com", prompt: "Extract main content" };

	test("immediate completion", async () => {
		const body = { status: "done", pages: [{ url: "https://example.com", content: "data" }] };
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await scrapegraphai.crawl(API_KEY, params);

		expect(res.status).toBe("success");
		expect(res.data as any).toEqual(body);
		expectPost(0, "/crawl");
	});

	test("polls with task_id", async () => {
		fetchSpy = spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json({ status: "pending", task_id: "crawl-99" }))
			.mockResolvedValueOnce(json({ status: "done", task_id: "crawl-99", pages: [] }));

		const res = await scrapegraphai.crawl(API_KEY, params);

		expect(res.status).toBe("success");
		expect(fetchSpy).toHaveBeenCalledTimes(2);
		expectGet(1, "/crawl/crawl-99");
	});

	test("calls onPoll callback", async () => {
		const statuses: string[] = [];
		fetchSpy = spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json({ status: "pending", task_id: "crawl-99" }))
			.mockResolvedValueOnce(json({ status: "done", task_id: "crawl-99", pages: [] }));

		await scrapegraphai.crawl(API_KEY, params, (s) => statuses.push(s));

		expect(statuses).toEqual(["done"]);
	});

	test("poll failure", async () => {
		fetchSpy = spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json({ status: "pending", task_id: "crawl-99" }))
			.mockResolvedValueOnce(json({ status: "failed", error: "Crawl exploded" }));

		const res = await scrapegraphai.crawl(API_KEY, params);

		expect(res.status).toBe("error");
		expect(res.error).toBe("Crawl exploded");
	});
});

describe("agenticScraper", () => {
	const params = { url: "https://example.com", steps: ["Click login"] };

	test("success", async () => {
		const body = {
			request_id: "abc-123",
			status: "completed",
			result: { screenshot: "base64..." },
			error: "",
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await scrapegraphai.agenticScraper(API_KEY, params);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectPost(0, "/agentic-scrapper", params);
	});
});

describe("generateSchema", () => {
	const params = { user_prompt: "Schema for product" };

	test("success", async () => {
		const body = {
			request_id: "abc-123",
			status: "completed",
			user_prompt: "Schema for product",
			generated_schema: { type: "object" },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await scrapegraphai.generateSchema(API_KEY, params);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectPost(0, "/generate_schema", params);
	});
});

describe("sitemap", () => {
	const params = { website_url: "https://example.com" };

	test("success", async () => {
		const body = {
			request_id: "abc-123",
			urls: ["https://example.com/a", "https://example.com/b"],
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await scrapegraphai.sitemap(API_KEY, params);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectPost(0, "/sitemap", params);
	});
});

describe("getCredits", () => {
	test("success", async () => {
		const body = { remaining_credits: 420, total_credits_used: 69 };
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await scrapegraphai.getCredits(API_KEY);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectGet(0, "/credits");
	});
});

describe("checkHealth", () => {
	test("success", async () => {
		const body = { status: "healthy" };
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await scrapegraphai.checkHealth(API_KEY);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
		expect(url).toBe("https://api.scrapegraphai.com/healthz");
		expect(init.method).toBe("GET");
	});
});
