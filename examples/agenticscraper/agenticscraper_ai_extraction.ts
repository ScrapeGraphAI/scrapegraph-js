import { agenticScraper } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const schema = {
	type: "object",
	properties: {
		username: { type: "string" },
		email: { type: "string" },
		available_sections: { type: "array", items: { type: "string" } },
		credits_remaining: { type: "number" },
	},
	required: ["username", "available_sections"],
};

const res = await agenticScraper(apiKey, {
	url: "https://dashboard.scrapegraphai.com/",
	steps: [
		"Type email@gmail.com in email input box",
		"Type test-password@123 in password input box",
		"Click on login",
		"Wait for dashboard to load completely",
	],
	use_session: true,
	ai_extraction: true,
	user_prompt:
		"Extract the user's dashboard info: username, email, available sections, and remaining credits",
	output_schema: schema,
});

if (res.status === "success") {
	console.log("Dashboard Info:", JSON.stringify(res.data?.result, null, 2));
} else {
	console.error("Failed:", res.error);
}
