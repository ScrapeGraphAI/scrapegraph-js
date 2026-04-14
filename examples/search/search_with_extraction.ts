import { search } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await search(apiKey, {
	query: "typescript best practices",
	numResults: 5,
	prompt: "Extract the main tips and recommendations",
	schema: {
		type: "object",
		properties: {
			tips: {
				type: "array",
				items: { type: "string" },
			},
		},
	},
});

if (res.status === "success") {
	console.log("Search results:", res.data?.results.length);
	console.log("\nExtracted tips:", JSON.stringify(res.data?.json, null, 2));
} else {
	console.error("Failed:", res.error);
}
