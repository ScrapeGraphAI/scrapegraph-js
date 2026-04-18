import { ScrapeGraphAI } from "scrapegraph-js";

// reads SGAI_API_KEY from env, or pass explicitly: ScrapeGraphAI({ apiKey: "..." })
const sgai = ScrapeGraphAI();

const res = await sgai.scrape({
	url: "https://example.com",
	formats: [
		{
			type: "json",
			prompt: "Extract the company name, tagline, and list of features",
			schema: {
				type: "object",
				properties: {
					companyName: { type: "string" },
					tagline: { type: "string" },
					features: {
						type: "array",
						items: { type: "string" },
					},
				},
				required: ["companyName"],
			},
		},
	],
});

if (res.status === "success") {
	const json = res.data?.results.json;

	console.log("=== JSON Extraction ===\n");
	console.log("Extracted data:");
	console.log(JSON.stringify(json?.data, null, 2));

	if (json?.metadata?.chunker) {
		console.log("\nChunker info:");
		console.log("  Chunks:", json.metadata.chunker.chunks.length);
		console.log("  Total size:", json.metadata.chunker.chunks.reduce((a, c) => a + c.size, 0), "chars");
	}
} else {
	console.error("Failed:", res.error);
}
