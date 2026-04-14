import { ScrapeGraphAI } from "scrapegraph-js";

// reads SGAI_API_KEY from env, or pass explicitly: ScrapeGraphAI({ apiKey: "..." })
const sgai = ScrapeGraphAI();

const res = await sgai.extract({
	url: "https://example.com",
	prompt: "What is this page about? Extract the main heading and description.",
});

if (res.status === "success") {
	console.log("Extracted:", JSON.stringify(res.data?.json, null, 2));
	console.log("\nTokens used:", res.data?.usage);
} else {
	console.error("Failed:", res.error);
}
