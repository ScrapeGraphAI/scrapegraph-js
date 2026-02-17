import { smartScraper } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await smartScraper(apiKey, {
	user_prompt: "Extract the main content and headings",
	website_url: "https://example.com",
	stealth: true,
	headers: {
		"Accept-Language": "en-US,en;q=0.9",
	},
});

if (res.status === "success") {
	console.log("Result:", JSON.stringify(res.data?.result, null, 2));
	console.log(`Took ${res.elapsedMs}ms`);
} else {
	console.error("Failed:", res.error);
}
