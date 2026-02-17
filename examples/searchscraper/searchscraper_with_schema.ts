import { searchScraper } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const schema = {
	type: "object",
	properties: {
		version: { type: "string" },
		release_date: { type: "string" },
		features: {
			type: "array",
			items: {
				type: "object",
				properties: {
					name: { type: "string" },
					description: { type: "string" },
				},
				required: ["name", "description"],
			},
		},
	},
	required: ["version", "features"],
};

const res = await searchScraper(apiKey, {
	user_prompt: "What is the latest version of Python and its new features?",
	num_results: 5,
	output_schema: schema,
});

if (res.status === "success") {
	console.log("Result:", JSON.stringify(res.data?.result, null, 2));
	console.log("\nReference URLs:");
	res.data?.reference_urls.forEach((url, i) => console.log(`  ${i + 1}. ${url}`));
} else {
	console.error("Failed:", res.error);
}
