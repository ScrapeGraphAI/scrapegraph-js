import { extract } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await extract(apiKey, {
	url: "https://example.com",
	prompt: "What is this page about? Extract the main heading and description.",
});

if (res.status === "success") {
	console.log("Extracted:", JSON.stringify(res.data?.json, null, 2));
	console.log("\nTokens used:", res.data?.usage);
} else {
	console.error("Failed:", res.error);
}
