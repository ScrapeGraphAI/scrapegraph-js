import { ScrapeGraphAI } from "scrapegraph-js";

// reads SGAI_API_KEY from env, or pass explicitly: ScrapeGraphAI({ apiKey: "..." })
const sgai = ScrapeGraphAI();

const res = await sgai.scrape({
	url: "https://example.com",
	formats: [{ type: "markdown" }],
});

if (res.status === "success") {
	console.log("Markdown:", res.data?.results.markdown?.data);
	console.log(`\nTook ${res.elapsedMs}ms`);
} else {
	console.error("Failed:", res.error);
}
