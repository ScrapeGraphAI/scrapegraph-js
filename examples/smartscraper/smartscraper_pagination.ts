import { smartScraper } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await smartScraper(apiKey, {
	user_prompt: "Extract all product info including name, price, rating, and image_url",
	website_url: "https://www.amazon.in/s?k=tv",
	total_pages: 3,
});

if (res.status === "success") {
	console.log("Products:", JSON.stringify(res.data?.result, null, 2));
	console.log(`Took ${res.elapsedMs}ms`);
} else {
	console.error("Failed:", res.error);
}
