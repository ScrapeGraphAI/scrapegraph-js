import { crawl } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

// extraction_mode: false returns raw markdown for each page
const res = await crawl(
	apiKey,
	{
		url: "https://scrapegraphai.com",
		extraction_mode: false,
		max_pages: 5,
		depth: 2,
		sitemap: true,
	},
	(status) => console.log(`Poll: ${status}`),
);

if (res.status === "success") {
	console.log(`Crawled ${res.data?.pages?.length ?? 0} pages\n`);
	for (const page of res.data?.pages ?? []) {
		console.log(`--- ${page.url} ---`);
		console.log(page.markdown.slice(0, 500));
		console.log("...\n");
	}
	console.log(`Took ${res.elapsedMs}ms`);
} else {
	console.error("Failed:", res.error);
}
