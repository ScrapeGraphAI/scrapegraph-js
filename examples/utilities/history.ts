import { ScrapeGraphAI } from "scrapegraph-js";

// reads SGAI_API_KEY from env, or pass explicitly: ScrapeGraphAI({ apiKey: "..." })
const sgai = ScrapeGraphAI();

const res = await sgai.history.list({
	service: "scrape",
	limit: 5,
});

if (res.status === "success") {
	console.log(`Total: ${res.data?.pagination.total}`);
	console.log(`Page ${res.data?.pagination.page}\n`);
	for (const entry of res.data?.data ?? []) {
		console.log(`  [${entry.status}] ${entry.service} - ${entry.id}`);
	}
} else {
	console.error("Failed:", res.error);
}
