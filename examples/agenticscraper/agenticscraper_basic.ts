import { agenticScraper } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await agenticScraper(apiKey, {
	url: "https://dashboard.scrapegraphai.com/",
	steps: [
		"Type email@gmail.com in email input box",
		"Type test-password@123 in password input box",
		"Click on login",
	],
	use_session: true,
	ai_extraction: false,
});

if (res.status === "success") {
	console.log("Request ID:", res.data?.request_id);
	console.log("Status:", res.data?.status);
	console.log("Result:", JSON.stringify(res.data?.result, null, 2));
} else {
	console.error("Failed:", res.error);
}
