import { extract } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await extract(apiKey, {
	url: "https://example.com",
	prompt: "Extract the page title and description",
	schema: {
		type: "object",
		properties: {
			title: { type: "string" },
			description: { type: "string" },
		},
		required: ["title"],
	},
});

if (res.status === "success") {
	console.log("Extracted:", JSON.stringify(res.data?.json, null, 2));
} else {
	console.error("Failed:", res.error);
}
