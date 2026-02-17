import { history, HISTORY_SERVICES } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

console.log("Available services:", HISTORY_SERVICES.join(", "));

const res = await history(apiKey, {
	service: "smartscraper",
	page: 1,
	page_size: 5,
});

if (res.status === "success") {
	console.log(`\nTotal requests: ${res.data?.total_count}`);
	console.log(`Page ${res.data?.page} of ${Math.ceil((res.data?.total_count ?? 0) / (res.data?.page_size ?? 10))}\n`);
	for (const entry of res.data?.requests ?? []) {
		console.log(`  [${entry.status}] ${entry.request_id}`);
	}
} else {
	console.error("Failed:", res.error);
}
