import { crawl } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const startRes = await crawl.start(apiKey, {
	url: "https://example.com",
	maxPages: 5,
	maxDepth: 2,
});

if (startRes.status !== "success" || !startRes.data) {
	console.error("Failed to start:", startRes.error);
} else {
	console.log("Crawl started:", startRes.data.id);
	console.log("Status:", startRes.data.status);

	const getRes = await crawl.get(apiKey, startRes.data.id);
	console.log("\nProgress:", getRes.data?.finished, "/", getRes.data?.total);
	console.log("Pages:", getRes.data?.pages.map((p) => p.url));
}
