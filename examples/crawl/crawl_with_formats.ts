import { ScrapeGraphAI } from "scrapegraph-js";

// reads SGAI_API_KEY from env, or pass explicitly: ScrapeGraphAI({ apiKey: "..." })
const sgai = ScrapeGraphAI();

const res = await sgai.crawl.start({
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
