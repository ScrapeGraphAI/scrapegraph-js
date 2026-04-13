import { describe, expect, test } from "bun:test";
import request from "../src/http";

function mockServer(handler: (req: Request) => Response | Promise<Response>) {
	const server = Bun.serve({ port: 0, fetch: handler });
	return { url: `http://localhost:${server.port}`, stop: () => server.stop() };
}

describe("request", () => {
	test("POST with JSON body", async () => {
		const server = mockServer(() =>
			Response.json({ markdown: "hello" }, { headers: { "x-request-id": "req-123" } }),
		);
		const res = await request("POST", `${server.url}/test`, "fake-key", {
			url: "https://example.com",
		});
		expect(res.data.markdown).toBe("hello");
		expect(res.requestId).toBe("req-123");
		server.stop();
	});

	test("retries on 502", async () => {
		let attempts = 0;
		const server = mockServer(() => {
			attempts++;
			if (attempts < 3) return new Response("bad", { status: 502 });
			return Response.json({ ok: true }, { headers: { "x-request-id": "req-456" } });
		});
		const res = await request("POST", `${server.url}/test`, "fake-key", {}, { maxRetries: 3 });
		expect(attempts).toBe(3);
		expect((res.data as any).ok).toBe(true);
		server.stop();
	});

	test("sends auth + sdk version headers", async () => {
		let capturedHeaders: Headers | undefined;
		const server = mockServer((req) => {
			capturedHeaders = req.headers;
			return Response.json({}, { headers: { "x-request-id": "req-789" } });
		});
		await request("GET", `${server.url}/test`, "my-api-key");
		expect(capturedHeaders).toBeDefined();
		expect(capturedHeaders?.get("authorization")).toBe("Bearer my-api-key");
		expect(capturedHeaders?.get("sgai-apikey")).toBe("my-api-key");
		expect(capturedHeaders?.get("x-sdk-version")).toContain("js@");
		server.stop();
	});

	test("throws on 401", async () => {
		const server = mockServer(() =>
			Response.json({ error: { type: "auth", message: "Invalid key" } }, { status: 401 }),
		);
		await expect(request("GET", `${server.url}/test`, "bad-key")).rejects.toThrow("Invalid key");
		server.stop();
	});
});
