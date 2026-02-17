import { smartScraper } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await smartScraper(apiKey, {
	user_prompt: "What does the company do? Extract the main heading and description",
	website_url: "https://scrapegraphai.com",
});

if (res.status === "success") {
	console.log("Result:", JSON.stringify(res.data?.result, null, 2));
	console.log(`Took ${res.elapsedMs}ms`);
} else {
	console.error("Failed:", res.error);
}
