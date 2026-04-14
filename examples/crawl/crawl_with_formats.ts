import { crawl } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await crawl.start(apiKey, {
	url: "https://example.com",
	formats: [
		{ type: "markdown", mode: "reader" },
		{ type: "screenshot", width: 1280, height: 720 },
	],
	maxPages: 10,
	maxDepth: 2,
	includePatterns: ["/blog/*", "/docs/*"],
	excludePatterns: ["/admin/*"],
});

if (res.status === "success") {
	console.log("Crawl ID:", res.data?.id);
	console.log("Status:", res.data?.status);
	console.log("Total pages to crawl:", res.data?.total);
} else {
	console.error("Failed:", res.error);
}
