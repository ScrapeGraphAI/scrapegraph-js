import { describe, expect, test } from "bun:test";
import { ScrapeGraphAI } from "../src/index.js";

if (!process.env.SGAI_API_KEY)
	throw new Error("SGAI_API_KEY env var required for integration tests");

const sgai = ScrapeGraphAI();

describe("integration", () => {
	test("credits", async () => {
		const res = await sgai.credits();
		console.log("credits:", res);
		expect(res.status).toBe("success");
		expect(res.data).toHaveProperty("remaining");
		expect(res.data).toHaveProperty("plan");
	});

	test("scrape - no formats (defaults to markdown)", async () => {
		const res = await sgai.scrape({ url: "https://example.com" });
		console.log("scrape default:", res.status, res.error);
		expect(res.status).toBe("success");
		expect(res.data?.results.markdown).toBeDefined();
	});

	test("scrape - single format", async () => {
		const res = await sgai.scrape({
			url: "https://example.com",
			formats: [{ type: "markdown" }],
		});
		console.log("scrape single:", res.status, res.error);
		expect(res.status).toBe("success");
		expect(res.data?.results.markdown).toBeDefined();
	});

	test("scrape - multiple formats", async () => {
		const res = await sgai.scrape({
			url: "https://example.com",
			formats: [{ type: "markdown", mode: "reader" }, { type: "links" }, { type: "images" }],
		});
		console.log("scrape multi:", res.status, res.error);
		expect(res.status).toBe("success");
		expect(res.data?.results.markdown).toBeDefined();
		expect(res.data?.results.links).toBeDefined();
	});

	test("scrape - PDF document", async () => {
		const res = await sgai.scrape({
			url: "https://pdfobject.com/pdf/sample.pdf",
			contentType: "application/pdf",
			formats: [{ type: "markdown" }],
		});
		console.log("scrape PDF:", res.status, res.error);
		expect(res.status).toBe("success");
		expect(res.data?.metadata.contentType).toBe("application/pdf");
	});

	test("scrape - with fetchConfig", async () => {
		const res = await sgai.scrape({
			url: "https://example.com",
			fetchConfig: { mode: "fast", timeout: 15000 },
			formats: [{ type: "markdown" }],
		});
		console.log("scrape fetchConfig:", res.status, res.error);
		expect(res.status).toBe("success");
	});

	test("extract", async () => {
		const res = await sgai.extract({
			url: "https://example.com",
			prompt: "What is this page about?",
		});
		console.log("extract:", res.status, res.error);
		expect(res.status).toBe("success");
	});

	test("search", async () => {
		const res = await sgai.search({
			query: "anthropic claude",
			numResults: 2,
		});
		console.log("search:", res.status, res.error);
		expect(res.status).toBe("success");
		expect(res.data?.results.length).toBeGreaterThan(0);
	});

	test("history.list", async () => {
		const res = await sgai.history.list({ limit: 5 });
		console.log("history.list:", res.status, res.data?.pagination);
		expect(res.status).toBe("success");
	});

	test("crawl.start and crawl.get", async () => {
		const startRes = await sgai.crawl.start({
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
			const getRes = await sgai.crawl.get(startRes.data.id);
			console.log("crawl.get:", getRes.status, getRes.data?.status);
			expect(getRes.status).toBe("success");
		}
	});
});
