import { smartScraper } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await smartScraper(apiKey, {
	user_prompt: "Extract all post titles and authors",
	website_url: "https://news.ycombinator.com",
	number_of_scrolls: 5,
});

if (res.status === "success") {
	console.log("Posts:", JSON.stringify(res.data?.result, null, 2));
	console.log(`Took ${res.elapsedMs}ms`);
} else {
	console.error("Failed:", res.error);
}
