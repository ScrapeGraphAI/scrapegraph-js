import { ScrapeGraphAI } from "scrapegraph-js";

// reads SGAI_API_KEY from env, or pass explicitly: ScrapeGraphAI({ apiKey: "..." })
const sgai = ScrapeGraphAI();

const res = await sgai.scrape({
	url: "https://example.com",
	formats: [
		{ type: "markdown", mode: "reader" },
		{ type: "html", mode: "prune" },
		{ type: "links" },
		{ type: "images" },
		{ type: "summary" },
		{ type: "screenshot", fullPage: false, width: 1440, height: 900, quality: 90 },
	],
});

if (res.status === "success") {
	const results = res.data?.results;

	console.log("=== Scrape Results ===\n");
	console.log("Provider:", res.data?.metadata.provider);
	console.log("Content-Type:", res.data?.metadata.contentType);
	console.log("Elapsed:", res.elapsedMs, "ms\n");

	if (results?.markdown) {
		console.log("--- Markdown ---");
		console.log("Length:", results.markdown.data?.join("").length, "chars");
		console.log("Preview:", results.markdown.data?.[0]?.slice(0, 200), "...\n");
	}

	if (results?.html) {
		console.log("--- HTML ---");
		console.log("Length:", results.html.data?.join("").length, "chars\n");
	}

	if (results?.links) {
		console.log("--- Links ---");
		console.log("Count:", results.links.metadata?.count);
		console.log("Sample:", results.links.data?.slice(0, 5), "\n");
	}

	if (results?.images) {
		console.log("--- Images ---");
		console.log("Count:", results.images.metadata?.count);
		console.log("Sample:", results.images.data?.slice(0, 3), "\n");
	}

	if (results?.summary) {
		console.log("--- Summary ---");
		console.log(results.summary.data, "\n");
	}

	if (results?.screenshot) {
		console.log("--- Screenshot ---");
		console.log("URL:", results.screenshot.data.url);
		console.log("Dimensions:", results.screenshot.data.width, "x", results.screenshot.data.height);
		console.log("Format:", results.screenshot.metadata?.contentType, "\n");
	}
} else {
	console.error("Failed:", res.error);
}
