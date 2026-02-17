import { sitemap } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await sitemap(apiKey, {
	website_url: "https://scrapegraphai.com",
});

if (res.status === "success") {
	const urls = res.data?.urls ?? [];
	console.log(`Found ${urls.length} URLs:\n`);
	urls.slice(0, 20).forEach((url, i) => console.log(`  ${i + 1}. ${url}`));
	if (urls.length > 20) console.log(`  ... and ${urls.length - 20} more`);
} else {
	console.error("Failed:", res.error);
}
