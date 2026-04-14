import { describe, expect, test } from "bun:test";
import { crawl, extract, getCredits, history, scrape, search } from "../src/index.js";

const API_KEY = process.env.SGAI_API_KEY || "sgai-669918e5-55be-4752-a684-f6da788d1384";

describe("integration", () => {
	test("getCredits", async () => {
		const res = await getCredits(API_KEY);
		console.log("getCredits:", res);
		expect(res.status).toBe("success");
		expect(res.data).toHaveProperty("remaining");
		expect(res.data).toHaveProperty("plan");
	});

	test("scrape markdown", async () => {
		const res = await scrape(API_KEY, {
			url: "https://example.com",
			formats: [{ type: "markdown" }],
		});
		console.log("scrape:", res.status, res.error);
		expect(res.status).toBe("success");
		expect(res.data?.results.markdown).toBeDefined();
	});

	test("scrape with multiple formats", async () => {
		const res = await scrape(API_KEY, {
			url: "https://example.com",
			formats: [{ type: "markdown", mode: "reader" }, { type: "links" }, { type: "images" }],
		});
		console.log("scrape multi:", res.status, res.error);
		expect(res.status).toBe("success");
		expect(res.data?.results.markdown).toBeDefined();
		expect(res.data?.results.links).toBeDefined();
	});

	test("scrape PDF document", async () => {
		const res = await scrape(API_KEY, {
			url: "https://pdfobject.com/pdf/sample.pdf",
			contentType: "application/pdf",
			formats: [{ type: "markdown" }],
		});
		console.log("scrape PDF:", res.status, res.error);
		expect(res.status).toBe("success");
		expect(res.data?.metadata.contentType).toBe("application/pdf");
	});

	test("scrape with fetchConfig", async () => {
		const res = await scrape(API_KEY, {
			url: "https://example.com",
			fetchConfig: { mode: "fast", timeout: 15000 },
			formats: [{ type: "markdown" }],
		});
		console.log("scrape fetchConfig:", res.status, res.error);
		expect(res.status).toBe("success");
	});

	test("extract", async () => {
		const res = await extract(API_KEY, {
			url: "https://example.com",
			prompt: "What is this page about?",
		});
		console.log("extract:", res.status, res.error);
		expect(res.status).toBe("success");
	});

	test("search", async () => {
		const res = await search(API_KEY, {
			query: "anthropic claude",
			numResults: 2,
		});
		console.log("search:", res.status, res.error);
		expect(res.status).toBe("success");
		expect(res.data?.results.length).toBeGreaterThan(0);
	});

	test("history.list", async () => {
		const res = await history.list(API_KEY, { limit: 5 });
		console.log("history.list:", res.status, res.data?.pagination);
		expect(res.status).toBe("success");
	});

	test("crawl.start and crawl.get", async () => {
		const startRes = await crawl.start(API_KEY, {
			url: "https://example.com",
			maxPages: 2,
		});
		console.log("crawl.start:", startRes.status, startRes.data?.id, startRes.error);

		if (
			startRes.status === "error" &&
			(startRes.error?.includes("Max") || startRes.error?.includes("Rate"))
		) {
			console.log("Skipping - rate limited");
			return;
		}

		expect(startRes.status).toBe("success");

		if (startRes.data?.id) {
			const getRes = await crawl.get(API_KEY, startRes.data.id);
			console.log("crawl.get:", getRes.status, getRes.data?.status);
			expect(getRes.status).toBe("success");
		}
	});
});
