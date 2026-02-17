import { smartScraper } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await smartScraper(apiKey, {
	user_prompt: "Extract all cookies info",
	website_url: "https://httpbin.org/cookies",
	cookies: { session_id: "abc123", user_token: "xyz789" },
});

if (res.status === "success") {
	console.log("Cookies:", JSON.stringify(res.data?.result, null, 2));
	console.log(`Took ${res.elapsedMs}ms`);
} else {
	console.error("Failed:", res.error);
}
