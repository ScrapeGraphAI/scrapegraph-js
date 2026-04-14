import { describe, expect, test } from "bun:test";
import { z } from "zod/v4";
import { scrapegraphai } from "../src";

function mockApi(routes: Record<string, (req: Request) => Response | Promise<Response>>) {
	const server = Bun.serve({
		port: 0,
		async fetch(req) {
			const path = new URL(req.url).pathname;
			const handler = routes[path];
			if (handler) return handler(req);
			return new Response("Not found", { status: 404 });
		},
	});
	return { url: `http://localhost:${server.port}`, stop: () => server.stop() };
}

describe("scrapegraphai", () => {
	test("scrape defaults to formats[] with markdown", async () => {
		let body: any;
		const api = mockApi({
			"/api/v2/scrape": async (req) => {
				body = await req.json();
				return Response.json(
					{ results: { markdown: "# Hello" }, metadata: { url: "https://example.com" } },
					{ headers: { "x-request-id": "req-1" } },
				);
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		const res = await sgai.scrape("https://example.com");
		expect(body.formats).toEqual([{ type: "markdown", mode: "normal" }]);
		expect((res.data as any).results.markdown).toBe("# Hello");
		expect(res.requestId).toBe("req-1");
		api.stop();
	});

	test("scrape translates legacy single-format calls to formats[]", async () => {
		let body: any;
		const api = mockApi({
			"/api/v2/scrape": async (req) => {
				body = await req.json();
				return Response.json(
					{ results: { html: "<h1>Hello</h1>" }, metadata: { url: "https://example.com" } },
					{ headers: { "x-request-id": "req-html" } },
				);
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		await sgai.scrape("https://example.com", { format: "html" });
		expect(body.formats).toEqual([{ type: "html", mode: "normal" }]);
		api.stop();
	});

	test("scrape normalizes JSON format schemas", async () => {
		let body: any;
		const api = mockApi({
			"/api/v2/scrape": async (req) => {
				body = await req.json();
				return Response.json(
					{ results: { json: { title: "Example" } }, metadata: { url: "https://example.com" } },
					{ headers: { "x-request-id": "req-json" } },
				);
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		await sgai.scrape("https://example.com", {
			format: "json",
			json: {
				prompt: "Extract the title",
				schema: z.object({ title: z.string() }),
			},
		});
		expect(body.formats[0]).toMatchObject({
			type: "json",
			prompt: "Extract the title",
			schema: {
				type: "object",
				properties: { title: { type: "string" } },
				required: ["title"],
			},
		});
		api.stop();
	});

	test("scrape sends stealth and mode in fetchConfig", async () => {
		let body: any;
		const api = mockApi({
			"/api/v2/scrape": async (req) => {
				body = await req.json();
				return Response.json(
					{ results: { markdown: "# Hello" }, metadata: { url: "https://example.com" } },
					{ headers: { "x-request-id": "req-stealth" } },
				);
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		await sgai.scrape("https://example.com", {
			fetchConfig: { mode: "fast", stealth: true, country: "us" },
		});
		expect(body.fetchConfig).toEqual({ mode: "fast", stealth: true, country: "us" });
		api.stop();
	});

	test("extract sends prompt, schema, and fetchConfig", async () => {
		let body: any;
		const api = mockApi({
			"/api/v2/extract": async (req) => {
				body = await req.json();
				return Response.json(
					{ json: { name: "Test" }, raw: null, usage: {}, metadata: { chunker: {} } },
					{ headers: { "x-request-id": "req-2" } },
				);
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		await sgai.extract("https://example.com", {
			prompt: "Get name",
			schema: z.object({ name: z.string() }),
			fetchConfig: { timeout: 5000 },
		});
		expect(body.prompt).toBe("Get name");
		expect(body.schema).toEqual({
			type: "object",
			properties: { name: { type: "string" } },
			required: ["name"],
		});
		expect(body.fetchConfig.timeout).toBe(5000);
		api.stop();
	});

	test("search sends SGAI v2 fields only", async () => {
		let body: any;
		const api = mockApi({
			"/api/v2/search": async (req) => {
				body = await req.json();
				return Response.json(
					{
						results: [{ url: "https://a.com" }],
						metadata: { search: {}, pages: { requested: 1, scraped: 1 } },
					},
					{ headers: { "x-request-id": "req-3" } },
				);
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		const res = await sgai.search("test query", {
			numResults: 1,
			prompt: "Find the title",
			schema: z.object({ title: z.string() }),
			locationGeoCode: "it",
			timeRange: "past_week",
		});
		expect(body).toEqual({
			query: "test query",
			numResults: 1,
			prompt: "Find the title",
			schema: {
				type: "object",
				properties: { title: { type: "string" } },
				required: ["title"],
			},
			locationGeoCode: "it",
			timeRange: "past_week",
		});
		expect((res.data as any).results.length).toBe(1);
		api.stop();
	});

	test("schema sends prompt and existing schema", async () => {
		let body: any;
		const api = mockApi({
			"/api/v2/schema": async (req) => {
				body = await req.json();
				return Response.json(
					{ refinedPrompt: "Refined prompt", schema: { type: "object" }, usage: {} },
					{ headers: { "x-request-id": "req-schema" } },
				);
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		await sgai.schema("Extract product data", {
			existingSchema: z.object({ name: z.string() }),
		});
		expect(body).toEqual({
			prompt: "Extract product data",
			existingSchema: {
				type: "object",
				properties: { name: { type: "string" } },
				required: ["name"],
			},
		});
		api.stop();
	});

	test("validate sends email as query param", async () => {
		let requestUrl: string | undefined;
		const server = Bun.serve({
			port: 0,
			fetch(req) {
				requestUrl = req.url;
				return Response.json({ ok: true }, { headers: { "x-request-id": "req-validate" } });
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: `http://localhost:${server.port}` });
		await sgai.validate("user@example.com");
		expect(requestUrl).toContain("email=user%40example.com");
		server.stop();
	});

	test("credits returns SGAI v2 balance shape", async () => {
		const api = mockApi({
			"/api/v2/credits": () =>
				Response.json(
					{ remaining: 5000, used: 200, plan: "local" },
					{ headers: { "x-request-id": "req-4" } },
				),
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		const res = await sgai.credits();
		expect((res.data as any).remaining).toBe(5000);
		expect((res.data as any).used).toBe(200);
		api.stop();
	});

	test("crawl.start translates legacy format to formats[]", async () => {
		let body: any;
		const api = mockApi({
			"/api/v2/crawl": async (req) => {
				body = await req.json();
				return Response.json(
					{ id: "crawl-123", status: "running", total: 0, finished: 0, pages: [] },
					{ headers: { "x-request-id": "req-5" } },
				);
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		const res = await sgai.crawl.start("https://example.com", { maxPages: 10, format: "html" });
		expect(body).toMatchObject({
			url: "https://example.com",
			maxPages: 10,
			formats: [{ type: "html", mode: "normal" }],
		});
		expect((res.data as any).id).toBe("crawl-123");
		api.stop();
	});

	test("crawl.status returns status", async () => {
		const api = mockApi({
			"/api/v2/crawl/crawl-123": () =>
				Response.json(
					{ id: "crawl-123", status: "completed", total: 1, finished: 1, pages: [] },
					{ headers: { "x-request-id": "req-6" } },
				),
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		const res = await sgai.crawl.status("crawl-123");
		expect((res.data as any).status).toBe("completed");
		api.stop();
	});

	test("crawl.stop sends POST", async () => {
		let called = false;
		const api = mockApi({
			"/api/v2/crawl/crawl-123/stop": () => {
				called = true;
				return Response.json({ ok: true }, { headers: { "x-request-id": "req-7" } });
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		await sgai.crawl.stop("crawl-123");
		expect(called).toBe(true);
		api.stop();
	});

	test("monitor.create translates legacy prompt inputs to JSON format entries", async () => {
		let body: any;
		const api = mockApi({
			"/api/v2/monitor": async (req) => {
				body = await req.json();
				return Response.json(
					{
						cronId: "mon-1",
						scheduleId: "sch-1",
						interval: "1h",
						status: "active",
						config: body,
						createdAt: "2026-01-01T00:00:00.000Z",
						updatedAt: "2026-01-01T00:00:00.000Z",
					},
					{ headers: { "x-request-id": "req-8" } },
				);
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		await sgai.monitor.create({
			url: "https://example.com",
			prompt: "Check price",
			schema: z.object({ price: z.number() }),
			interval: "1h",
		});
		expect(body).toEqual({
			url: "https://example.com",
			name: undefined,
			webhookUrl: undefined,
			interval: "1h",
			fetchConfig: undefined,
			formats: [
				{
					type: "json",
					prompt: "Check price",
					schema: {
						type: "object",
						properties: { price: { type: "number" } },
						required: ["price"],
					},
					mode: "normal",
				},
			],
		});
		api.stop();
	});

	test("monitor.delete sends DELETE", async () => {
		let method: string | undefined;
		const api = mockApi({
			"/api/v2/monitor/mon-1": (req) => {
				method = req.method;
				return Response.json({}, { headers: { "x-request-id": "req-9" } });
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		await sgai.monitor.delete("mon-1");
		expect(method).toBe("DELETE");
		api.stop();
	});

	test("history appends query params", async () => {
		let requestUrl: string | undefined;
		const server = Bun.serve({
			port: 0,
			fetch(req) {
				requestUrl = req.url;
				return Response.json(
					{ data: [], pagination: { page: 2, limit: 10, total: 0 } },
					{ headers: { "x-request-id": "req-10" } },
				);
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: `http://localhost:${server.port}` });
		await sgai.history({ page: 2, limit: 10, service: "scrape" });
		expect(requestUrl).toContain("page=2");
		expect(requestUrl).toContain("limit=10");
		expect(requestUrl).toContain("service=scrape");
		server.stop();
	});

	test("extract supports raw html and markdown inputs", async () => {
		let body: any;
		const api = mockApi({
			"/api/v2/extract": async (req) => {
				body = await req.json();
				return Response.json(
					{ json: { title: "Alpha" }, raw: null, usage: {}, metadata: { chunker: {} } },
					{ headers: { "x-request-id": "req-extract-raw" } },
				);
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		await sgai.extract(
			undefined,
			{
				prompt: "Extract the title",
				html: "<h1>Alpha</h1>",
				markdown: "# Alpha",
			},
			{ timeout: 10_000 },
		);

		expect(body).toEqual({
			prompt: "Extract the title",
			html: "<h1>Alpha</h1>",
			markdown: "# Alpha",
		});
		api.stop();
	});
});
