import { searchScraper } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

// extraction_mode: false returns raw markdown instead of AI-extracted data
// costs 2 credits per page vs 10 for AI extraction
const res = await searchScraper(apiKey, {
	user_prompt: "Latest developments in artificial intelligence",
	num_results: 3,
	extraction_mode: false,
});

if (res.status === "success") {
	console.log("Result:", JSON.stringify(res.data?.result, null, 2));
	console.log("\nReference URLs:");
	res.data?.reference_urls.forEach((url, i) => console.log(`  ${i + 1}. ${url}`));
} else {
	console.error("Failed:", res.error);
}
