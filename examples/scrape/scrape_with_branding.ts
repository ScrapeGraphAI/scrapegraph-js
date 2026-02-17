import { scrape } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await scrape(apiKey, {
	website_url: "https://example.com",
	branding: true,
});

if (res.status === "success") {
	console.log("Branding:", JSON.stringify(res.data?.branding, null, 2));
	console.log(`HTML length: ${res.data?.html.length} chars`);
	console.log(`\nTook ${res.elapsedMs}ms`);
} else {
	console.error("Failed:", res.error);
}
