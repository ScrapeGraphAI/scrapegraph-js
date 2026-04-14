import { scrape } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await scrape(apiKey, {
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
