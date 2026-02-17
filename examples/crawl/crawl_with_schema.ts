import { crawl } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const schema = {
	type: "object",
	properties: {
		company: {
			type: "object",
			properties: {
				name: { type: "string" },
				description: { type: "string" },
				features: { type: "array", items: { type: "string" } },
			},
			required: ["name", "description"],
		},
		services: {
			type: "array",
			items: {
				type: "object",
				properties: {
					service_name: { type: "string" },
					description: { type: "string" },
				},
				required: ["service_name", "description"],
			},
		},
	},
	required: ["company", "services"],
};

const res = await crawl(
	apiKey,
	{
		url: "https://scrapegraphai.com",
		prompt: "Extract company info, services, and features",
		schema,
		max_pages: 3,
		depth: 2,
		sitemap: true,
	},
	(status) => console.log(`Poll: ${status}`),
);

if (res.status === "success") {
	console.log("Result:", JSON.stringify(res.data?.llm_result, null, 2));
	console.log(`Took ${res.elapsedMs}ms`);
} else {
	console.error("Failed:", res.error);
}
