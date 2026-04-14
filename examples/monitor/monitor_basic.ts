import { monitor } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await monitor.create(apiKey, {
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
