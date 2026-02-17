import { scrape } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await scrape(apiKey, {
	website_url: "https://example.com",
	stealth: true,
	country_code: "us",
});

if (res.status === "success") {
	console.log(`HTML length: ${res.data?.html.length} chars`);
	console.log("Preview:", res.data?.html.slice(0, 500));
	console.log(`\nTook ${res.elapsedMs}ms`);
} else {
	console.error("Failed:", res.error);
}
