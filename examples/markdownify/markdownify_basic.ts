import { markdownify } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await markdownify(apiKey, {
	website_url: "https://scrapegraphai.com",
});

if (res.status === "success") {
	console.log(res.data?.result);
} else {
	console.error("Failed:", res.error);
}
