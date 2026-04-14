import { ScrapeGraphAI } from "scrapegraph-js";

// reads SGAI_API_KEY from env, or pass explicitly: ScrapeGraphAI({ apiKey: "..." })
const sgai = ScrapeGraphAI();

const startRes = await sgai.crawl.start({
	url: "https://example.com",
	maxPages: 5,
	maxDepth: 2,
});

if (startRes.status !== "success" || !startRes.data) {
	console.error("Failed to start:", startRes.error);
} else {
	console.log("Crawl started:", startRes.data.id);
	console.log("Status:", startRes.data.status);

	const getRes = await sgai.crawl.get(startRes.data.id);
	console.log("\nProgress:", getRes.data?.finished, "/", getRes.data?.total);
	console.log("Pages:", getRes.data?.pages.map((p) => p.url));
}
