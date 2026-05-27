import { tool } from "ai";
import {
	ScrapeGraphAI,
	type ScrapeGraphAIInput,
	crawlPagesQuerySchema,
	crawlRequestSchema,
	extractRequestBaseSchema,
	monitorActivityQuerySchema,
	monitorCreateSchema,
	monitorUpdateSchema,
	scrapeRequestSchema,
	searchRequestSchema,
} from "scrapegraph-js";
import { z } from "zod";

export type ScrapeGraphToolOptions = ScrapeGraphAIInput;

const idSchema = z.object({
	id: z.string().min(1),
});

const monitorActivityInputSchema = z.object({
	id: z.string().min(1),
	params: monitorActivityQuerySchema.optional(),
});

const monitorUpdateInputSchema = z.object({
	id: z.string().min(1),
	params: monitorUpdateSchema,
});

const crawlPagesInputSchema = z.object({
	id: z.string().min(1),
	params: crawlPagesQuerySchema.partial().optional(),
});

function unwrap<T>(result: { status: "success" | "error"; data: T | null; error?: string }) {
	if (result.status === "error") {
		throw new Error(result.error ?? "ScrapeGraphAI request failed");
	}

	if (!result.data) {
		throw new Error("ScrapeGraphAI request returned no data");
	}

	return result.data;
}

export function scrapeTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description:
			"Scrape a webpage with ScrapeGraphAI. Supports markdown, html, json extraction, links, images, summary, branding, and screenshots.",
		inputSchema: scrapeRequestSchema,
		execute: async (input) => unwrap(await sgai.scrape(input)),
	});
}

export function extractTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description:
			"Extract structured JSON from a URL, HTML, or markdown using ScrapeGraphAI and a natural-language prompt.",
		inputSchema: extractRequestBaseSchema,
		execute: async (input) => unwrap(await sgai.extract(input)),
	});
}

export function searchTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description:
			"Search the web with ScrapeGraphAI and optionally extract structured data from the results.",
		inputSchema: searchRequestSchema,
		execute: async (input) => unwrap(await sgai.search(input)),
	});
}

export function startCrawlTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description:
			'Start an asynchronous ScrapeGraphAI crawl. Returns a crawl id. Poll getCrawlTool for status, then call getCrawlPagesTool to retrieve paginated pages and scrape results. When the user asks to crawl only a section or path slug, set includePatterns using glob-style URL patterns: "*/<slug>" for first-level paths and "**/<slug>/**" for nested paths.',
		inputSchema: crawlRequestSchema,
		execute: async (input) => unwrap(await sgai.crawl.start(input)),
	});
}

export function getCrawlTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description:
			"Get crawl status by crawl id. Use this after startCrawlTool for polling progress; use getCrawlPagesTool to retrieve paginated pages and scrape results.",
		inputSchema: idSchema,
		execute: async ({ id }) => unwrap(await sgai.crawl.get(id)),
	});
}

export function getCrawlPagesTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description:
			"Get cursor-paginated crawled pages for a ScrapeGraphAI crawl by crawl id. Returned pages include resolved scrape results when available. Default pagination is cursor 0 and limit 50.",
		inputSchema: crawlPagesInputSchema,
		execute: async ({ id, params }) => unwrap(await sgai.crawl.pages(id, params)),
	});
}

export function stopCrawlTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description: "Stop a running ScrapeGraphAI crawl by crawl id.",
		inputSchema: idSchema,
		execute: async ({ id }) => unwrap(await sgai.crawl.stop(id)),
	});
}

export function resumeCrawlTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description: "Resume a paused ScrapeGraphAI crawl by crawl id.",
		inputSchema: idSchema,
		execute: async ({ id }) => unwrap(await sgai.crawl.resume(id)),
	});
}

export function deleteCrawlTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description: "Delete a ScrapeGraphAI crawl by crawl id.",
		inputSchema: idSchema,
		execute: async ({ id }) => unwrap(await sgai.crawl.delete(id)),
	});
}

export function crawlTools(options?: ScrapeGraphToolOptions) {
	return {
		startCrawl: startCrawlTool(options),
		getCrawl: getCrawlTool(options),
		getCrawlPages: getCrawlPagesTool(options),
		stopCrawl: stopCrawlTool(options),
		resumeCrawl: resumeCrawlTool(options),
		deleteCrawl: deleteCrawlTool(options),
	};
}

export function createMonitorTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description:
			"Create an asynchronous ScrapeGraphAI monitor for a webpage. Returns a monitor id for status and activity checks.",
		inputSchema: monitorCreateSchema,
		execute: async (input) => unwrap(await sgai.monitor.create(input)),
	});
}

export function listMonitorsTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description: "List ScrapeGraphAI monitors.",
		inputSchema: z.object({}),
		execute: async () => unwrap(await sgai.monitor.list()),
	});
}

export function getMonitorTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description: "Get a ScrapeGraphAI monitor by monitor id.",
		inputSchema: idSchema,
		execute: async ({ id }) => unwrap(await sgai.monitor.get(id)),
	});
}

export function updateMonitorTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description: "Update a ScrapeGraphAI monitor by monitor id.",
		inputSchema: monitorUpdateInputSchema,
		execute: async ({ id, params }) => unwrap(await sgai.monitor.update(id, params)),
	});
}

export function deleteMonitorTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description: "Delete a ScrapeGraphAI monitor by monitor id.",
		inputSchema: idSchema,
		execute: async ({ id }) => unwrap(await sgai.monitor.delete(id)),
	});
}

export function pauseMonitorTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description: "Pause a ScrapeGraphAI monitor by monitor id.",
		inputSchema: idSchema,
		execute: async ({ id }) => unwrap(await sgai.monitor.pause(id)),
	});
}

export function resumeMonitorTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description: "Resume a paused ScrapeGraphAI monitor by monitor id.",
		inputSchema: idSchema,
		execute: async ({ id }) => unwrap(await sgai.monitor.resume(id)),
	});
}

export function getMonitorActivityTool(options?: ScrapeGraphToolOptions) {
	const sgai = ScrapeGraphAI(options);

	return tool({
		description:
			"Get recent activity ticks for a ScrapeGraphAI monitor by monitor id. Use after creating or retrieving a monitor.",
		inputSchema: monitorActivityInputSchema,
		execute: async ({ id, params }) => unwrap(await sgai.monitor.activity(id, params)),
	});
}

export function monitorTools(options?: ScrapeGraphToolOptions) {
	return {
		createMonitor: createMonitorTool(options),
		listMonitors: listMonitorsTool(options),
		getMonitor: getMonitorTool(options),
		updateMonitor: updateMonitorTool(options),
		deleteMonitor: deleteMonitorTool(options),
		pauseMonitor: pauseMonitorTool(options),
		resumeMonitor: resumeMonitorTool(options),
		getMonitorActivity: getMonitorActivityTool(options),
	};
}
