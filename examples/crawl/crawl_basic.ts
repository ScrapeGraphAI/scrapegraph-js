import { crawl } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await crawl(
	apiKey,
	{
		url: "https://scrapegraphai.com",
		prompt: "Extract the main content from each page",
		max_pages: 5,
		depth: 2,
		sitemap: true,
	},
	(status) => console.log(`Poll: ${status}`),
);

if (res.status === "success") {
	console.log("Pages crawled:", res.data?.crawled_urls?.length);
	console.log("Result:", JSON.stringify(res.data?.llm_result, null, 2));
	console.log(`Took ${res.elapsedMs}ms`);
} else {
	console.error("Failed:", res.error);
}
