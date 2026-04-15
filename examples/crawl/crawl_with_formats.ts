import { ScrapeGraphAI } from "scrapegraph-js";

// reads SGAI_API_KEY from env, or pass explicitly: ScrapeGraphAI({ apiKey: "..." })
const sgai = ScrapeGraphAI();

const res = await sgai.crawl.start({
	url: "https://scrapegraphai.com/",
	formats: [
		{ type: "markdown", mode: "reader" },
		{ type: "screenshot", width: 1280, height: 720 },
	],
	maxPages: 10,
	maxDepth: 2,
	includePatterns: ["/blog/*", "/docs/*"],
	excludePatterns: ["/admin/*"],
});

if (res.status !== "success" || !res.data) {
	console.error("Failed to start:", res.error);
} else {
	const crawlId = res.data.id;
	console.log("Crawl started:", crawlId);

	let status = res.data.status;
	while (status === "running") {
		await new Promise((r) => setTimeout(r, 2000));
		const getRes = await sgai.crawl.get(crawlId);
		if (getRes.status !== "success" || !getRes.data) {
			console.error("Failed to get status:", getRes.error);
			break;
		}
		status = getRes.data.status;
		console.log(`Progress: ${getRes.data.finished}/${getRes.data.total} - ${status}`);

		if (status === "completed" || status === "failed") {
			console.log("\nPages crawled:");
			for (const page of getRes.data.pages) {
				console.log(`  ${page.url} - ${page.status}`);
			}
		}
	}
}
