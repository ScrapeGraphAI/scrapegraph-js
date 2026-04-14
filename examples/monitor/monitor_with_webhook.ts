import { ScrapeGraphAI } from "scrapegraph-js";

// reads SGAI_API_KEY from env, or pass explicitly: ScrapeGraphAI({ apiKey: "..." })
const sgai = ScrapeGraphAI();

const res = await sgai.monitor.create({
	url: "https://example.com/prices",
	name: "Price Monitor",
	interval: "0 */6 * * *",
	formats: [
		{ type: "markdown" },
		{ type: "json", prompt: "Extract all product prices" },
	],
	webhookUrl: "https://your-server.com/webhook",
});

if (res.status === "success") {
	console.log("Monitor created:", res.data?.cronId);
	console.log("Will notify:", res.data?.config.webhookUrl);
} else {
	console.error("Failed:", res.error);
}
