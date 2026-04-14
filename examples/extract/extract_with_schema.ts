import { ScrapeGraphAI } from "scrapegraph-js";

// reads SGAI_API_KEY from env, or pass explicitly: ScrapeGraphAI({ apiKey: "..." })
const sgai = ScrapeGraphAI();

const res = await sgai.extract({
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
