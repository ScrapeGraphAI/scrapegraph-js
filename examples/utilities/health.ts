import { checkHealth } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await checkHealth(apiKey);

if (res.status === "success") {
	console.log("API Status:", res.data?.status);
} else {
	console.error("Health check failed:", res.error);
}
