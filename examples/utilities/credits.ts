import { getCredits } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await getCredits(apiKey);

if (res.status === "success") {
	console.log("Plan:", res.data?.plan);
	console.log("Remaining credits:", res.data?.remaining);
	console.log("Used credits:", res.data?.used);
	console.log("\nJob limits:");
	console.log("  Crawl:", res.data?.jobs.crawl.used, "/", res.data?.jobs.crawl.limit);
	console.log("  Monitor:", res.data?.jobs.monitor.used, "/", res.data?.jobs.monitor.limit);
} else {
	console.error("Failed:", res.error);
}
