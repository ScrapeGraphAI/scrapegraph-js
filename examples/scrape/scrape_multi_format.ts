import { scrape } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await scrape(apiKey, {
	url: "https://example.com",
	formats: [
		{ type: "markdown", mode: "reader" },
		{ type: "links" },
		{ type: "images" },
		{ type: "screenshot", fullPage: true, width: 1440, height: 900 },
	],
});

if (res.status === "success") {
	console.log("Markdown:", res.data?.results.markdown?.data?.slice(0, 200));
	console.log("\nLinks:", res.data?.results.links?.data?.slice(0, 5));
	console.log("\nImages:", res.data?.results.images?.data?.slice(0, 3));
	console.log("\nScreenshot URL:", res.data?.results.screenshot?.data.url);
} else {
	console.error("Failed:", res.error);
}
