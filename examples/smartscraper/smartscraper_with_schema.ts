import { smartScraper } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const schema = {
	type: "object",
	properties: {
		products: {
			type: "array",
			items: {
				type: "object",
				properties: {
					name: { type: "string" },
					price: { type: "number" },
					rating: { type: "string" },
					image_url: { type: "string", format: "uri" },
				},
				required: ["name", "price"],
			},
		},
	},
	required: ["products"],
};

const res = await smartScraper(apiKey, {
	user_prompt: "Extract all product info including name, price, rating, and image_url",
	website_url: "https://www.amazon.in/s?k=laptop",
	output_schema: schema,
});

if (res.status === "success") {
	console.log("Products:", JSON.stringify(res.data?.result, null, 2));
	console.log(`Took ${res.elapsedMs}ms`);
} else {
	console.error("Failed:", res.error);
}
