import { describe, expect, test } from "bun:test";
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
	test("scrape returns markdown + requestId", async () => {
		const api = mockApi({
			"/v2/scrape": () =>
				Response.json({ markdown: "# Hello" }, { headers: { "x-request-id": "req-1" } }),
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		const res = await sgai.scrape("https://example.com");
		expect((res.data as any).markdown).toBe("# Hello");
		expect(res._requestId).toBe("req-1");
		api.stop();
	});

	test("extract sends prompt + schema", async () => {
		let body: any;
		const api = mockApi({
			"/v2/extract": async (req) => {
				body = await req.json();
				return Response.json({ json: { name: "Test" } }, { headers: { "x-request-id": "req-2" } });
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		await sgai.extract("https://example.com", {
			prompt: "Get name",
			schema: { type: "object", properties: { name: { type: "string" } } },
		});
		expect(body.prompt).toBe("Get name");
		expect(body.schema).toBeTruthy();
		api.stop();
	});

	test("search sends query", async () => {
		let body: any;
		const api = mockApi({
			"/v2/search": async (req) => {
				body = await req.json();
				return Response.json(
					{ results: [{ url: "https://a.com" }] },
					{ headers: { "x-request-id": "req-3" } },
				);
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		const res = await sgai.search("test query");
		expect(body.query).toBe("test query");
		expect((res.data as any).results.length).toBe(1);
		api.stop();
	});

	test("credits returns balance", async () => {
		const api = mockApi({
			"/v2/credits": () =>
				Response.json(
					{ remainingCredits: 5000, totalCreditsUsed: 200 },
					{ headers: { "x-request-id": "req-4" } },
				),
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		const res = await sgai.credits();
		expect((res.data as any).remainingCredits).toBe(5000);
		api.stop();
	});

	test("crawl.start returns job id", async () => {
		const api = mockApi({
			"/v2/crawl": () =>
				Response.json(
					{ id: "crawl-123", status: "running" },
					{ headers: { "x-request-id": "req-5" } },
				),
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		const res = await sgai.crawl.start("https://example.com", { maxPages: 10 });
		expect((res.data as any).id).toBe("crawl-123");
		api.stop();
	});

	test("crawl.status returns status", async () => {
		const api = mockApi({
			"/v2/crawl/crawl-123": () =>
				Response.json(
					{ id: "crawl-123", status: "completed", pages: [] },
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
			"/v2/crawl/crawl-123/stop": () => {
				called = true;
				return Response.json({ ok: true }, { headers: { "x-request-id": "req-7" } });
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		await sgai.crawl.stop("crawl-123");
		expect(called).toBe(true);
		api.stop();
	});

	test("monitor.create sends body", async () => {
		let body: any;
		const api = mockApi({
			"/v2/monitor": async (req) => {
				body = await req.json();
				return Response.json({ id: "mon-1" }, { headers: { "x-request-id": "req-8" } });
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: api.url });
		await sgai.monitor.create({
			url: "https://example.com",
			prompt: "Check price",
			interval: "1h",
		});
		expect(body.url).toBe("https://example.com");
		expect(body.prompt).toBe("Check price");
		api.stop();
	});

	test("monitor.delete sends DELETE", async () => {
		let method: string | undefined;
		const api = mockApi({
			"/v2/monitor/mon-1": (req) => {
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
				return Response.json({ data: [], total: 0 }, { headers: { "x-request-id": "req-10" } });
			},
		});
		const sgai = scrapegraphai({ apiKey: "test", baseUrl: `http://localhost:${server.port}` });
		await sgai.history({ page: 2, limit: 10, service: "scrape" });
		expect(requestUrl).toContain("page=2");
		expect(requestUrl).toContain("limit=10");
		expect(requestUrl).toContain("service=scrape");
		server.stop();
	});
});
