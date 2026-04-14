import { monitor } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await monitor.create(apiKey, {
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
