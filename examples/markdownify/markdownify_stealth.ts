import { markdownify } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await markdownify(apiKey, {
	website_url: "https://example.com",
	stealth: true,
	headers: {
		"Accept-Language": "en-US,en;q=0.9",
	},
});

if (res.status === "success") {
	console.log(res.data?.result);
} else {
	console.error("Failed:", res.error);
}
