import { ScrapeGraphAI } from "scrapegraph-js";

// reads SGAI_API_KEY from env, or pass explicitly: ScrapeGraphAI({ apiKey: "..." })
const sgai = ScrapeGraphAI();

const res = await sgai.healthy();

if (res.status === "success") {
	console.log("API Status:", res.data?.status);
} else {
	console.error("Health check failed:", res.error);
}
