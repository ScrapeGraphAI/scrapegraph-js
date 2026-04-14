import { scrape } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await scrape(apiKey, {
	url: "https://example.com",
	fetchConfig: {
		mode: "js",
		stealth: true,
		timeout: 45000,
		wait: 2000,
		scrolls: 3,
	},
	formats: [{ type: "markdown" }],
});

if (res.status === "success") {
	console.log("Content:", res.data?.results.markdown?.data);
	console.log("\nProvider:", res.data?.metadata.provider);
} else {
	console.error("Failed:", res.error);
}
