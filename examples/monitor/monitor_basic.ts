import { ScrapeGraphAI } from "scrapegraph-js";

// reads SGAI_API_KEY from env, or pass explicitly: ScrapeGraphAI({ apiKey: "..." })
const sgai = ScrapeGraphAI();

const res = await sgai.monitor.create({
	url: "https://example.com",
	name: "Example Monitor",
	interval: "0 * * * *",
	formats: [{ type: "markdown" }],
});

if (res.status === "success") {
	console.log("Monitor created:", res.data?.cronId);
	console.log("Status:", res.data?.status);
	console.log("Interval:", res.data?.interval);
} else {
	console.error("Failed:", res.error);
}
