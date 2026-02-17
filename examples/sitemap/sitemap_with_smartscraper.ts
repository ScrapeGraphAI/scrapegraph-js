import { sitemap, smartScraper } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const sitemapRes = await sitemap(apiKey, {
	website_url: "https://scrapegraphai.com",
});

if (sitemapRes.status !== "success") {
	console.error("Sitemap failed:", sitemapRes.error);
	process.exit(1);
}

const urls = sitemapRes.data?.urls ?? [];
console.log(`Found ${urls.length} URLs, scraping first 3...\n`);

for (const url of urls.slice(0, 3)) {
	console.log(`Scraping: ${url}`);
	const res = await smartScraper(apiKey, {
		user_prompt: "Extract the page title and main content summary",
		website_url: url,
	});

	if (res.status === "success") {
		console.log("  Result:", JSON.stringify(res.data?.result, null, 2));
	} else {
		console.error("  Failed:", res.error);
	}
	console.log();
}
