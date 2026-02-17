import { searchScraper } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await searchScraper(apiKey, {
	user_prompt: "What is the latest version of Python and what are its main features?",
	num_results: 3,
});

if (res.status === "success") {
	console.log("Result:", JSON.stringify(res.data?.result, null, 2));
	console.log("\nReference URLs:");
	res.data?.reference_urls.forEach((url, i) => console.log(`  ${i + 1}. ${url}`));
} else {
	console.error("Failed:", res.error);
}
