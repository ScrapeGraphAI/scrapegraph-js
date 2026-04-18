import { ScrapeGraphAI } from "scrapegraph-js";

// reads SGAI_API_KEY from env, or pass explicitly: ScrapeGraphAI({ apiKey: "..." })
const sgai = ScrapeGraphAI();

const res = await sgai.search({
	query: "best programming languages 2024",
	numResults: 3,
});

if (res.status === "success") {
	for (const result of res.data?.results ?? []) {
		console.log(`\n${result.title}`);
		console.log(`URL: ${result.url}`);
		console.log(`Content: ${result.content.slice(0, 200)}...`);
	}
} else {
	console.error("Failed:", res.error);
}
