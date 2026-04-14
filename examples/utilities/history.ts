import { history } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await history.list(apiKey, {
	service: "scrape",
	limit: 5,
});

if (res.status === "success") {
	console.log(`Total: ${res.data?.pagination.total}`);
	console.log(`Page ${res.data?.pagination.page}\n`);
	for (const entry of res.data?.data ?? []) {
		console.log(`  [${entry.status}] ${entry.service} - ${entry.id}`);
	}
} else {
	console.error("Failed:", res.error);
}
