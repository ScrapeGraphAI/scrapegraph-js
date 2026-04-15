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

	test("with fetchConfig - js mode and stealth", async () => {
		const body = {
			results: { markdown: { data: ["# Hello"] } },
			metadata: { contentType: "text/html", provider: "playwright" },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const paramsWithConfig = {
			url: "https://example.com",
			fetchConfig: {
				mode: "js" as const,
				stealth: true,
				timeout: 45000,
				wait: 2000,
				scrolls: 3,
			},
			formats: [{ type: "markdown" as const }],
		};

		const res = await sdk.scrape(API_KEY, paramsWithConfig);

		expect(res.status).toBe("success");
		expectRequest(0, "POST", "/scrape", paramsWithConfig);
	});

	test("with fetchConfig - headers and cookies", async () => {
		const body = {
			results: { html: { data: ["<html></html>"] } },
			metadata: { contentType: "text/html" },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const paramsWithConfig = {
			url: "https://example.com",
			fetchConfig: {
				mode: "fast" as const,
				headers: { "X-Custom-Header": "test-value", Authorization: "Bearer token123" },
				cookies: { session: "abc123", tracking: "xyz789" },
			},
			formats: [{ type: "html" as const }],
		};

		const res = await sdk.scrape(API_KEY, paramsWithConfig);

		expect(res.status).toBe("success");
		expectRequest(0, "POST", "/scrape", paramsWithConfig);
	});

	test("with fetchConfig - country geo targeting", async () => {
		const body = {
			results: { markdown: { data: ["# Localized content"] } },
			metadata: { contentType: "text/html" },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const paramsWithConfig = {
			url: "https://example.com",
			fetchConfig: { country: "de" },
			formats: [{ type: "markdown" as const }],
		};

		const res = await sdk.scrape(API_KEY, paramsWithConfig);

		expect(res.status).toBe("success");
		expectRequest(0, "POST", "/scrape", paramsWithConfig);
	});

	test("multiple formats - markdown, html, links, images", async () => {
		const body = {
			results: {
				markdown: { data: ["# Title"] },
				html: { data: ["<h1>Title</h1>"] },
				links: { data: ["https://example.com/page1"], metadata: { count: 1 } },
				images: { data: ["https://example.com/image.png"], metadata: { count: 1 } },
			},
			metadata: { contentType: "text/html" },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const multiFormatParams = {
			url: "https://example.com",
			formats: [
				{ type: "markdown" as const, mode: "reader" as const },
				{ type: "html" as const, mode: "prune" as const },
				{ type: "links" as const },
				{ type: "images" as const },
			],
		};

		const res = await sdk.scrape(API_KEY, multiFormatParams);

		expect(res.status).toBe("success");
		expect(res.data?.results.markdown).toBeDefined();
		expect(res.data?.results.html).toBeDefined();
		expect(res.data?.results.links).toBeDefined();
		expect(res.data?.results.images).toBeDefined();
		expectRequest(0, "POST", "/scrape", multiFormatParams);
	});

	test("screenshot format with options", async () => {
		const body = {
			results: {
				screenshot: {
					data: { url: "https://storage.example.com/shot.png", width: 1920, height: 1080 },
					metadata: { contentType: "image/png" },
				},
			},
			metadata: { contentType: "text/html" },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const screenshotParams = {
			url: "https://example.com",
			formats: [
				{
					type: "screenshot" as const,
					fullPage: true,
					width: 1920,
					height: 1080,
					quality: 95,
				},
			],
		};

		const res = await sdk.scrape(API_KEY, screenshotParams);

		expect(res.status).toBe("success");
		expect(res.data?.results.screenshot?.data.url).toBeDefined();
		expectRequest(0, "POST", "/scrape", screenshotParams);
	});

	test("json format with prompt and schema", async () => {
		const body = {
			results: {
				json: {
					data: { title: "Example", price: 99.99 },
					metadata: { chunker: { chunks: [{ size: 500 }] } },
				},
			},
			metadata: { contentType: "text/html" },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const jsonParams = {
			url: "https://example.com/product",
			formats: [
				{
					type: "json" as const,
					prompt: "Extract product title and price",
					schema: {
						type: "object",
						properties: {
							title: { type: "string" },
							price: { type: "number" },
						},
					},
				},
			],
		};

		const res = await sdk.scrape(API_KEY, jsonParams);

		expect(res.status).toBe("success");
		expect(res.data?.results.json?.data).toEqual({ title: "Example", price: 99.99 });
		expectRequest(0, "POST", "/scrape", jsonParams);
	});

	test("summary format", async () => {
		const body = {
			results: {
				summary: {
					data: "This is a summary of the page content.",
					metadata: { chunker: { chunks: [{ size: 1000 }] } },
				},
			},
			metadata: { contentType: "text/html" },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const summaryParams = {
			url: "https://example.com/article",
			formats: [{ type: "summary" as const }],
		};

		const res = await sdk.scrape(API_KEY, summaryParams);

		expect(res.status).toBe("success");
		expect(res.data?.results.summary?.data).toBe("This is a summary of the page content.");
		expectRequest(0, "POST", "/scrape", summaryParams);
	});

	test("branding format", async () => {
		const body = {
			results: {
				branding: {
					data: {
						colorScheme: "light",
						colors: {
							primary: "#0066cc",
							accent: "#ff6600",
							background: "#ffffff",
							textPrimary: "#333333",
							link: "#0066cc",
						},
						typography: {
							primary: { family: "Inter", fallback: "sans-serif" },
							heading: { family: "Inter", fallback: "sans-serif" },
							mono: { family: "Fira Code", fallback: "monospace" },
							sizes: { h1: "2.5rem", h2: "2rem", body: "1rem" },
						},
						images: { logo: "", favicon: "", ogImage: "" },
						spacing: { baseUnit: 8, borderRadius: "4px" },
						frameworkHints: ["react"],
						personality: { tone: "professional", energy: "medium", targetAudience: "developers" },
						confidence: 0.85,
					},
					metadata: {
						branding: {
							title: "Example",
							description: "Example site",
							favicon: "",
							language: "en",
							themeColor: "#0066cc",
							ogTitle: "Example",
							ogDescription: "Example site",
							ogImage: "",
							ogUrl: "https://example.com",
						},
					},
				},
			},
			metadata: { contentType: "text/html" },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const brandingParams = {
			url: "https://example.com",
			formats: [{ type: "branding" as const }],
		};

		const res = await sdk.scrape(API_KEY, brandingParams);

		expect(res.status).toBe("success");
		expect(res.data?.results.branding?.data.colorScheme).toBe("light");
		expectRequest(0, "POST", "/scrape", brandingParams);
	});

	test("PDF document scraping", async () => {
		const body = {
			results: {
				markdown: { data: ["# PDF Document\n\nThis is the content extracted from the PDF."] },
			},
			metadata: {
				contentType: "application/pdf",
				ocr: {
					model: "gpt-4o",
					pagesProcessed: 2,
					pages: [
						{
							index: 0,
							images: [],
							tables: [],
							hyperlinks: [],
							dimensions: { dpi: 72, height: 792, width: 612 },
						},
						{
							index: 1,
							images: [],
							tables: [],
							hyperlinks: [],
							dimensions: { dpi: 72, height: 792, width: 612 },
						},
					],
				},
			},
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const pdfParams = {
			url: "https://pdfobject.com/pdf/sample.pdf",
			contentType: "application/pdf" as const,
			formats: [{ type: "markdown" as const }],
		};

		const res = await sdk.scrape(API_KEY, pdfParams);

		expect(res.status).toBe("success");
		expect(res.data?.metadata.contentType).toBe("application/pdf");
		expect(res.data?.metadata.ocr?.pagesProcessed).toBe(2);
		expectRequest(0, "POST", "/scrape", pdfParams);
	});

	test("DOCX document scraping", async () => {
		const body = {
			results: { markdown: { data: ["# Word Document\n\nContent from DOCX file."] } },
			metadata: {
				contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			},
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const docxParams = {
			url: "https://example.com/document.docx",
			contentType:
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document" as const,
			formats: [{ type: "markdown" as const }],
		};

		const res = await sdk.scrape(API_KEY, docxParams);

		expect(res.status).toBe("success");
		expectRequest(0, "POST", "/scrape", docxParams);
	});

	test("image scraping with OCR", async () => {
		const body = {
			results: { markdown: { data: ["Text extracted from image via OCR"] } },
			metadata: { contentType: "image/png" },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const imageParams = {
			url: "https://example.com/screenshot.png",
			contentType: "image/png" as const,
			formats: [{ type: "markdown" as const }],
		};

		const res = await sdk.scrape(API_KEY, imageParams);

		expect(res.status).toBe("success");
		expectRequest(0, "POST", "/scrape", imageParams);
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

	test("with HTML input instead of URL", async () => {
		const body = {
			raw: null,
			json: { title: "Test Page" },
			usage: { promptTokens: 50, completionTokens: 20 },
			metadata: { chunker: { chunks: [{ size: 200 }] } },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const htmlParams = {
			html: "<html><head><title>Test Page</title></head><body><h1>Hello</h1></body></html>",
			prompt: "Extract the page title",
		};

		const res = await sdk.extract(API_KEY, htmlParams);

		expect(res.status).toBe("success");
		expectRequest(0, "POST", "/extract", htmlParams);
	});

	test("with markdown input instead of URL", async () => {
		const body = {
			raw: null,
			json: { headings: ["Introduction", "Methods"] },
			usage: { promptTokens: 30, completionTokens: 15 },
			metadata: { chunker: { chunks: [{ size: 100 }] } },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const mdParams = {
			markdown: "# Introduction\n\nSome content.\n\n# Methods\n\nMore content.",
			prompt: "Extract all headings",
		};

		const res = await sdk.extract(API_KEY, mdParams);

		expect(res.status).toBe("success");
		expectRequest(0, "POST", "/extract", mdParams);
	});

	test("with schema for structured output", async () => {
		const body = {
			raw: null,
			json: { products: [{ name: "Widget", price: 29.99, inStock: true }] },
			usage: { promptTokens: 150, completionTokens: 80 },
			metadata: { chunker: { chunks: [{ size: 500 }] } },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const schemaParams = {
			url: "https://example.com/products",
			prompt: "Extract all products with their names, prices, and availability",
			schema: {
				type: "object",
				properties: {
					products: {
						type: "array",
						items: {
							type: "object",
							properties: {
								name: { type: "string" },
								price: { type: "number" },
								inStock: { type: "boolean" },
							},
						},
					},
				},
			},
		};

		const res = await sdk.extract(API_KEY, schemaParams);

		expect(res.status).toBe("success");
		expect(res.data?.json?.products).toHaveLength(1);
		expectRequest(0, "POST", "/extract", schemaParams);
	});

	test("with fetchConfig and contentType for PDF", async () => {
		const body = {
			raw: "Raw text from PDF",
			json: { sections: ["Abstract", "Introduction", "Conclusion"] },
			usage: { promptTokens: 200, completionTokens: 50 },
			metadata: { chunker: { chunks: [{ size: 2000 }] }, fetch: { provider: "playwright" } },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const pdfParams = {
			url: "https://pdfobject.com/pdf/sample.pdf",
			contentType: "application/pdf" as const,
			prompt: "List all section headings in this document",
			fetchConfig: { timeout: 60000 },
		};

		const res = await sdk.extract(API_KEY, pdfParams);

		expect(res.status).toBe("success");
		expect(res.data?.raw).toBe("Raw text from PDF");
		expectRequest(0, "POST", "/extract", pdfParams);
	});

	test("with html mode options", async () => {
		const body = {
			raw: null,
			json: { mainContent: "Article text without boilerplate" },
			usage: { promptTokens: 100, completionTokens: 30 },
			metadata: { chunker: { chunks: [{ size: 800 }] } },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const modeParams = {
			url: "https://example.com/article",
			prompt: "Extract the main article content",
			mode: "reader" as const,
		};

		const res = await sdk.extract(API_KEY, modeParams);

		expect(res.status).toBe("success");
		expectRequest(0, "POST", "/extract", modeParams);
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

	test("with numResults and format options", async () => {
		const body = {
			results: [
				{ url: "https://example1.com", title: "Result 1", content: "<p>HTML content 1</p>" },
				{ url: "https://example2.com", title: "Result 2", content: "<p>HTML content 2</p>" },
				{ url: "https://example3.com", title: "Result 3", content: "<p>HTML content 3</p>" },
				{ url: "https://example4.com", title: "Result 4", content: "<p>HTML content 4</p>" },
				{ url: "https://example5.com", title: "Result 5", content: "<p>HTML content 5</p>" },
			],
			metadata: { search: { provider: "google" }, pages: { requested: 5, scraped: 5 } },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const searchParams = {
			query: "typescript best practices",
			numResults: 5,
			format: "html" as const,
		};

		const res = await sdk.search(API_KEY, searchParams);

		expect(res.status).toBe("success");
		expect(res.data?.results).toHaveLength(5);
		expectRequest(0, "POST", "/search", searchParams);
	});

	test("with prompt and schema for structured extraction", async () => {
		const body = {
			results: [{ url: "https://example.com", title: "Product", content: "Widget $29.99" }],
			json: { products: [{ name: "Widget", price: 29.99 }] },
			usage: { promptTokens: 100, completionTokens: 30 },
			metadata: {
				search: {},
				pages: { requested: 3, scraped: 3 },
				chunker: { chunks: [{ size: 500 }] },
			},
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const searchParams = {
			query: "buy widgets online",
			prompt: "Extract product names and prices from search results",
			schema: {
				type: "object",
				properties: {
					products: {
						type: "array",
						items: {
							type: "object",
							properties: {
								name: { type: "string" },
								price: { type: "number" },
							},
						},
					},
				},
			},
		};

		const res = await sdk.search(API_KEY, searchParams);

		expect(res.status).toBe("success");
		expect(res.data?.json).toBeDefined();
		expectRequest(0, "POST", "/search", searchParams);
	});

	test("with location and time range filters", async () => {
		const body = {
			results: [
				{ url: "https://news.example.com", title: "Breaking News", content: "Recent event" },
			],
			metadata: { search: {}, pages: { requested: 3, scraped: 3 } },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const searchParams = {
			query: "local news",
			locationGeoCode: "us",
			timeRange: "past_24_hours" as const,
		};

		const res = await sdk.search(API_KEY, searchParams);

		expect(res.status).toBe("success");
		expectRequest(0, "POST", "/search", searchParams);
	});

	test("with fetchConfig and html mode", async () => {
		const body = {
			results: [{ url: "https://example.com", title: "Test", content: "# Clean content" }],
			metadata: { search: {}, pages: { requested: 2, scraped: 2 } },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const searchParams = {
			query: "test query",
			numResults: 2,
			mode: "prune" as const,
			fetchConfig: { mode: "js" as const, timeout: 45000 },
		};

		const res = await sdk.search(API_KEY, searchParams);

		expect(res.status).toBe("success");
		expectRequest(0, "POST", "/search", searchParams);
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
		expectRequest(0, "GET", "/api/v2/health", undefined, HEALTH_BASE);
	});
});

describe("history", () => {
	test("list success without params", async () => {
		const body = {
			data: [],
			pagination: { page: 1, limit: 20, total: 0 },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.history.list(API_KEY);

		expect(res.status).toBe("success");
		expect(res.data).toEqual(body);
		expectRequest(0, "GET", "/history");
	});

	test("list success with params", async () => {
		const body = {
			data: [],
			pagination: { page: 2, limit: 10, total: 50 },
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.history.list(API_KEY, { page: 2, limit: 10, service: "scrape" });

		expect(res.status).toBe("success");
		const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
		expect(url).toContain("page=2");
		expect(url).toContain("limit=10");
		expect(url).toContain("service=scrape");
	});

	test("get success", async () => {
		const body = {
			id: "abc-123",
			service: "scrape",
			status: "completed",
			params: { url: "https://example.com" },
			result: {},
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.history.get(API_KEY, "abc-123");

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

	test("start with full config - formats and limits", async () => {
		const body = {
			id: "crawl-456",
			status: "running",
			total: 100,
			finished: 0,
			pages: [],
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const fullParams = {
			url: "https://example.com",
			formats: [
				{ type: "markdown" as const, mode: "reader" as const },
				{ type: "screenshot" as const, fullPage: false, width: 1280, height: 720, quality: 80 },
			],
			maxDepth: 3,
			maxPages: 100,
			maxLinksPerPage: 20,
		};

		const res = await sdk.crawl.start(API_KEY, fullParams);

		expect(res.status).toBe("success");
		expectRequest(0, "POST", "/crawl", fullParams);
	});

	test("start with include/exclude patterns", async () => {
		const body = {
			id: "crawl-789",
			status: "running",
			total: 30,
			finished: 0,
			pages: [],
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const patternParams = {
			url: "https://example.com",
			includePatterns: ["/blog/*", "/docs/*"],
			excludePatterns: ["/admin/*", "*.pdf"],
			allowExternal: false,
		};

		const res = await sdk.crawl.start(API_KEY, patternParams);

		expect(res.status).toBe("success");
		expectRequest(0, "POST", "/crawl", patternParams);
	});

	test("start with fetchConfig and contentTypes", async () => {
		const body = {
			id: "crawl-abc",
			status: "running",
			total: 50,
			finished: 0,
			pages: [],
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const configParams = {
			url: "https://example.com",
			contentTypes: ["text/html" as const, "application/pdf" as const],
			fetchConfig: {
				mode: "js" as const,
				stealth: true,
				timeout: 45000,
				wait: 1000,
			},
		};

		const res = await sdk.crawl.start(API_KEY, configParams);

		expect(res.status).toBe("success");
		expectRequest(0, "POST", "/crawl", configParams);
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

	test("create with multiple formats and webhook", async () => {
		const fullParams = {
			url: "https://example.com/prices",
			name: "Price Monitor",
			interval: "0 */6 * * *",
			formats: [
				{ type: "markdown" as const, mode: "reader" as const },
				{ type: "json" as const, prompt: "Extract all product prices", mode: "normal" as const },
				{ type: "screenshot" as const, fullPage: true, width: 1440, height: 900, quality: 90 },
			],
			webhookUrl: "https://hooks.example.com/notify",
		};
		const body = {
			cronId: "mon-456",
			scheduleId: "sched-789",
			interval: "0 */6 * * *",
			status: "active",
			config: fullParams,
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.monitor.create(API_KEY, fullParams);

		expect(res.status).toBe("success");
		expectRequest(0, "POST", "/monitor", fullParams);
	});

	test("create with fetchConfig", async () => {
		const configParams = {
			url: "https://spa-example.com",
			interval: "0 0 * * *",
			fetchConfig: {
				mode: "js" as const,
				stealth: true,
				wait: 3000,
				scrolls: 5,
			},
		};
		const body = {
			cronId: "mon-789",
			scheduleId: "sched-abc",
			interval: "0 0 * * *",
			status: "active",
			config: configParams,
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		};
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(json(body));

		const res = await sdk.monitor.create(API_KEY, configParams);

		expect(res.status).toBe("success");
		expectRequest(0, "POST", "/monitor", configParams);
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
